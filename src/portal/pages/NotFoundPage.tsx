import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      className="byte-card"
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        maxWidth: '560px',
        margin: '4rem auto'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}
      >
        <Search style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }} />
      </div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        404 — Page Not Found
      </h1>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        The mission stage, briefing, or submission URL you requested does not exist in Archive 047.
      </p>

      <Link to="/tasks" className="byte-btn byte-btn-primary">
        <ArrowLeft style={{ width: '16px', height: '16px' }} />
        <span>Return to Tasks</span>
      </Link>
    </div>
  );
};
