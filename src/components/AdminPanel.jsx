import React, { useState, useEffect } from 'react';
import { Shield, Users, DollarSign, Activity, FileText, Lock, RefreshCw, Building2, Smartphone, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function AdminPanel({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payoutSettings, setPayoutSettings] = useState({
    account_holder: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    upi_id: '',
    upi_qr_url: ''
  });
  const [savingPayout, setSavingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState({ type: '', text: '' });

  const fetchAdminData = async () => {
    const token = localStorage.getItem('savewise_token');
    if (!token) return;

    try {
      setLoading(true);
      const [resMetrics, resPayout] = await Promise.all([
        fetch('/api/admin/metrics', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/payout-settings', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (resMetrics.ok) {
        const metrics = await resMetrics.json();
        setData(metrics);
      }
      if (resPayout.ok) {
        const payout = await resPayout.json();
        setPayoutSettings(payout);
      }
    } catch (e) {
      console.error('Failed to load admin metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayout = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('savewise_token');
    if (!token) return;

    try {
      setSavingPayout(true);
      setPayoutMessage({ type: '', text: '' });
      const res = await fetch('/api/admin/payout-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payoutSettings)
      });
      const resData = await res.json();
      if (res.ok) {
        setPayoutMessage({ type: 'success', text: 'Admin bank account credentials updated successfully! All premium payments will route here.' });
        if (resData.settings) setPayoutSettings(resData.settings);
      } else {
        setPayoutMessage({ type: 'error', text: resData.error || 'Failed to update bank credentials.' });
      }
    } catch (err) {
      setPayoutMessage({ type: 'error', text: 'Network error saving bank credentials.' });
    } finally {
      setSavingPayout(false);
      setTimeout(() => setPayoutMessage({ type: '', text: '' }), 5000);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <Lock size={48} color="var(--rose-400)" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Restricted Administrative Access</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You must be logged in with an administrator account to view platform telemetry.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-rose">Admin Portal</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--emerald-400)' }}>● Live Telemetry Operational</span>
          </div>
          <h2 style={{ fontSize: '1.75rem' }}>Platform Operations & System Health</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Audited usage metrics, security health, and premium conversion telemetry.
          </p>
        </div>

        <button onClick={fetchAdminData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {data && (
        <>
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Registered Users</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {data.metrics.totalUsers}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)' }}>100% password hashes encrypted</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Premium Revenue (INR)</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gold-400)', marginTop: '0.25rem' }}>
                ₹{Number(data.metrics.totalRevenueINR || 0).toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>From {data.metrics.premiumCount} premium plans</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Planned Capital Volume</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald-400)', marginTop: '0.25rem' }}>
                ₹{Number(data.metrics.plannedVolumeINR || 0).toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Across {data.metrics.plansCount} saved plans</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academy Completions</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--indigo-400)', marginTop: '0.25rem' }}>
                {data.metrics.lessonsCompleted}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lessons mastered by users</span>
            </div>
          </div>

          {/* System Telemetry & Health */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Server & Security Telemetry</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Uptime:</span>
                <strong>{Math.round(data.telemetry.serverUptimeSeconds)} seconds active</strong>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Memory (Heap):</span>
                <strong>{data.telemetry.memoryUsageMB} MB RAM used</strong>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Database Engine:</span>
                <strong style={{ color: 'var(--emerald-400)' }}>{data.telemetry.databaseStatus}</strong>
              </div>
            </div>
          </div>

          {/* Recent Signups Table (Passwords strictly isolated) */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>Recent Registered Accounts</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.5rem 0' }}>User ID</th>
                  <th style={{ padding: '0.5rem 0' }}>Name</th>
                  <th style={{ padding: '0.5rem 0' }}>Email</th>
                  <th style={{ padding: '0.5rem 0' }}>Role</th>
                  <th style={{ padding: '0.5rem 0' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.5rem 0', fontFamily: 'var(--font-mono)' }}>{u.id}</td>
                    <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '0.5rem 0', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '0.5rem 0' }}><span className="badge badge-emerald">{u.role}</span></td>
                    <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* ADMIN BANK ACCOUNT & PAYOUT CREDENTIALS SETUP */}
          <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(16, 185, 129, 0.03) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-gold">Payout Destination Settings</span>
                  <span className="badge badge-emerald">Direct Bank & UPI Routing</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', marginTop: '0.25rem' }}>Admin Bank Account Credentials</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  All 4% Software Planning Fees paid by users for plans above ₹1,000 will be credited directly to this receiving account.
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Fees Credited to Admin:</span>
                <strong style={{ fontSize: '1.35rem', color: 'var(--gold-400)' }}>
                  ₹{Number(data.metrics.totalRevenueINR || 0).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            {payoutMessage.text && (
              <div style={{
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                backgroundColor: payoutMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${payoutMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
                color: payoutMessage.type === 'success' ? '#6ee7b7' : '#fca5a5'
              }}>
                {payoutMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{payoutMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSavePayout}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Account Holder Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SaveWise Operations / Suryakumar"
                    value={payoutSettings.account_holder}
                    onChange={(e) => setPayoutSettings({ ...payoutSettings, account_holder: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Bank Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Bank Ltd, State Bank of India"
                    value={payoutSettings.bank_name}
                    onChange={(e) => setPayoutSettings({ ...payoutSettings, bank_name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Bank Account Number:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50200084920193"
                    value={payoutSettings.account_number}
                    onChange={(e) => setPayoutSettings({ ...payoutSettings, account_number: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Bank IFSC Code:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC0000240"
                    value={payoutSettings.ifsc_code}
                    onChange={(e) => setPayoutSettings({ ...payoutSettings, ifsc_code: e.target.value.toUpperCase() })}
                    className="input-field"
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Admin UPI ID / VPA (for Instant UPI QR & App Payments):
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      required
                      placeholder="e.g. admin@hdfcbank or yourname@oksbi"
                      value={payoutSettings.upi_id}
                      onChange={(e) => setPayoutSettings({ ...payoutSettings, upi_id: e.target.value })}
                      className="input-field"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="submit"
                      disabled={savingPayout}
                      className="btn btn-primary"
                      style={{ fontWeight: 700, padding: '0.6rem 1.25rem', whiteSpace: 'nowrap' }}
                    >
                      <Save size={16} />
                      <span>{savingPayout ? 'Updating...' : 'Save Bank Credentials'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Live Receiving Preview Card */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: '#ffffff',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {payoutSettings.upi_qr_url ? (
                    <img src={payoutSettings.upi_qr_url} alt="Admin UPI QR" style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Smartphone size={32} color="#000" />
                  )}
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', fontWeight: 600, display: 'block' }}>
                    ● Active Receiving Channel
                  </span>
                  <strong style={{ fontSize: '0.95rem' }}>{payoutSettings.bank_name || 'Bank Not Configured'}</strong>
                  <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    A/C: {payoutSettings.account_number ? `•••• •••• ${payoutSettings.account_number.slice(-4)}` : 'N/A'} • IFSC: {payoutSettings.ifsc_code || 'N/A'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--gold-400)', fontWeight: 600 }}>
                    UPI VPA: {payoutSettings.upi_id || 'N/A'}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                When users confirm a 4% fee checkout, they see this official bank credential and the settlement logs automatically verify receipt.
              </div>
            </div>
          </div>

          {/* Recent Premium Orders & Credited Bank Table */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>Recent Premium Plan Purchases & Admin Credited Fees</h3>
            {data.recentOrders && data.recentOrders.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.5rem 0' }}>Invoice #</th>
                    <th style={{ padding: '0.5rem 0' }}>Client</th>
                    <th style={{ padding: '0.5rem 0' }}>Planned Capital</th>
                    <th style={{ padding: '0.5rem 0' }}>4% Fee Paid</th>
                    <th style={{ padding: '0.5rem 0' }}>Status</th>
                    <th style={{ padding: '0.5rem 0' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.5rem 0', fontFamily: 'var(--font-mono)' }}>{o.invoice_no}</td>
                      <td style={{ padding: '0.5rem 0' }}>
                        <strong style={{ display: 'block' }}>{o.name}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{o.email}</span>
                      </td>
                      <td style={{ padding: '0.5rem 0' }}>₹{Number(o.planning_amount).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.5rem 0', color: 'var(--gold-400)', fontWeight: 700 }}>₹{Number(o.fee_amount).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.5rem 0' }}><span className="badge badge-emerald">{o.status}</span></td>
                      <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No premium orders placed yet.</p>
            )}
          </div>
        </>
      )}

    </div>
  );
}
