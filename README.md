# SaveWise AI (AssetGrow) 🚀

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL_Mode-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

> **"I have money. What can I actually do with it?"**  
> **SaveWise AI** is a personal financial agency, scenario modeling, and capital protection platform built for Indian financial savers. It replaces get-rich-quick hype with honest risk awareness, multi-strategy asset allocation, intrinsic valuation metrics, and transparent educational roadmaps.

---

## 🌟 Highlights & Key Features

### 1. 🧭 Diagnostic Financial Planning Engine (Step 1 to 7)
- **Granular Capital Input**: Plans starting from as low as **₹100** up to **₹1,00,000+**.
- **Specialized ₹100 Micro-Roadmap**: Analyzes safe liquid buffers vs. knowledge experiment investments vs. micro ETF/fractional gold units.
- **4 Distinct Asset Allocations**:
  - **Conservative**: Capital preservation, high liquidity, bank deposits, zero equity risk.
  - **Balanced**: Liquid safety buffer combined with disciplined index fund compounding.
  - **Growth**: Multi-year inflation-beating equity allocation with crash buffers.
  - **Knowledge & Habit**: Focus on financial literacy and small, consistent SIP habits.
- **🔄 Instant Strategy Refresh Engine**: Click *"Give Me Different Options"* to generate alternate scenarios and allocation permutations.

### 2. 💎 4% Transparent Premium Planning Engine
- **100% Free Tier**: Financial roadmaps for capital up to **₹1,000** are free forever.
- **Upfront 4% Software Planning Fee**: For target planning capital exceeding **₹1,000**, users pay a flat 4% software service fee (+ 18% GST).
- **Direct Admin Payout Integration**: Payments display the official configured **Admin Bank Account credentials** (Bank Name, Account Number, IFSC) and **Admin UPI ID / QR code**.
- **Instant Plan Unlock**: The moment payment is verified, the system generates and unlocks the full comprehensive strategy for the user's **entire capital**.
- **Official GST Tax Invoices**: Generates audited tax invoices (`SW-INV-XXXXXX`) with one-click printable receipts.

### 3. 🛡️ Admin Telemetry & Bank Account Setup
- **Bank Credentials Manager**: Admin can update their Account Holder Name, Bank Name, Account Number, IFSC, and UPI ID directly from the portal.
- **Audit & Settlement Table**: Tracks every premium order, client details, 4% fee paid, and credited bank account.
- **Live System Telemetry**: Monitors server uptime, heap memory usage, and SQLite WAL database health.

### 4. 📈 Real-Time Market Explorer & Valuation Terminal
- **Live Ticker Engine**: Real-time simulated price ticks every 2.5 seconds with green ($\uparrow$) and red ($\downarrow$) flash indicators.
- **Second-by-Second IST Clock**: Live market session indicator (`MARKET OPEN (LIVE)` vs. `SETTLEMENT`).
- **Comprehensive Fundamental Metrics**:
  - **Fair Value (DCF)**: Calculates intrinsic valuation vs. current price and highlights Margin of Safety %.
  - **Book Value per Share (BVPS)**: Net asset liquidation value per share.
  - **P/B Ratio**: Identifies asset-backed bargains vs. high-IP software franchises.
  - **P/E vs. Sector P/E**: Contextual earnings multiples.
  - **ROE & ROCE**: Capital efficiency and operating moat indicators.
  - **Debt-to-Equity**: Solvency and financial leverage risk.
- **Financial Education Masterclass**: Dedicated panel explaining how to read Fair Value, Book Value, and P/E ratios to avoid buying overhyped assets.
- **Mutual Fund & ETF Radar**: Index funds, Flexicap, and liquid funds with expense ratio comparisons and tax implications.
- **Crypto Risk Disclosures**: Clear breakdown of Indian tax realities (Flat 30% tax + 1% TDS, no loss set-off) and extreme volatility warnings.

### 5. 🛠️ Financial Utilities & Tools
- **🔍 Scam Detector**: Algorithmic risk evaluation detecting Ponzi schemes, guaranteed return traps, and fake Telegram trading channels.
- **📊 What-If Compound Simulator**: 1-30 year compounding simulations with inflation-adjusted real purchasing power comparisons.
- **🎯 Goals Tracker**: Set milestones (e.g. Emergency Fund, Laptop) with monthly required savings calculation and 3 alternative pacing scenarios.
- **🤖 Smart AI Financial Coach**: Safety-guarded conversational coach for non-advisory educational money questions.
- **📚 3-Tier Learning Academy**: Interactive financial literacy quizzes tracking completed modules.
- **💼 Demat Broker Guide**: Feature & fee comparison across Zerodha, Groww, Angel One, and ICICI Direct.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Lucide React, Canvas Confetti |
| **Styling** | Vanilla CSS Design System, Glassmorphism, Dark/Light Mode Tokens |
| **Backend** | Node.js, Express 5, CORS, Dotenv |
| **Database** | SQLite via `better-sqlite3` (WAL Mode enabled) |
| **Security** | JWT Authentication, Bcryptjs password hashing, Non-custodial architecture |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` (comes with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Suryakumar-site/my-savewise.ai.git
   cd my-savewise.ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Running Locally

To run the complete application, launch the backend and frontend dev servers:

1. **Start the Backend API Server (Port 5000):**
   ```bash
   npm run server
   ```
   *The backend starts at `http://localhost:5000` and automatically initializes SQLite tables and seed accounts.*

2. **Start the Frontend Vite Dev Server (Port 3000):**
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser.*

3. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🔐 Default Demo Credentials

The database automatically seeds two test accounts for instant evaluation:

| Account Type | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Regular User** | `demo@savewise.ai` | `SaveWise@2026` | Planning Wizard, Saved Plans, Goals, Timeline |
| **System Admin** | `admin@savewise.ai` | `AdminWise@2026` | Admin Telemetry, Bank Account & Payout Setup, Order Auditing |

*(You can also use the 1-click login buttons in the Sign In modal).*

---

## 📁 Project Structure

```
my-savewise.ai/
├── index.html                   # HTML entry point with metadata & Google Fonts
├── vite.config.js               # Vite config with API proxy to port 5000
├── package.json                 # Project dependencies & scripts
├── .gitignore                   # Excludes node_modules, dist, and DB journal files
├── server/
│   ├── index.js                 # Express server entry point & middleware
│   ├── db.js                    # SQLite schema, tables & automatic seeding
│   ├── data/
│   │   └── financialData.js     # Curated educational market assets & curriculum
│   └── routes/
│       ├── admin.js             # Admin metrics, audit logs & payout settings
│       ├── aiCoach.js           # Guarded AI chat assistant
│       ├── auth.js              # User authentication, registration & JWT verify
│       ├── goals.js             # Personal goals CRUD & savings contributions
│       ├── learning.js          # Academy lessons & quiz progress
│       ├── market.js            # Live market tickers, valuation metrics & glossary
│       ├── plans.js             # Multi-strategy planning algorithm (Conservative to Growth)
│       ├── premium.js           # 4% fee checkout, admin payout routing & invoice generation
│       └── scamCheck.js         # Scam detection evaluation engine
└── src/
    ├── main.jsx                 # React root renderer
    ├── App.jsx                  # Main router, state coordinator & modal manager
    ├── index.css                # Curated design tokens, glassmorphism & typography
    └── components/
        ├── AdminPanel.jsx       # Admin telemetry & bank account payout credentials
        ├── AuthModal.jsx        # Login / Registration modal with demo 1-click
        ├── ComparisonEngine.jsx # Side-by-side strategy comparison
        ├── Dashboard.jsx        # User command center, progress & saved allocations
        ├── DematGuide.jsx       # Broker comparison & account opening guide
        ├── DisclaimerBanner.jsx # SEBI compliance & live market status strip
        ├── GoalsTracker.jsx     # Milestone savings tracker with pacing scenarios
        ├── LearningCenter.jsx   # Interactive financial literacy academy
        ├── MarketExplorer.jsx   # Real-time market terminal with Fair Value & Book Value
        ├── Navbar.jsx           # Responsive navigation bar with Dark/Light mode
        ├── OnboardingWizard.jsx # 7-step diagnostic profiling wizard
        ├── PlanGenerator.jsx    # Strategy visualizer, 9-point breakdowns & save plan
        ├── PremiumModal.jsx     # 4% fee checkout with admin bank details & instant plan unlock
        ├── ScamDetector.jsx     # Investment red-flag & legitimacy calculator
        ├── SmartCoach.jsx       # Safety-first AI conversation assistant
        ├── WealthOptimizer.jsx  # Asset allocation analyzer & FD vs SIP calculators
        └── WhatIfSimulator.jsx  # Multi-year compound growth simulator
```

---

## ⚖️ Regulatory & Safety Disclaimers

- **Educational Non-Advisory Notice**: SaveWise AI is an educational technology and financial literacy platform. It does not provide SEBI-registered investment advice, stock recommendations, or portfolio management services.
- **Non-Custodial Architecture**: SaveWise AI does not hold or invest client funds. All financial capital remains entirely in the user's own bank or demat accounts.
- **Zero Guaranteed Returns**: All investments in securities and market-linked instruments carry risk of capital loss. Past performance does not guarantee future results.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
