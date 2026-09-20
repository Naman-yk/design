import React from 'react';
import { CheckResult } from '../types/api';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

interface CheckResultListProps {
  checks: CheckResult[];
}

export const CheckResultList: React.FC<CheckResultListProps> = ({ checks }) => {
  if (!checks || checks.length === 0) {
    return null;
  }

  const passedCount = checks.filter((c) => c.passed).length;

  return (
    <div
      className="byte-card"
      style={{
        padding: '1.75rem',
        marginBottom: '2rem'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ShieldCheck style={{ width: '18px', height: '18px', color: 'var(--byte-accent)' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            Automated Check Results
          </h3>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            background: passedCount === checks.length ? 'var(--status-passed-bg)' : 'rgba(239, 68, 68, 0.12)',
            color: passedCount === checks.length ? 'var(--status-passed)' : '#f87171',
            border: `1px solid ${
              passedCount === checks.length ? 'var(--status-passed-border)' : 'rgba(239, 68, 68, 0.3)'
            }`
          }}
        >
          {passedCount} / {checks.length} Checks Passed
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {checks.map((check) => (
          <div
            key={check.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              padding: '1rem 1.25rem',
              borderRadius: '8px',
              border: `1px solid ${
                check.passed ? 'rgba(34, 197, 121, 0.2)' : 'rgba(239, 68, 68, 0.25)'
              }`,
              background: check.passed ? 'rgba(34, 197, 121, 0.03)' : 'rgba(239, 68, 68, 0.05)'
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {check.passed ? (
                <CheckCircle2 style={{ width: '18px', height: '18px', color: 'var(--byte-accent)' }} />
              ) : (
                <XCircle style={{ width: '18px', height: '18px', color: '#ef4444' }} />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: check.passed ? 'var(--text-primary)' : '#fca5a5',
                  marginBottom: '0.25rem'
                }}
              >
                <span>{check.label}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  [{check.id}]
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45
                }}
              >
                {check.message}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
