import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle, Clock, AlertCircle, Trash2, ArrowUpRight, DollarSign } from 'lucide-react';

export default function GoalsTracker({ user, onOpenAuth }) {
  const [goals, setGoals] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(null); // active goal to contribute to
  const [contributionAmount, setContributionAmount] = useState('');
  
  // New goal form
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadlineMonths, setDeadlineMonths] = useState(12);
  const [category, setCategory] = useState('tech');
  const [loading, setLoading] = useState(false);

  const fetchGoals = async () => {
    const token = localStorage.getItem('savewise_token');
    if (!token) return;
    try {
      const res = await fetch('/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setGoals(data || []);
    } catch (e) {
      console.error('Failed to fetch goals:', e);
    }
  };

  useEffect(() => {
    if (user) fetchGoals();
  }, [user]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title || !targetAmount || !deadlineMonths) return;

    setLoading(true);
    const token = localStorage.getItem('savewise_token');
    try {
      await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          targetAmount: Number(targetAmount),
          currentAmount: Number(currentAmount) || 0,
          deadlineMonths: Number(deadlineMonths),
          category
        })
      });
      setShowCreateModal(false);
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('');
      fetchGoals();
    } catch (err) {
      console.error('Failed to create goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = async (e) => {
    e.preventDefault();
    if (!contributionAmount || Number(contributionAmount) <= 0) return;

    const token = localStorage.getItem('savewise_token');
    try {
      await fetch(`/api/goals/${showContributeModal.id}/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contributionAmount: Number(contributionAmount) })
      });
      setShowContributeModal(null);
      setContributionAmount('');
      fetchGoals();
    } catch (err) {
      console.error('Failed to contribute:', err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    const token = localStorage.getItem('savewise_token');
    try {
      await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchGoals();
    } catch (err) {
      console.error('Delete goal error:', err);
    }
  };

  if (!user) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <Target size={48} color="var(--emerald-400)" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Track Personal Financial Goals</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
          Create custom goals (e.g. "Buy laptop" ₹60,000 in 12 months) and let SaveWise calculate your monthly savings schedule and alternative pacing scenarios.
        </p>
        <button onClick={onOpenAuth} className="btn btn-primary">
          Log In or Register to Track Goals
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-emerald">Goal Planning Engine</span>
          </div>
          <h2 style={{ fontSize: '1.75rem' }}>My Financial Goals</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Transform big ambitions into predictable, bite-sized monthly savings milestones.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You don't have any active goals yet.</p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-secondary">
            Set Your First Goal (e.g. Emergency Fund or Laptop)
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.25rem' }}>
          {goals.map(g => (
            <div key={g.id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-indigo">{g.category}</span>
                    <span style={{ fontSize: '0.8125rem', color: g.status === 'completed' ? 'var(--emerald-400)' : 'var(--text-muted)' }}>
                      ● {g.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.35rem', marginTop: '0.25rem' }}>{g.title}</h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => setShowContributeModal(g)}
                    className="btn btn-primary btn-sm"
                  >
                    + Add Savings
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(g.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.4rem', color: 'var(--rose-400)' }}
                    title="Delete Goal"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                  <span>Current: <strong>₹{g.current_amount.toLocaleString('en-IN')}</strong></span>
                  <span style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>{g.progressPercent}% of ₹{g.target_amount.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${g.progressPercent}%`,
                    height: '100%',
                    backgroundColor: g.status === 'completed' ? 'var(--emerald-500)' : 'var(--indigo-500)',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Monthly Saving Required</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--emerald-400)' }}>₹{g.calculatedMonthly.toLocaleString('en-IN')}/mo</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Remaining Amount</span>
                  <strong style={{ fontSize: '1rem' }}>₹{g.remaining.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Timeline Target</span>
                  <strong style={{ fontSize: '1rem' }}>{g.deadline_months} Months</strong>
                </div>
              </div>

              {/* Pacing Scenarios */}
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.375rem' }}>
                  Alternative Pacing Scenarios:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.75rem' }}>
                  {g.scenarios.map((sc, i) => (
                    <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{sc.label}</strong>
                      <span style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>₹{sc.monthly.toLocaleString('en-IN')}/mo</span> ({sc.months} mos)
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '1.75rem', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Create a New Savings Goal</h3>
            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Goal Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Buy Laptop, Emergency Fund, Trip to Goa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Target (₹):</label>
                  <input
                    type="number"
                    min="100"
                    placeholder="60000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Current Saved (₹):</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="8000"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Deadline (Months):</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={deadlineMonths}
                    onChange={(e) => setDeadlineMonths(e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="electronics">Electronics / Laptop</option>
                    <option value="emergency">Emergency Reserve</option>
                    <option value="education">Education / Course</option>
                    <option value="travel">Travel / Vacation</option>
                    <option value="general">General Savings</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTRIBUTE MODAL */}
      {showContributeModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '1.75rem', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Add Savings to "{showContributeModal.title}"</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Target: ₹{showContributeModal.target_amount.toLocaleString('en-IN')} (Remaining: ₹{showContributeModal.remaining.toLocaleString('en-IN')})
            </p>

            <form onSubmit={handleAddContribution} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Amount Added (₹):</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 1000"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  required
                  className="input-field"
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowContributeModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record Savings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
