import express from 'express';
import { optionalAuth } from './auth.js';
import { db } from '../db.js';

const router = express.Router();

// Response generator enforcing all financial safety rules
function generateCoachResponse(userMessage, context = {}) {
  const msg = (userMessage || '').toLowerCase().trim();

  // Safety Rule 1: Get-rich-quick rejection
  if (
    /turn (₹|rs\.?)?\s*100 into (₹|rs\.?)?\s*(10,?000|1000|1,?00,?000)/i.test(msg) ||
    /get rich quick|double.*overnight|instant wealth|guaranteed 10x|make me a millionaire fast/i.test(msg)
  ) {
    return {
      message: `There is no reliable, guaranteed method to multiply small savings into large sums quickly. 

In real-world finance:
1. Extremely high-return promises almost always indicate scams, Ponzi schemes, or illegal gambling.
2. Market-linked assets (like index funds or bluechip shares) grow at sustainable annual rates (e.g. 10%–12% historically), but need **years of compounding**, not days.
3. The most reliable way to grow:
   - **Save regularly** (adding ₹100 or ₹500 every single month via SIP)
   - **Invest in yourself** (use small capital to learn skills that increase your monthly income)
   - **Protect yourself** (keep emergency cash safe before taking any market risk)

Would you like to build a realistic step-by-step savings plan for your money?`,
      intent: 'REALITY_CHECK',
      suggestedActions: ['Start with ₹100 Plan', 'Learn Compounding', 'Emergency Fund Checklist']
    };
  }

  // Safety Rule 2: Borrowing / leverage / F&O speculation warning
  if (/borrow money to invest|take loan to trade|futures and options|f&o tips|leverage/i.test(msg)) {
    return {
      message: `⚠️ **Critical Financial Warning**: Never borrow money or take personal loans to invest in the stock market or trade derivatives (F&O).

According to SEBI official research studies:
- Over **93% of individual retail traders in F&O lose money**, with average losses exceeding ₹1.2 Lakh.
- Paying interest on a loan while market prices are dropping can wipe out your net worth.

The golden rule of wealth building: Only invest unborrowed, surplus money that you do not need for daily living essentials.`,
      intent: 'SAFETY_WARNING',
      suggestedActions: ['Check Demat Basics', 'Read Risk Lesson', 'Safe Savings Options']
    };
  }

  // Detection: User mentions an amount but has not provided all 4 diagnostic pillars
  const amountMatch = msg.match(/(₹|rs\.?|inr)?\s*([0-9,]+)/i);
  const mentionedAmount = amountMatch ? parseInt(amountMatch[2].replace(/,/g, ''), 10) : null;

  if (mentionedAmount && (!context.timeHorizon || !context.hasEmergency || !context.riskComfort)) {
    return {
      message: `Great! You are planning with **₹${mentionedAmount.toLocaleString('en-IN')}**.

Before I can suggest tailored, responsible options for your ₹${mentionedAmount.toLocaleString('en-IN')}, I need to know 4 quick things:

1. **Time Horizon**: When might you need this money? (e.g., in a few weeks, 1 year, or 5+ years?)
2. **Emergency Cushion**: Do you already have a cash buffer for unexpected hospital or job emergencies?
3. **Risk Comfort**: If market prices temporarily dropped by 15% next month, would you panic and withdraw, or can you wait?
4. **Existing Accounts**: Do you already have a Demat / Mutual Fund account, or just a regular savings bank account?

Tell me your answers, or use our interactive **Plan My Money** wizard!`,
      intent: 'DIAGNOSTIC_GATHERING',
      suggestedActions: [
        'Open Planning Wizard',
        'I am completely new',
        'I need it in 1 year',
        'I want safe options only'
      ]
    };
  }

  // Question on Demat accounts
  if (/demat|zerodha|groww|trading account/i.test(msg)) {
    return {
      message: `A **Demat Account** is simply a secure electronic locker (supervised by SEBI via CDSL/NSDL) that stores your shares, ETFs, and bonds digitally.

Key facts:
- **Do you need one?** Yes, if you want to buy direct stocks or ETFs (like Nifty 50 BeES or Gold BeES).
- **When is it NOT required?** If you only want to invest in Direct Mutual Funds, you can invest directly through fund houses (AMCs) or MFCentral without opening a demat account.
- **Top brokers**: Zerodha, Groww, Angel One, Upstox all offer SEBI-registered paperless video KYC.

Check our neutral broker comparison tab to see fee structures without any marketing bias!`,
      intent: 'DEMAT_GUIDE',
      suggestedActions: ['Compare Demat Brokers', 'What is KYC?', 'Explore Mutual Funds']
    };
  }

  // Question on Mutual Funds vs Stocks
  if (/mutual fund|stock|difference/i.test(msg)) {
    return {
      message: `Here is the simplest way to understand the difference:

- **Single Stock**: Buying 1 share of TCS means your return depends entirely on TCS. If the company performs poorly, your investment drops. (Higher risk, requires deep research).
- **Mutual Fund / Index Fund**: A fund collects money and spreads it across 50 to 100 top companies. If 2 companies perform poorly, the other 48 cushion the fall. (Lower individual risk, ideal for beginners).

For people starting with ₹500 or ₹1,000, broad index mutual funds offer instant diversification without having to analyze balance sheets!`,
      intent: 'EDUCATIONAL',
      suggestedActions: ['Compare Stock vs MF', 'What is an Index Fund?', 'Simulate ₹500 SIP']
    };
  }

  // Default friendly coach response
  return {
    message: `Hello! I am your **SaveWise Financial Coach**. 

My goal is to give you honest, step-by-step clarity on your money without hype or sales pressure.

Here is what we can do together:
1. **Plan an amount**: Tell me how much you have (e.g. ₹100, ₹500, ₹10,000) and I'll explain realistic allocations.
2. **Understand concepts**: Ask me "What is an ETF?", "How does KYC work?", or "Explain Compounding like I'm new".
3. **Verify offers**: Ask me "Is this Telegram trading group legit?" to check for red flags.

How can I help you today?`,
    intent: 'GENERAL_GREETING',
    suggestedActions: ['Plan ₹500', 'Plan ₹100', 'Is my investment legit?', 'Explain Mutual Funds']
  };
}

// POST /api/ai-coach/chat
router.post('/chat', optionalAuth, (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Please provide a message.' });
    }

    let userContext = context || {};

    // If user has saved a profile and is logged in, attach their profile for personalization
    if (req.user && !context) {
      const profile = db.prepare('SELECT * FROM financial_profiles WHERE user_id = ?').get(req.user.id);
      if (profile) {
        userContext = {
          amount: profile.amount,
          familiarity: profile.familiarity,
          timeHorizon: profile.time_horizon,
          riskComfort: profile.risk_comfort,
          hasEmergency: profile.has_emergency === 1
        };
      }
    }

    const response = generateCoachResponse(message, userContext);
    res.json(response);
  } catch (err) {
    console.error('AI Coach error:', err);
    res.status(500).json({ error: 'AI Coach service temporarily unavailable.' });
  }
});

export default router;
