import React, { useState } from 'react';
import { Calculator, TrendingUp, Info, HelpCircle, ShieldAlert } from 'lucide-react';

export default function WhatIfSimulator() {
  const [initialAmount, setInitialAmount] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [years, setYears] = useState(5);
  const [returnRate, setReturnRate] = useState(10); // 10% default
  const [inflationRate, setInflationRate] = useState(6); // 6% annual inflation assumption

  // Compounding math: Future Value with monthly compounding
  // FV = P*(1 + r/n)^(n*t) + PMT * [ ((1 + r/n)^(n*t) - 1) / (r/n) ]
  const calculateFV = (P, PMT, rPercent, tYears) => {
    const r = rPercent / 100;
    const n = 12; // monthly
    const totalMonths = tYears * 12;
    const monthlyRate = r / n;

    const principalGrowth = P * Math.pow(1 + monthlyRate, totalMonths);
    const contributionsGrowth = monthlyRate > 0 
      ? PMT * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
      : PMT * totalMonths;

    const finalValue = Math.round(principalGrowth + contributionsGrowth);
    const totalContributed = Math.round(P + (PMT * totalMonths));
    const compoundingGain = Math.max(0, finalValue - totalContributed);

    // Inflation adjusted real purchasing power: FV / (1 + i)^t
    const inflationFactor = Math.pow(1 + (inflationRate / 100), tYears);
    const inflationAdjusted = Math.round(finalValue / inflationFactor);

    return {
      finalValue,
      totalContributed,
      compoundingGain,
      inflationAdjusted
    };
  };

  const results = calculateFV(initialAmount, monthlyContribution, returnRate, years);

  // Scenarios for quick comparison
  const scenarios = [
    { label: 'Conservative (Bank FD / Debt)', rate: 6, desc: 'Capital preservation focus' },
    { label: 'Balanced (Multi-Asset / Hybrid)', rate: 8, desc: 'Moderate equity + debt' },
    { label: 'Index Long-Term (Nifty 50)', rate: 10, desc: 'Historical broad index trend' },
    { label: 'Aggressive Equity', rate: 12, desc: 'High volatility, strictly 7+ years' }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span className="badge badge-emerald">Interactive Scenario Engine</span>
        </div>
        <h2 style={{ fontSize: '1.75rem' }}>What-If Compound Growth Calculator</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Explore how regular monthly savings and time interact over 1 to 30 years.
        </p>

        {/* Clear Disclaimer */}
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)'
        }}>
          <strong style={{ color: 'var(--gold-400)' }}>Important Disclosure:</strong> All calculations are hypothetical mathematical simulations based on assumed compounding rates. Market-linked returns are never guaranteed, fluctuate year-to-year, and past performance is not a promise of future results.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }}>
        
        {/* Controls Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Input Your Parameters</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Initial Lump Sum Amount (₹):
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Math.max(0, Number(e.target.value)))}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Monthly Contribution / SIP (₹):
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Math.max(0, Number(e.target.value)))}
                className="input-field"
              />
            </div>
          </div>

          {/* Time Horizon Slider */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Time Horizon: <span style={{ color: 'var(--emerald-400)' }}>{years} {years === 1 ? 'Year' : 'Years'}</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({years * 12} Monthly installments)</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--emerald-500)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <span>1 Year</span>
              <span>10 Years</span>
              <span>20 Years</span>
              <span>30 Years</span>
            </div>
          </div>

          {/* Assumed Return Rate */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Assumed Annual Growth Rate: <span style={{ color: 'var(--emerald-400)' }}>{returnRate}%</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {[5, 8, 10, 12, 14].map(rate => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setReturnRate(rate)}
                  className={`chip ${returnRate === rate ? 'active' : ''}`}
                >
                  {rate}% {rate === 10 ? '(Index Baseline)' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Simulated Outcome Over {years} Years</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Amount Contributed</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>
                ₹{results.totalContributed.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Your own saved capital
              </span>
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', textTransform: 'uppercase' }}>Compounding Growth Gain</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald-400)', marginTop: '0.25rem' }}>
                +₹{results.compoundingGain.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Returns earned over time
              </span>
            </div>
          </div>

          {/* Grand Total Value */}
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Estimated Illustrative Portfolio Value
            </span>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--emerald-400)', margin: '0.25rem 0' }}>
              ₹{results.finalValue.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Estimated Purchasing Power (at 6% annual inflation): <strong>₹{results.inflationAdjusted.toLocaleString('en-IN')}</strong> in today's terms.
            </div>
          </div>

          {/* Side by side scenario comparison */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Compare Other Assumed Rates for this Same Plan:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {scenarios.map(sc => {
                const scResult = calculateFV(initialAmount, monthlyContribution, sc.rate, years);
                return (
                  <div
                    key={sc.rate}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{sc.rate}%: {sc.label}</strong>
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--emerald-400)', marginTop: '0.25rem' }}>
                      ₹{scResult.finalValue.toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Gain: +₹{scResult.compoundingGain.toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
