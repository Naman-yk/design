import React, { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useSubmissionStatus } from '../hooks/useSubmissionStatus';
import { StatusBadge } from '../components/StatusBadge';
import { CheckResultList } from '../components/CheckResultList';
import { RetryControl } from '../components/RetryControl';
import { InlineError } from '../components/InlineError';
import { Skeleton } from '../components/Skeleton';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const SubmissionResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { status, loading, error } = useSubmissionStatus(id);
  const confettiFiredRef = useRef(false);

  useEffect(() => {
    if (status?.status === 'passed' && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c579', '#52e0a6', '#38bdf8', '#ffffff']
      });
    }
  }, [status?.status]);

  if (loading && !status) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="32px" width="180px" />
        <Skeleton height="120px" borderRadius="14px" />
        <Skeleton height="180px" borderRadius="14px" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/tasks"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem'
            }}
          >
            <ArrowLeft style={{ width: '15px', height: '15px' }} />
            <span>Back to Tasks</span>
          </Link>
        </div>
        <InlineError error={error} />
      </div>
    );
  }

  if (!status) return null;

  const isTerminal = ['passed', 'failed', 'needs_review', 'infra_error'].includes(status.status);

  return (
    <div>
      {/* Top breadcrumb navigation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/tasks"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem'
          }}
        >
          <ArrowLeft style={{ width: '15px', height: '15px' }} />
          <span>Back to Tasks</span>
        </Link>
      </div>

      {/* Submission Status Hero Card */}
      <div
        className="byte-card-elevated"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          borderColor:
            status.status === 'passed'
              ? 'var(--border-accent)'
              : status.status === 'failed'
              ? 'rgba(239, 68, 68, 0.3)'
              : 'var(--border-medium)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}
            >
              SUBMISSION ID: <strong style={{ color: 'var(--text-primary)' }}>{status.id}</strong>
            </span>
            <span style={{ color: 'var(--border-medium)' }}>•</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}
            >
              Stage {status.stageId} (Attempt #{status.attempt})
            </span>
          </div>

          <StatusBadge status={status.status} size="lg" />
        </div>

        {/* State Banner Details */}
        {status.status === 'queued' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(234, 179, 8, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Clock className="animate-pulse" style={{ width: '24px', height: '24px', color: '#eab308' }} />
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 800 }}>
                Waiting in Verification Queue...
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {status.queuePosition ? (
                  <span>
                    Your submission is queued at position <strong>#{status.queuePosition}</strong>. Test workers are claiming jobs.
                  </span>
                ) : (
                  <span>Your submission has been safely received. Verification will begin in a moment.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {status.status === 'verifying' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Loader2 className="animate-spin" style={{ width: '24px', height: '24px', color: '#c084fc' }} />
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 800 }}>
                Running Automated Checks...
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Sandboxed test runner is executing headless Playwright and validation suites.
              </div>
            </div>
          </div>
        )}

        {status.status === 'passed' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--status-passed-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 20px rgba(34, 197, 121, 0.35)'
              }}
            >
              <CheckCircle2 style={{ width: '26px', height: '26px', color: 'var(--byte-accent)' }} />
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--byte-accent-bright)' }}>
                Stage Verified Successfully!
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                All required verification checks passed. Your progress has been idempotently recorded.
              </div>
            </div>
          </div>
        )}

        {status.status === 'failed' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AlertTriangle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 800, color: '#fca5a5' }}>
                Changes Required
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Some automated checks did not pass. Review the guidance below, adjust your solution, and retry.
              </div>
            </div>
          </div>
        )}

        {status.status === 'needs_review' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <HelpCircle style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 800, color: '#fde68a' }}>
                Pending Reviewer Attention
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Your submission has passed automated validation and is in the reviewer queue for manual evaluation.
              </div>
            </div>
          </div>
        )}

        {status.status === 'infra_error' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(236, 72, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AlertTriangle style={{ width: '24px', height: '24px', color: '#ec4899' }} />
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 800, color: '#fbcfe8' }}>
                Technical Verification Issue
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                The evaluation runner encountered a container timeout. No candidate attempt was consumed.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checks list (rendered when checks are available) */}
      {status.checks && status.checks.length > 0 && (
        <CheckResultList checks={status.checks} />
      )}

      {/* Retry Control (if failed or cooldown) */}
      {status.status === 'failed' && (
        <RetryControl
          retry={status.retry}
          onRetry={() => navigate(`/tasks/stages/${status.stageId}/submit`)}
        />
      )}

      {/* Infra Error Immediate Retry */}
      {status.status === 'infra_error' && (
        <div
          className="byte-card"
          style={{
            padding: '1.5rem 2rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              Ready to re-trigger verification?
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              No attempt was consumed by this technical error.
            </div>
          </div>

          <button
            onClick={() => navigate(`/tasks/stages/${status.stageId}/submit`)}
            className="byte-btn byte-btn-primary"
          >
            <RefreshCw style={{ width: '15px', height: '15px' }} />
            <span>Re-submit Solution</span>
          </button>
        </div>
      )}

      {/* Next Stage Banner (if passed) */}
      {status.status === 'passed' && (
        <div
          className="byte-card-elevated animate-glow"
          style={{
            padding: '1.75rem 2rem',
            marginBottom: '2rem',
            border: '1px solid var(--border-accent)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--byte-accent-bright)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <Sparkles style={{ width: '14px', height: '14px' }} />
              <span>{status.nextStage ? 'NEXT MISSION READY' : 'ALL 6 MISSIONS VERIFIED'}</span>
            </div>
            <h3 style={{ margin: '0.25rem 0', fontSize: '1.25rem', fontWeight: 800 }}>
              {status.nextStage ? `Advance to Stage 0${status.nextStage.id}` : 'Archive 047 Protocol Completed!'}
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {status.nextStage
                ? `Stage 0${status.stageId} passed. You are cleared to proceed to Stage 0${status.nextStage.id}.`
                : 'All missions have been successfully verified and accepted. No further stages remaining.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/tasks" className="byte-btn byte-btn-secondary">
              <span>View Tasks Dashboard</span>
            </Link>

            {status.nextStage && (
              <Link
                to={`/tasks/stages/${status.nextStage.id}`}
                className="byte-btn byte-btn-primary"
                style={{ textDecoration: 'none' }}
              >
                <span>Begin Stage 0{status.nextStage.id}</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
