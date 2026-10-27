import React, { useState } from 'react';
import { 
  ShieldCheck, TrendingUp, DollarSign, PieChart, 
  Flame, Sparkles, ArrowRight, CheckCircle2, AlertCircle, 
  Layers, Percent, PiggyBank, RefreshCw, Zap, BookmarkCheck
} from 'lucide-react';

export default function WealthOptimizer({ user, onNavigateToPlan, onNavigateToGoals }) {
  const [activeSubTab, setActiveSubTab] = useState('emergency'); // 'emergency', 'budget', 'inflation', 'microsave', 'stepup', 'tax'

  // Tab 1: Emergency Shield State
  const [monthlyRent, setMonthlyRent] = useState(15000);
  const [monthlyFoodBills, setMonthlyFoodBills] = useState(12000);
  const [monthlyEMIs, setMonthlyEMIs] = useState(5000);
  const [dependents, setDependents] = useState(1);
  const [currentEmergencySaved, setCurrentEmergencySaved] = useState(30000);

  const monthlyEssentialTotal = monthlyRent + monthlyFoodBills + monthlyEMIs;
  const threeMonthCushion = monthlyEssentialTotal * 3;
  const sixMonthCushion = monthlyEssentialTotal * 6;
  const twelveMonthCushion = monthlyEssentialTotal * 12;
  const emergencyCoverageMonths = monthlyEssentialTotal > 0 ? (currentEmergencySaved / monthlyEssentialTotal).toFixed(1) : 0;
  const emergencyHealthPct = Math.min(100, Math.round((currentEmergencySaved / sixMonthCushion) * 100));

  // Tab 2: 50/30/20 Budget State
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [budgetRule, setBudgetRule] = useState('50-30-20'); // '50-30-20', '40-20-40', '60-25-15'

  const getBudgetSplits = () => {
    if (budgetRule === '40-20-40') {
      return { needsPct: 40, wantsPct: 20, investPct: 40, label: 'Aggressive Wealth Accumulator' };
    }
    if (budgetRule === '60-25-15') {
      return { needsPct: 60, wantsPct: 25, investPct: 15, label: 'Starter / Early Career Buffer' };
    }
    return { needsPct: 50, wantsPct: 30, investPct: 20, label: 'Balanced Classic 50/30/20' };
  };

  const currentSplit = getBudgetSplits();
  const needsAmt = Math.round((monthlyIncome * currentSplit.needsPct) / 100);
  const wantsAmt = Math.round((monthlyIncome * currentSplit.wantsPct) / 100);
  const investAmt = Math.round((monthlyIncome * currentSplit.investPct) / 100);

  // 10 Year Wealth projection from investAmt at 12% p.a.
  const calculateSIPWealth = (monthlyPmt, years, annualRate = 12) => {
    const r = annualRate / 100 / 12;
    const n = years * 12;
    return Math.round(monthlyPmt * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  };
  const projected10YrWealth = calculateSIPWealth(investAmt, 10, 12);
  const projected10YrPrincipal = investAmt * 120;

  // Tab 3: Inflation & Cost of Idle Cash
  const [idleCashAmount, setIdleCashAmount] = useState(100000);
  const [horizonYears, setHorizonYears] = useState(10);
  const inflationRate = 6.0; // 6% India average CPI

  // Returns
  const bankSavingsRate = 3.0; // 3%
  const bankFDRate = 7.0; // 7%
  const goldRate = 9.0; // 9%
  const niftyIndexRate = 12.5; // 12.5%

  const calcFutureNominal = (P, rate, yrs) => Math.round(P * Math.pow(1 + rate / 100, yrs));
  const calcRealPurchasingPower = (P, nominalRate, infRate, yrs) => {
    const nominal = P * Math.pow(1 + nominalRate / 100, yrs);
    const inflationDiscount = Math.pow(1 + infRate / 100, yrs);
    return Math.round(nominal / inflationDiscount);
  };

  const savingsReal = calcRealPurchasingPower(idleCashAmount, bankSavingsRate, inflationRate, horizonYears);
  const fdReal = calcRealPurchasingPower(idleCashAmount, bankFDRate, inflationRate, horizonYears);
  const goldReal = calcRealPurchasingPower(idleCashAmount, goldRate, inflationRate, horizonYears);
  const niftyReal = calcRealPurchasingPower(idleCashAmount, niftyIndexRate, inflationRate, horizonYears);

  // Tab 4: Micro-Savings / Expense Leakage Simulator
  const [dailyLeakExpense, setDailyLeakExpense] = useState(100); // ₹100/day
  const monthlyLeakSaved = dailyLeakExpense * 30;
  const leak5Yr = calculateSIPWealth(monthlyLeakSaved, 5, 12);
  const leak10Yr = calculateSIPWealth(monthlyLeakSaved, 10, 12);
  const leak15Yr = calculateSIPWealth(monthlyLeakSaved, 15, 12);
  const leak20Yr = calculateSIPWealth(monthlyLeakSaved, 20, 12);

  // Tab 5: Step-Up SIP Calculator
  const [baseSIP, setBaseSIP] = useState(5000);
  const [stepUpYears, setStepUpYears] = useState(15);
  const [annualStepUpPct, setAnnualStepUpPct] = useState(10); // 10% annual step-up

  const calculateStepUpSIP = (initialSIP, stepUpRate, yrs, annualReturn = 12) => {
    let totalInvested = 0;
    let totalValue = 0;
    let currentSIP = initialSIP;
    const monthlyReturn = annualReturn / 100 / 12;

    for (let y = 1; y <= yrs; y++) {
      for (let m = 1; m <= 12; m++) {
        const remainingMonths = (yrs - y) * 12 + (12 - m + 1);
        totalInvested += currentSIP;
        totalValue += currentSIP * Math.pow(1 + monthlyReturn, remainingMonths);
      }
      currentSIP = currentSIP * (1 + stepUpRate / 100);
    }

    return {
      totalInvested: Math.round(totalInvested),
      totalValue: Math.round(totalValue)
    };
  };

  const normalSIPResult = {
    totalInvested: baseSIP * 12 * stepUpYears,
    totalValue: calculateSIPWealth(baseSIP, stepUpYears, 12)
  };
  const stepUpSIPResult = calculateStepUpSIP(baseSIP, annualStepUpPct, stepUpYears, 12);
  const extraStepUpWealth = stepUpSIPResult.totalValue - normalSIPResult.totalValue;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '2rem 1.75rem',
        background: 'radial-gradient(ellipse at top left, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 50%, var(--bg-glass) 100%)',
        border: '1px solid var(--border-glass)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-emerald">ASSET GROW SUITE</span>
              <span className="badge badge-cyan">Investor Optimization Engine</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Wealth Acceleration & <span className="text-gradient-emerald">Savings Optimization</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '750px', marginTop: '0.4rem', lineHeight: 1.6 }}>
              A set of mathematical financial models designed for Indian investors: eradicate silent expense leaks, conquer inflation, engineer an unbreakable emergency cushion, and compound capital exponentially.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={onNavigateToPlan} className="btn btn-primary">
              <Sparkles size={16} />
              <span>Generate My Asset Plan</span>
            </button>
            <button onClick={onNavigateToGoals} className="btn btn-secondary">
              <BookmarkCheck size={16} />
              <span>Track My Goals</span>
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '1.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
          overflowX: 'auto',
          paddingBottom: '0.25rem'
        }}>
          {[
            { id: 'emergency', label: '1. Emergency Shield', icon: ShieldCheck },
            { id: 'budget', label: '2. 50/30/20 Budget Engine', icon: PieChart },
            { id: 'inflation', label: '3. Cost of Idle Cash', icon: Flame },
            { id: 'microsave', label: '4. Micro-Savings to Millions', icon: PiggyBank },
            { id: 'stepup', label: '5. Step-Up SIP Multiplier', icon: TrendingUp },
            { id: 'tax', label: '6. Tax 80C Optimizer', icon: Percent },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                  padding: '0.55rem 1rem'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: EMERGENCY SHIELD & SAFETY BUFFER */}
      {/* ============================================================== */}
      {activeSubTab === 'emergency' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            {/* Input Card */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <ShieldCheck size={22} color="var(--emerald-400)" />
                <h3 style={{ fontSize: '1.25rem' }}>Monthly Survival Baseline</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                An Emergency Shield ensures you never have to sell investments in a market crash or take high-interest loans for sudden life events.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <span>Rent / Housing & Maintenance:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>₹{monthlyRent.toLocaleString('en-IN')}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="60000"
                    step="1000"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <span>Groceries, Utilities & Health Essentials:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>₹{monthlyFoodBills.toLocaleString('en-IN')}</strong>
                  </label>
                  <input
                    type="range"
                    min="2000"
                    max="50000"
                    step="1000"
                    value={monthlyFoodBills}
                    onChange={(e) => setMonthlyFoodBills(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <span>Mandatory Loan EMIs / Insurance:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>₹{monthlyEMIs.toLocaleString('en-IN')}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="60000"
                    step="1000"
                    value={monthlyEMIs}
                    onChange={(e) => setMonthlyEMIs(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <span>Currently Saved in Emergency Fund:</span>
                    <strong style={{ color: 'var(--emerald-400)' }}>₹{currentEmergencySaved.toLocaleString('en-IN')}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="300000"
                    step="5000"
                    value={currentEmergencySaved}
                    onChange={(e) => setCurrentEmergencySaved(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Diagnostics & Recommendation Card */}
            <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>Shield Readiness Diagnostic</span>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
                  Coverage Runway: <span className="text-gradient-emerald">{emergencyCoverageMonths} Months</span>
                </h3>

                {/* Progress Bar */}
                <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    <span>Readiness vs Recommended 6-Month Standard</span>
                    <strong>{emergencyHealthPct}% Secured</strong>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, emergencyHealthPct)}%`,
                      height: '100%',
                      background: emergencyHealthPct >= 100 ? 'var(--emerald-400)' : emergencyHealthPct >= 50 ? 'var(--cyan-400)' : 'var(--gold-400)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>

                {/* Milestone breakdown boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>3 Months (Min)</span>
                    <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      ₹{threeMonthCushion.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--emerald-500)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--emerald-400)' }}>6 Months (Target)</span>
                    <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--emerald-400)', marginTop: '0.2rem' }}>
                      ₹{sixMonthCushion.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>12 Months (Ironclad)</span>
                    <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      ₹{twelveMonthCushion.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                {/* Optimal Fund Allocation */}
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--emerald-400)', display: 'block', marginBottom: '0.35rem' }}>
                    💡 Asset Grow Deployment Recommendation:
                  </strong>
                  <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                    <li><strong>20% (₹{Math.round(sixMonthCushion * 0.2).toLocaleString('en-IN')})</strong> in Auto-Sweep Savings Account (Instant ATM/UPI liquidity).</li>
                    <li><strong>80% (₹{Math.round(sixMonthCushion * 0.8).toLocaleString('en-IN')})</strong> in Overnight / Liquid Debt Mutual Fund (Earns ~7.0% p.a. vs 3.0% in savings, with T+1 instant payout).</li>
                  </ul>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <button 
                  onClick={onNavigateToGoals} 
                  className="btn btn-outline btn-sm" 
                  style={{ width: '100%' }}
                >
                  Save as Emergency Goal (₹{sixMonthCushion.toLocaleString('en-IN')}) <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: 50/30/20 BUDGET ENGINE */}
      {/* ============================================================== */}
      {activeSubTab === 'budget' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            {/* Input & Selector Card */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <PieChart size={22} color="var(--indigo-400)" />
                <h3 style={{ fontSize: '1.25rem' }}>Income Allocation Strategy</h3>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <span>Monthly Take-Home Income:</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--emerald-400)' }}>₹{monthlyIncome.toLocaleString('en-IN')}</strong>
                </label>
                <input
                  type="range"
                  min="15000"
                  max="300000"
                  step="5000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Select Your Budgeting Philosophy:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { id: '50-30-20', label: '50% Needs • 30% Wants • 20% Investments', desc: 'Balanced lifestyle & consistent compounding.' },
                    { id: '40-20-40', label: '40% Needs • 20% Wants • 40% Investments (Aggressive)', desc: 'Accelerates Financial Independence by 7+ years.' },
                    { id: '60-25-15', label: '60% Needs • 25% Wants • 15% Investments (Starter)', desc: 'Ideal for metro living with higher rent obligations.' }
                  ].map(rule => (
                    <div
                      key={rule.id}
                      onClick={() => setBudgetRule(rule.id)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: budgetRule === rule.id ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)',
                        border: `1px solid ${budgetRule === rule.id ? 'var(--emerald-500)' : 'var(--border-color)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <strong style={{ fontSize: '0.875rem', color: budgetRule === rule.id ? 'var(--emerald-300)' : 'var(--text-primary)', display: 'block' }}>
                        {rule.label}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rule.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Split Visualization Card */}
            <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>Monthly Rupee Split</span>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>{currentSplit.label}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {/* Needs */}
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--rose-400)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Essentials & Needs ({currentSplit.needsPct}%)</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--rose-400)' }}>₹{needsAmt.toLocaleString('en-IN')}</strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rent, EMI, Food, Bills, Commute</span>
                  </div>

                  {/* Wants */}
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--gold-400)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Guilt-Free Wants ({currentSplit.wantsPct}%)</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--gold-400)' }}>₹{wantsAmt.toLocaleString('en-IN')}</strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dining, Travel, Gadgets, Streaming</span>
                  </div>

                  {/* Investments */}
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--emerald-400)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Asset Growth & Wealth ({currentSplit.investPct}%)</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--emerald-400)' }}>₹{investAmt.toLocaleString('en-IN')}/mo</strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Index Funds, PPF, Gold, SIPs</span>
                  </div>
                </div>

                {/* 10 Year Future Wealth Box */}
                <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--cyan-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>10-Year Compounding Projection</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.15rem' }}>
                        ₹{projected10YrWealth.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Saved</span>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        ₹{projected10YrPrincipal.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Gain from pure compound growth: <strong style={{ color: 'var(--emerald-400)' }}>₹{(projected10YrWealth - projected10YrPrincipal).toLocaleString('en-IN')}</strong> (at 12% CAGR).
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: COST OF IDLE CASH VS INFLATION */}
      {/* ============================================================== */}
      {activeSubTab === 'inflation' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span className="badge badge-rose" style={{ marginBottom: '0.5rem' }}>Inflation Reality Engine</span>
                <h3 style={{ fontSize: '1.4rem' }}>The Silent Tax of Leaving Money Idle</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  At India's historical ~6% inflation rate, money sitting in a bank account loses purchasing power every single year.
                </p>
              </div>

              {/* Quick Selectors */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[50000, 100000, 500000, 1000000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setIdleCashAmount(amt)}
                    className={`btn btn-sm ${idleCashAmount === amt ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Horizon Slider */}
            <div style={{ maxWidth: '480px', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span>Holding Horizon:</span>
                <strong style={{ color: 'var(--cyan-400)', fontSize: '1rem' }}>{horizonYears} Years</strong>
              </label>
              <input
                type="range"
                min="3"
                max="25"
                step="1"
                value={horizonYears}
                onChange={(e) => setHorizonYears(Number(e.target.value))}
              />
            </div>

            {/* 4 Comparative Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              
              {/* Savings Account */}
              <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                <span className="badge badge-rose" style={{ fontSize: '0.65rem' }}>Normal Bank Savings (3%)</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--rose-400)', marginTop: '0.5rem' }}>
                  ₹{savingsReal.toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real Purchasing Power in Year {horizonYears}</span>
                <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--rose-400)' }}>
                  ⚠️ Loss of purchasing power: <strong>-₹{(idleCashAmount - savingsReal).toLocaleString('en-IN')}</strong>. Inflation destroys your savings.
                </div>
              </div>

              {/* Fixed Deposit */}
              <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Bank Fixed Deposit (7%)</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-400)', marginTop: '0.5rem' }}>
                  ₹{fdReal.toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real Purchasing Power in Year {horizonYears}</span>
                <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--gold-400)' }}>
                  ⚖️ Barely breaks even. After income tax on interest (slab rate), real gain is often near zero.
                </div>
              </div>

              {/* Sovereign Gold */}
              <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>Sovereign Gold / SGB (9%)</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--indigo-400)', marginTop: '0.5rem' }}>
                  ₹{goldReal.toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real Purchasing Power in Year {horizonYears}</span>
                <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--indigo-400)' }}>
                  🛡️ Proven inflation hedge. Retains purchasing power across currency devaluations.
                </div>
              </div>

              {/* ASSET GROW Index Portfolio */}
              <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.5)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>ASSET GROW Equity Index (12.5%)</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-400)', marginTop: '0.5rem' }}>
                  ₹{niftyReal.toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real Purchasing Power in Year {horizonYears}</span>
                <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.12)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--emerald-300)' }}>
                  🚀 Real wealth expansion: <strong>+{((niftyReal / idleCashAmount - 1) * 100).toFixed(0)}%</strong> real growth beyond inflation.
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 4: MICRO-SAVINGS TO MILLIONS */}
      {/* ============================================================== */}
      {activeSubTab === 'microsave' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Habit Compounding Engine</span>
            <h3 style={{ fontSize: '1.4rem' }}>Chai & Latte to Wealth: The Micro-Savings Miracle</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '700px' }}>
              Redirecting small everyday expense leakages (daily takeouts, taxi surges, unused subscriptions) into disciplined index compounding creates life-changing financial freedom.
            </p>

            <div style={{ marginTop: '1.5rem', marginBottom: '1.75rem', maxWidth: '520px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span>Daily Expense Redirected into Investments:</span>
                <strong style={{ fontSize: '1.15rem', color: 'var(--gold-400)' }}>₹{dailyLeakExpense}/day (₹{monthlyLeakSaved.toLocaleString('en-IN')}/mo)</strong>
              </label>
              <input
                type="range"
                min="30"
                max="500"
                step="10"
                value={dailyLeakExpense}
                onChange={(e) => setDailyLeakExpense(Number(e.target.value))}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {[50, 100, 200, 300].map(val => (
                  <button
                    key={val}
                    onClick={() => setDailyLeakExpense(val)}
                    className={`chip ${dailyLeakExpense === val ? 'active' : ''}`}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  >
                    ₹{val}/day
                  </button>
                ))}
              </div>
            </div>

            {/* Growth Milestones Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In 5 Years</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--cyan-400)', marginTop: '0.25rem' }}>
                  ₹{leak5Yr.toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>You saved ₹{(monthlyLeakSaved * 60).toLocaleString('en-IN')}</span>
              </div>

              <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In 10 Years</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--indigo-400)', marginTop: '0.25rem' }}>
                  ₹{leak10Yr.toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>You saved ₹{(monthlyLeakSaved * 120).toLocaleString('en-IN')}</span>
              </div>

              <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In 15 Years</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-400)', marginTop: '0.25rem' }}>
                  ₹{leak15Yr.toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>You saved ₹{(monthlyLeakSaved * 180).toLocaleString('en-IN')}</span>
              </div>

              <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--emerald-500)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)' }}>In 20 Years (Wealth Milestone)</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald-400)', marginTop: '0.25rem' }}>
                  ₹{leak20Yr.toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>You saved ₹{(monthlyLeakSaved * 240).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={onNavigateToGoals} className="btn btn-primary btn-sm">
                Add ₹{monthlyLeakSaved.toLocaleString('en-IN')}/mo Habit to Goals Tracker <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 5: STEP-UP SIP MULTIPLIER */}
      {/* ============================================================== */}
      {activeSubTab === 'stepup' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>Wealth Accelerator</span>
            <h3 style={{ fontSize: '1.4rem' }}>The Step-Up SIP Secret</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '720px' }}>
              As your salary or business revenues grow each year, increasing your monthly SIP by just 10% each year almost <strong>doubles your final wealth</strong> compared to keeping your SIP flat.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <span>Starting Monthly SIP:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>₹{baseSIP.toLocaleString('en-IN')}</strong>
                </label>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={baseSIP}
                  onChange={(e) => setBaseSIP(Number(e.target.value))}
                />
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <span>Annual Step-Up Percentage:</span>
                  <strong style={{ color: 'var(--emerald-400)' }}>{annualStepUpPct}% / year</strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={annualStepUpPct}
                  onChange={(e) => setAnnualStepUpPct(Number(e.target.value))}
                />
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <span>Investment Horizon:</span>
                  <strong style={{ color: 'var(--cyan-400)' }}>{stepUpYears} Years</strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={stepUpYears}
                  onChange={(e) => setStepUpYears(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Direct Comparison Box */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {/* Normal SIP */}
              <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Flat SIP (No Increment)</span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  ₹{normalSIPResult.totalValue.toLocaleString('en-IN')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                  <span>Invested: ₹{normalSIPResult.totalInvested.toLocaleString('en-IN')}</span>
                  <span>Gains: ₹{(normalSIPResult.totalValue - normalSIPResult.totalInvested).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Step-Up SIP */}
              <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--emerald-500)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>With {annualStepUpPct}% Annual Step-Up</span>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--emerald-400)', marginTop: '0.25rem' }}>
                  ₹{stepUpSIPResult.totalValue.toLocaleString('en-IN')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                  <span>Invested: ₹{stepUpSIPResult.totalInvested.toLocaleString('en-IN')}</span>
                  <span>Gains: ₹{(stepUpSIPResult.totalValue - stepUpSIPResult.totalInvested).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.12)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--emerald-300)' }}>
                  🎉 Extra Wealth Created: <strong>+₹{extraStepUpWealth.toLocaleString('en-IN')}</strong>!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 6: TAX 80C OPTIMIZER */}
      {/* ============================================================== */}
      {activeSubTab === 'tax' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>Tax Planning Matrix</span>
            <h3 style={{ fontSize: '1.4rem' }}>Section 80C & Tax-Efficient Asset Comparison</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Under the Old Tax Regime, Section 80C allows deductions up to ₹1,50,000. Here is how the top tax-saving instruments compare in lock-in, returns, and taxation:
            </p>

            <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Instrument</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Lock-in Period</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Expected Return</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Tax on Withdrawal</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Best Suited For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(16, 185, 129, 0.05)' }}>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <strong style={{ color: 'var(--emerald-400)' }}>ELSS (Tax Saver Mutual Fund)</strong>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>3 Years (Shortest!)</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--emerald-300)' }}>12% - 14% (Market)</td>
                    <td style={{ padding: '1rem 0.5rem' }}>LTCG @ 12.5% beyond ₹1.25L</td>
                    <td style={{ padding: '1rem 0.5rem' }}>Wealth growth + shortest lock-in</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <strong style={{ color: 'var(--cyan-400)' }}>PPF (Public Provident Fund)</strong>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>15 Years</td>
                    <td style={{ padding: '1rem 0.5rem' }}>7.1% (Govt Guaranteed)</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--emerald-300)' }}>100% Tax-Free (EEE)</td>
                    <td style={{ padding: '1rem 0.5rem' }}>Risk-free long-term compounding</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <strong style={{ color: 'var(--indigo-400)' }}>NPS (National Pension System)</strong>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>Until Age 60</td>
                    <td style={{ padding: '1rem 0.5rem' }}>9% - 11% (Hybrid)</td>
                    <td style={{ padding: '1rem 0.5rem' }}>60% Tax-Free Lump Sum, 40% Annuity</td>
                    <td style={{ padding: '1rem 0.5rem' }}>Retirement + Extra ₹50,000 deduction (80CCD)</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <strong style={{ color: 'var(--gold-400)' }}>5-Year Tax-Saver Bank FD</strong>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>5 Years</td>
                    <td style={{ padding: '1rem 0.5rem' }}>6.5% - 7.1%</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--rose-400)' }}>Taxed at Income Slab Rate</td>
                    <td style={{ padding: '1rem 0.5rem' }}>Senior citizens / conservative savers</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              💡 <strong>Smart Pro-Tip:</strong> ELSS has the shortest lock-in period (3 years) of any Section 80C vehicle while investing in growth equities. If you prefer zero volatility, PPF offers complete sovereign EEE tax exemption.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
