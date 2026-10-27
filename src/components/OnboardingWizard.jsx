import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, ArrowLeft, Shield, Clock, 
  HelpCircle, AlertTriangle, CheckCircle2, Wallet, 
  Info, RefreshCw, Check
} from 'lucide-react';

export default function OnboardingWizard({ initialAmount = 1000, onCompletePlan, onLearnFirst }) {
  const [step, setStep] = useState(1);

  // Form State
  const [amount, setAmount] = useState(initialAmount);
  const [customAmountInput, setCustomAmountInput] = useState('');
  const [familiarity, setFamiliarity] = useState('beginner'); // 'beginner', 'basics', 'investing', 'experienced'
  const [goals, setGoals] = useState(['Grow slowly']);
  const [timeHorizon, setTimeHorizon] = useState('1-3 years');
  const [riskComfort, setRiskComfort] = useState('moderate');
  const [existingAccounts, setExistingAccounts] = useState(['Savings bank account', 'UPI']);
  const [dematPlatform, setDematPlatform] = useState('');
  const [hasEmergency, setHasEmergency] = useState(false);
  const [loading, setLoading] = useState(false);

  const amountPresets = [100, 250, 500, 1000, 2000, 5000, 10000, 25000];

  const goalOptions = [
    'Keep it safe',
    'Grow slowly',
    'Grow over the long term',
    'Build an emergency fund',
    'Save for education',
    'Save for a phone/laptop',
    'Save for travel',
    'Build wealth',
    'Learn investing',
    'Generate potential passive income',
    "I don't know yet"
  ];

  const timeHorizonOptions = [
    { id: '< 1 month', label: 'Within 1 month', note: 'Strictly liquid cash/savings only. Zero market risk allowed.' },
    { id: '1-6 months', label: '1–6 months', note: 'High-yield savings or short term bank deposits.' },
    { id: '6-12 months', label: '6–12 months', note: 'Short term fixed deposits or recurring deposits.' },
    { id: '1-3 years', label: '1–3 years', note: 'Low-duration conservative debt or balanced buffers.' },
    { id: '3-5 years', label: '3–5 years', note: 'Moderate multi-asset or conservative index funds.' },
    { id: '5+ years', label: '5+ years', note: 'Equity index funds, broad market compounding, gold.' },
    { id: 'unknown', label: "I don't know yet", note: 'We will help you determine appropriate flexibility.' }
  ];

  const riskScenarios = [
    {
      id: 'low',
      code: 'A',
      title: '"I would panic and want my money back immediately."',
      riskLevel: 'Conservative / Capital Preservation',
      description: 'You prioritize peace of mind over high returns. Focus on liquid bank deposits and sovereign-backed instruments with zero loss potential.'
    },
    {
      id: 'moderate',
      code: 'B',
      title: '"I wouldn\'t like it, but I could wait it out."',
      riskLevel: 'Balanced / Moderate Tolerance',
      description: 'You can handle minor temporary fluctuations if the overall portfolio stays cushioned with liquid reserves.'
    },
    {
      id: 'high',
      code: 'C',
      title: '"I understand that short-term market losses happen."',
      riskLevel: 'Growth / Disciplined Investor',
      description: 'You understand business cycles and can stay calm during 10%–20% market corrections over 5+ years.'
    },
    {
      id: 'very_high',
      code: 'D',
      title: '"I am comfortable with significant fluctuations for high growth."',
      riskLevel: 'Aggressive / High Volatility',
      description: 'You have a secure emergency foundation elsewhere and can handle sharp market swings.'
    }
  ];

  const accountList = [
    'Savings bank account',
    'UPI',
    'Demat account',
    'Trading account',
    'Mutual fund account',
    'SIP',
    'PPF',
    'NPS',
    'FD/RD',
    'Gold investment',
    'Crypto account',
    'None of these'
  ];

  const dematPlatforms = [
    'Zerodha',
    'Groww',
    'Upstox',
    'Angel One',
    'ICICI Direct',
    'HDFC Securities',
    'Other',
    "I don't remember"
  ];

  const toggleGoal = (g) => {
    if (goals.includes(g)) {
      setGoals(goals.filter(item => item !== g));
    } else {
      setGoals([...goals, g]);
    }
  };

  const toggleAccount = (acc) => {
    if (acc === 'None of these') {
      setExistingAccounts(['None of these']);
      return;
    }
    const filtered = existingAccounts.filter(item => item !== 'None of these');
    if (filtered.includes(acc)) {
      setExistingAccounts(filtered.filter(item => item !== acc));
    } else {
      setExistingAccounts([...filtered, acc]);
    }
  };

  const hasDematSelected = existingAccounts.includes('Demat account');

  const handleFinish = async () => {
    setLoading(true);
    const planPayload = {
      amount: Number(amount),
      familiarity,
      goals,
      timeHorizon,
      riskComfort,
      existingAccounts,
      dematPlatform: hasDematSelected ? dematPlatform : '',
      hasEmergency
    };
    await onCompletePlan(planPayload);
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', maxWidth: '820px', margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}>
      {/* Progress Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
            Step {step} of 7
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Financial Diagnostic Journey
          </span>
        </div>

        <button
          onClick={onLearnFirst}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          I want to learn first
        </button>
      </div>

      {/* STEP 1: AMOUNT */}
      {step === 1 && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 600, fontSize: '0.875rem' }}>STEP 1</span>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>How much money are you planning with?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              Whether you have ₹100 or ₹50,000, SaveWise AI generates realistic, honest educational paths.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {amountPresets.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => { setAmount(preset); setCustomAmountInput(''); }}
                className={`chip ${amount === preset && !customAmountInput ? 'active' : ''}`}
                style={{ fontSize: '1rem', padding: '0.625rem 1.25rem' }}
              >
                ₹{preset.toLocaleString('en-IN')}
                {preset === 100 && <span style={{ fontSize: '0.7rem', color: 'var(--emerald-400)' }}>★ Special ₹100 Path</span>}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Or enter a custom amount (₹ INR):
            </label>
            <div style={{ position: 'relative', maxWidth: '320px' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>
                ₹
              </span>
              <input
                type="number"
                min="1"
                placeholder="e.g. 3500"
                value={customAmountInput}
                onChange={(e) => {
                  setCustomAmountInput(e.target.value);
                  if (e.target.value) setAmount(Number(e.target.value));
                }}
                className="input-field"
                style={{ paddingLeft: '2.25rem', fontSize: '1.125rem', fontWeight: 600 }}
              />
            </div>
          </div>

          {amount <= 100 && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-400)', fontWeight: 600, fontSize: '0.875rem' }}>
                <Sparkles size={16} />
                <span>The ₹100 Experience Active</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                We will unlock specialized educational roadmaps: Safe liquidity, trial investing, and skill improvement.
              </p>
            </div>
          )}

          {amount > 1000 && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-400)', fontWeight: 600, fontSize: '0.875rem' }}>
                <Info size={16} />
                <span>Planning over ₹1,000</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Basic planning is 100% free. You can also explore our optional 4% Deep Premium Plan for detailed tax analysis and personalized checklists.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              onClick={() => setStep(2)}
              className="btn btn-primary"
            >
              Continue to Step 2 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: FAMILIARITY */}
      {step === 2 && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 600, fontSize: '0.875rem' }}>STEP 2</span>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>How familiar are you with investing?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              We tailor our vocabulary to match your level—from zero jargon to advanced portfolio concepts.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              {
                id: 'beginner',
                title: "I'm completely new",
                desc: 'Explain everything from absolute zero using simple, real-life analogies. No financial jargon without an explanation.',
                badge: 'Zero Jargon'
              },
              {
                id: 'basics',
                title: 'I know the basics',
                desc: 'I understand what stocks and mutual funds are, but want structured guidance on asset allocation and risks.',
                badge: 'Foundation'
              },
              {
                id: 'investing',
                title: 'I already invest',
                desc: 'I have an active SIP or demat account. Skip basic definitions and focus on asset allocation and comparisons.',
                badge: 'Active'
              },
              {
                id: 'experienced',
                title: "I'm experienced",
                desc: 'Show advanced metrics, expense ratio comparisons, tax nuances (LTCG/STCG), and rebalancing frameworks.',
                badge: 'Advanced'
              }
            ].map(lvl => (
              <div
                key={lvl.id}
                onClick={() => setFamiliarity(lvl.id)}
                className="glass-card"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  border: familiarity === lvl.id ? '2px solid var(--emerald-500)' : '1px solid var(--border-color)',
                  background: familiarity === lvl.id ? 'rgba(16, 185, 129, 0.08)' : undefined
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>{lvl.title}</h3>
                  <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>{lvl.badge}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{lvl.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button onClick={() => setStep(1)} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setStep(3)} className="btn btn-primary">
              Continue to Step 3 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: GOALS */}
      {step === 3 && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 600, fontSize: '0.875rem' }}>STEP 3</span>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>What do you want this money to do?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              Select all goals that matter to you. Different goals require completely different financial vehicles.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', marginBottom: '1.5rem' }}>
            {goalOptions.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGoal(g)}
                className={`chip ${goals.includes(g) ? 'active' : ''}`}
                style={{ padding: '0.625rem 1rem' }}
              >
                {goals.includes(g) && <Check size={14} color="var(--emerald-400)" />}
                <span>{g}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button onClick={() => setStep(2)} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button 
              onClick={() => setStep(4)} 
              disabled={goals.length === 0} 
              className="btn btn-primary"
            >
              Continue to Step 4 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: TIME HORIZON */}
      {step === 4 && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 600, fontSize: '0.875rem' }}>STEP 4</span>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>When might you need this money?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              <strong>Why this matters:</strong> Investing money you need in 3 months into the stock market is dangerous because prices fluctuate. Time horizon dictates safety vs. growth.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {timeHorizonOptions.map(th => (
              <div
                key={th.id}
                onClick={() => setTimeHorizon(th.id)}
                className="glass-card"
                style={{
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  border: timeHorizon === th.id ? '2px solid var(--emerald-500)' : '1px solid var(--border-color)',
                  background: timeHorizon === th.id ? 'rgba(16, 185, 129, 0.08)' : undefined
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color={timeHorizon === th.id ? 'var(--emerald-400)' : 'var(--text-muted)'} />
                  <strong style={{ fontSize: '1rem' }}>{th.label}</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{th.note}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button onClick={() => setStep(3)} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setStep(5)} className="btn btn-primary">
              Continue to Step 5 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: RISK COMFORT SCENARIO */}
      {step === 5 && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 600, fontSize: '0.875rem' }}>STEP 5</span>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>How comfortable are you with risk?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              Instead of asking generic labels, consider this real scenario:
            </p>
          </div>

          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              "If your ₹{amount.toLocaleString('en-IN')} temporarily dropped to ₹{Math.round(amount * 0.8).toLocaleString('en-IN')} (-20%) during a market dip, what would you do?"
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {riskScenarios.map(s => (
              <div
                key={s.id}
                onClick={() => setRiskComfort(s.id)}
                className="glass-card"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  border: riskComfort === s.id ? '2px solid var(--emerald-500)' : '1px solid var(--border-color)',
                  background: riskComfort === s.id ? 'rgba(16, 185, 129, 0.08)' : undefined
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-emerald" style={{ width: '22px', height: '22px', padding: 0, justifyContent: 'center' }}>
                    {s.code}
                  </span>
                  <strong style={{ fontSize: '0.95rem' }}>{s.title}</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginLeft: '1.75rem' }}>
                  <strong>Profile:</strong> {s.riskLevel} — {s.description}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button onClick={() => setStep(4)} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setStep(6)} className="btn btn-primary">
              Continue to Step 6 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: EXISTING ACCOUNTS */}
      {step === 6 && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 600, fontSize: '0.875rem' }}>STEP 6</span>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>Do you already have any of these?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              This helps us recommend only instruments you can actually access without unnecessary paperwork.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', marginBottom: '1.5rem' }}>
            {accountList.map(acc => (
              <button
                key={acc}
                type="button"
                onClick={() => toggleAccount(acc)}
                className={`chip ${existingAccounts.includes(acc) ? 'active' : ''}`}
                style={{ padding: '0.625rem 1rem' }}
              >
                {existingAccounts.includes(acc) && <Check size={14} color="var(--emerald-400)" />}
                <span>{acc}</span>
              </button>
            ))}
          </div>

          {/* Demat Platform Sub-question */}
          {hasDematSelected ? (
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Which Demat platform do you use?
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {dematPlatforms.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDematPlatform(p)}
                    className={`chip ${dematPlatform === p ? 'active' : ''}`}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-400)', fontWeight: 600, fontSize: '0.9rem' }}>
                <Info size={16} />
                <span>Don't have a Demat Account? No problem!</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
                A Demat account is a digital locker for stocks and ETFs. If you only want to invest in safe bank deposits or direct mutual funds via fund websites, you don't even need one right now!
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button onClick={() => setStep(5)} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setStep(7)} className="btn btn-primary">
              Continue to Step 7 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: EMERGENCY SAVINGS CHECK & CONFIRM */}
      {step === 7 && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 600, fontSize: '0.875rem' }}>STEP 7</span>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>Do you already have emergency savings?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              An emergency buffer (3 to 6 months of basic living costs) protects you from having to sell investments in panic during sudden medical or job events.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              onClick={() => setHasEmergency(true)}
              className="glass-card"
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                textAlign: 'center',
                border: hasEmergency ? '2px solid var(--emerald-500)' : '1px solid var(--border-color)',
                background: hasEmergency ? 'rgba(16, 185, 129, 0.08)' : undefined
              }}
            >
              <CheckCircle2 size={28} color={hasEmergency ? 'var(--emerald-400)' : 'var(--text-muted)'} style={{ margin: '0 auto 0.5rem auto' }} />
              <strong style={{ display: 'block', fontSize: '1rem' }}>Yes, I have an emergency buffer</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ready for market-linked growth</span>
            </div>

            <div
              onClick={() => setHasEmergency(false)}
              className="glass-card"
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                textAlign: 'center',
                border: !hasEmergency ? '2px solid var(--gold-500)' : '1px solid var(--border-color)',
                background: !hasEmergency ? 'rgba(245, 158, 11, 0.08)' : undefined
              }}
            >
              <AlertTriangle size={28} color={!hasEmergency ? 'var(--gold-400)' : 'var(--text-muted)'} style={{ margin: '0 auto 0.5rem auto' }} />
              <strong style={{ display: 'block', fontSize: '1rem' }}>Not yet / Still building it</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>We will allocate a safe cushion first</span>
            </div>
          </div>

          {/* Review Summary */}
          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.8125rem'
          }}>
            <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Your Plan Profile Summary:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <div>• Amount: <strong style={{ color: 'var(--text-primary)' }}>₹{amount.toLocaleString('en-IN')}</strong></div>
              <div>• Knowledge: <strong style={{ color: 'var(--text-primary)' }}>{familiarity}</strong></div>
              <div>• Horizon: <strong style={{ color: 'var(--text-primary)' }}>{timeHorizon}</strong></div>
              <div>• Risk Profile: <strong style={{ color: 'var(--text-primary)' }}>{riskComfort}</strong></div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button onClick={() => setStep(6)} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button 
              onClick={handleFinish} 
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ fontWeight: 700 }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Generating Responsible Strategies...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate My ₹{amount.toLocaleString('en-IN')} Strategies</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
