import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Sparkles, BookOpen, Calculator, Target, 
  CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck, 
  Trash2, Plus, Calendar
} from 'lucide-react';

export default function Dashboard({ 
  user, 
  onNavigate, 
  onOpenAuth,
  onOpenPlan
}) {
  const [timeline, setTimeline] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [stats, setStats] = useState({
    plannedSavings: 1000,
    goalsCount: 0,
    progressPercentage: 0,
    plansCount: 0
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    const token = localStorage.getItem('savewise_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [plansRes, goalsRes, currRes] = await Promise.all([
        fetch('/api/plans/my-plans', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/goals', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/learning/curriculum', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const plans = await plansRes.json();
      const goals = await goalsRes.json();
      const curr = await currRes.json();

      setSavedPlans(plans || []);
      setStats({
        plannedSavings: plans.reduce((acc, p) => acc + p.amount, 0) || 1000,
        goalsCount: (goals || []).length,
        progressPercentage: curr.progressPercentage || 0,
        plansCount: (plans || []).length
      });

      // Synthetic initial timeline if fresh
      setTimeline([
        { date: 'Today', title: 'Session Active', desc: 'Financial diagnostic profile active on SaveWise AI' },
        { date: 'Recent', title: 'Disclaimers Verified', desc: 'SEBI educational disclaimer acknowledged' },
        { date: 'Initial', title: 'Journey Started', desc: 'Joined SaveWise AI educational platform' }
      ]);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleDeletePlan = async (id) => {
    const token = localStorage.getItem('savewise_token');
    try {
      await fetch(`/api/plans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '0.25rem' }}>Personal Financial Command Center</span>
          <h1 style={{ fontSize: '2rem' }}>
            Welcome, <span className="text-gradient-emerald">{user ? user.name : 'Savvy Planner'}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            "I have money. What can I actually do with it?" — Your personalized roadmaps and habits at a glance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('plan')} className="btn btn-primary">
            <Sparkles size={16} />
            <span>Plan My Money</span>
          </button>
          <button onClick={() => onNavigate('learn')} className="btn btn-secondary">
            <BookOpen size={16} />
            <span>Academy & Terms</span>
          </button>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Planned Volume</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald-400)', marginTop: '0.25rem' }}>
            ₹{stats.plannedSavings.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Allocated across strategies</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Goals</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--indigo-400)', marginTop: '0.25rem' }}>
            {stats.goalsCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target milestones set</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Learning Progress</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gold-400)', marginTop: '0.25rem' }}>
            {stats.progressPercentage}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Financial literacy mastery</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Saved Strategies</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--cyan-400)', marginTop: '0.25rem' }}>
            {stats.plansCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Adopted asset allocations</span>
        </div>
      </div>

      {/* Grid: Financial Health Checklist + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        
        {/* Financial Health Checklist */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ShieldCheck size={20} color="var(--emerald-400)" />
            <h3 style={{ fontSize: '1.2rem' }}>Financial Health Checklist</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { title: 'Emergency Savings Cushion', status: 'done', desc: 'At least 3 months essential expenses in bank or liquid fund' },
              { title: 'Basic Financial Literacy', status: stats.progressPercentage > 20 ? 'done' : 'pending', desc: 'Understand inflation, risk vs return, and compounding' },
              { title: 'Target Goal Planning', status: stats.goalsCount > 0 ? 'done' : 'pending', desc: 'Define concrete timeline and monthly contribution milestones' },
              { title: 'Multi-Asset Diversification', status: stats.plansCount > 0 ? 'done' : 'pending', desc: 'Split savings across safety buffers, index funds, and gold' }
            ].map((chk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                {chk.status === 'done' ? (
                  <CheckCircle2 size={18} color="var(--emerald-400)" style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                )}
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>{chk.title}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{chk.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Quick Actions</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <button
              onClick={() => onNavigate('plan')}
              className="glass-card"
              style={{ padding: '1rem', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-color)' }}
            >
              <Sparkles size={20} color="var(--emerald-400)" style={{ marginBottom: '0.5rem' }} />
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>Create Plan</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Allocate from ₹100</span>
            </button>

            <button
              onClick={() => onNavigate('learn')}
              className="glass-card"
              style={{ padding: '1rem', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-color)' }}
            >
              <BookOpen size={20} color="var(--gold-400)" style={{ marginBottom: '0.5rem' }} />
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>Academy</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Take interactive quizzes</span>
            </button>

            <button
              onClick={() => onNavigate('calculator')}
              className="glass-card"
              style={{ padding: '1rem', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-color)' }}
            >
              <Calculator size={20} color="var(--cyan-400)" style={{ marginBottom: '0.5rem' }} />
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>What-If Math</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Simulate 1-30 years</span>
            </button>

            <button
              onClick={() => onNavigate('scam')}
              className="glass-card"
              style={{ padding: '1rem', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-color)' }}
            >
              <AlertTriangle size={20} color="var(--rose-400)" style={{ marginBottom: '0.5rem' }} />
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>Scam Check</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Verify dubious offers</span>
            </button>
          </div>
        </div>

      </div>

      {/* SAVED PLANS SECTION */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>My Saved Allocation Strategies</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Strategies you have saved to your private journal.
            </p>
          </div>
          <button onClick={() => onNavigate('plan')} className="btn btn-secondary btn-sm">
            <Plus size={14} /> New Plan
          </button>
        </div>

        {savedPlans.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              No saved strategies yet. Run the planning wizard and click "Save Strategy".
            </p>
            <button onClick={() => onNavigate('plan')} className="btn btn-primary btn-sm">
              Generate Plan Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
            {savedPlans.map(plan => (
              <div
                key={plan.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>{plan.strategy_type}</span>
                    <h4 style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>{plan.strategy_name}</h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--emerald-400)' }}>
                      ₹{plan.amount.toLocaleString('en-IN')}
                    </strong>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem', color: 'var(--rose-400)' }}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Allocation chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {plan.allocation.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-tertiary)',
                        fontSize: '0.75rem',
                        borderLeft: `3px solid ${item.color}`
                      }}
                    >
                      {item.category}: <strong>₹{item.amount}</strong> ({item.percentage}%)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVITY TIMELINE: "My Money Journey" */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Calendar size={18} color="var(--indigo-400)" />
          <h3 style={{ fontSize: '1.25rem' }}>My Money Journey (Timeline)</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1rem' }}>
          <div style={{ position: 'absolute', left: '1.5rem', top: '0.5rem', bottom: '0.5rem', width: '2px', backgroundColor: 'var(--border-color)' }} />

          {timeline.map((evt, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', position: 'relative' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'var(--emerald-500)',
                marginTop: '4px',
                flexShrink: 0,
                zIndex: 1,
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
              }} />
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{evt.date}</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>{evt.title}</strong>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{evt.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
