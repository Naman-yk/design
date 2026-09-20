import React from 'react';
import { toUserMessage } from '../api/errors';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InlineErrorProps {
  error: unknown;
  onRetry?: () => void;
}

export const InlineError: React.FC<InlineErrorProps> = ({ error, onRetry }) => {
  const mapped = toUserMessage(error);

  return (
    <div
      className="byte-card"
      style={{
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        background: 'rgba(239, 68, 68, 0.05)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem'
      }}
    >
      <div style={{ marginTop: '2px', flexShrink: 0 }}>
        <AlertCircle style={{ width: '22px', height: '22px', color: '#ef4444' }} />
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '0.25rem'
          }}
        >
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fca5a5' }}>
            {mapped.title}
          </h4>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5'
            }}
          >
            {mapped.code}
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {mapped.message}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
          {onRetry && mapped.isRetryable && (
            <button
              onClick={onRetry}
              className="byte-btn byte-btn-secondary byte-btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw style={{ width: '13px', height: '13px' }} />
              <span>Retry Request</span>
            </button>
          )}

          {mapped.actionUrl && (
            <Link
              to={mapped.actionUrl}
              className="byte-btn byte-btn-secondary byte-btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft style={{ width: '13px', height: '13px' }} />
              <span>{mapped.actionHint || 'Back'}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
