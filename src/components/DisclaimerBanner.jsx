import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

export default function DisclaimerBanner({ marketStatus, onOpenLearn }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '0.5rem 1rem',
      fontSize: '0.8125rem',
      color: '#94a3b8'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
          <ShieldCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
          <span>
            <strong style={{ color: '#f8fafc' }}>Financial Education & Scenario Platform:</strong> SaveWise AI does not provide regulated SEBI investment advice or promise guaranteed returns. You retain 100% human financial agency.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          {marketStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span className="pulse-live" style={{ backgroundColor: marketStatus.isOpen ? '#10b981' : '#eab308' }}></span>
              <span style={{ color: marketStatus.isOpen ? '#34d399' : '#facc15', fontWeight: 600, fontSize: '0.75rem' }}>
                {marketStatus.statusText}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                ({marketStatus.currentIST || 'IST'})
              </span>
            </div>
          )}

          <button
            onClick={onOpenLearn}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: 0
            }}
          >
            Read Disclaimers <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
