import { delay, http, HttpResponse } from 'msw';
import { createFakeSubmission, getSubmissionCurrentStatus } from './fakeGrader';
import { mockBriefings, mockStarterResponses } from './fixtures';
import { getActiveScenarioId, getProgressForActiveScenario } from './scenarios';
import { SubmissionStatus } from '../types/api';

const savedLogs: Record<string, { sections: Record<string, string>; version: number; updatedAt: string }> = {};

export const handlers = [
  // GET /api/me/progress
  http.get('/api/me/progress', async () => {
    const scenario = getActiveScenarioId();
    await delay(100);

    if (scenario === 'session_expired_401') {
      return HttpResponse.json(
        { error: { code: 'UNAUTHENTICATED', message: 'Candidate session expired.' } },
        { status: 401 }
      );
    }

    if (scenario === 'offline_network_error') {
      return HttpResponse.error();
    }

    return HttpResponse.json(getProgressForActiveScenario());
  }),

  // GET /api/stages/:id/briefing
  http.get('/api/stages/:id/briefing', async ({ params }) => {
    const stageId = Number(params.id);
    const scenario = getActiveScenarioId();
    await delay(120);

    const progress = getProgressForActiveScenario();
    const stage = progress.stages.find((s) => s.id === stageId);

    if (scenario === 'locked_403' || (stage && stage.status === 'locked')) {
      return HttpResponse.json(
        {
          error: {
            code: 'STAGE_LOCKED',
            message: `Stage ${stageId} is locked. You must complete and verify all prerequisite stages before this mission unlocks.`
          }
        },
        { status: 403 }
      );
    }

    const briefing = mockBriefings[stageId];
    if (!briefing) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: `Stage ${stageId} briefing not found.` } },
        { status: 404 }
      );
    }

    return HttpResponse.json(briefing);
  }),

  // GET /api/stages/:id/starter
  http.get('/api/stages/:id/starter', async ({ params }) => {
    const stageId = Number(params.id);
    await delay(150);

    const starter = mockStarterResponses[stageId];
    if (!starter) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: `Starter for stage ${stageId} not found.` } },
        { status: 404 }
      );
    }

    return HttpResponse.json(starter);
  }),

  // GET /api/stages/:id/log
  http.get('/api/stages/:id/log', async ({ params }) => {
    const stageId = String(params.id);
    await delay(80);

    const existing = savedLogs[stageId];
    if (existing) {
      return HttpResponse.json({
        sections: existing.sections,
        version: existing.version,
        updatedAt: existing.updatedAt,
        isFinal: false
      });
    }

    return HttpResponse.json({
      sections: {},
      version: 0,
      updatedAt: new Date().toISOString(),
      isFinal: false
    });
  }),

  // PUT /api/stages/:id/log
  http.put('/api/stages/:id/log', async ({ params, request }) => {
    const stageId = String(params.id);
    const body = (await request.json()) as any;
    await delay(150);

    const currentVersion = (savedLogs[stageId]?.version ?? 0) + 1;
    savedLogs[stageId] = {
      sections: body.sections || {},
      version: currentVersion,
      updatedAt: new Date().toISOString()
    };

    return HttpResponse.json({
      sections: savedLogs[stageId].sections,
      version: currentVersion,
      updatedAt: savedLogs[stageId].updatedAt,
      isFinal: false
    });
  }),

  // POST /api/stages/:id/submissions
  http.post('/api/stages/:id/submissions', async ({ params }) => {
    const stageId = Number(params.id);
    const scenario = getActiveScenarioId();
    await delay(250);

    if (scenario === 'session_expired_401') {
      return HttpResponse.json(
        { error: { code: 'UNAUTHENTICATED', message: 'Session expired during submission.' } },
        { status: 401 }
      );
    }

    if (scenario === 'manifest_mismatch_422') {
      return HttpResponse.json(
        {
          error: {
            code: 'MANIFEST_MISMATCH',
            message: 'This archive was not built from your assigned starter kit.'
          }
        },
        { status: 422 }
      );
    }

    if (scenario === 'invalid_zip_422') {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_ARCHIVE',
            message: 'Uploaded archive is corrupted or missing root package manifest.'
          }
        },
        { status: 422 }
      );
    }

    if (scenario === 'file_too_large_413') {
      return HttpResponse.json(
        {
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'Archive exceeds 25 MB size limit.'
          }
        },
        { status: 413 }
      );
    }

    if (scenario === 'duplicate_409') {
      return HttpResponse.json(
        {
          error: {
            code: 'SUBMISSION_IN_PROGRESS',
            message: 'A submission for this stage is already queued or verifying.'
          }
        },
        { status: 409 }
      );
    }

    if (scenario === 'offline_network_error') {
      return HttpResponse.error();
    }

    let outcome: 'pass' | 'fail' | 'needs_review' | 'infra_error' = 'pass';
    let queueMs = 2000;
    let verifyingMs = 3500;

    if (scenario === 'fail_some_checks') {
      outcome = 'fail';
    } else if (scenario === 'needs_review') {
      outcome = 'needs_review';
    } else if (scenario === 'infra_error') {
      outcome = 'infra_error';
    } else if (scenario === 'slow_queue') {
      queueMs = 12000;
    }

    const fakeSub = createFakeSubmission(stageId, outcome, { queueMs, verifyingMs });

    return HttpResponse.json(
      {
        submissionId: fakeSub.id,
        status: 'queued',
        queuePosition: fakeSub.queueDurationMs > 3000 ? 12 : 2
      },
      { status: 202 }
    );
  }),

  // GET /api/submissions/:id
  http.get('/api/submissions/:id', async ({ params }) => {
    const submissionId = String(params.id);
    await delay(120);

    // Check specific preset scenario submission IDs
    if (submissionId === 'sub_active_409' || submissionId === 'active') {
      const activeStatus: SubmissionStatus = {
        id: 'sub_01HX_ACTIVE_409',
        stageId: 2,
        attempt: 1,
        status: 'queued',
        queuePosition: 2,
        checks: [],
        retry: { allowed: false, attemptsUsed: 1, attemptLimit: 8, cooldownEndsAt: null },
        createdAt: new Date(Date.now() - 45000).toISOString()
      };
      return HttpResponse.json(activeStatus);
    }

    if (submissionId === 'sub_slow_queue') {
      const slowQueueStatus: SubmissionStatus = {
        id: 'sub_01HX_SLOW_QUEUE',
        stageId: 2,
        attempt: 1,
        status: 'queued',
        queuePosition: 12,
        checks: [],
        retry: { allowed: false, attemptsUsed: 1, attemptLimit: 8, cooldownEndsAt: null },
        createdAt: new Date(Date.now() - 15000).toISOString()
      };
      return HttpResponse.json(slowQueueStatus);
    }

    const passMatch = submissionId.match(/^sub_pass_stage_(\d+)$/);
    if (passMatch || submissionId === 'sub_01H1PASS1' || submissionId === 'sub_passed_all') {
      const stageNum = passMatch ? Number(passMatch[1]) : 1;
      const nextStageId = stageNum < 6 ? stageNum + 1 : null;

      const stageChecks: Record<number, Array<{ id: string; label: string; passed: boolean; message: string }>> = {
        1: [
          { id: 's1.responsive', label: 'Responsive Viewport Layout', passed: true, message: 'Exhibit layout preserves structural integrity across mobile, tablet, and desktop viewports.' },
          { id: 's1.contrast', label: 'WCAG 2.1 AA Contrast Ratios', passed: true, message: 'All specimen typography and badge elements satisfy 4.5:1 minimum contrast.' },
          { id: 's1.a11y-dom', label: 'Keyboard Accessibility & ARIA', passed: true, message: 'Interactive exhibit controls are fully navigable via keyboard with valid ARIA roles.' }
        ],
        2: [
          { id: 's2.valid-count', label: 'Valid Record Count Match', passed: true, message: 'Rendered the expected number of valid records.' },
          { id: 's2.error-state', label: 'Corrupted Record Error Boundary', passed: true, message: 'Isolated corrupt fragments safely into discrete visual warning cards.' },
          { id: 's2.no-uncaught', label: 'Console Exception Safety', passed: true, message: 'Zero uncaught parsing exceptions during sync burst.' }
        ],
        3: [
          { id: 's3.race-condition', label: 'Event Debounce & Teardown', passed: true, message: 'Clean abort of superseded asynchronous fetch requests.' },
          { id: 's3.state-sync', label: 'Synchronized Archival State', passed: true, message: 'Cache matches active telemetry without stale race anomalies.' }
        ],
        4: [
          { id: 's4.completeness', label: 'Automated Completeness Validation', passed: true, message: 'All required finding entries meet structural schema requirements.' },
          { id: 's4.selector-precision', label: 'CSS Selector Precision', passed: true, message: 'Selectors unambiguously resolved against specimen DOM.' }
        ],
        5: [
          { id: 's5.auth-security', label: 'RBAC & Bearer Token Validation', passed: true, message: 'Protected endpoints strictly reject unauthorized requests.' },
          { id: 's5.deployed-live', label: 'Live Deployment Handshake', passed: true, message: 'Public HTTPS service returned HTTP 200 with valid headers.' }
        ],
        6: [
          { id: 's6.scanner-pipeline', label: 'High-Throughput Safety Ingestion', passed: true, message: 'Processed all test archives within performance constraints.' },
          { id: 's6.quarantine-logic', label: 'Threat Quarantine Protocol', passed: true, message: 'Safely isolated malicious specimen payloads.' }
        ]
      };

      const passedStatus: SubmissionStatus = {
        id: submissionId,
        stageId: stageNum,
        attempt: 1,
        status: 'passed',
        checks: stageChecks[stageNum] || stageChecks[1],
        nextStage: nextStageId
          ? {
              id: nextStageId,
              status: 'unlocked'
            }
          : undefined,
        retry: { allowed: false, attemptsUsed: 1, attemptLimit: 8, cooldownEndsAt: null },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        finishedAt: new Date(Date.now() - 3550000).toISOString()
      };
      return HttpResponse.json(passedStatus);
    }

    if (submissionId === 'sub_failed_checks' || submissionId === 'sub_cooldown') {
      const isCooldown = submissionId === 'sub_cooldown';
      const failedStatus: SubmissionStatus = {
        id: 'sub_01HX_FAIL_FEED',
        stageId: 2,
        attempt: 2,
        status: 'failed',
        checks: [
          {
            id: 's2.valid-count',
            label: 'Valid record count match',
            passed: true,
            message: 'Rendered the expected number of valid records.'
          },
          {
            id: 's2.error-state',
            label: 'Corrupted record error boundary',
            passed: false,
            message: 'The corrupted record is not shown as a visible isolated error state.'
          },
          {
            id: 's2.no-uncaught',
            label: 'Console exception safety',
            passed: true,
            message: 'Zero uncaught parsing exceptions during sync burst.'
          }
        ],
        retry: {
          allowed: true,
          attemptsUsed: 2,
          attemptLimit: 8,
          cooldownEndsAt: isCooldown ? new Date(Date.now() + 180000).toISOString() : null
        },
        createdAt: new Date(Date.now() - 60000).toISOString(),
        finishedAt: new Date(Date.now() - 10000).toISOString()
      };
      return HttpResponse.json(failedStatus);
    }

    if (submissionId === 'sub_needs_review') {
      const reviewStatus: SubmissionStatus = {
        id: 'sub_01HX_RUBRIC_REV',
        stageId: 4,
        attempt: 1,
        status: 'needs_review',
        checks: [
          {
            id: 's4.completeness',
            label: 'Automated completeness validation',
            passed: true,
            message: 'All 3 required finding entries meet structural schema requirements.'
          },
          {
            id: 's4.selector-precision',
            label: 'CSS Selector resolution',
            passed: true,
            message: 'Selectors unambiguously resolved against specimen DOM.'
          }
        ],
        retry: { allowed: false, attemptsUsed: 1, attemptLimit: 8, cooldownEndsAt: null },
        createdAt: new Date(Date.now() - 120000).toISOString(),
        message: 'Your inspection sheet has passed automated completeness and is in the reviewer queue for manual rubric assessment.'
      };
      return HttpResponse.json(reviewStatus);
    }

    if (submissionId === 'sub_infra_error') {
      const infraStatus: SubmissionStatus = {
        id: 'sub_01HX_RUNNER_TIMEOUT',
        stageId: 2,
        attempt: 1,
        status: 'infra_error',
        checks: [
          {
            id: 's2.runner-boot',
            label: 'Sandbox container bootstrap',
            passed: false,
            message: 'Container execution timed out after 90000ms.'
          }
        ],
        retry: { allowed: true, attemptsUsed: 0, attemptLimit: 8, cooldownEndsAt: null },
        createdAt: new Date(Date.now() - 95000).toISOString(),
        finishedAt: new Date(Date.now() - 5000).toISOString(),
        message: 'The grading runner timed out executing the container. No candidate attempt was consumed.'
      };
      return HttpResponse.json(infraStatus);
    }

    if (submissionId === 'sub_attempt_limit') {
      const limitStatus: SubmissionStatus = {
        id: 'sub_01HX_LIMIT_EXHAUSTED',
        stageId: 2,
        attempt: 8,
        status: 'failed',
        checks: [
          {
            id: 's2.error-state',
            label: 'Corrupted record error boundary',
            passed: false,
            message: 'The corrupted record is not shown as a visible error state.'
          }
        ],
        retry: { allowed: false, attemptsUsed: 8, attemptLimit: 8, cooldownEndsAt: null },
        createdAt: new Date(Date.now() - 300000).toISOString()
      };
      return HttpResponse.json(limitStatus);
    }

    // Default dynamic check against active submissions
    const status = getSubmissionCurrentStatus(submissionId);
    if (!status) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: `Submission ${submissionId} not found.` } },
        { status: 404 }
      );
    }

    // If passed, persist to local storage so progress updates
    if (status.status === 'passed' && status.stageId === 2) {
      localStorage.setItem('byte_mock_passed_stage_2', 'true');
    }

    return HttpResponse.json(status);
  }),

  // GET /api/stages/:id/submissions
  http.get('/api/stages/:id/submissions', async () => {
    await delay(100);
    return HttpResponse.json([]);
  })
];
