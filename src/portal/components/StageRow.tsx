import React from 'react';
import { Link } from 'react-router-dom';
import { StageSummary } from '../types/api';
import { StatusBadge } from './StatusBadge';
import { ArrowRight, Clock, Lock, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface StageRowProps {
  stage: StageSummary;
  isCurrent?: boolean;
}

export const StageRow: React.FC<StageRowProps> = ({ stage, isCurrent }) => {
  const isLocked = stage.status === 'locked' || stage.status === 'scheduled';
  const isActionable = !isLocked;

  const getActionLink = () => {
    if (stage.status === 'passed') {
      return `/tasks/submissions/${stage.latestSubmissionId || `sub_pass_stage_${stage.id}`}`;
    }
    if (stage.status === 'queued') {
      return `/tasks/submissions/${stage.latestSubmissionId || 'sub_active_409'}`;
    }
    if (stage.status === 'verifying') {
      return `/tasks/submissions/${stage.latestSubmissionId || 'sub_active_409'}`;
    }
    if (stage.status === 'failed') {
      return `/tasks/submissions/${stage.latestSubmissionId || 'sub_failed_checks'}`;
    }
    if (stage.status === 'needs_review') {
      return `/tasks/submissions/${stage.latestSubmissionId || 'sub_needs_review'}`;
    }
    if (stage.status === 'infra_error') {
      return `/tasks/submissions/${stage.latestSubmissionId || 'sub_infra_error'}`;
    }
    return `/tasks/stages/${stage.id}`;
  };

  const getActionLabel = () => {
    switch (stage.status) {
      case 'passed':
        return 'Review Result';
      case 'queued':
        return 'Live Status';
      case 'verifying':
        return 'Running Tests';
      case 'failed':
        return 'Inspect Checks';
      case 'needs_review':
        return 'View Dossier';
      case 'infra_error':
        return 'Retry Issue';
      default:
        return isCurrent ? 'Open Briefing' : 'View Stage';
    }
  };

  return (
    <div
      className="byte-card"
      style={{
        padding: '1.35rem 1.75rem',
        marginBottom: '1rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
        borderColor: isCurrent
          ? 'var(--border-accent)'
          : stage.status === 'passed'
          ? 'rgba(34, 197, 121, 0.25)'
          : stage.status === 'queued'
          ? 'rgba(234, 179, 8, 0.35)'
          : stage.status === 'failed'
          ? 'rgba(239, 68, 68, 0.35)'
          : 'var(--border-subtle)',
        background: isCurrent
          ? 'linear-gradient(90deg, rgba(34, 197, 121, 0.07) 0%, var(--bg-surface) 100%)'
          : stage.status === 'queued'
          ? 'linear-gradient(90deg, rgba(234, 179, 8, 0.05) 0%, var(--bg-surface) 100%)'
          : 'var(--bg-surface)',
        opacity: isLocked ? 0.65 : 1
      }}
    >
      {/* Left info & coordinate */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: '1 1 340px' }}>
        {/* Node coordinate box (e.g. N01, N02) */}
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '8px',
            background: stage.status === 'passed'
              ? 'var(--status-passed-bg)'
              : stage.status === 'queued'
              ? 'var(--status-queued-bg)'
              : stage.status === 'failed'
              ? 'var(--status-failed-bg)'
              : isCurrent
              ? 'rgba(56, 189, 248, 0.15)'
              : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${
              stage.status === 'passed'
                ? 'var(--status-passed-border)'
                : stage.status === 'queued'
                ? 'var(--status-queued-border)'
                : stage.status === 'failed'
                ? 'var(--status-failed-border)'
                : isCurrent
                ? 'var(--status-unlocked-border)'
                : 'var(--border-subtle)'
            }`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: '0.85rem',
            color: stage.status === 'passed'
              ? 'var(--status-passed)'
              : stage.status === 'queued'
              ? 'var(--status-queued)'
              : stage.status === 'failed'
              ? 'var(--status-failed)'
              : isCurrent
              ? 'var(--status-unlocked)'
              : 'var(--text-muted)',
            flexShrink: 0
          }}
        >
          {stage.status === 'passed' ? (
            <CheckCircle2 style={{ width: '22px', height: '22px' }} />
          ) : (
            `N0${stage.id}`
          )}
        </div>

        {/* Title, subtitle, meta */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 800,
                margin: 0,
                color: isLocked ? 'var(--text-secondary)' : '#ffffff'
              }}
            >
              Stage {stage.id}: {stage.title}
            </h3>
            {isCurrent && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--byte-accent-bright)',
                  background: 'rgba(34, 197, 121, 0.14)',
                  border: '1px solid var(--border-accent)',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 800
                }}
              >
                CURRENT
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {stage.subtitle && <span>{stage.subtitle}</span>}
            {stage.estimatedMinutes && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
                <Clock style={{ width: '13px', height: '13px' }} />
                <span>{stage.estimatedMinutes}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right status & action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <StatusBadge status={stage.status} />

        {isActionable ? (
          <Link
            to={getActionLink()}
            className={`byte-btn byte-btn-sm ${
              isCurrent || stage.status === 'queued'
                ? 'byte-btn-primary animate-glow'
                : 'byte-btn-secondary'
            }`}
          >
            <span>{getActionLabel()}</span>
            <ArrowRight style={{ width: '14px', height: '14px' }} />
          </Link>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <Lock style={{ width: '13px', height: '13px' }} />
            <span>Unlocks after Stage {stage.id - 1}</span>
          </div>
        )}
      </div>
    </div>
  );
};
