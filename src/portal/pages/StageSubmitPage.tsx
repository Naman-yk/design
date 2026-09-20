import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBriefing } from '../hooks/useBriefing';
import { useAutosaveLog } from '../hooks/useAutosaveLog';
import { useProgress } from '../hooks/useProgress';
import { api } from '../api/endpoints';
import { FindingRow } from '../types/api';
import { ZipDropzone } from '../components/ZipDropzone';
import { LogEditor } from '../components/LogEditor';
import { FindingsEditor } from '../components/FindingsEditor';
import { DeploymentForm } from '../components/DeploymentForm';
import { InlineError } from '../components/InlineError';
import { Skeleton } from '../components/Skeleton';
import {
  ArrowLeft,
  Send,
  Loader2,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Award,
  Clock
} from 'lucide-react';

export const StageSubmitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const stageId = Number(id);
  const navigate = useNavigate();

  const { briefing, loading: loadingBriefing, error: briefingError } = useBriefing(stageId);
  const { data: progress } = useProgress();
  const stageProgress = progress?.stages.find((s) => s.id === stageId);

  // Autosave log hook
  const defaultLogSections = briefing?.logSections || [
    'What I observed',
    'What I suspected',
    'Evidence',
    'What I changed',
    'What I am still unsure about'
  ];

  const {
    sections: logSections,
    updateSection: updateLogSection,
    status: logAutosaveStatus,
    lastSavedAt: logLastSavedAt,
    saveNow: saveLogNow
  } = useAutosaveLog(stageId, defaultLogSections);

  // Submission state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Stage 4 findings state
  const [findings, setFindings] = useState<FindingRow[]>([
    {
      id: 'f1',
      ruleId: 'a11y-contrast',
      selector: '',
      evidence: '',
      severity: 'medium',
      why: '',
      suggestedFix: ''
    }
  ]);

  // Stages 5-6 deployment state
  const [deployedUrl, setDeployedUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [readmeUrl, setReadmeUrl] = useState('');

  // Form submission UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<any | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (loadingBriefing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="32px" width="180px" />
        <Skeleton height="100px" borderRadius="12px" />
        <Skeleton height="260px" borderRadius="12px" />
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
        <InlineError error={briefingError} />
      </div>
    );
  }

  if (!briefing) return null;

  // Guard: If stage is already passed, re-submission is locked!
  if (stageProgress?.status === 'passed') {
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

        <div
          className="byte-card-elevated animate-glow"
          style={{
            padding: '3rem 2.5rem',
            textAlign: 'center',
            maxWidth: '680px',
            margin: '2rem auto',
            border: '1px solid var(--border-accent)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 121, 0.15)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}
          >
            <CheckCircle2 style={{ width: '36px', height: '36px', color: 'var(--byte-accent-bright)' }} />
          </div>

          <div className="byte-mint-box" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            STAGE 0{stageId} VERIFIED & ACCEPTED
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.75rem 0', letterSpacing: '-0.02em' }}>
            Re-Submission Locked
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2.25rem' }}>
            You have already successfully submitted and passed <strong>Stage {stageId}: {briefing.title}</strong> with 100% check verification. Re-submissions are not permitted for verified missions.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to={`/tasks/submissions/${stageProgress.latestSubmissionId || 'sub_01H1PASS1'}`}
              className="byte-btn byte-btn-primary byte-btn-lg"
            >
              <Award style={{ width: '18px', height: '18px' }} />
              <span>Review Verification Records</span>
            </Link>

            <Link to="/tasks" className="byte-btn byte-btn-secondary byte-btn-lg">
              <span>Return to Tasks Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Guard: If stage is currently queued, prevent duplicate 409 conflict
  if (stageProgress?.status === 'queued') {
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

        <div
          className="byte-card-elevated"
          style={{
            padding: '3rem 2.5rem',
            textAlign: 'center',
            maxWidth: '680px',
            margin: '2rem auto',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, var(--bg-surface-elevated) 100%)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(234, 179, 8, 0.15)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}
          >
            <Clock style={{ width: '36px', height: '36px', color: '#facc15' }} />
          </div>

          <div
            style={{
              background: '#eab308',
              color: '#060807',
              fontWeight: 800,
              fontSize: '0.85rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              display: 'inline-block',
              marginBottom: '1rem',
              textTransform: 'uppercase'
            }}
          >
            Submission In Progress (409)
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.75rem 0' }}>
            Automated Evaluation Active
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2.25rem' }}>
            An evaluation job for Stage {stageId} is currently waiting in the execution queue. Duplicate submissions are locked until the active job completes.
          </p>

          <Link
            to={`/tasks/submissions/${stageProgress.latestSubmissionId || 'sub_active_409'}`}
            className="byte-btn byte-btn-primary byte-btn-lg animate-glow"
          >
            <Clock style={{ width: '18px', height: '18px' }} />
            <span>Open Live Verification</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSubmitError(null);

    const clientRequestId = (crypto.randomUUID && crypto.randomUUID()) || `req_${Date.now()}`;
    const idempotencyKey = clientRequestId;

    try {
      setIsSubmitting(true);

      // Force save log draft first
      await saveLogNow();

      if (stageId >= 0 && stageId <= 3) {
        // ZIP submission
        if (!selectedFile) {
          setValidationError('Please select and upload a valid .zip solution archive.');
          setIsSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('clientRequestId', clientRequestId);
        formData.append('logVersion', '1');

        const response = await api.postSubmissionZip(stageId, formData, idempotencyKey);
        navigate(`/tasks/submissions/${response.submissionId}`);
      } else if (stageId === 4) {
        // Findings submission
        const validFindings = findings.filter(
          (f) => f.ruleId && f.selector.trim() && f.evidence.trim() && f.why.trim() && f.suggestedFix.trim()
        );

        if (validFindings.length < (briefing.minFindings || 3)) {
          setValidationError(
            `Please complete at least ${briefing.minFindings || 3} valid finding entries before submitting (currently ${validFindings.length} complete).`
          );
          setIsSubmitting(false);
          return;
        }

        const response = await api.postSubmissionFindings(
          stageId,
          {
            clientRequestId,
            logVersion: 1,
            findings: validFindings
          },
          idempotencyKey
        );
        navigate(`/tasks/submissions/${response.submissionId}`);
      } else {
        // Stages 5–6 Deployment submission
        if (!deployedUrl.trim() || !deployedUrl.startsWith('https://')) {
          setValidationError('Please provide a valid public HTTPS deployed service URL.');
          setIsSubmitting(false);
          return;
        }
        if (!repoUrl.trim() || !repoUrl.includes('github.com')) {
          setValidationError('Please provide a valid public GitHub repository URL.');
          setIsSubmitting(false);
          return;
        }

        const response = await api.postSubmissionDeployment(
          stageId,
          {
            clientRequestId,
            deployedUrl,
            repoUrl,
            readmeUrl,
            logVersion: 1
          },
          idempotencyKey
        );
        navigate(`/tasks/submissions/${response.submissionId}`);
      }
    } catch (err: any) {
      setSubmitError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Top navigation back link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to={`/tasks/stages/${briefing.stageId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem'
          }}
        >
          <ArrowLeft style={{ width: '15px', height: '15px' }} />
          <span>Back to Mission Briefing</span>
        </Link>
      </div>

      {/* Header */}
      <div
        className="byte-card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--byte-accent-bright)',
              background: 'var(--byte-accent-tint)',
              border: '1px solid var(--border-accent)',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px'
            }}
          >
            STAGE 0{briefing.stageId} SUBMISSION
          </span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
          Submit Solution for Verification
        </h1>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {briefing.title} • All submissions are evaluated by sandboxed test workers.
        </div>
      </div>

      {/* Submission Error Banner if API rejected */}
      {submitError && <InlineError error={submitError} />}

      {/* Client Validation Error */}
      {validationError && (
        <div
          className="byte-card"
          style={{
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#fca5a5',
            fontSize: '0.85rem'
          }}
        >
          <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Stages 0-3: ZIP file uploader */}
        {stageId >= 0 && stageId <= 3 && (
          <ZipDropzone
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            error={fileError}
            onError={setFileError}
            disabled={isSubmitting}
          />
        )}

        {/* Stage 4: Interactive Findings Editor */}
        {stageId === 4 && (
          <FindingsEditor
            findings={findings}
            onChange={setFindings}
            ruleOptions={briefing.ruleIds || []}
            minFindings={briefing.minFindings || 3}
            disabled={isSubmitting}
          />
        )}

        {/* Stages 5-6: Live Deployment Form */}
        {stageId >= 5 && (
          <DeploymentForm
            deployedUrl={deployedUrl}
            repoUrl={repoUrl}
            readmeUrl={readmeUrl}
            onDeployedUrlChange={setDeployedUrl}
            onRepoUrlChange={setRepoUrl}
            onReadmeUrlChange={setReadmeUrl}
            disabled={isSubmitting}
          />
        )}

        {/* Structured Investigation Log (Required for all stages) */}
        <LogEditor
          sections={briefing.logSections}
          values={logSections}
          onChange={updateLogSection}
          status={logAutosaveStatus}
          lastSavedAt={logLastSavedAt}
          onManualSave={saveLogNow}
          disabled={isSubmitting}
        />

        {/* Submit Action Bar */}
        <div
          className="byte-card-elevated"
          style={{
            padding: '1.5rem 2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            border: '1px solid var(--border-accent)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
            <ShieldCheck style={{ width: '16px', height: '16px', color: 'var(--byte-accent)' }} />
            <span>Submissions are strictly evaluated against non-leaked test suites.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="byte-btn byte-btn-primary byte-btn-lg animate-glow"
            style={{ minWidth: '220px' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin" />
                <span>Transmitting Solution...</span>
              </>
            ) : (
              <>
                <Send style={{ width: '18px', height: '18px' }} />
                <span>Submit for Verification</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
