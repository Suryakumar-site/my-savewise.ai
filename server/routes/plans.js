import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { optionalAuth, authenticateToken } from './auth.js';

const router = express.Router();

// Helper to generate the ₹100 specific experience
function generateRs100Experience() {
  return {
    isRs100Special: true,
    realityCheck: {
      headline: 'The Reality of ₹100',
      message: 'Your ₹100 cannot realistically become ₹1,000 quickly without taking substantial, dangerous risk or adding more savings over time.',
      principles: [
        'No legitimate market asset doubles money overnight without extreme risk of total loss.',
        'Compounding ₹100 at a healthy 10% annual rate gives ₹10 in a year—the real wealth comes from adding ₹100 regularly (SIP) and giving it time.',
        'The greatest return on ₹100 today is often knowledge, building the habit of saving, or purchasing a learning tool.'
      ]
    },
    paths: [
      {
        id: 'path_save',
        badge: 'PATH A — Safe Liquidity',
        title: 'Keep as Liquid Cash / UPI Buffer',
        tagline: 'Preserve 100% of your capital with zero market volatility.',
        what: 'Keep the ₹100 in your savings bank account or digital UPI wallet as a minor buffer.',
        why: 'Having zero debt and an emergency cash cushion is step #1 before any investing.',
        risk: 'Zero risk of nominal loss. Only minor loss of purchasing power over years due to inflation.',
        cost: 'Zero fees or charges in a standard zero-balance bank account.',
        liquidity: 'Instant (Available in seconds via UPI or ATM withdrawal).',
        minimum: '₹1 in any standard bank account.',
        time: 'Immediate / Anytime.',
        how: 'Keep it parked in your savings account. Do not spend it on impulse snacks or digital subscriptions.',
        nextStep: 'Try adding another ₹100 next week to build your first ₹500 emergency buffer.'
      },
      {
        id: 'path_learn',
        badge: 'PATH B — Knowledge Experiment',
        title: 'Use as a Financial Learning Experiment',
        tagline: 'Treat this ₹100 as the tuition fee to understand financial mechanics.',
        what: 'Investigate how money transfers, interest credits, and compounding actually feel without fear.',
        why: 'The emotional habit of tracking ₹100 prepares you to manage ₹10,000 and ₹1,00,000 later.',
        risk: 'Low to None. Even if you make a trial mistake, the loss is capped at ₹100.',
        cost: 'Zero if reading free verified guides or using educational tools.',
        liquidity: 'Immediate.',
        minimum: '₹100.',
        time: '1 to 2 weeks of disciplined study.',
        how: 'Complete Level 1 in the SaveWise Learning Center and track every rupee.',
        nextStep: 'Understand the difference between stocks, index funds, and bank deposits.'
      },
      {
        id: 'path_invest',
        badge: 'PATH C — Micro-Invest (If Supported)',
        title: 'Micro Index ETF / Micro Gold Unit',
        tagline: 'Explore fractional gold or an eligible micro ETF unit if supported by your platform.',
        what: 'Certain digital gold platforms or micro-ETFs (like Nifty BeES units ~₹250 or digital gold starting at ₹100) allow micro-entries.',
        why: 'To experience firsthand what it feels like to own a market-linked asset and see daily NAV updates.',
        risk: 'Moderate. Price can fluctuate between ₹90 and ₹110 based on market conditions.',
        cost: 'Exchange transaction charges and GST (~3% on gold purchases).',
        liquidity: 'High. Can sell back on market business days.',
        minimum: '₹100 for digital gold; ~₹250 for 1 unit of Nifty 50 ETF.',
        how: 'Open a verified SEBI-regulated app (e.g. Groww/Zerodha), search for "Gold ETF" or "Nifty BeES", and purchase 1 unit.',
        nextStep: 'Observe the price movement over 30 days without panicking during minor dips.'
      },
      {
        id: 'path_skill',
        badge: 'PATH D — Skill & Earning Capacity',
        title: 'Improve Future Earning Capacity',
        tagline: 'The highest return on small capital is increasing your income.',
        what: 'Using ₹100 towards a high-value book, a technical cheat-sheet, notebook, or internet data for a free online tutorial.',
        why: 'Growing your monthly earning ability from ₹10,000 to ₹15,000 does infinitely more for your wealth than a 7% return on ₹100.',
        risk: 'Zero financial risk; only requires your personal focus and study time.',
        cost: '₹100 one-time.',
        liquidity: 'Knowledge is permanent and non-depreciating.',
        minimum: '₹50 - ₹100.',
        time: 'Lifetime benefits.',
        how: 'Buy a used paperback on personal finance (e.g., "The Psychology of Money") or use internet recharge to complete a certified online skill course.',
        nextStep: 'Apply one new productive skill to earn your next ₹500.'
      }
    ]
  };
}

// Generate dynamic multi-strategy plans
export function generateStrategies(params, refreshIteration = 0) {
  const amount = Number(params.amount) || 1000;
  const familiarity = params.familiarity || 'beginner';
  const riskComfort = params.riskComfort || 'moderate';
  const timeHorizon = params.timeHorizon || '1-3 years';
  const goals = Array.isArray(params.goals) ? params.goals : [params.goals || 'Grow slowly'];
  const hasEmergency = Boolean(params.hasEmergency);

  // If amount is ₹100 or below, attach the specialized ₹100 roadmap
  const rs100Data = amount <= 100 ? generateRs100Experience() : null;

  // Compute 4 distinct strategies
  // Iteration modifies nuances if refreshed
  const strategies = [
    {
      id: 'strat_conservative',
      name: 'Strategy 1 — Conservative (Safety & Liquidity First)',
      badge: 'Low Volatility',
      type: 'conservative',
      description: 'Focuses primarily on capital preservation and instant liquidity, with minimal to zero market fluctuation.',
      suitableFor: 'Short time horizons, zero risk tolerance, or anyone building their first emergency savings.',
      allocation: [
        {
          category: 'High-Yield Bank Savings / Liquid Cash',
          percentage: amount < 500 ? 100 : 70,
          amount: amount < 500 ? amount : Math.round(amount * 0.70),
          color: '#10b981',
          rationale: 'Keeps your core capital 100% safe from market crashes and available instantly.'
        },
        {
          category: 'Bank RD / Short-Term FD / Sovereign Debt',
          percentage: amount < 500 ? 0 : 30,
          amount: amount < 500 ? 0 : Math.round(amount * 0.30),
          color: '#3b82f6',
          rationale: 'Locks in fixed interest (6.5%–7.2%) with DICGC insurance protection up to ₹5 Lakh.'
        }
      ],
      breakdown9Points: {
        what: 'A capital-preservation plan combining liquid savings accounts with fixed term deposits.',
        why: 'Protects you from sleepless nights while building a guaranteed financial bedrock.',
        risk: 'Very Low. No equity market risk. Minor risk of trailing high inflation over 5+ years.',
        cost: 'Zero fees on savings accounts; normal income tax on bank interest.',
        liquidity: 'High. 70% available immediately; 30% available with minor FD pre-closure penalty.',
        minimum: '₹100 to start.',
        time: '1 month to 2 years.',
        how: 'Open your bank app, ensure ₹' + (amount < 500 ? amount : Math.round(amount * 0.7)) + ' stays in savings, and book a small recurring deposit for the rest.',
        nextStep: 'Check if you have 3 months of essential living expenses saved before taking market risks.'
      }
    },
    {
      id: 'strat_balanced',
      name: 'Strategy 2 — Balanced (Safety Buffer + Disciplined Indexing)',
      badge: 'Recommended for Most Beginners',
      type: 'balanced',
      description: 'The golden middle path: protects your immediate peace of mind while gently starting long-term compounding.',
      suitableFor: '1 to 5 year horizon, moderate comfort with temporary dips, and people wanting balanced growth.',
      allocation: [
        {
          category: 'Liquid Emergency Reserve',
          percentage: 50,
          amount: Math.round(amount * 0.50),
          color: '#10b981',
          rationale: 'Ensures you never have to sell investments in panic during personal emergencies.'
        },
        {
          category: 'Broad Index Fund (Nifty 50 / Large Cap)',
          percentage: 35,
          amount: Math.round(amount * 0.35),
          color: '#6366f1',
          rationale: 'Spreads ownership across India\'s 50 biggest companies with low expense ratios.'
        },
        {
          category: 'Gold ETF or Debt Fund Buffer',
          percentage: 15,
          amount: Math.round(amount * 0.15),
          color: '#f59e0b',
          rationale: 'Acts as a shock absorber during stock market volatility.'
        }
      ],
      breakdown9Points: {
        what: 'A multi-asset strategy allocating half to liquid safety and half to diversified market growth.',
        why: 'Historical data shows balanced asset allocation provides steady compounding with lower drawdown stress.',
        risk: 'Moderate. The index portion will fluctuate up and down daily, but the 50% liquid buffer protects you.',
        cost: 'Index fund expense ratio (~0.1% to 0.25% per year) and digital gold exchange spread.',
        liquidity: 'Medium to High. Liquid portion instant; mutual fund units redeemable in 2 business days.',
        minimum: '₹500 (supports ₹250 liquid + ₹250 index SIP).',
        time: '3 to 5+ years.',
        how: 'Keep ₹' + Math.round(amount * 0.5) + ' in your savings account, and start a ₹' + Math.round(amount * 0.35) + ' monthly SIP in a direct Nifty 50 Index Fund.',
        nextStep: 'Set up an automated monthly auto-debit so you don\'t have to remember to invest manually.'
      }
    },
    {
      id: 'strat_growth',
      name: 'Strategy 3 — Growth-Oriented (Long-Term Compounding)',
      badge: '5+ Years Horizon Required',
      type: 'growth',
      description: 'Maximizes exposure to productive businesses and index funds to beat inflation substantially over 5–10 years.',
      suitableFor: 'Investors with an existing emergency cushion, 5+ year patience, and high tolerance for temporary market swings.',
      allocation: [
        {
          category: 'Nifty 50 / Nifty Next 50 Equity Index',
          percentage: 60,
          amount: Math.round(amount * 0.60),
          color: '#8b5cf6',
          rationale: 'Direct ownership in top 100 Indian corporate enterprises for long-term GDP growth.'
        },
        {
          category: 'Flexicap / Diversified Mutual Fund',
          percentage: 25,
          amount: Math.round(amount * 0.25),
          color: '#ec4899',
          rationale: 'Allows experienced managers to seek growth opportunities across mid and large cap firms.'
        },
        {
          category: 'Liquid Emergency Buffer',
          percentage: 15,
          amount: Math.round(amount * 0.15),
          color: '#10b981',
          rationale: 'Minimum cash cushion to avoid forced liquidations during market corrections.'
        }
      ],
      breakdown9Points: {
        what: 'An equity-heavy investment plan focused on beating inflation over multiple years.',
        why: 'Historically, equity indices have been the primary vehicle for compounding wealth above inflation in India.',
        risk: 'High in the short term. Your balance can drop 10%–20% during market corrections without warning.',
        cost: 'Direct mutual fund expense ratios (~0.3% - 0.8%) and 12.5% Long-Term Capital Gains tax on gains > ₹1.25 Lakh.',
        liquidity: 'Moderate. Accessible in T+2 days, but withdrawing during a crash locks in permanent capital losses.',
        minimum: '₹1,000 (can split into two ₹500 SIPs).',
        time: 'Strictly 5 to 7+ years.',
        how: 'Choose 1 direct Nifty 50 Index Fund and 1 well-rated Flexicap fund through MFCentral or a verified broker app.',
        nextStep: 'Commit mentally to ignoring daily stock market news and holding through inevitable market dips.'
      }
    },
    {
      id: 'strat_learning',
      name: 'Strategy 4 — Learning-First & Skill Building',
      badge: 'Highest Personal ROI',
      type: 'learning',
      description: 'Prioritizes building financial habits, acquiring practical skills, and testing the waters before risking serious money.',
      suitableFor: 'Complete beginners, students, or anyone who feels overwhelmed by financial jargon.',
      allocation: [
        {
          category: 'High-Interest Emergency Savings',
          percentage: 40,
          amount: Math.round(amount * 0.40),
          color: '#10b981',
          rationale: 'Provides mental security and proves you can keep money untouched for 30 days.'
        },
        {
          category: 'Skill Upgrade / Productivity Tool / Book',
          percentage: 30,
          amount: Math.round(amount * 0.30),
          color: '#f97316',
          rationale: 'Investing ₹300 in a book or online tool that helps you earn more is the highest returning asset.'
        },
        {
          category: 'Micro Trial SIP (Index Fund / Gold)',
          percentage: 30,
          amount: Math.round(amount * 0.30),
          color: '#06b6d4',
          rationale: 'A small ₹100 - ₹300 trial to learn the technical process of KYC, demat, and NAV tracking.'
        }
      ],
      breakdown9Points: {
        what: 'A holistic strategy treating personal skills and financial literacy as co-equal to financial assets.',
        why: 'Earning power and emotional discipline determine 90% of financial success for young earners.',
        risk: 'Minimal. Skill knowledge never loses value.',
        cost: 'Zero hidden fees. One-time purchase of learning material.',
        liquidity: 'Cash portion is instant. Knowledge is permanently with you.',
        minimum: '₹100 to ₹500.',
        time: '3 to 6 months.',
        how: 'Complete our 4-level learning modules, finish 1 book, and set up your first trial ₹100 SIP.',
        nextStep: 'Review your financial confidence after 30 days and graduate to the Balanced Strategy.'
      }
    }
  ];

  // If user requested a refresh, adjust the variations and add explanation
  if (refreshIteration > 0) {
    const variations = [
      {
        diffRationale: 'Refreshed with an extra emphasis on sovereign safety (PPF / RBI Bonds) and inflation protection.',
        modConservative: 'Added Sovereign Gold Bond / RBI Retail Direct slice for guaranteed tax-smart coupon flow.'
      },
      {
        diffRationale: 'Refreshed with a heavier focus on automated micro-SIPs and index factor tilt.',
        modConservative: 'Shifted allocation toward low-cost Nifty Next 50 indexation for younger earners.'
      },
      {
        diffRationale: 'Refreshed with pure emergency fund optimization and debt fund liquidity.',
        modConservative: 'Prioritized overnight liquid mutual funds over traditional locked term deposits.'
      }
    ];
    const picked = variations[(refreshIteration - 1) % variations.length];
    strategies.forEach(s => {
      s.refreshed = true;
      s.refreshNote = picked.diffRationale;
    });
  }

  return {
    amount,
    familiarity,
    riskComfort,
    timeHorizon,
    goals,
    hasEmergency,
    refreshIteration,
    isPremiumEligible: amount > 1000,
    rs100Data,
    strategies
  };
}

// POST /api/plans/generate
router.post('/generate', optionalAuth, (req, res) => {
  try {
    const { amount, familiarity, goals, timeHorizon, riskComfort, existingAccounts, dematPlatform, hasEmergency, refreshIteration } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({ error: 'Please enter a valid positive planning amount in ₹.' });
    }

    const planData = generateStrategies({
      amount: numAmount,
      familiarity,
      goals,
      timeHorizon,
      riskComfort,
      existingAccounts,
      dematPlatform,
      hasEmergency
    }, Number(refreshIteration) || 0);

    // If authenticated user, log to audit/timeline
    if (req.user) {
      db.prepare(`
        INSERT INTO timeline_events (id, user_id, event_type, title, description, amount)
        VALUES (?, ?, 'plan_generated', 'Generated Plan for ₹' || ?, 'Explored ' || ? || ' strategies based on ' || ? || ' profile', ?)
      `).run('evt_' + uuidv4().slice(0, 8), req.user.id, numAmount, planData.strategies.length, familiarity || 'beginner', numAmount);
    }

    res.json(planData);
  } catch (err) {
    console.error('Plan generation error:', err);
    res.status(500).json({ error: 'Failed to generate financial plan. Please try again.' });
  }
});

// POST /api/plans/save (Save chosen strategy to dashboard)
router.post('/save', authenticateToken, (req, res) => {
  try {
    const { amount, strategyName, strategyType, allocation, details } = req.body;

    if (!amount || !strategyName || !allocation) {
      return res.status(400).json({ error: 'Missing required plan details to save.' });
    }

    const planId = 'plan_' + uuidv4().slice(0, 8);
    db.prepare(`
      INSERT INTO saved_plans (id, user_id, amount, strategy_name, strategy_type, allocation_json, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      planId,
      req.user.id,
      Number(amount),
      strategyName,
      strategyType || 'balanced',
      JSON.stringify(allocation),
      JSON.stringify(details || {})
    );

    db.prepare(`
      INSERT INTO timeline_events (id, user_id, event_type, title, description, amount)
      VALUES (?, ?, 'plan_saved', 'Adopted ' || ?, 'Committed to ' || ? || ' allocation model', ?)
    `).run('evt_' + uuidv4().slice(0, 8), req.user.id, strategyName, strategyType, Number(amount));

    res.status(201).json({ message: 'Strategy successfully saved to your financial dashboard!', planId });
  } catch (err) {
    console.error('Save plan error:', err);
    res.status(500).json({ error: 'Failed to save plan.' });
  }
});

// GET /api/plans/my-plans
router.get('/my-plans', authenticateToken, (req, res) => {
  try {
    const plans = db.prepare('SELECT * FROM saved_plans WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const parsed = plans.map(p => ({
      ...p,
      allocation: JSON.parse(p.allocation_json || '[]'),
      details: JSON.parse(p.details_json || '{}')
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch saved plans.' });
  }
});

// DELETE /api/plans/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM saved_plans WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Plan removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete plan.' });
  }
});

export default router;
