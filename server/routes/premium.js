import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { authenticateToken, optionalAuth } from './auth.js';

const router = express.Router();

// Helper to calculate 4% planning fee
export function calculatePlanFee(planningAmount) {
  const amount = Number(planningAmount) || 0;
  if (amount <= 1000) {
    return {
      isFree: true,
      amount,
      feePercentage: 0,
      feeAmount: 0,
      message: 'Planning up to ₹1,000 is 100% FREE forever on SaveWise AI.'
    };
  }

  const feeAmount = Math.round(amount * 0.04);
  return {
    isFree: false,
    amount,
    feePercentage: 4,
    feeAmount,
    gstAmount: Math.round(feeAmount * 0.18),
    totalPayable: Math.round(feeAmount * 1.18),
    message: `SaveWise Premium Planning Fee: 4% of planning amount (₹${amount.toLocaleString('en-IN')}) = ₹${feeAmount.toLocaleString('en-IN')}.`
  };
}

// POST /api/premium/calculate
router.post('/calculate', (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Please enter a valid positive planning amount.' });
  }

  const calc = calculatePlanFee(amount);
  res.json(calc);
});

import { generateStrategies } from './plans.js';

// GET /api/premium/payout-destination (Public endpoint for checkout to know admin receiver details)
router.get('/payout-destination', (req, res) => {
  try {
    const payout = db.prepare('SELECT account_holder, bank_name, account_number, ifsc_code, upi_id, upi_qr_url FROM admin_payout_settings WHERE id = ?').get('default_admin_payout');
    res.json({
      payout: payout || {
        account_holder: 'SaveWise Operations (Admin)',
        bank_name: 'HDFC Bank Ltd',
        account_number: '50200084920193',
        ifsc_code: 'HDFC0000240',
        upi_id: 'savewise.admin@hdfcbank',
        upi_qr_url: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=savewise.admin@hdfcbank&pn=SaveWise%20Operations'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve payout destination.' });
  }
});

// POST /api/premium/checkout (Simulate secure checkout directly to admin bank account)
router.post('/checkout', authenticateToken, (req, res) => {
  try {
    const { planningAmount, paymentMethod, familiarity, goals, timeHorizon, riskComfort, hasEmergency } = req.body;
    const amount = Number(planningAmount);

    if (isNaN(amount) || amount <= 1000) {
      return res.status(400).json({ error: 'Premium checkout is only required for amounts exceeding ₹1,000.' });
    }

    // Get current Admin Payout Credentials
    const payout = db.prepare('SELECT * FROM admin_payout_settings WHERE id = ?').get('default_admin_payout') || {};
    const adminBank = payout.bank_name ? `${payout.bank_name} (A/C ${payout.account_number})` : 'Admin Bank Account';
    const adminUpi = payout.upi_id || 'savewise.admin@hdfcbank';

    const calc = calculatePlanFee(amount);
    const invoiceNo = 'SW-INV-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);
    const paymentId = 'pay_' + uuidv4().slice(0, 12);
    const orderId = 'order_' + uuidv4().slice(0, 8);

    db.prepare(`
      INSERT INTO premium_orders (id, user_id, planning_amount, fee_amount, payment_id, invoice_no, status, payout_bank, payout_upi)
      VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?)
    `).run(orderId, req.user.id, amount, calc.totalPayable, paymentId, invoiceNo, adminBank, adminUpi);

    // Record in user timeline
    db.prepare(`
      INSERT INTO timeline_events (id, user_id, event_type, title, description, amount)
      VALUES (?, ?, 'premium_unlocked', 'Unlocked Deep Premium Plan for ₹' || ?, 'Invoice #' || ? || ' paid to Admin (' || ? || ') via ' || ?, ?)
    `).run('evt_' + uuidv4().slice(0, 8), req.user.id, amount.toLocaleString('en-IN'), invoiceNo, adminBank, paymentMethod || 'UPI/Bank', calc.totalPayable);

    // Generate full comprehensive plan for the user's total capital
    const fullPlan = generateStrategies({
      amount,
      familiarity: familiarity || 'beginner',
      goals: goals || ['Grow slowly', 'Build emergency fund'],
      timeHorizon: timeHorizon || '1-3 years',
      riskComfort: riskComfort || 'moderate',
      hasEmergency: Boolean(hasEmergency)
    });

    res.json({
      success: true,
      message: `Payment confirmed! 4% software fee (₹${calc.totalPayable}) credited to Admin (${adminBank} / UPI: ${adminUpi}). Full plan for ₹${amount.toLocaleString('en-IN')} unlocked.`,
      order: {
        orderId,
        invoiceNo,
        paymentId,
        planningAmount: amount,
        feeAmount: calc.feeAmount,
        totalPaid: calc.totalPayable,
        creditedToAdminBank: adminBank,
        creditedToAdminUpi: adminUpi,
        date: new Date().toISOString()
      },
      plan: fullPlan
    });
  } catch (err) {
    console.error('Premium checkout error:', err);
    res.status(500).json({ error: 'Payment checkout failed.' });
  }
});

// GET /api/premium/invoice/:invoiceNo
router.get('/invoice/:invoiceNo', authenticateToken, (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM premium_orders WHERE invoice_no = ? AND user_id = ?').get(req.params.invoiceNo, req.user.id);
    if (!order) return res.status(404).json({ error: 'Invoice not found.' });

    const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(req.user.id);

    res.json({
      invoiceNo: order.invoice_no,
      date: order.created_at,
      clientName: user.name,
      clientEmail: user.email,
      serviceDescription: `SaveWise AI Comprehensive Financial Planning & Scenario Engine (Planning Capital: ₹${order.planning_amount.toLocaleString('en-IN')})`,
      planningAmount: order.planning_amount,
      baseFee: Math.round(order.fee_amount / 1.18),
      gst: Math.round(order.fee_amount - (order.fee_amount / 1.18)),
      totalPaid: order.fee_amount,
      paymentId: order.payment_id,
      company: {
        name: 'SaveWise Financial Technologies India',
        gstin: '33AABCS1429B1Z8',
        cin: 'U72900TN2026PTC184920',
        disclaimer: 'This fee is for software scenario modeling and financial education. Not a fee for regulated portfolio management or guaranteed investment returns.'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not load invoice.' });
  }
});

// GET /api/premium/orders
router.get('/orders', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM premium_orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve order history.' });
  }
});

export default router;
