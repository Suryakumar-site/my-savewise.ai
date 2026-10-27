import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, X, ShieldCheck, CheckCircle2, FileText, 
  CreditCard, Smartphone, Building2, Download, Printer, ArrowRight, QrCode
} from 'lucide-react';

export default function PremiumModal({ initialAmount = 10000, onClose, user, onOpenAuth, onPlanUnlocked }) {
  const [planningAmount, setPlanningAmount] = useState(initialAmount);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [unlockedPlan, setUnlockedPlan] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(false);
  const [adminPayout, setAdminPayout] = useState(null);

  useEffect(() => {
    fetch('/api/premium/payout-destination')
      .then(res => res.json())
      .then(data => {
        if (data.payout) setAdminPayout(data.payout);
      })
      .catch(() => {});
  }, []);

  // 4% fee calculation math
  const numAmount = Number(planningAmount) || 0;
  const baseFee = Math.round(numAmount * 0.04);
  const gst = Math.round(baseFee * 0.18);
  const totalPayable = baseFee + gst;

  const handleCheckout = async () => {
    if (!user) {
      alert('Please log in or register before completing the premium planning checkout.');
      onOpenAuth();
      return;
    }

    setIsProcessing(true);
    const token = localStorage.getItem('savewise_token');

    try {
      const res = await fetch('/api/premium/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planningAmount: numAmount,
          paymentMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        setCompletedOrder(data.order);
        if (data.plan) {
          setUnlockedPlan(data.plan);
          if (onPlanUnlocked) onPlanUnlocked(data.plan);
        }
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.6 }
        });
      } else {
        alert(data.error || 'Checkout failed.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error during checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '2rem',
        background: 'var(--bg-secondary)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-gold">Transparent 4% Fee</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>SaveWise Premium Planning</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem' }}>
            <X size={18} />
          </button>
        </div>

        {!completedOrder ? (
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
              Deep Financial Planning Engine
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Planning for savings above ₹1,000 unlocks personalized tax optimization (Section 80C & 80CCD), comprehensive emergency fund sizing, multi-scenario crash buffers, and actionable step-by-step checklists.
            </p>

            {/* Input Planning Amount */}
            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Your Target Planning Amount (₹ INR):
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {[2000, 5000, 10000, 25000, 50000, 100000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPlanningAmount(amt)}
                    className={`chip ${planningAmount === amt ? 'active' : ''}`}
                    style={{ fontSize: '0.875rem' }}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', maxWidth: '300px' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                <input
                  type="number"
                  min="1001"
                  step="500"
                  value={planningAmount}
                  onChange={(e) => setPlanningAmount(Math.max(1001, Number(e.target.value)))}
                  className="input-field"
                  style={{ paddingLeft: '2.25rem', fontWeight: 600 }}
                />
              </div>
            </div>

            {/* Transparent 4% Pricing Breakdown */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--gold-400)', marginBottom: '0.75rem' }}>
                Transparent Pricing Breakdown (No Hidden Fees)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Selected Planning Capital:</span>
                  <strong>₹{numAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Software Planning Fee (Flat 4%):</span>
                  <strong>₹{baseFee.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>GST (18% on service fee):</span>
                  <strong>₹{gst.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '1.1rem', fontWeight: 800 }}>
                  <span style={{ color: 'var(--gold-400)' }}>Total Payable Today:</span>
                  <span style={{ color: 'var(--gold-400)' }}>₹{totalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                ★ <strong>Strict Safeguard:</strong> This one-time 4% software planning fee is for algorithms, scenario modeling, and report generation. It is NOT a percentage of your investment returns.
              </p>
            </div>

            {/* Admin Bank & Payout Receiving Channel Card */}
            {adminPayout && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Building2 size={16} color="var(--emerald-400)" />
                  <strong style={{ fontSize: '0.85rem', color: 'var(--emerald-400)' }}>
                    Admin Payout Destination (Your 4% Fee Goes Directly Here):
                  </strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Bank Name: </span>
                    <strong>{adminPayout.bank_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>A/C Number: </span>
                    <strong>{adminPayout.account_number ? `•••• •••• ${adminPayout.account_number.slice(-4)}` : 'Verified'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>IFSC: </span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{adminPayout.ifsc_code}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Admin UPI: </span>
                    <strong style={{ color: 'var(--gold-400)', fontFamily: 'var(--font-mono)' }}>{adminPayout.upi_id}</strong>
                  </div>
                </div>

                {paymentMethod === 'upi' && adminPayout.upi_qr_url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(16, 185, 129, 0.15)' }}>
                    <div style={{ width: '56px', height: '56px', background: '#fff', padding: '3px', borderRadius: '4px' }}>
                      <img src={adminPayout.upi_qr_url} alt="Admin UPI QR" style={{ width: '100%', height: '100%' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Scan via GPay, PhonePe, Paytm, or BHIM. Simulated 1-click authorization active.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Simulated Payment Methods */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Select Payment Mode:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                  { id: 'card', label: 'Debit / Credit Card', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', icon: Building2 }
                ].map(pm => {
                  const Icon = pm.icon;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className="glass-card"
                      style={{
                        padding: '0.875rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        border: paymentMethod === pm.id ? '2px solid var(--emerald-500)' : '1px solid var(--border-color)',
                        background: paymentMethod === pm.id ? 'rgba(16, 185, 129, 0.1)' : undefined
                      }}
                    >
                      <Icon size={20} color={paymentMethod === pm.id ? 'var(--emerald-400)' : 'var(--text-muted)'} style={{ margin: '0 auto 0.25rem auto' }} />
                      <strong style={{ fontSize: '0.8125rem' }}>{pm.label}</strong>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Checkout Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="btn btn-gold btn-lg"
                style={{ fontWeight: 800 }}
              >
                {isProcessing ? 'Authorizing Payout to Admin...' : `Pay ₹${totalPayable.toLocaleString('en-IN')} & Unlock ₹${numAmount.toLocaleString('en-IN')} Plan`}
              </button>
            </div>
          </div>
        ) : (
          /* SUCCESS INVOICE VIEW */
          <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={48} color="var(--emerald-400)" style={{ margin: '0 auto 0.5rem auto' }} />
              <h3 style={{ fontSize: '1.5rem' }}>Payment Confirmed & Full Plan Unlocked!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                4% fee successfully credited to Admin. Complete strategy for your total ₹{completedOrder.planningAmount.toLocaleString('en-IN')} has been generated.
              </p>
            </div>

            {/* Official Invoice Card */}
            <div style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--emerald-400)' }}>SaveWise Financial Technologies</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>GSTIN: 33AABCS1429B1Z8 • CIN: U72900TN2026PTC184920</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ display: 'block' }}>TAX INVOICE</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{completedOrder.invoiceNo}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Billed To:</span>
                  <strong>{user?.name || 'Valued Client'}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Date:</span>
                  <strong>{new Date(completedOrder.date).toLocaleDateString('en-IN')}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--emerald-400)' }}>Payment ID: {completedOrder.paymentId}</span>
                </div>
              </div>

              {completedOrder.creditedToAdminBank && (
                <div style={{
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  fontSize: '0.75rem'
                }}>
                  <span style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>Settlement Channel: </span>
                  <span>Credited to {completedOrder.creditedToAdminBank} (UPI: {completedOrder.creditedToAdminUpi})</span>
                </div>
              )}

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.5rem 0' }}>Description</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.5rem 0' }}>SaveWise AI Deep Financial Plan (₹{completedOrder.planningAmount.toLocaleString('en-IN')} Total Capital)</td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>₹{completedOrder.feeAmount.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem 0' }}>GST @ 18%</td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>₹{Math.round(completedOrder.feeAmount * 0.18).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--border-color)', fontWeight: 800, fontSize: '1rem' }}>
                    <td style={{ padding: '0.5rem 0' }}>Total Paid</td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right', color: 'var(--emerald-400)' }}>₹{completedOrder.totalPaid.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                This fee covers software analysis services. SaveWise AI is an educational technology platform and does not manage client investment funds directly.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => window.print()} className="btn btn-secondary">
                <Printer size={16} /> Print Receipt
              </button>
              {unlockedPlan ? (
                <button
                  onClick={() => {
                    if (onPlanUnlocked) onPlanUnlocked(unlockedPlan);
                    onClose();
                  }}
                  className="btn btn-primary"
                  style={{ fontWeight: 800 }}
                >
                  <span>View My ₹{completedOrder.planningAmount.toLocaleString('en-IN')} Plan</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button onClick={onClose} className="btn btn-primary">
                  Return to Dashboard
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
