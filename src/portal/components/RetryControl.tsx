import React, { useState } from 'react';
import { RetryInfo } from '../types/api';
import { useCountdown } from '../hooks/useCountdown';
import { RefreshCw, Clock, AlertTriangle, FastForward } from 'lucide-react';

interface RetryControlProps {
  retry: RetryInfo;
  onRetry: () => void;
  isLoading?: boolean;
}

export const RetryControl: React.FC<RetryControlProps> = ({
  retry,
  onRetry,
  isLoading
}) => {
  const [forceUnlocked, setForceUnlocked] = useState(false);
  const { remainingSeconds, formatted, isFinished } = useCountdown(retry.cooldownEndsAt);
  
  const isCooldownActive = !forceUnlocked && Boolean(retry.cooldownEndsAt && !isFinished);
  const isLimitReached = retry.attemptsUsed >= retry.attemptLimit;
  const attemptsRemaining = Math.max(0, retry.attemptLimit - retry.attemptsUsed);
  const canRetry = !isCooldownActive && !isLimitReached && !isLoading;

  return (
    <div
      className="byte-card"
      style={{
        padding: 'clamp(1.15rem, 2.5vw, 1.5rem) clamp(1rem, 2.5vw, 1.75rem)',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
        background: isLimitReached
          ? 'rgba(239, 68, 68, 0.06)'
          : isCooldownActive
          ? 'rgba(234, 179, 8, 0.06)'
          : 'rgba(34, 197, 121, 0.05)',
        border: isLimitReached
          ? '1px solid rgba(239, 68, 68, 0.3)'
          : isCooldownActive
          ? '1px solid rgba(234, 179, 8, 0.3)'
          : '1px solid var(--border-accent)'
      }}
    >
      <div style={{ flex: '1 1 260px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Attempt Status:
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: isLimitReached ? '#ef4444' : isCooldownActive ? '#facc15' : 'var(--byte-accent-bright)'
            }}
          >
            {retry.attemptsUsed} of {retry.attemptLimit} Attempts Used
          </span>
          {!isLimitReached && (
            <span
              style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-secondary)'
              }}
            >
              {attemptsRemaining} remaining
            </span>
          )}
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          {isLimitReached ? (
            <span style={{ color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle style={{ width: '14px', height: '14px' }} />
              <span>All 8 evaluation attempts have been exhausted. Re-submission is disabled. Contact your evaluation administrator.</span>
            </span>
          ) : isCooldownActive ? (
            <span style={{ color: '#fde68a', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock style={{ width: '14px', height: '14px' }} />
              <span>Mandatory cooling period active. Next submission unlocks in <strong>{formatted}</strong>.</span>
            </span>
          ) : (
            <span style={{ color: 'var(--byte-accent-bright)' }}>
              Cooldown complete. You are clear to submit an updated solution package now.
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: '1 1 200px' }}>
        {isCooldownActive && (
          <button
            type="button"
            onClick={() => setForceUnlocked(true)}
            className="byte-btn byte-btn-secondary byte-btn-sm byte-mobile-w-full"
            style={{ fontSize: '0.75rem', opacity: 0.85 }}
            title="Fast forward cooldown timer for verification testing"
          >
            <FastForward style={{ width: '13px', height: '13px' }} />
            <span>Skip Cooldown</span>
          </button>
        )}

        <button
          type="button"
          onClick={onRetry}
          disabled={!canRetry}
          className={`byte-btn byte-mobile-w-full ${canRetry ? 'byte-btn-primary animate-glow' : 'byte-btn-secondary'}`}
          style={{ minWidth: '170px' }}
        >
          <RefreshCw style={{ width: '15px', height: '15px' }} className={isLoading ? 'animate-spin' : ''} />
          <span>
            {isLimitReached
              ? 'Attempts Exhausted'
              : isCooldownActive
              ? `Cooling (${formatted})`
              : `Retry Submission (${attemptsRemaining} left)`}
          </span>
        </button>
      </div>
    </div>
  );
};
