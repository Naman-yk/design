import { CheckResult, SubmissionStatus } from '../types/api';

export interface FakeGraderSubmission {
  id: string;
  stageId: number;
  attempt: number;
  submittedAt: number;
  status: 'queued' | 'verifying' | 'passed' | 'failed' | 'needs_review' | 'infra_error';
  queueDurationMs: number;
  verifyingDurationMs: number;
  targetOutcome: 'pass' | 'fail' | 'needs_review' | 'infra_error';
  checks: CheckResult[];
  cooldownSeconds?: number;
}

const activeSubmissions = new Map<string, FakeGraderSubmission>();

export function createFakeSubmission(
  stageId: number,
  targetOutcome: 'pass' | 'fail' | 'needs_review' | 'infra_error' = 'pass',
  options: { queueMs?: number; verifyingMs?: number } = {}
): FakeGraderSubmission {
  const id = `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const queueDurationMs = options.queueMs ?? 2500;
  const verifyingDurationMs = options.verifyingMs ?? 3500;

  const checks = generateChecksForStage(stageId, targetOutcome);

  const sub: FakeGraderSubmission = {
    id,
    stageId,
    attempt: 1,
    submittedAt: Date.now(),
    status: 'queued',
    queueDurationMs,
    verifyingDurationMs,
    targetOutcome,
    checks,
    cooldownSeconds: targetOutcome === 'fail' ? 180 : 0
  };

  activeSubmissions.set(id, sub);
  return sub;
}

export function getSubmissionCurrentStatus(id: string): SubmissionStatus | null {
  const sub = activeSubmissions.get(id);
  if (!sub) return null;

  const elapsed = Date.now() - sub.submittedAt;

  let currentStatus: SubmissionStatus['status'] = 'queued';
  let queuePosition: number | undefined = 2;

  if (elapsed < sub.queueDurationMs) {
    currentStatus = 'queued';
    queuePosition = elapsed > sub.queueDurationMs / 2 ? 1 : 2;
  } else if (elapsed < sub.queueDurationMs + sub.verifyingDurationMs) {
    currentStatus = 'verifying';
    queuePosition = undefined;
  } else {
    currentStatus = sub.targetOutcome === 'pass' ? 'passed'
      : sub.targetOutcome === 'fail' ? 'failed'
      : sub.targetOutcome === 'needs_review' ? 'needs_review'
      : 'infra_error';
    queuePosition = undefined;
  }

  const finishedAt = currentStatus !== 'queued' && currentStatus !== 'verifying'
    ? new Date(sub.submittedAt + sub.queueDurationMs + sub.verifyingDurationMs).toISOString()
    : undefined;

  const cooldownEndsAt = currentStatus === 'failed' && sub.cooldownSeconds
    ? new Date(Date.now() + sub.cooldownSeconds * 1000).toISOString()
    : null;

  return {
    id: sub.id,
    stageId: sub.stageId,
    attempt: sub.attempt,
    status: currentStatus,
    queuePosition,
    checks: currentStatus === 'queued' ? [] : currentStatus === 'verifying' ? sub.checks.map(c => ({ ...c, passed: true, message: 'Check in progress...' })) : sub.checks,
    retry: {
      allowed: currentStatus !== 'passed',
      attemptsUsed: currentStatus === 'infra_error' ? 0 : 1,
      attemptLimit: 8,
      cooldownEndsAt
    },
    nextStage: currentStatus === 'passed' ? {
      id: sub.stageId + 1,
      status: 'unlocked'
    } : undefined,
    createdAt: new Date(sub.submittedAt).toISOString(),
    finishedAt,
    message: currentStatus === 'needs_review'
      ? 'Your submission requires manual rubric evaluation by a review engineer.'
      : currentStatus === 'infra_error'
      ? 'The grading runner timed out executing the container. No candidate attempt was consumed.'
      : undefined
  };
}

function generateChecksForStage(
  stageId: number,
  outcome: 'pass' | 'fail' | 'needs_review' | 'infra_error'
): CheckResult[] {
  if (outcome === 'infra_error') {
    return [
      { id: `s${stageId}.runner-boot`, label: 'Sandbox container bootstrap', passed: false, message: 'Container execution timed out after 90000ms.' }
    ];
  }

  switch (stageId) {
    case 1:
      return [
        {
          id: 's1.responsive-375',
          label: 'Mobile layout (375px)',
          passed: true,
          message: 'All exhibit elements fit viewport without horizontal overflow.'
        },
        {
          id: 's1.modal-trap',
          label: 'Dialog focus trap',
          passed: outcome === 'pass',
          message: outcome === 'pass'
            ? 'Modal traps tab navigation and dismisses on Escape key.'
            : 'Focus leaked outside modal dialog when tabbing backwards.'
        },
        {
          id: 's1.tooltip-layering',
          label: 'Tooltip stacking context',
          passed: true,
          message: 'Tooltips render above sticky headers and adjacent cards.'
        },
        {
          id: 's1.contrast-semantics',
          label: 'Semantic HTML & contrast',
          passed: outcome === 'pass',
          message: outcome === 'pass'
            ? 'Color contrast ratios exceed WCAG AA standards (4.5:1).'
            : 'Card subtitle text contrast was 3.1:1, falling below AA threshold.'
        }
      ];
    case 2:
      return [
        {
          id: 's2.valid-count',
          label: 'Valid record count',
          passed: true,
          message: 'Rendered the expected number of valid records.'
        },
        {
          id: 's2.error-state',
          label: 'Corrupted record error boundary',
          passed: outcome === 'pass',
          message: outcome === 'pass'
            ? 'Corrupted records display non-crashing isolation badges.'
            : 'The corrupted record is not shown as a visible error state.'
        },
        {
          id: 's2.no-uncaught',
          label: 'Console safety',
          passed: true,
          message: 'Zero uncaught parsing exceptions during sync burst.'
        }
      ];
    case 3:
      return [
        {
          id: 's3.abort-stale',
          label: 'AbortController stale cancellation',
          passed: outcome === 'pass',
          message: outcome === 'pass'
            ? 'Superseded requests cleanly aborted with AbortError handling.'
            : 'Stale network response overwrote newest query results.'
        },
        {
          id: 's3.no-listener-leak',
          label: 'Event listener cleanup',
          passed: true,
          message: 'Window resize and scroll listeners removed on component teardown.'
        }
      ];
    case 4:
      return [
        {
          id: 's4.rubric-validity',
          label: 'Rule validity check',
          passed: outcome !== 'fail',
          message: outcome !== 'fail'
            ? 'All identified violations correspond to genuine specimen defects.'
            : 'One or more findings cited decoy rules that do not apply to this specimen.'
        },
        {
          id: 's4.selector-precision',
          label: 'CSS selector accuracy',
          passed: true,
          message: 'Selectors unambiguously resolved to offending DOM nodes.'
        },
        {
          id: 's4.remediation-quality',
          label: 'Fix feasibility',
          passed: outcome === 'pass',
          message: outcome === 'pass'
            ? 'Suggested code remediations directly resolve identified issues.'
            : 'Remediation was too vague or omitted code example.'
        }
      ];
    default:
      return [
        {
          id: `s${stageId}.contract`,
          label: 'Endpoint compliance check',
          passed: outcome === 'pass',
          message: outcome === 'pass'
            ? 'Public service passed black-box test suite.'
            : 'Service returned unexpected status code on verification probe.'
        }
      ];
  }
}
