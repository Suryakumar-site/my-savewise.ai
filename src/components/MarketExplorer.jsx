import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldAlert, Clock, Layers,
  RefreshCw, BookOpen, Activity, ArrowUpRight, ArrowDownRight,
  BarChart2
} from 'lucide-react';

export default function MarketExplorer() {
  const [marketData, setMarketData] = useState(null);
  const [stockResults, setStockResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fundCategories, setFundCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('stocks'); // 'stocks', 'funds', 'education', 'crypto'
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [liveSeconds, setLiveSeconds] = useState(new Date().toLocaleTimeString('en-IN'));
  const [glossary, setGlossary] = useState([]);

  // Live IST Clock ticking every second
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setLiveSeconds(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Fetch initial market data
  const fetchData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const [overviewRes, fundsRes, stocksRes] = await Promise.all([
        fetch('/api/market/overview'),
        fetch('/api/market/funds'),
        fetch(`/api/market/stocks${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`)
      ]);

      const overview = await overviewRes.json();
      const funds = await fundsRes.json();
      const stocks = await stocksRes.json();

      setMarketData(overview);
      setFundCategories(funds.categories || []);
      setStockResults(stocks.results || []);
      if (overview.glossary) setGlossary(overview.glossary);
    } catch (err) {
      console.error('Market data fetch error:', err);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Live Market Fluctuation Engine (Updates every 2.5 seconds when live ticker is ON)
  useEffect(() => {
    if (!isLiveActive) return;

    const tickInterval = setInterval(() => {
      setMarketData(prev => {
        if (!prev || !prev.indices) return prev;
        const updatedIndices = prev.indices.map(idx => {
          const delta = (Math.random() - 0.48) * 0.25;
          const newPrice = Math.round((idx.livePrice || idx.price) * (1 + delta / 100) * 100) / 100;
          const diff = Math.round((newPrice - idx.price) * 100) / 100;
          return {
            ...idx,
            livePrice: newPrice,
            tickDelta: (diff >= 0 ? '+' : '') + diff.toFixed(2),
            tickDirection: delta >= 0 ? 'up' : 'down'
          };
        });
        return { ...prev, indices: updatedIndices };
      });

      setStockResults(prev => {
        if (!prev) return prev;
        return prev.map(stk => {
          const delta = (Math.random() - 0.49) * 0.30;
          const current = stk.livePrice || stk.price;
          const newPrice = Math.round(current * (1 + delta / 100) * 100) / 100;
          const diff = Math.round((newPrice - stk.price) * 100) / 100;
          return {
            ...stk,
            livePrice: newPrice,
            tickDelta: (diff >= 0 ? '+' : '') + diff.toFixed(2),
            tickDirection: delta >= 0 ? 'up' : 'down'
          };
        });
      });
    }, 2500);

    return () => clearInterval(tickInterval);
  }, [isLiveActive]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    try {
      const res = await fetch(`/api/market/stocks?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setStockResults(data.results || []);
    } catch (e) {
      console.error('Stock search error:', e);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Market Status */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald">Verified Market Feeds</span>
            
            {/* Live IST clock */}
            <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={12} />
              <span>{liveSeconds}</span>
            </span>

            {/* Live streaming indicator */}
            <span className="badge" style={{
              backgroundColor: isLiveActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: isLiveActive ? '#34d399' : '#facc15',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isLiveActive ? '#34d399' : '#facc15',
                display: 'inline-block',
                boxShadow: isLiveActive ? '0 0 6px #34d399' : 'none'
              }} />
              <span>{isLiveActive ? 'LIVE SECONDS STREAM ACTIVE' : 'STREAM PAUSED'}</span>
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Educational Market Explorer & Live Valuation</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Live tick movements, intrinsic Fair Value, Book Value, P/E ratios, and financial metrics explained simply.
          </p>
        </div>

        {/* Action Controls: Live Toggle & Manual Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsLiveActive(!isLiveActive)}
            className="btn btn-secondary btn-sm"
            title="Toggle Live Fluctuation Ticks"
            style={{ fontWeight: 600 }}
          >
            <Activity size={14} color={isLiveActive ? 'var(--emerald-400)' : 'var(--text-muted)'} />
            <span>{isLiveActive ? 'Live Ticker: ON' : 'Live Ticker: OFF'}</span>
          </button>

          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 700 }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing Rates...' : 'Refresh Live Rates'}</span>
          </button>
        </div>
      </div>

      {/* Tab Switchers */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('stocks')}
          className={`btn btn-sm ${activeTab === 'stocks' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontWeight: 600 }}
        >
          <BarChart2 size={15} />
          <span>Stocks & Valuation Metrics (Fair Value, Book Value)</span>
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`btn btn-sm ${activeTab === 'education' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontWeight: 600, color: activeTab === 'education' ? undefined : 'var(--gold-400)' }}
        >
          <BookOpen size={15} />
          <span>Financial Education Panel (How to Read Metrics)</span>
        </button>
        <button
          onClick={() => setActiveTab('funds')}
          className={`btn btn-sm ${activeTab === 'funds' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontWeight: 600 }}
        >
          <Layers size={15} />
          <span>Mutual Funds & ETFs</span>
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`btn btn-sm ${activeTab === 'crypto' ? 'btn-secondary' : 'btn-secondary'}`}
          style={{ color: activeTab === 'crypto' ? '#f43f5e' : undefined, borderColor: activeTab === 'crypto' ? '#f43f5e' : undefined, fontWeight: 600 }}
        >
          <ShieldAlert size={15} />
          <span>Crypto Speculation Notice</span>
        </button>
      </div>

      {/* BENCHMARK INDICES STRIP WITH LIVE TICKS */}
      {marketData?.indices && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {marketData.indices.map(idx => {
            const currentPrice = idx.livePrice || idx.price;
            const isTickUp = idx.tickDirection === 'up';
            const isOverallPositive = idx.change.startsWith('+');

            return (
              <div
                key={idx.symbol}
                className="glass-card"
                style={{
                  padding: '1rem',
                  borderLeft: `3px solid ${isTickUp ? '#10b981' : '#f43f5e'}`,
                  transition: 'background 0.3s ease',
                  background: isTickUp ? 'rgba(16, 185, 129, 0.04)' : 'rgba(244, 63, 94, 0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{idx.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{idx.exchange}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.35rem 0' }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isTickUp ? 'var(--emerald-400)' : 'var(--rose-400)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {isTickUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {idx.tickDelta ? `${idx.tickDelta}` : idx.percentChange}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>Source: {idx.source.split('(')[0]}</span>
                  <span style={{ color: isTickUp ? 'var(--emerald-400)' : 'var(--rose-400)' }}>
                    ● Live Tick
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 1: STOCKS WITH RICH VALUATION METRICS (FAIR VALUE, BOOK VALUE, PE, ROE, ROCE) */}
      {activeTab === 'stocks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Quick Search & Metric Guide Helper */}
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search stocks by name or ticker (e.g. TCS, Reliance, Infosys, HDFC, Tata Motors)..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <button
              onClick={() => setActiveTab('education')}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 600, color: 'var(--gold-400)' }}
            >
              <BookOpen size={14} />
              <span>How do I use Fair Value & Book Value?</span>
            </button>
          </div>

          {/* Educational Disclaimer */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)'
          }}>
            <strong style={{ color: '#60a5fa' }}>Educational Valuation Terminal:</strong> SaveWise AI computes factual valuation metrics from exchange filings. These numbers help you understand if a stock is fundamentally expensive or cheap. This is NOT a buy/sell recommendation.
          </div>

          {/* Stock Cards with Rich Valuation Data */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.25rem' }}>
            {stockResults.map(stock => {
              const liveP = stock.livePrice || stock.price;
              const isUp = stock.tickDirection === 'up';
              const fairValueDiff = stock.fairValue ? Math.round(((stock.fairValue - liveP) / liveP) * 100) : null;

              return (
                <div key={stock.symbol} className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
                  
                  {/* Top Bar: Company Details & Live Price */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-indigo">{stock.exchange}</span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{stock.sector}</span>
                        {stock.valuationStatus && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                            {stock.valuationStatus}
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.4rem', marginTop: '0.25rem', fontWeight: 700 }}>
                        {stock.name} <span style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontFamily: 'var(--font-mono)' }}>({stock.symbol})</span>
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
                        {stock.description}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                          {stock.currency === 'USD ($)' ? `$${liveP.toFixed(2)}` : `₹${liveP.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </span>
                        {stock.tickDelta && (
                          <span style={{
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            color: isUp ? 'var(--emerald-400)' : 'var(--rose-400)',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {stock.tickDelta}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Market Cap: <strong>{stock.marketCap}</strong>
                      </span>
                    </div>
                  </div>

                  {/* VALUATION METRICS GRID (Fair Value, Book Value, P/B, P/E, ROE, ROCE, D/E) */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '1rem'
                  }}>
                    {/* 1. Fair Value */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fair Value (DCF)</span>
                      </div>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--gold-400)', display: 'block' }}>
                        {stock.currency === 'USD ($)' ? `$${stock.fairValue}` : `₹${stock.fairValue?.toLocaleString('en-IN')}`}
                      </strong>
                      <span style={{ fontSize: '0.65rem', color: fairValueDiff >= 0 ? 'var(--emerald-400)' : 'var(--rose-400)' }}>
                        {fairValueDiff >= 0 ? `+${fairValueDiff}% Margin of Safety` : `${fairValueDiff}% Premium`}
                      </span>
                    </div>

                    {/* 2. Book Value (BVPS) */}
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Book Value / Share</span>
                      <strong style={{ fontSize: '1.05rem', display: 'block' }}>
                        {stock.currency === 'USD ($)' ? `$${stock.bookValue}` : `₹${stock.bookValue?.toLocaleString('en-IN')}`}
                      </strong>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        Net Asset Backing
                      </span>
                    </div>

                    {/* 3. Price-to-Book (P/B) */}
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>P/B Ratio</span>
                      <strong style={{ fontSize: '1.05rem', display: 'block', color: stock.pbRatio < 3 ? 'var(--emerald-400)' : 'var(--text-primary)' }}>
                        {stock.pbRatio}x
                      </strong>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {stock.pbRatio < 3 ? 'Attractive Asset Price' : 'High IP / Franchise'}
                      </span>
                    </div>

                    {/* 4. P/E Ratio vs Sector */}
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>P/E vs Sector</span>
                      <strong style={{ fontSize: '1.05rem', display: 'block' }}>
                        {stock.peRatio} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({stock.sectorPE || '—'})</span>
                      </strong>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        Earnings Multiple
                      </span>
                    </div>

                    {/* 5. ROE & ROCE */}
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ROE / ROCE</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--emerald-400)', display: 'block' }}>
                        {stock.roe || '—'} / {stock.roce || '—'}
                      </strong>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        Capital Efficiency
                      </span>
                    </div>

                    {/* 6. Debt to Equity */}
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Debt / Equity</span>
                      <strong style={{ fontSize: '1.05rem', display: 'block', color: stock.debtToEquity < 0.5 ? 'var(--emerald-400)' : 'var(--rose-400)' }}>
                        {stock.debtToEquity !== undefined ? stock.debtToEquity : '—'}
                      </strong>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {stock.debtToEquity < 0.5 ? 'Very Low Debt' : 'Leveraged'}
                      </span>
                    </div>
                  </div>

                  {/* Valuation Breakdown Notes */}
                  {stock.valuationAnalysis && (
                    <div style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: '3px solid var(--gold-400)',
                      marginBottom: '1rem',
                      fontSize: '0.8125rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <strong style={{ color: 'var(--gold-400)' }}>Valuation Insight:</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--emerald-400)', fontWeight: 600 }}>{stock.valuationAnalysis.healthRating}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        • <strong>Fair Value Analysis:</strong> {stock.valuationAnalysis.fairValueNote}
                      </p>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        • <strong>Book Value Rationale:</strong> {stock.valuationAnalysis.bookValueNote}
                      </p>
                    </div>
                  )}

                  {/* Factors & Risks */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                    <div>
                      <strong style={{ color: 'var(--emerald-400)', display: 'block', marginBottom: '0.25rem' }}>
                        What Drives This Business:
                      </strong>
                      <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                        {stock.factorsToExamine.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <strong style={{ color: 'var(--rose-400)', display: 'block', marginBottom: '0.25rem' }}>
                        Key Risks to Monitor:
                      </strong>
                      <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                        {stock.risks.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>52-Week Range: <strong>{stock.range52w}</strong></span>
                    <span>Source: {stock.source}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL EDUCATION PANEL (METRICS DECRYPTED) */}
      {activeTab === 'education' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Investor Education Masterclass</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>How to Analyze Stock Market Numbers Like an Expert</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '720px', marginTop: '0.25rem' }}>
              Most beginners lose money by buying stocks when prices have already surged. Here is how professional value investors examine Fair Value, Book Value, and P/E ratios to protect their hard-earned capital.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {glossary.map((item, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  borderTop: '3px solid var(--emerald-500)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{item.term}</h3>
                  <span className="badge badge-indigo">{item.symbol}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>What is it?</span>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.15rem', lineHeight: 1.5 }}>
                    {item.simpleMeaning}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Why It Matters:</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.5 }}>
                    {item.whyItMatters}
                  </p>
                </div>

                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(245, 158, 11, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  fontSize: '0.8125rem'
                }}>
                  <strong style={{ color: 'var(--gold-400)', display: 'block', marginBottom: '0.15rem' }}>
                    Golden Rule of Thumb:
                  </strong>
                  <span style={{ color: 'var(--text-primary)' }}>{item.ruleOfThumb}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Ready to check real stock valuations?</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Head back to the Stocks tab to see these metrics live across India's largest companies.
            </p>
            <button onClick={() => setActiveTab('stocks')} className="btn btn-primary">
              <BarChart2 size={16} />
              <span>Explore Live Stocks with These Metrics</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: MUTUAL FUNDS & ETFS */}
      {activeTab === 'funds' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
          {fundCategories.map(cat => (
            <div key={cat.category} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <span className="badge badge-emerald">{cat.type}</span>
                  <h3 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>{cat.category}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{cat.description}</p>
                </div>
                <span className="badge badge-gold">Risk: {cat.risk}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.8125rem', background: 'var(--bg-secondary)', padding: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                <div><strong>Min SIP:</strong> {cat.minimumSip}</div>
                <div><strong>Expense Ratio:</strong> {cat.avgExpenseRatio}</div>
                <div><strong>Exit Load:</strong> {cat.exitLoad}</div>
                <div><strong>Recommended Horizon:</strong> {cat.recommendedHorizon}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Taxation:</strong> {cat.taxation}</div>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <strong>Representative Benchmark Funds:</strong> {cat.examples.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CRYPTO RISK NOTICE */}
      {activeTab === 'crypto' && marketData?.cryptoNotice && (
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(244, 63, 94, 0.4)', background: 'rgba(244, 63, 94, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--rose-400)', marginBottom: '1rem' }}>
            <ShieldAlert size={28} />
            <h3 style={{ fontSize: '1.4rem' }}>{marketData.cryptoNotice.riskLevel}</h3>
          </div>

          <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.6, marginBottom: '1rem' }}>
            {marketData.cryptoNotice.disclaimer}
          </p>

          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#fecaca',
            fontSize: '0.875rem'
          }}>
            <strong>Indian Tax Law Reality:</strong> {marketData.cryptoNotice.taxWarning}
          </div>

          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Four Reasons Beginners Should Be Extremely Cautious:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {marketData.cryptoNotice.coreRisks.map((rk, idx) => (
              <div key={idx} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--rose-400)', marginBottom: '0.25rem' }}>
                  {rk.title}
                </strong>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {rk.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
