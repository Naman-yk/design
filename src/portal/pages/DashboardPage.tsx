import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { ProgressHeader } from '../components/ProgressHeader';
import { StageList } from '../components/StageList';
import { InlineError } from '../components/InlineError';
import { Skeleton } from '../components/Skeleton';
import {
  PlayCircle,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Award,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data, loading, error, refresh } = useProgress();
  const navigate = useNavigate();

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <Skeleton height="190px" borderRadius="14px" />
        <Skeleton height="40px" width="260px" />
        <Skeleton height="90px" borderRadius="12px" />
        <Skeleton height="90px" borderRadius="12px" />
        <Skeleton height="90px" borderRadius="12px" />
      </div>
    );
  }

  if (error) {
    return <InlineError error={error} onRetry={refresh} />;
  }

  if (!data) return null;

  const currentStage = data.stages.find((s) => s.id === data.currentStageId) || data.stages[1];
  const allStagesPassed = data.percentComplete === 100 || data.stages.every((s) => s.status === 'passed');

  return (
    <div className="animate-fade-in">
      {/* Header section with progress ring & candidate details */}
      <ProgressHeader progress={data} />

      {/* 1. SCENARIO: ALL 6 STAGES COMPLETED (100% Verified) */}
      {allStagesPassed ? (
        <div
          className="byte-card-elevated animate-glow"
          style={{
            padding: '2.5rem',
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg, rgba(34, 197, 121, 0.18) 0%, var(--bg-surface-elevated) 100%)',
            border: '1px solid var(--byte-accent-bright)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.75rem'
          }}
        >
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span className="byte-mint-box">
                ALL 6 MISSIONS VERIFIED
              </span>
              <span className="byte-coord-tag">
                N00 • EVALUATION COMPLETE
              </span>
            </div>

            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.03em' }}>
              You Have Submitted All Stages Successfully!
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              All 6 technical challenges — Responsive Exhibit, Corrupted Feed Resiliency, Event Synchronization, Field Audit, Vault Service, and Conservation Scanner — have passed 100% automated test verification. Your candidate submission record has been finalized and accepted. No further submissions are required.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/tasks/submissions/sub_pass_stage_6')}
              className="byte-btn byte-btn-primary byte-btn-lg"
            >
              <Award style={{ width: '18px', height: '18px' }} />
              <span>Review Verification Records</span>
            </button>
            <a
              href="https://byte-dev.nyahost.in/members/"
              target="_blank"
              rel="noopener noreferrer"
              className="byte-btn byte-btn-secondary"
            >
              <span>Explore Byte Society</span>
              <ExternalLink style={{ width: '14px', height: '14px' }} />
            </a>
          </div>
        </div>
      ) : /* 2. SCENARIO: ACTIVE SUBMISSION IN QUEUE (e.g. 409 or slow_queue) */
      currentStage && currentStage.status === 'queued' ? (
        <div
          className="byte-card-elevated"
          style={{
            padding: '2.25rem',
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, var(--bg-surface-elevated) 100%)',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}
        >
          <div style={{ flex: '1 1 360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <span
                style={{
                  background: '#eab308',
                  color: '#060807',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '4px'
                }}
              >
                SUBMISSION IN QUEUE
              </span>
              <span className="byte-coord-tag" style={{ color: '#fde68a' }}>
                JOB #{currentStage.latestSubmissionId || 'ACTIVE'}
              </span>
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Stage {currentStage.id}: {currentStage.title}
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              An automated evaluation job for this stage is currently in the execution queue. Duplicate submissions are locked until verification completes.
            </p>
          </div>

          <Link
            to={`/tasks/submissions/${currentStage.latestSubmissionId || 'sub_active_409'}`}
            className="byte-btn byte-btn-primary byte-btn-lg animate-glow"
            style={{ textDecoration: 'none' }}
          >
            <Clock style={{ width: '18px', height: '18px' }} />
            <span>Open Live Verification</span>
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
        </div>
      ) : /* 3. SCENARIO: CHANGES REQUIRED (Failed checks / Cooldown) */
      currentStage && currentStage.status === 'failed' ? (
        <div
          className="byte-card-elevated"
          style={{
            padding: '2.25rem',
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, var(--bg-surface-elevated) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}
        >
          <div style={{ flex: '1 1 360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <span
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '4px'
                }}
              >
                CHANGES REQUIRED
              </span>
              <span className="byte-coord-tag" style={{ color: '#fca5a5' }}>
                STAGE 0{currentStage.id}
              </span>
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Stage {currentStage.id}: {currentStage.title}
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Prior automated checks identified incomplete criteria. Review safe test feedback and retry once ready.
            </p>
          </div>

          <Link
            to={`/tasks/submissions/${currentStage.latestSubmissionId || 'sub_failed_checks'}`}
            className="byte-btn byte-btn-primary byte-btn-lg"
            style={{ textDecoration: 'none' }}
          >
            <AlertTriangle style={{ width: '18px', height: '18px' }} />
            <span>Inspect Failed Checks</span>
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
        </div>
      ) : /* 4. SCENARIO: PENDING REVIEWER ATTENTION */
      currentStage && currentStage.status === 'needs_review' ? (
        <div
          className="byte-card-elevated"
          style={{
            padding: '2.25rem',
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, var(--bg-surface-elevated) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}
        >
          <div style={{ flex: '1 1 360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <span
                style={{
                  background: '#f59e0b',
                  color: '#060807',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '4px'
                }}
              >
                PENDING MANUAL REVIEW
              </span>
              <span className="byte-coord-tag" style={{ color: '#fde68a' }}>
                EVALUATOR RUBRIC QUEUE
              </span>
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Stage {currentStage.id}: {currentStage.title}
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Automated completeness checks passed. Your submission is in the evaluator review queue.
            </p>
          </div>

          <Link
            to={`/tasks/submissions/${currentStage.latestSubmissionId || 'sub_needs_review'}`}
            className="byte-btn byte-btn-primary byte-btn-lg"
            style={{ textDecoration: 'none' }}
          >
            <HelpCircle style={{ width: '18px', height: '18px' }} />
            <span>View Review Dossier</span>
          </Link>
        </div>
      ) : /* 5. SCENARIO: TECHNICAL INFRASTRUCTURE ISSUE */
      currentStage && currentStage.status === 'infra_error' ? (
        <div
          className="byte-card-elevated"
          style={{
            padding: '2.25rem',
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, var(--bg-surface-elevated) 100%)',
            border: '1px solid rgba(236, 72, 153, 0.4)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}
        >
          <div style={{ flex: '1 1 360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <span
                style={{
                  background: '#ec4899',
                  color: '#ffffff',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '4px'
                }}
              >
                TECHNICAL VERIFICATION ISSUE
              </span>
              <span className="byte-coord-tag" style={{ color: '#fbcfe8' }}>
                ZERO ATTEMPTS USED
              </span>
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Stage {currentStage.id}: {currentStage.title}
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              The evaluation runner timed out executing the container. Your attempt was not penalized.
            </p>
          </div>

          <Link
            to={`/tasks/submissions/${currentStage.latestSubmissionId || 'sub_infra_error'}`}
            className="byte-btn byte-btn-primary byte-btn-lg"
            style={{ textDecoration: 'none' }}
          >
            <RefreshCw style={{ width: '18px', height: '18px' }} />
            <span>Review Issue & Retry</span>
          </Link>
        </div>
      ) : /* 6. DEFAULT CANONICAL READY-TO-START STATE */
      currentStage && (currentStage.status === 'unlocked' || currentStage.status === 'in_progress') ? (
        <div
          className="byte-card-elevated animate-glow"
          style={{
            padding: '2rem 2.25rem',
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg, rgba(34, 197, 121, 0.12) 0%, var(--bg-surface-elevated) 100%)',
            border: '1px solid var(--border-accent)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}
        >
          <div style={{ flex: '1 1 360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <span className="byte-mint-box">
                ACTIVE ASSIGNMENT
              </span>
              <span className="byte-coord-tag">
                N0{currentStage.id} • STAGE 0{currentStage.id}
              </span>
            </div>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
              Stage {currentStage.id}: {currentStage.title}
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              {currentStage.subtitle || 'Ready to begin candidate evaluation.'}
            </p>
          </div>

          <Link
            to={`/tasks/stages/${currentStage.id}`}
            className="byte-btn byte-btn-primary byte-btn-lg"
            style={{ textDecoration: 'none' }}
          >
            <span>Open Mission Briefing</span>
            <ArrowRight style={{ width: '18px', height: '18px' }} />
          </Link>
        </div>
      ) : null}

      {/* Stage Roster with Section Coordinate Label */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span className="byte-coord-tag">
          01 MISSION PIPELINE
        </span>
        <span style={{ color: 'var(--border-medium)' }}>•</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Sequential Candidate Verification Stages
        </span>
      </div>

      <StageList stages={data.stages} currentStageId={data.currentStageId} />
    </div>
  );
};
