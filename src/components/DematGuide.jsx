import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, CheckCircle2, Info, ExternalLink } from 'lucide-react';

export default function DematGuide() {
  const [platforms, setPlatforms] = useState([]);
  const [guideData, setGuideData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlatforms() {
      try {
        const res = await fetch('/api/learning/demat-platforms');
        const data = await res.json();
        setPlatforms(data.platforms || []);
        setGuideData(data);
      } catch (e) {
        console.error('Failed to load demat guide:', e);
      } finally {
        setLoading(false);
      }
    }
    loadPlatforms();
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span className="badge badge-emerald">Demystifying Accounts</span>
        </div>
        <h2 style={{ fontSize: '1.75rem' }}>Demat, Trading & Bank Accounts in India</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Understand the difference between accounts, when you actually need one, and compare major SEBI-registered brokers neutrally.
        </p>
      </div>

      {/* The 3-Account Ecosystem Diagram / Explanations */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>The Three Accounts You Encounter in India</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-400)', textTransform: 'uppercase' }}>Account #1</div>
            <h4 style={{ fontSize: '1.1rem', margin: '0.25rem 0' }}>Bank Account</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <strong>Where your rupees live.</strong> Governed by RBI. Used to transfer money via UPI, NEFT, or Net Banking into investments and receive dividends back.
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--indigo-400)', textTransform: 'uppercase' }}>Account #2</div>
            <h4 style={{ fontSize: '1.1rem', margin: '0.25rem 0' }}>Trading Account</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <strong>The order engine.</strong> Provided by a registered broker (like Zerodha or Groww). It bridges your bank account to the stock exchange (NSE/BSE) to execute trades.
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-400)', textTransform: 'uppercase' }}>Account #3</div>
            <h4 style={{ fontSize: '1.1rem', margin: '0.25rem 0' }}>Demat Account</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <strong>The digital security locker.</strong> Held safely with CDSL or NSDL. It securely stores your shares, ETFs, and bonds in dematerialized (electronic) form.
            </p>
          </div>
        </div>

        {/* When you need / don't need one */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <strong style={{ color: 'var(--emerald-400)', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
              ✓ When You NEED a Demat Account:
            </strong>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <li>Buying individual company shares (like TCS or Reliance)</li>
              <li>Buying Exchange Traded Funds (ETFs like Nifty BeES or Gold BeES)</li>
              <li>Applying for stock market IPOs directly</li>
              <li>Holding Sovereign Gold Bonds (SGB) in digital tradeable form</li>
            </ul>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <strong style={{ color: 'var(--gold-400)', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
              ✕ When You DO NOT Need a Demat Account:
            </strong>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <li>Investing in Direct Mutual Funds (via AMC portals, Kuvera, or MFCentral)</li>
              <li>Opening Bank Fixed Deposits (FD) or Recurring Deposits (RD)</li>
              <li>Opening a Public Provident Fund (PPF) with your bank</li>
              <li>Contributing to National Pension System (NPS)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Neutral Broker Comparison */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Neutral Platform Comparison</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            We do not receive affiliate commissions or rank any single broker as "the best". All listed entities are verified SEBI-registered stockbrokers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
          {platforms.map(broker => (
            <div
              key={broker.id}
              className="glass-card"
              style={{ padding: '1.25rem', background: 'var(--bg-secondary)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.2rem' }}>{broker.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SEBI Reg: {broker.sebi_reg}</span>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Verified Broker</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.8125rem', marginBottom: '0.75rem', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div><strong>Account Opening:</strong> {broker.account_opening}</div>
                <div><strong>Annual Maintenance (AMC):</strong> {broker.maintenance_amc}</div>
                <div><strong>Delivery Brokerage:</strong> {broker.brokerage_delivery}</div>
                <div><strong>Intraday Brokerage:</strong> {broker.brokerage_intraday}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Supported:</strong> {broker.supported.join(', ')}</div>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <strong>Vibe / Suitability:</strong> {broker.ui_vibe}. <em>{broker.best_for}</em>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
