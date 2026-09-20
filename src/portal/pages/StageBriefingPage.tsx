import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBriefing } from '../hooks/useBriefing';
import { useStarter } from '../hooks/useStarter';
import { useProgress } from '../hooks/useProgress';
import { WorkspacePanel } from '../components/WorkspacePanel';
import { StatusBadge } from '../components/StatusBadge';
import { InlineError } from '../components/InlineError';
import { Skeleton } from '../components/Skeleton';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  FileCheck,
  Shield,
  ExternalLink,
  Award,
  RefreshCw
} from 'lucide-react';

export const StageBriefingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const stageId = Number(id);
  const navigate = useNavigate();

  const { briefing, loading: loadingBriefing, error: briefingError, refresh } = useBriefing(stageId);
  const { starter, loading: loadingStarter, fetchStarter } = useStarter(stageId);
  const { data: progress } = useProgress();

  const stageProgress = progress?.stages.find((s) => s.id === stageId);

  useEffect(() => {
    if (briefing && !starter && !loadingStarter) {
      fetchStarter();
    }
  }, [briefing, starter, loadingStarter, fetchStarter]);

  if (loadingBriefing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="32px" width="180px" />
        <Skeleton height="140px" borderRadius="12px" />
        <Skeleton height="200px" borderRadius="12px" />
        <Skeleton height="120px" borderRadius="12px" />
      </div>
    );
  }

  if (briefingError) {
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
        <InlineError error={briefingError} onRetry={refresh} />
      </div>
    );
  }

  if (!briefing) return null;

  return (
    <div>
      {/* Top navigation back link */}
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

      {/* Stage Header Card */}
      <div
        className="byte-card"
        style={{
          padding: 'clamp(1.25rem, 3vw, 2rem)',
          marginBottom: '2rem',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--byte-accent-bright)',
                background: 'var(--byte-accent-tint)',
                border: '1px solid var(--border-accent)',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px'
              }}
            >
              STAGE 0{briefing.stageId}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              <Clock style={{ width: '14px', height: '14px' }} />
              <span>{briefing.estimatedMinutes}</span>
            </div>
          </div>

          <StatusBadge status={stageProgress?.status || 'unlocked'} />
        </div>

        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', lineHeight: 1.2, fontWeight: 800, margin: '0 0 1rem 0' }}>
          {briefing.title}
        </h1>

        {/* Goal Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            background: 'rgba(34, 197, 121, 0.08)',
            border: '1px solid var(--border-accent)'
          }}
        >
          <Target style={{ width: '20px', height: '20px', color: 'var(--byte-accent)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--byte-accent-bright)', marginBottom: '0.2rem' }}>
              PRIMARY MISSION OBJECTIVE
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.5 }}>
              {briefing.goal}
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Panel (StackBlitz + ZIP Download + Local Steps) */}
      <WorkspacePanel
        stageId={briefing.stageId}
        workspace={briefing.workspace}
        starter={starter}
        isLoadingStarter={loadingStarter}
        onDownloadZip={() => fetchStarter()}
      />

      {/* Narrative & Story */}
      <div
        className="byte-card"
        style={{
          padding: 'clamp(1.25rem, 3vw, 2rem)',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <BookOpen style={{ width: '18px', height: '18px', color: 'var(--byte-accent)' }} />
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
            Context & Mission Narrative
          </h2>
        </div>

        <div
          style={{
            fontSize: '0.925rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            whiteSpace: 'pre-line'
          }}
        >
          {briefing.story}
        </div>
      </div>

      {/* Deliverables & Constraints Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* Deliverables */}
        <div className="byte-card" style={{ padding: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FileCheck style={{ width: '18px', height: '18px', color: 'var(--byte-accent)' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
              Expected Deliverables
            </h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            {briefing.deliverables.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-primary)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Constraints & Checks */}
        <div className="byte-card" style={{ padding: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Shield style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
              Constraints & Rules
            </h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            {briefing.constraints.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-primary)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Checks Summary Notice */}
      {briefing.checksSummary && briefing.checksSummary.length > 0 && (
        <div
          className="byte-card"
          style={{
            padding: '1.25rem',
            marginBottom: '2rem',
            background: 'rgba(0, 0, 0, 0.25)'
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Automated Evaluation Focus Areas:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {briefing.checksSummary.map((chk, idx) => (
              <span
                key={idx}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)'
                }}
              >
                ✓ {chk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Footer - Conditional on Stage Status */}
      {stageProgress?.status === 'passed' ? (
        <div
          className="byte-card-elevated animate-glow"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            padding: 'clamp(1.25rem, 3vw, 1.75rem) clamp(1rem, 3vw, 2rem)',
            background: 'linear-gradient(135deg, rgba(34, 197, 121, 0.12) 0%, var(--bg-surface-elevated) 100%)',
            borderRadius: '14px',
            border: '1px solid var(--border-accent)'
          }}
        >
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className="byte-mint-box">
                MISSION VERIFIED & ACCEPTED
              </span>
              <span className="byte-coord-tag">
                STAGE 0{briefing.stageId} COMPLETE
              </span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 'clamp(1.1rem, 3.5vw, 1.25rem)', color: '#ffffff', marginBottom: '0.35rem' }}>
              All Challenge Criteria Passed
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Your solution has been verified and accepted with 100% test passage. Re-submissions are locked for completed missions.
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: '1 1 240px' }}>
            <Link
              to={`/tasks/submissions/${stageProgress.latestSubmissionId || 'sub_01H1PASS1'}`}
              className="byte-btn byte-btn-secondary byte-mobile-w-full"
            >
              <Award style={{ width: '16px', height: '16px' }} />
              <span>Review Verified Records</span>
            </Link>

            {stageId < 6 && (
              <Link
                to={`/tasks/stages/${stageId + 1}`}
                className="byte-btn byte-btn-primary byte-mobile-w-full"
                style={{ textDecoration: 'none' }}
              >
                <span>Advance to Stage 0{stageId + 1}</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            )}
          </div>
        </div>
      ) : stageProgress?.status === 'queued' ? (
        <div
          className="byte-card-elevated"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            padding: 'clamp(1.25rem, 3vw, 1.75rem) clamp(1rem, 3vw, 2rem)',
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, var(--bg-surface-elevated) 100%)',
            borderRadius: '14px',
            border: '1px solid rgba(234, 179, 8, 0.4)'
          }}
        >
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ background: '#eab308', color: '#060807', fontWeight: 800, fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                SUBMISSION IN PROGRESS
              </span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 'clamp(1.1rem, 3.5vw, 1.25rem)', color: '#ffffff', marginBottom: '0.35rem' }}>
              Automated Verification Job Active
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              An automated evaluation job is executing. Duplicate submissions are locked until verification finishes.
            </div>
          </div>

          <Link
            to={`/tasks/submissions/${stageProgress.latestSubmissionId || 'sub_active_409'}`}
            className="byte-btn byte-btn-primary byte-btn-lg byte-mobile-w-full animate-glow"
            style={{ textDecoration: 'none' }}
          >
            <Clock style={{ width: '18px', height: '18px' }} />
            <span>Open Live Verification Queue</span>
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: 'clamp(1.25rem, 3vw, 1.5rem) clamp(1rem, 3vw, 2rem)',
            background: 'var(--bg-surface-elevated)',
            borderRadius: '14px',
            border: '1px solid var(--border-accent)'
          }}
        >
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Ready to submit your solution?
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Package your edits and proceed to the verification submission form.
            </div>
          </div>

          <Link
            to={`/tasks/stages/${briefing.stageId}/submit`}
            className="byte-btn byte-btn-primary byte-btn-lg byte-mobile-w-full animate-glow"
            style={{ textDecoration: 'none' }}
          >
            <span>Open Submission Form</span>
            <ArrowRight style={{ width: '18px', height: '18px' }} />
          </Link>
        </div>
      )}
    </div>
  );
};
