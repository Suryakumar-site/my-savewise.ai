import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, ExternalLink, RefreshCw, Info } from 'lucide-react';

export default function ScamDetector() {
  const [offerText, setOfferText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!offerText.trim() && !companyName.trim() && !website.trim()) {
      alert('Please enter some text, company name, or website to examine.');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch('/api/scam-check/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerText, companyName, website })
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error('Scam check failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const sampleScams = [
    {
      title: 'Sample: Telegram VIP Doubling Scam',
      text: 'Join our VIP Telegram group! Guaranteed 25% weekly profits using secret algorithm. Only 5 slots left today! Send money to our UPI and receive double in 48 hours. Refer 3 friends for extra bonus.'
    },
    {
      title: 'Sample: Legitimate Mutual Fund SIP',
      text: 'Invest in a direct Nifty 50 Index Fund via a SEBI-registered AMC. Subject to market risks. Minimum monthly SIP is ₹500. No guaranteed returns.'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span className="badge badge-rose">Financial Fraud Shield</span>
        </div>
        <h2 style={{ fontSize: '1.75rem' }}>"Is This Investment Legit?" Analyzer</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Paste any message, investment offer, WhatsApp/Telegram pitch, or company name. We scan for deceptive patterns and classic fraud red flags.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }}>
        
        {/* Input Form */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Enter the Offer or Scheme Details</h3>

          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Paste the message, promise, or advertisement text:
              </label>
              <textarea
                rows="4"
                placeholder="e.g. 'Invest ₹5,000 and get guaranteed ₹1,000 every day on Telegram...'"
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
                className="input-field"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Company / App Name (optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. FastGain Trade"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Website or Channel link (optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. t.me/vip_signals"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Quick Test Samples */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Try a sample:</span>
              {sampleScams.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setOfferText(s.text)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  {s.title}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
            >
              {analyzing ? <RefreshCw size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
              <span>{analyzing ? 'Scanning for Red Flags...' : 'Scan For Warning Signs'}</span>
            </button>
          </form>
        </div>

        {/* Results Card */}
        {analysisResult && (
          <div className="glass-card animate-fade-in" style={{ padding: '1.75rem', border: `2px solid ${analysisResult.verdictColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', color: analysisResult.verdictColor }}>
                  {analysisResult.verdictTitle}
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Scanned on {new Date(analysisResult.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <span className="badge" style={{ backgroundColor: `${analysisResult.verdictColor}20`, color: analysisResult.verdictColor, border: `1px solid ${analysisResult.verdictColor}` }}>
                {analysisResult.flagsDetectedCount} Red Flags Detected
              </span>
            </div>

            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              {analysisResult.recommendation}
            </p>

            {/* List of Flags */}
            {analysisResult.flags.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--rose-400)' }}>Specific Warning Flags Triggered:</h4>
                {analysisResult.flags.map((flag, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.875rem 1rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: `4px solid ${flag.severity === 'DEADLY' ? '#ef4444' : '#f59e0b'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{flag.flag}</strong>
                      <span className="badge badge-rose" style={{ fontSize: '0.65rem' }}>{flag.severity}</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {flag.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Official Verification Resources */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Verify with Official Indian Regulators Before Depositing:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {analysisResult.verificationResources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '0.875rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      display: 'block'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.85rem' }}>{res.name}</strong>
                      <ExternalLink size={13} color="var(--emerald-400)" />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{res.authority}</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{res.purpose}</p>
                  </a>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
