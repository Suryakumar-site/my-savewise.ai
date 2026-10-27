import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';
import OnboardingWizard from './components/OnboardingWizard';
import PlanGenerator from './components/PlanGenerator';
import WhatIfSimulator from './components/WhatIfSimulator';
import LearningCenter from './components/LearningCenter';
import ComparisonEngine from './components/ComparisonEngine';
import MarketExplorer from './components/MarketExplorer';
import DematGuide from './components/DematGuide';
import ScamDetector from './components/ScamDetector';
import SmartCoach from './components/SmartCoach';
import GoalsTracker from './components/GoalsTracker';
import Dashboard from './components/Dashboard';
import PremiumModal from './components/PremiumModal';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);
  const [marketStatus, setMarketStatus] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumTargetAmount, setPremiumTargetAmount] = useState(10000);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Restore authenticated session
  useEffect(() => {
    const savedUser = localStorage.getItem('savewise_user');
    const token = localStorage.getItem('savewise_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify with server
        fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.user) setUser(data.user);
          })
          .catch(() => {});
      } catch (e) {}
    }
  }, []);

  // Fetch live market status on mount
  useEffect(() => {
    fetch('/api/market/overview')
      .then(res => res.json())
      .then(data => {
        if (data.marketStatus) setMarketStatus(data.marketStatus);
      })
      .catch(() => {});
  }, []);

  // Generate Plan Handler
  const handleCompletePlan = async (payload) => {
    // If amount is above ₹1,000, prompt upfront 4% fee checkout to admin bank account
    if (payload.amount > 1000) {
      setPremiumTargetAmount(payload.amount);
      setShowPremiumModal(true);
      return;
    }

    try {
      const token = localStorage.getItem('savewise_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/plans/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...payload, refreshIteration: refreshCount })
      });
      const data = await res.json();
      setPlanData(data);
      setCurrentTab('plan');
    } catch (e) {
      console.error('Failed to generate plan:', e);
      alert('Error generating plan. Please verify backend connection.');
    }
  };

  // Refresh Options Handler (Prominent 🔄 Give Me Different Options feature)
  const handleRefreshOptions = async () => {
    if (!planData) return;
    const nextIteration = (planData.refreshIteration || 0) + 1;
    setRefreshCount(nextIteration);

    try {
      const token = localStorage.getItem('savewise_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/plans/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: planData.amount,
          familiarity: planData.familiarity,
          goals: planData.goals,
          timeHorizon: planData.timeHorizon,
          riskComfort: planData.riskComfort,
          hasEmergency: planData.hasEmergency,
          refreshIteration: nextIteration
        })
      });
      const data = await res.json();
      setPlanData(data);
    } catch (e) {
      console.error('Failed to refresh options:', e);
    }
  };

  // Save Plan to Dashboard Handler
  const handleSavePlan = async (planToSave) => {
    const token = localStorage.getItem('savewise_token');
    if (!token) {
      setShowAuthModal(true);
      return false;
    }

    try {
      const res = await fetch('/api/plans/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(planToSave)
      });
      const data = await res.json();
      return res.ok;
    } catch (e) {
      console.error('Save plan error:', e);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('savewise_token');
    localStorage.removeItem('savewise_user');
    setUser(null);
    setCurrentTab('dashboard');
  };

  const handleOpenPremiumModal = (targetAmt) => {
    if (targetAmt) setPremiumTargetAmount(targetAmt);
    setShowPremiumModal(true);
  };

  return (
    <div className="app-container">
      {/* Disclaimer and Market Status Bar */}
      <DisclaimerBanner 
        marketStatus={marketStatus} 
        onOpenLearn={() => setCurrentTab('learn')} 
      />

      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenPremium={() => handleOpenPremiumModal(10000)}
      />

      {/* Hero Headline Section for Dashboard */}
      {currentTab === 'dashboard' && (
        <section style={{
          background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.12) 0%, rgba(10, 14, 23, 0) 70%)',
          borderBottom: '1px solid var(--border-color)',
          padding: '2.5rem 1rem',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}>
              Financial Agency • Education • Scenario Modeling
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '0.75rem' }}>
              Your Money. Your Choice. <span className="text-gradient-emerald">Better Understanding.</span>
            </h1>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto 1.5rem auto' }}>
              Tell us how much you have, what you want to achieve, and what you already know. SaveWise AI explains your options step by step.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setCurrentTab('plan')}
                className="btn btn-primary btn-lg"
                style={{ fontWeight: 700 }}
              >
                Plan My Money
              </button>
              <button
                onClick={() => setCurrentTab('learn')}
                className="btn btn-secondary btn-lg"
              >
                I Want to Learn First
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Body Router */}
      <main className="main-content">
        {currentTab === 'dashboard' && (
          <Dashboard
            user={user}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenPlan={() => setCurrentTab('plan')}
          />
        )}

        {currentTab === 'plan' && (
          planData ? (
            <PlanGenerator
              planData={planData}
              onRefreshOptions={handleRefreshOptions}
              onSavePlan={handleSavePlan}
              onOpenPremium={handleOpenPremiumModal}
              onResetPlan={() => setPlanData(null)}
              onOpenLearn={() => setCurrentTab('learn')}
              user={user}
            />
          ) : (
            <OnboardingWizard
              initialAmount={1000}
              onCompletePlan={handleCompletePlan}
              onLearnFirst={() => setCurrentTab('learn')}
            />
          )
        )}

        {currentTab === 'explore' && <MarketExplorer />}

        {currentTab === 'learn' && (
          <LearningCenter
            user={user}
            onLessonCompleted={() => {}}
          />
        )}

        {currentTab === 'calculator' && <WhatIfSimulator />}

        {currentTab === 'goals' && (
          <GoalsTracker
            user={user}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {currentTab === 'coach' && (
          <SmartCoach
            user={user}
            onNavigateToPlan={() => setCurrentTab('plan')}
          />
        )}

        {currentTab === 'compare' && <ComparisonEngine />}

        {currentTab === 'demat' && <DematGuide />}

        {currentTab === 'scam' && <ScamDetector />}

        {currentTab === 'admin' && <AdminPanel user={user} />}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        padding: '2.5rem 1rem 1.5rem 1rem',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  SAVEWISE<span style={{ color: 'var(--emerald-400)' }}>.AI</span>
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>India Edition</span>
              </div>
              <p style={{ maxWidth: '380px', lineHeight: 1.5 }}>
                "I have money. What can I actually do with it?"
                Building human financial agency through honest, step-by-step education, risk awareness, and scenario analysis.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Quick Navigation</strong>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <li><a href="#plan" onClick={() => setCurrentTab('plan')} style={{ color: 'inherit', textDecoration: 'none' }}>Plan My Money</a></li>
                  <li><a href="#learn" onClick={() => setCurrentTab('learn')} style={{ color: 'inherit', textDecoration: 'none' }}>Academy & Terms</a></li>
                  <li><a href="#calculator" onClick={() => setCurrentTab('calculator')} style={{ color: 'inherit', textDecoration: 'none' }}>What-If Calculator</a></li>
                  <li><a href="#scam" onClick={() => setCurrentTab('scam')} style={{ color: 'inherit', textDecoration: 'none' }}>Is This Investment Legit?</a></li>
                </ul>
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Compliance & Legal</strong>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <li>SEBI Non-Advisory Notice</li>
                  <li>Zero Guaranteed Returns Policy</li>
                  <li>Digital Personal Data Protection (DPDP)</li>
                  <li>No Sensitive Banking PINs Collected</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.75rem'
          }}>
            <span>© 2026 SaveWise AI Technologies. All rights reserved. Built for Indian financial savers.</span>
            <span>Market data feeds: NSE / BSE / IBJA Spot settlement indices.</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(loggedUser) => setUser(loggedUser)}
        />
      )}

      {showPremiumModal && (
        <PremiumModal
          initialAmount={premiumTargetAmount}
          onClose={() => setShowPremiumModal(false)}
          user={user}
          onOpenAuth={() => setShowAuthModal(true)}
          onPlanUnlocked={(unlockedPlan) => {
            setPlanData(unlockedPlan);
            setCurrentTab('plan');
            setShowPremiumModal(false);
          }}
        />
      )}
    </div>
  );
}
