import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, RefreshCw, BookmarkCheck, CheckCircle2, 
  AlertCircle, ShieldCheck, Clock, ArrowRight, BookOpen, 
  TrendingUp, Wallet, DollarSign, ExternalLink, HelpCircle
} from 'lucide-react';

export default function PlanGenerator({ 
  planData, 
  onRefreshOptions, 
  onSavePlan, 
  onOpenPremium,
  onResetPlan,
  onOpenLearn,
  user
}) {
  const [selectedStrategyIndex, setSelectedStrategyIndex] = useState(1); // Default to Balanced (index 1)
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!planData || !planData.strategies) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <p>No plan data available. Please run the planning wizard.</p>
        <button onClick={onResetPlan} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Start Planning
        </button>
      </div>
    );
  }

  const { amount, rs100Data, strategies, refreshIteration, isPremiumEligible } = planData;
  const currentStrategy = strategies[selectedStrategyIndex] || strategies[0];

  const handleSave = async () => {
    if (!user) {
      alert('Please log in or register to save this plan to your private financial journey.');
      return;
    }
    setSaving(true);
    const success = await onSavePlan({
      amount,
      strategyName: currentStrategy.name,
      strategyType: currentStrategy.type,
      allocation: currentStrategy.allocation,
      details: currentStrategy.breakdown9Points
    });
    setSaving(false);
    if (success) {
      setSavedSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner: Amount & Actions */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-emerald">Strategy Explorer</span>
            {refreshIteration > 0 && (
              <span className="badge badge-indigo">
                Iteration #{refreshIteration}
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Planning for <span className="text-gradient-emerald">₹{amount.toLocaleString('en-IN')}</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Here are multiple legitimate educational strategies. No strategy is universally "best"—choose the one matching your comfort.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Prominent REFRESH FEATURE */}
          <button
            onClick={onRefreshOptions}
            className="btn btn-secondary"
            title="Generate different valid allocations and product categories"
          >
            <RefreshCw size={16} color="var(--cyan-400)" />
            <span>🔄 Give Me Different Options</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`btn ${savedSuccess ? 'btn-secondary' : 'btn-primary'}`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 size={16} color="var(--emerald-400)" />
                <span>Saved to Dashboard!</span>
              </>
            ) : (
              <>
                <BookmarkCheck size={16} />
                <span>{saving ? 'Saving...' : 'Save Strategy'}</span>
              </>
            )}
          </button>

          <button onClick={onResetPlan} className="btn btn-outline btn-sm">
            Modify Inputs
          </button>
        </div>
      </div>

      {/* Refresh rationale note if refreshed */}
      {currentStrategy.refreshed && currentStrategy.refreshNote && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Sparkles size={18} color="var(--indigo-400)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.875rem', color: '#e0e7ff' }}>
            <strong>Why this option differs:</strong> {currentStrategy.refreshNote}
          </div>
        </div>
      )}

      {/* SPECIAL ₹100 EXPERIENCE (If amount <= 100) */}
      {rs100Data && (
        <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.04)' }}>
          {/* Reality Check */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--rose-400)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.375rem' }}>
              <AlertCircle size={20} />
              <span>{rs100Data.realityCheck.headline}</span>
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 600 }}>
              {rs100Data.realityCheck.message}
            </p>
            <ul style={{ marginTop: '0.75rem', paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {rs100Data.realityCheck.principles.map((pr, idx) => (
                <li key={idx} style={{ marginBottom: '0.25rem' }}>{pr}</li>
              ))}
            </ul>
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            Four Realistic Paths for ₹100
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
            {rs100Data.paths.map(path => (
              <div key={path.id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>{path.badge}</span>
                    <h4 style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>{path.title}</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{path.tagline}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.8125rem' }}>
                  <div><strong>What:</strong> <span style={{ color: 'var(--text-secondary)' }}>{path.what}</span></div>
                  <div><strong>Why:</strong> <span style={{ color: 'var(--text-secondary)' }}>{path.why}</span></div>
                  <div><strong>Risk:</strong> <span style={{ color: 'var(--text-secondary)' }}>{path.risk}</span></div>
                  <div><strong>Cost:</strong> <span style={{ color: 'var(--text-secondary)' }}>{path.cost}</span></div>
                  <div><strong>Liquidity:</strong> <span style={{ color: 'var(--text-secondary)' }}>{path.liquidity}</span></div>
                  <div><strong>Action:</strong> <span style={{ color: 'var(--text-secondary)' }}>{path.nextStep}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STRATEGY SELECTOR TABS */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          SELECT A STRATEGY MODEL TO EXAMINE:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {strategies.map((strat, idx) => (
            <div
              key={strat.id}
              onClick={() => setSelectedStrategyIndex(idx)}
              className="glass-card"
              style={{
                padding: '1rem',
                cursor: 'pointer',
                border: selectedStrategyIndex === idx ? '2px solid var(--emerald-500)' : '1px solid var(--border-color)',
                background: selectedStrategyIndex === idx ? 'rgba(16, 185, 129, 0.08)' : undefined
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '0.95rem' }}>{strat.name}</strong>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>{strat.badge}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {strat.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ALLOCATION VISUALIZER */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.125rem' }}>Educational Money Split</h3>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total: ₹{amount.toLocaleString('en-IN')}</span>
        </div>

        {/* Visual Progress Bar */}
        <div style={{
          height: '24px',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          display: 'flex',
          backgroundColor: 'var(--bg-tertiary)',
          marginBottom: '1.25rem'
        }}>
          {currentStrategy.allocation.map((item, idx) => (
            <div
              key={idx}
              title={`${item.category}: ₹${item.amount} (${item.percentage}%)`}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
                transition: 'width 0.4s ease'
              }}
            />
          ))}
        </div>

        {/* Breakdown Items */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '0.75rem' }}>
          {currentStrategy.allocation.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.9375rem', display: 'block' }}>{item.category}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.rationale}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: '1.0625rem', color: 'var(--emerald-400)', display: 'block' }}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.percentage}% of total</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9-POINT SCHEMA BREAKDOWN */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <ShieldCheck size={22} color="var(--emerald-400)" />
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>9-Point Step-by-Step Clarity</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Every responsible financial strategy must answer these 9 essential questions before moving a single rupee.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
          {[
            { label: '1. WHAT?', title: 'What is this?', val: currentStrategy.breakdown9Points.what, color: '#38bdf8' },
            { label: '2. WHY?', title: 'Why consider it?', val: currentStrategy.breakdown9Points.why, color: '#34d399' },
            { label: '3. RISK?', title: 'What could go wrong?', val: currentStrategy.breakdown9Points.risk, color: '#fb7185' },
            { label: '4. COST?', title: 'Fees, taxes, and charges?', val: currentStrategy.breakdown9Points.cost, color: '#fbbf24' },
            { label: '5. LIQUIDITY?', title: 'How easily can it be accessed?', val: currentStrategy.breakdown9Points.liquidity, color: '#a78bfa' },
            { label: '6. MINIMUM?', title: 'Minimum start amount?', val: currentStrategy.breakdown9Points.minimum, color: '#2dd4bf' },
            { label: '7. TIME?', title: 'How long to hold?', val: currentStrategy.breakdown9Points.time, color: '#f472b6' },
            { label: '8. HOW?', title: 'Exact beginner instructions:', val: currentStrategy.breakdown9Points.how, color: '#60a5fa' },
            { label: '9. NEXT STEP', title: 'What to do right after this?', val: currentStrategy.breakdown9Points.nextStep, color: '#10b981' }
          ].map((point, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderLeft: `4px solid ${point.color}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: point.color, letterSpacing: '0.04em' }}>
                  {point.label}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {point.title}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {point.val}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* PREMIUM PROMPT (If planning amount > ₹1,000) */}
      {isPremiumEligible && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.08) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-400)', fontWeight: 700, fontSize: '0.875rem' }}>
              <Sparkles size={16} />
              <span>SAVEWISE PREMIUM PLAN OPTION</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>
              Want deep multi-asset scenarios & tax optimization?
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '640px', marginTop: '0.25rem' }}>
              Transparent pricing: <strong>4% of your planning amount (₹{Math.round(amount * 0.04).toLocaleString('en-IN')})</strong>. Unlocks personalized tax saving (Section 80C/80CCD), printable implementation roadmaps, and review reminders.
            </p>
          </div>

          <button
            onClick={() => onOpenPremium(amount)}
            className="btn btn-gold"
            style={{ fontWeight: 700 }}
          >
            Explore 4% Premium Plan <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={onOpenLearn} className="btn btn-secondary">
          <BookOpen size={16} />
          <span>Learn Financial Terms Used in This Plan</span>
        </button>
      </div>

    </div>
  );
}
