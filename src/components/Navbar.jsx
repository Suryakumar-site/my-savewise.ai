import React, { useState } from 'react';
import { 
  Sparkles, Compass, BookOpen, Calculator, Target, 
  MessageSquare, Layers, ShieldAlert, KeyRound, User, 
  LogOut, Sun, Moon, Menu, X, CheckCircle, BarChart3, Lock
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  onOpenAuth, 
  onLogout, 
  theme, 
  toggleTheme,
  onOpenPremium
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'plan', label: 'Plan My Money', icon: Sparkles, badge: 'Core' },
    { id: 'explore', label: 'Explore Market', icon: Compass },
    { id: 'learn', label: 'Learn & Terms', icon: BookOpen },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'coach', label: 'AI Coach', icon: MessageSquare },
    { id: 'compare', label: 'Compare', icon: Layers },
    { id: 'demat', label: 'Demat Guide', icon: KeyRound },
    { id: 'scam', label: 'Legit Check', icon: ShieldAlert, badge: 'Safety' },
  ];

  if (user && user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: Lock, badge: 'Staff' });
  }

  const handleNavClick = (tabId) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      transition: 'all 0.2s'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Logo and Brand */}
        <div 
          onClick={() => handleNavClick('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            flexShrink: 0
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                SAVEWISE<span style={{ color: 'var(--emerald-400)' }}>.AI</span>
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                ₹ INR
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'none', md: 'block' }}>
              "I have money. What can I actually do with it?"
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav style={{ display: 'none', lg: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navItems.slice(0, 7).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  border: isActive ? 'none' : '1px solid transparent',
                  background: isActive ? undefined : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.8125rem',
                  padding: '0.4rem 0.75rem'
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '0.1rem 0.3rem',
                    borderRadius: '4px',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: isActive ? '#ffffff' : 'var(--emerald-400)'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* More menu items */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {navItems.slice(7).map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                    style={{
                      border: isActive ? 'none' : '1px solid transparent',
                      background: isActive ? undefined : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                      padding: '0.4rem 0.65rem'
                    }}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Right Action Icons: Theme, Premium, Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            title="Toggle Light / Dark mode"
            style={{ padding: '0.5rem', borderRadius: '50%' }}
          >
            {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#6366f1" />}
          </button>

          <button
            onClick={onOpenPremium}
            className="btn btn-gold btn-sm"
            style={{ fontWeight: 700 }}
          >
            <Sparkles size={14} />
            <span style={{ display: 'none', sm: 'inline' }}>4% Premium Plan</span>
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div 
                onClick={() => handleNavClick('dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--emerald-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#ffffff'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="btn btn-secondary btn-sm"
                title="Logout"
                style={{ padding: '0.5rem', borderRadius: '50%' }}
              >
                <LogOut size={15} color="var(--rose-400)" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-primary btn-sm"
            >
              <User size={15} />
              <span>Login</span>
            </button>
          )}

          {/* Mobile menu hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', lg: 'none', padding: '0.5rem' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          padding: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.5rem'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
