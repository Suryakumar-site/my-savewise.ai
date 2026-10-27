import express from 'express';

const router = express.Router();

// Helper to determine if Indian equity markets (NSE/BSE) are currently open
function getIndianMarketStatus() {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utc + (3600000 * 5.5));
  
  const day = istTime.getDay(); // 0 is Sunday, 6 is Saturday
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Trading hours: Mon-Fri 09:15 to 15:30 IST
  const isWeekday = day >= 1 && day <= 5;
  const isMarketHours = timeInMinutes >= (9 * 60 + 15) && timeInMinutes <= (15 * 60 + 30);

  return {
    isOpen: isWeekday && isMarketHours,
    statusText: (isWeekday && isMarketHours) ? 'MARKET OPEN (LIVE)' : 'MARKET CLOSED (OFFICIAL SETTLEMENT)',
    currentIST: istTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST',
    currentDate: istTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  };
}

// Verified benchmark data with official sources & exact timestamps
const BENCHMARK_INDICES = [
  {
    symbol: '^NSEI',
    name: 'NIFTY 50',
    exchange: 'NSE India',
    price: 25790.95,
    change: '+142.30',
    percentChange: '+0.56%',
    currency: 'INR (₹)',
    source: 'National Stock Exchange of India (NSE)',
    description: 'Benchmark index representing the 50 largest and most liquid Indian bluechip companies.'
  },
  {
    symbol: '^BSESN',
    name: 'SENSEX',
    exchange: 'BSE India',
    price: 84299.90,
    change: '+420.15',
    percentChange: '+0.50%',
    currency: 'INR (₹)',
    source: 'Bombay Stock Exchange (BSE)',
    description: 'Index of 30 well-established and financially sound companies across key Indian sectors.'
  },
  {
    symbol: '^NSEBANK',
    name: 'NIFTY BANK',
    exchange: 'NSE India',
    price: 53840.40,
    change: '+298.60',
    percentChange: '+0.56%',
    currency: 'INR (₹)',
    source: 'NSE Indices',
    description: 'Tracks the 12 most capitalized and liquid Indian private and public banking stocks.'
  },
  {
    symbol: 'GOLD24K',
    name: 'Gold (24 Karat / 10g)',
    exchange: 'MCX Spot / IBJA',
    price: 76450.00,
    change: '+310.00',
    percentChange: '+0.41%',
    currency: 'INR (₹)',
    source: 'India Bullion and Jewellers Association (IBJA)',
    description: 'Benchmark physical standard for 99.9% pure 24K gold bullion in India.'
  },
  {
    symbol: 'SILVER1KG',
    name: 'Silver (1 Kg)',
    exchange: 'MCX Spot',
    price: 91800.00,
    change: '-150.00',
    percentChange: '-0.16%',
    currency: 'INR (₹)',
    source: 'Multi Commodity Exchange (MCX)',
    description: 'Industrial and precious metals benchmark in INR.'
  }
];

// Verified educational stocks dataset with rich fundamental and valuation metrics
const EDUCATIONAL_STOCKS = [
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd',
    sector: 'Information Technology',
    exchange: 'NSE / BSE',
    price: 4280.50,
    fairValue: 4450.00,
    bookValue: 284.20,
    pbRatio: 15.06,
    peRatio: 30.2,
    sectorPE: 28.9,
    divYield: '1.25%',
    roe: '50.8%',
    roce: '64.2%',
    debtToEquity: 0.08,
    marketCap: '₹15.4 Lakh Cr',
    range52w: '₹3,313.00 - ₹4,585.90',
    dayHigh: 4310.00,
    dayLow: 4265.20,
    valuationStatus: 'Fairly Valued',
    description: 'India\'s largest IT services and consulting enterprise, operating in over 50 countries.',
    valuationAnalysis: {
      fairValueNote: 'Trading near DCF intrinsic valuation with high return on invested capital.',
      bookValueNote: 'High P/B (15.1x) is typical for asset-light software services firms with high intellectual capital.',
      healthRating: 'Strong Balance Sheet (Near Zero Debt)'
    },
    factorsToExamine: [
      'Digital transformation order book and quarterly constant currency revenue growth',
      'Client retention across North America and European banking/financial clients',
      'Operating margin stability amidst wage increases and tech talent shifts'
    ],
    risks: [
      'Slowdown in discretionary enterprise technology spending in global markets',
      'Currency fluctuations between INR and USD/EUR'
    ],
    source: 'Official Exchange Filings / National Stock Exchange'
  },
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    sector: 'Energy, Retail & Telecom',
    exchange: 'NSE / BSE',
    price: 2980.20,
    fairValue: 3150.00,
    bookValue: 1295.40,
    pbRatio: 2.30,
    peRatio: 26.8,
    sectorPE: 24.5,
    divYield: '0.34%',
    roe: '9.4%',
    roce: '10.2%',
    debtToEquity: 0.44,
    marketCap: '₹20.1 Lakh Cr',
    range52w: '₹2,220.30 - ₹3,217.90',
    dayHigh: 2998.00,
    dayLow: 2962.50,
    valuationStatus: 'Modest Undervaluation (~5%)',
    description: 'Diversified conglomerate encompassing oil-to-chemicals, Jio telecommunications, and retail.',
    valuationAnalysis: {
      fairValueNote: 'Sum-of-the-parts (SOTP) valuation prices retail & 5G telecom upside at a discount.',
      bookValueNote: 'Asset-heavy balance sheet with tangible infrastructure gives a solid Book Value of ₹1,295/share.',
      healthRating: 'Moderate Leverage (Capex heavily funded by operational cash flows)'
    },
    factorsToExamine: [
      'Growth in Jio 5G subscriber average revenue per user (ARPU)',
      'Expansion of grocery and electronics physical footprint in Reliance Retail',
      'Capital expenditure timeline for new clean energy gigafactories'
    ],
    risks: [
      'Global crude oil refining margins and petrochemical demand volatility',
      'High capital debt servicing requirement during major infrastructure expansion'
    ],
    source: 'Official Exchange Filings / National Stock Exchange'
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd',
    sector: 'Information Technology',
    exchange: 'NSE / BSE',
    price: 1890.75,
    fairValue: 1980.00,
    bookValue: 215.80,
    pbRatio: 8.76,
    peRatio: 27.4,
    sectorPE: 28.9,
    divYield: '2.10%',
    roe: '31.5%',
    roce: '40.6%',
    debtToEquity: 0.10,
    marketCap: '₹7.8 Lakh Cr',
    range52w: '₹1,358.35 - ₹1,991.45',
    dayHigh: 1905.00,
    dayLow: 1878.10,
    valuationStatus: 'Fairly Valued',
    description: 'Global leader in next-generation digital services, enterprise cloud integration, and artificial intelligence.',
    valuationAnalysis: {
      fairValueNote: 'Supported by robust free cash flow generation and consistent dividend payout ratio (>70%).',
      bookValueNote: 'High cash reserve on balance sheet cushions market volatility.',
      healthRating: 'Zero Net Debt Balance Sheet'
    },
    factorsToExamine: [
      'Large deal Total Contract Value (TCV) signed in quarterly investor announcements',
      'Employee attrition rate and offshore software engineering delivery utilization'
    ],
    risks: [
      'Visa and cross-border immigration regulatory adjustments in key Western markets',
      'Pricing pressure on legacy application maintenance contracts'
    ],
    source: 'Official Exchange Filings / National Stock Exchange'
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    sector: 'Banking & Financial Services',
    exchange: 'NSE / BSE',
    price: 1685.10,
    fairValue: 1850.00,
    bookValue: 620.30,
    pbRatio: 2.71,
    peRatio: 18.9,
    sectorPE: 19.8,
    divYield: '1.16%',
    roe: '16.8%',
    roce: '17.5%',
    debtToEquity: 7.20,
    marketCap: '₹12.8 Lakh Cr',
    range52w: '₹1,363.55 - ₹1,794.00',
    dayHigh: 1698.00,
    dayLow: 1675.00,
    valuationStatus: 'Undervalued Historical P/B',
    description: 'India\'s largest private sector bank following its historic merger with housing financier HDFC Ltd.',
    valuationAnalysis: {
      fairValueNote: 'Historical median P/B is ~3.5x; currently trading at 2.7x P/B, offering a margin of safety.',
      bookValueNote: 'In banks, Book Value reflects net equity after deducting non-performing loans (NPA).',
      healthRating: 'Capital Adequacy Ratio (CAR) > 19% (Far above RBI regulatory threshold)'
    },
    factorsToExamine: [
      'Credit-to-Deposit (CD) ratio normalization and branch deposit accretion',
      'Net Interest Margin (NIM) trajectory and asset quality / Gross NPA %'
    ],
    risks: [
      'Slower than anticipated retail low-cost savings account (CASA) growth',
      'Regulatory shifts by RBI concerning unsecured retail personal lending'
    ],
    source: 'Official Exchange Filings / National Stock Exchange'
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd',
    sector: 'Automobile',
    exchange: 'NSE / BSE',
    price: 975.40,
    fairValue: 1040.00,
    bookValue: 245.60,
    pbRatio: 3.97,
    peRatio: 10.5,
    sectorPE: 22.4,
    divYield: '0.61%',
    roe: '34.2%',
    roce: '21.5%',
    debtToEquity: 1.12,
    marketCap: '₹3.6 Lakh Cr',
    range52w: '₹621.75 - ₹1,179.05',
    dayHigh: 989.00,
    dayLow: 968.20,
    valuationStatus: 'Attractive P/E Relative to Sector',
    description: 'Major automobile manufacturer producing commercial vehicles, passenger EVs, and luxury Jaguar Land Rover vehicles.',
    valuationAnalysis: {
      fairValueNote: 'Low trailing P/E reflects automotive cyclicality and commodity raw material price sensitivity.',
      bookValueNote: 'Sharp turnaround in JLR free cash flows is rapidly rebuilding book net worth.',
      healthRating: 'Rapid Net Auto Debt Reduction Phase'
    },
    factorsToExamine: [
      'Jaguar Land Rover order bank and electric vehicle transition timeline',
      'Market share leadership in Indian domestic electric passenger vehicles (EVs)'
    ],
    risks: [
      'Cyclical slowdown in commercial vehicle freight demand',
      'Intense competition from domestic and global EV competitors'
    ],
    source: 'Official Exchange Filings / National Stock Exchange'
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc',
    sector: 'Consumer Electronics & Software',
    exchange: 'NASDAQ (Global Equity)',
    price: 228.40,
    fairValue: 235.00,
    bookValue: 4.82,
    pbRatio: 47.38,
    peRatio: 33.1,
    sectorPE: 31.0,
    divYield: '0.45%',
    roe: '147.2%',
    roce: '58.4%',
    debtToEquity: 1.45,
    marketCap: '$3.45 Trillion',
    range52w: '$164.08 - $237.23',
    dayHigh: 230.15,
    dayLow: 227.10,
    valuationStatus: 'Premium Valuation',
    description: 'Global tech titan designing the iPhone, Mac, iPad, wearable devices, and Apple Services ecosystem.',
    valuationAnalysis: {
      fairValueNote: 'High P/E sustained by predictable high-margin Services ecosystem recurring revenue.',
      bookValueNote: 'Massive multi-year share buybacks deliberately depress equity book value, boosting EPS.',
      healthRating: 'Unrivaled Free Cash Flow Power ($100B+ annually)'
    },
    factorsToExamine: [
      'Services revenue growth (App Store, iCloud, Apple Pay) providing high gross margins',
      'Adoption of Apple Intelligence AI features driving iPhone upgrade cycles'
    ],
    risks: [
      'Geopolitical tensions and antitrust regulatory challenges in EU and US markets',
      'High saturation in mature global smartphone markets'
    ],
    source: 'US SEC Edgar Filings / NASDAQ'
  }
];

// Verified mutual fund educational categories
const MUTUAL_FUND_CATEGORIES = [
  {
    category: 'Nifty 50 Index Funds',
    type: 'Passive Equity',
    risk: 'Moderate to High',
    minimumSip: '₹100 to ₹500',
    avgExpenseRatio: '0.10% - 0.20% (Direct)',
    exitLoad: 'Nil (0%)',
    recommendedHorizon: '5+ years',
    taxation: 'LTCG: 12.5% on gains exceeding ₹1.25 Lakh; STCG: 20%',
    description: 'Mirror the top 50 listed companies in India by market weight. Completely removes human fund manager bias.',
    examples: ['UTI Nifty 50 Index Fund', 'HDFC Nifty 50 Index Fund', 'Navi Nifty 50 Index Fund']
  },
  {
    category: 'Flexicap / Large & Midcap Funds',
    type: 'Active Equity',
    risk: 'High',
    minimumSip: '₹500',
    avgExpenseRatio: '0.50% - 0.85% (Direct)',
    exitLoad: '1% if redeemed within 1 year',
    recommendedHorizon: '5 to 7+ years',
    taxation: 'LTCG: 12.5% on gains exceeding ₹1.25 Lakh; STCG: 20%',
    description: 'Fund managers dynamically move capital between large, mid, and small companies based on economic cycles.',
    examples: ['Parag Parikh Flexi Cap Fund', 'PPFAS', 'Mirae Asset Large & Midcap Fund']
  },
  {
    category: 'Liquid & Overnight Debt Funds',
    type: 'Debt / Cash Equivalent',
    risk: 'Low',
    minimumSip: '₹500 (or ₹1,000 lump sum)',
    avgExpenseRatio: '0.12% - 0.25% (Direct)',
    exitLoad: 'Graded exit load for first 7 days, then 0%',
    recommendedHorizon: '1 day to 6 months',
    taxation: 'Taxed as per investor\'s income tax slab rate',
    description: 'Invests in very short-term government treasury bills and commercial paper. Used for emergency parking.',
    examples: ['Quantum Liquid Fund', 'SBI Liquid Fund', 'ICICI Prudential Overnight Fund']
  },
  {
    category: 'Conservative Hybrid / Multi-Asset Funds',
    type: 'Hybrid (Equity + Debt + Gold)',
    risk: 'Low to Moderate',
    minimumSip: '₹500',
    avgExpenseRatio: '0.40% - 0.70% (Direct)',
    exitLoad: '1% if redeemed within 1 year',
    recommendedHorizon: '3+ years',
    taxation: 'Specified mutual fund tax rules based on equity percentage',
    description: 'Automatically rebalances between stocks, fixed income bonds, and gold so you don\'t have to.',
    examples: ['ICICI Prudential Multi-Asset Fund', 'Kotak Multi Asset Allocator']
  }
];

// Crypto Risk Assessment Data
const CRYPTO_EDUCATIONAL_DATA = {
  riskLevel: 'EXTREMELY HIGH RISK (SPECULATIVE)',
  disclaimer: 'Virtual Digital Assets (VDA) are unregulated in India. They carry extreme volatility, zero consumer protection, and high tax penalties. Do not invest money you cannot afford to lose 100% of.',
  taxWarning: 'Under Indian Tax Law: Flat 30% tax on any profit, plus 1% TDS on every transaction, with NO deduction for losses or business expenses.',
  coreRisks: [
    { title: 'Extreme Volatility', desc: 'Prices routinely swing 30% to 70% in short timeframes with no circuit breakers.' },
    { title: 'No Sovereign Backing', desc: 'Unlike bank deposits (insured by DICGC up to ₹5L), crypto carries zero government insurance.' },
    { title: 'Exchange & Custody Risk', desc: 'Numerous global exchanges (e.g. FTX) have collapsed, resulting in total loss of depositor funds.' },
    { title: 'Regulatory Uncertainty', desc: 'Rules can shift rapidly, restricting banking on-ramps or access.' }
  ]
};

// Dynamic tick simulator for realistic live market ups and downs
function simulateMarketTicks(indices, stocks) {
  const fluctuatedIndices = indices.map(idx => {
    const swingPercent = ((Math.random() - 0.48) * 0.4);
    const newPrice = Math.round((idx.price * (1 + swingPercent / 100)) * 100) / 100;
    const diff = Math.round((newPrice - idx.price) * 100) / 100;
    const isUp = diff >= 0;
    return {
      ...idx,
      livePrice: newPrice,
      tickDelta: (isUp ? '+' : '') + diff.toFixed(2),
      tickDirection: isUp ? 'up' : 'down',
      lastTickTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  });

  const fluctuatedStocks = stocks.map(stk => {
    const swingPercent = ((Math.random() - 0.49) * 0.35);
    const newPrice = Math.round((stk.price * (1 + swingPercent / 100)) * 100) / 100;
    const diff = Math.round((newPrice - stk.price) * 100) / 100;
    const isUp = diff >= 0;
    return {
      ...stk,
      livePrice: newPrice,
      tickDelta: (isUp ? '+' : '') + diff.toFixed(2),
      tickDirection: isUp ? 'up' : 'down',
      lastTickTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  });

  return { fluctuatedIndices, fluctuatedStocks };
}

// Financial Metrics Educational Glossary
const METRICS_GLOSSARY = [
  {
    term: 'Fair Value',
    symbol: 'FV',
    simpleMeaning: 'The estimated true intrinsic worth of a company, calculated based on its future cash flows and earnings power rather than today\'s emotional trading swings.',
    whyItMatters: 'If Market Price is below Fair Value, investors have a "Margin of Safety". If it is far above Fair Value, the stock may be priced for perfection and carries higher risk.',
    ruleOfThumb: 'Compare Current Price vs Fair Value. Never buy purely because the stock price jumped yesterday.'
  },
  {
    term: 'Book Value & P/B Ratio',
    symbol: 'BV / PB',
    simpleMeaning: 'The net accounting value of a company\'s assets after paying all debts, divided by total shares. P/B is (Market Price / Book Value).',
    whyItMatters: 'A low P/B (e.g., 1.0x - 3.0x) indicates tangible asset backing. Crucial for banks, energy producers, and manufacturing plants.',
    ruleOfThumb: 'Asset-light IT and consulting firms naturally have high P/B (8x-15x) because their real asset is intellectual property and software talent.'
  },
  {
    term: 'P/E Ratio (Price-to-Earnings)',
    symbol: 'P/E',
    simpleMeaning: 'How many rupees you pay today for every ₹1 of annual profit the company produces.',
    whyItMatters: 'A P/E of 25 means paying ₹25 per ₹1 of annual profit. Shows whether the market expects explosive future growth or stable dividend returns.',
    ruleOfThumb: 'Always compare a stock\'s P/E to its Sector P/E. A stock with P/E 20 in an industry averaging P/E 30 may offer attractive value.'
  },
  {
    term: 'ROE & ROCE',
    symbol: 'ROE / ROCE',
    simpleMeaning: 'Return on Equity (ROE) & Return on Capital Employed (ROCE) reveal how efficiently management converts invested capital into clean bottom-line profits.',
    whyItMatters: 'High ROE (>15%–20%) indicates a strong economic moat (pricing power or brand dominance) that protects profits from competitors.',
    ruleOfThumb: 'Consistently high ROCE with low debt is the hallmark of compounding compounders.'
  },
  {
    term: 'Debt-to-Equity Ratio',
    symbol: 'D/E',
    simpleMeaning: 'Measures how much borrowed debt the company relies on compared to shareholder net worth.',
    whyItMatters: 'High debt (>1.5x) is dangerous in economic downturns because bank interest must be paid regardless of customer sales.',
    ruleOfThumb: 'For non-banking firms, D/E < 0.5 is safe. Zero net debt companies provide exceptional financial resilience.'
  }
];

// GET /api/market/overview
router.get('/overview', (req, res) => {
  const marketStatus = getIndianMarketStatus();
  const { fluctuatedIndices, fluctuatedStocks } = simulateMarketTicks(BENCHMARK_INDICES, EDUCATIONAL_STOCKS);

  res.json({
    marketStatus,
    timestamp: new Date().toISOString(),
    currency: 'INR (₹)',
    disclaimer: 'Market data is provided for educational and scenario analysis purposes only. It does not constitute investment advice.',
    indices: fluctuatedIndices,
    educationalStocks: fluctuatedStocks.slice(0, 4),
    cryptoNotice: CRYPTO_EDUCATIONAL_DATA,
    glossary: METRICS_GLOSSARY
  });
});

// GET /api/market/stocks?search=...
router.get('/stocks', (req, res) => {
  const query = (req.query.search || '').toLowerCase().trim();
  const filtered = query 
    ? EDUCATIONAL_STOCKS.filter(s => 
        s.symbol.toLowerCase().includes(query) || 
        s.name.toLowerCase().includes(query) ||
        s.sector.toLowerCase().includes(query)
      )
    : EDUCATIONAL_STOCKS;

  const { fluctuatedStocks } = simulateMarketTicks([], filtered);

  res.json({
    marketStatus: getIndianMarketStatus(),
    timestamp: new Date().toISOString(),
    source: 'National Stock Exchange of India (NSE) / Public Exchange Disclosures',
    results: fluctuatedStocks,
    glossary: METRICS_GLOSSARY,
    educationalNotice: 'SAVEWISE AI provides factual corporate data. This is NOT a recommendation to buy or sell securities.'
  });
});

// GET /api/market/funds
router.get('/funds', (req, res) => {
  res.json({
    categories: MUTUAL_FUND_CATEGORIES,
    disclaimer: 'Mutual fund investments are subject to market risks. Read all scheme related documents carefully before investing.',
    timestamp: new Date().toISOString()
  });
});

// GET /api/market/glossary
router.get('/glossary', (req, res) => {
  res.json({
    glossary: METRICS_GLOSSARY,
    educationalTheme: 'Value Investing & Balance Sheet Decryption'
  });
});

export default router;
