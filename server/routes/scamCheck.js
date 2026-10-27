import express from 'express';
import { SCAM_RED_FLAGS } from '../data/financialData.js';

const router = express.Router();

const OFFICIAL_VERIFICATION_RESOURCES = [
  {
    name: 'SEBI SCORES & Registered Entities Check',
    authority: 'Securities and Exchange Board of India',
    url: 'https://scores.sebi.gov.in',
    purpose: 'Verify if a stock broker, mutual fund, or investment advisor holds a valid SEBI registration number.'
  },
  {
    name: 'RBI Sachet Portal',
    authority: 'Reserve Bank of India',
    url: 'https://sachet.rbi.org.in',
    purpose: 'Report and check unauthorized deposit schemes, fraudulent chit funds, and fake illegal loan/investment apps.'
  },
  {
    name: 'MCA Company & Director Master Data',
    authority: 'Ministry of Corporate Affairs (Govt of India)',
    url: 'https://www.mca.gov.in/mcafoportal/viewCompanyMasterData.do',
    purpose: 'Check if a company is legitimately incorporated with registered directors and Paid-Up capital.'
  },
  {
    name: 'National Cyber Crime Reporting Portal',
    authority: 'Ministry of Home Affairs',
    url: 'https://cybercrime.gov.in',
    purpose: 'Helpline 1930: Emergency reporting of financial cyber fraud, UPI theft, and online impersonation scams.'
  }
];

// POST /api/scam-check/analyze
router.post('/analyze', (req, res) => {
  try {
    const { offerText, companyName, website } = req.body;
    const combined = `${offerText || ''} ${companyName || ''} ${website || ''}`.toLowerCase();

    if (!combined.trim()) {
      return res.status(400).json({ error: 'Please enter text, company name, or message snippet to analyze.' });
    }

    const detectedFlags = [];

    // Check 1: Guaranteed extreme returns
    const guaranteedPatterns = [
      /guarantee(d)?.*(return|profit|income|percent|%)/i,
      /double your (money|investment|cash)/i,
      /20%|30%|50%|100%.*(monthly|daily|week|guaranteed)/i,
      /1% daily|2% daily|3% daily/i,
      /risk[\s-]?free (wealth|profits|trading)/i,
      /make ₹?[0-9,]+ (every day|daily|per day)/i
    ];
    if (guaranteedPatterns.some(p => p.test(combined))) {
      detectedFlags.push(SCAM_RED_FLAGS.find(f => f.id === 'guaranteed_high_returns'));
    }

    // Check 2: Telegram / WhatsApp VIP trading signals
    const channelPatterns = [
      /telegram/i,
      /whatsapp (group|vip|admin|link)/i,
      /vip (signals|call|tips|group)/i,
      /sure shot (tips|calls)/i,
      /send screenshot to admin/i
    ];
    if (channelPatterns.some(p => p.test(combined))) {
      detectedFlags.push(SCAM_RED_FLAGS.find(f => f.id === 'telegram_whatsapp_groups'));
    }

    // Check 3: Urgency & pressure
    const urgencyPatterns = [
      /only [0-9]+ (seats|spots|slots) left/i,
      /hurry.*expires/i,
      /offer valid for today only/i,
      /act now before price increases/i,
      /last chance to invest/i
    ];
    if (urgencyPatterns.some(p => p.test(combined))) {
      detectedFlags.push(SCAM_RED_FLAGS.find(f => f.id === 'urgency_pressure'));
    }

    // Check 4: MLM / Referral pyramid
    const referralPatterns = [
      /refer [0-9]+ friends/i,
      /referral bonus/i,
      /binary income|downline|upline/i,
      /level [0-9]+ commission/i,
      /invite and earn ₹?[0-9]+/i
    ];
    if (referralPatterns.some(p => p.test(combined))) {
      detectedFlags.push(SCAM_RED_FLAGS.find(f => f.id === 'referral_pyramid'));
    }

    // Check 5: Sensitive credentials / PIN / Remote software
    const securityPatterns = [
      /upi pin/i,
      /atm pin/i,
      /share otp/i,
      /anydesk/i,
      /teamviewer/i,
      /rustdesk/i,
      /install apk/i
    ];
    if (securityPatterns.some(p => p.test(combined))) {
      detectedFlags.push(SCAM_RED_FLAGS.find(f => f.id === 'pin_otp_requests'));
    }

    // Check 6: Fake government / SEBI claim
    const fakeGovtPatterns = [
      /100% government approved/i,
      /rbi verified scheme/i,
      /sebi certified profit/i,
      /modi scheme bonus/i
    ];
    if (fakeGovtPatterns.some(p => p.test(combined))) {
      detectedFlags.push(SCAM_RED_FLAGS.find(f => f.id === 'unregistered_platform'));
    }

    // Calculate score
    let verdict = 'LOW_SUSPICION';
    let verdictTitle = 'No Obvious Scam Signals Detected';
    let verdictColor = '#10b981';
    let recommendation = 'While this specific text did not trigger our automatic scam patterns, ALWAYS verify SEBI/RBI registration numbers before depositing money.';

    if (detectedFlags.length >= 3 || detectedFlags.some(f => f?.severity === 'DEADLY')) {
      verdict = 'EXTREME_DANGER';
      verdictTitle = '🚨 DANGEROUS: Severe Scam Probability';
      verdictColor = '#ef4444';
      recommendation = 'DO NOT SEND MONEY. This offer matches classic patterns of illegal Ponzi schemes, advance fee fraud, or cyber theft.';
    } else if (detectedFlags.length >= 1) {
      verdict = 'HIGH_CAUTION';
      verdictTitle = '⚠️ HIGH CAUTION: Red Flags Detected';
      verdictColor = '#f59e0b';
      recommendation = 'Proceed with extreme care. Legitimate financial investments do not use high-pressure tactics or promise unrealistic returns.';
    }

    res.json({
      verdict,
      verdictTitle,
      verdictColor,
      flagsDetectedCount: detectedFlags.length,
      flags: detectedFlags.filter(Boolean),
      recommendation,
      verificationResources: OFFICIAL_VERIFICATION_RESOURCES,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Scam check error:', err);
    res.status(500).json({ error: 'Failed to complete scam analysis.' });
  }
});

// GET /api/scam-check/common-scams
router.get('/common-scams', (req, res) => {
  res.json({
    redFlags: SCAM_RED_FLAGS,
    resources: OFFICIAL_VERIFICATION_RESOURCES
  });
});

export default router;
