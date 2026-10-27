import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ComparisonEngine() {
  const [comparisons, setComparisons] = useState({});
  const [selectedKey, setSelectedKey] = useState('stock-vs-mf');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComparisons() {
      try {
        const res = await fetch('/api/learning/comparisons');
        const data = await res.json();
        setComparisons(data.comparisons || {});
      } catch (e) {
        console.error('Failed to load comparisons:', e);
      } finally {
        setLoading(false);
      }
    }
    loadComparisons();
  }, []);

  const active = comparisons[selectedKey];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span className="badge badge-emerald">Objective Comparison Matrix</span>
        </div>
        <h2 style={{ fontSize: '1.75rem' }}>Side-by-Side Financial Vehicle Comparison</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Compare mechanisms factually. We never declare an overall "winner" because every vehicle serves different life goals.
        </p>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
          {[
            { key: 'stock-vs-mf', label: 'Stock vs. Mutual Fund' },
            { key: 'sip-vs-lumpsum', label: 'SIP vs. Lump Sum' },
            { key: 'fd-vs-mf', label: 'Fixed Deposit (FD) vs. Mutual Fund' },
            { key: 'ppf-vs-nps', label: 'PPF vs. NPS' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedKey(tab.key)}
              className={`chip ${selectedKey === tab.key ? 'active' : ''}`}
              style={{ fontSize: '0.875rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table / Cards */}
      {active && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.35rem' }}>{active.title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{active.description}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
            {active.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(1, 1fr)',
                  gap: '0.75rem'
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--emerald-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {item.feature}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div style={{
                    padding: '0.875rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid var(--indigo-400)'
                  }}>
                    <strong style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      Option A
                    </strong>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {item.a}
                    </p>
                  </div>

                  <div style={{
                    padding: '0.875rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid var(--emerald-400)'
                  }}>
                    <strong style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      Option B
                    </strong>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {item.b}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <ShieldCheck size={20} color="var(--emerald-400)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <strong>SaveWise Impartiality Rule:</strong> We never declare a "winner" or rank products by commission. The right choice depends strictly on your individual time horizon, liquidity need, and tax bracket.
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
