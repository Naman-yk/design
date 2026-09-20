import { LIMITS } from '../config/limits';
import {
  fixtureProgressAllPassed,
  fixtureProgressNewCandidate,
  fixtureProgressScreenshotCase
} from './fixtures';
import { ProgressResponse } from '../types/api';

export type ScenarioId =
  | 'stage1_passed_stage2_current'
  | 'brand_new_candidate'
  | 'pass_all'
  | 'duplicate_409'
  | 'slow_queue'
  | 'fail_some_checks'
  | 'needs_review'
  | 'infra_error'
  | 'cooldown_active'
  | 'attempt_limit'
  | 'locked_403'
  | 'manifest_mismatch_422'
  | 'invalid_zip_422'
  | 'file_too_large_413'
  | 'session_expired_401'
  | 'offline_network_error';

export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  category: 'Progress & Completion' | 'Active Evaluation States' | 'API Errors' | 'Network & Edge Cases';
  description: string;
  badge?: string;
}

export const SCENARIO_CATALOG: ScenarioDefinition[] = [
  {
    id: 'stage1_passed_stage2_current',
    name: 'Default: Stage 1 Passed, Stage 2 Current',
    category: 'Progress & Completion',
    description: 'Stage 1 verified, Stage 2 ready to start, Stage 3-6 locked. 33% complete (Canonical screenshot).',
    badge: 'Canonical'
  },
  {
    id: 'brand_new_candidate',
    name: 'Brand New Candidate (0% Progress)',
    category: 'Progress & Completion',
    description: 'Fresh candidate at 0% complete, Stage 1 unlocked and ready to begin.'
  },
  {
    id: 'pass_all',
    name: 'All 6 Stages Verified (100% Complete)',
    category: 'Progress & Completion',
    description: 'Candidate has completed all 6 stages. Displays full verification summary & review dossier.',
    badge: '100% Done'
  },
  {
    id: 'duplicate_409',
    name: '409: Submission in Progress (Queued #2)',
    category: 'Active Evaluation States',
    description: 'Stage 2 is actively queued in runner. Shows live In-Queue state, position #2, and live status button.',
    badge: 'Queued'
  },
  {
    id: 'slow_queue',
    name: 'Slow Job Queue (Position #12)',
    category: 'Active Evaluation States',
    description: 'Stage 2 sits in high-load queue with position countdown #12 before verification begins.'
  },
  {
    id: 'fail_some_checks',
    name: 'Verification: Checks Failed & Cooldown',
    category: 'Active Evaluation States',
    description: 'Stage 2 shows changes needed, check breakdown with non-leaking feedback, and retry cooldown.'
  },
  {
    id: 'needs_review',
    name: 'Verification: Pending Human Review',
    category: 'Active Evaluation States',
    description: 'Stage 2 shows pending reviewer attention with human rubric inspection details.'
  },
  {
    id: 'infra_error',
    name: 'Verification: Infrastructure Issue',
    category: 'Active Evaluation States',
    description: 'Stage 2 runner container timeout notice. Zero attempts consumed, instant retry available.'
  },
  {
    id: 'cooldown_active',
    name: 'Cooldown Active (5m Timer)',
    category: 'API Errors',
    description: 'Stage 2 has an active 5-minute countdown before the next submission attempt unlocks.'
  },
  {
    id: 'attempt_limit',
    name: 'Attempt Limit Reached (8 of 8)',
    category: 'API Errors',
    description: 'Candidate exhausted all 8 allowed evaluation attempts for Stage 2.'
  },
  {
    id: 'manifest_mismatch_422',
    name: '422: Manifest Mismatch',
    category: 'API Errors',
    description: 'ZIP submission rejected: archive was not built from candidate assigned starter kit.'
  },
  {
    id: 'invalid_zip_422',
    name: '422: Invalid Archive Format',
    category: 'API Errors',
    description: 'ZIP corrupted or missing root package manifest. No attempt consumed.'
  },
  {
    id: 'file_too_large_413',
    name: '413: File Too Large (>25MB)',
    category: 'API Errors',
    description: 'Uploaded archive exceeds size limit. Form state safely preserved.'
  },
  {
    id: 'locked_403',
    name: '403: Stage Locked Access',
    category: 'API Errors',
    description: 'Direct navigation to locked stage returns 403 STAGE_LOCKED with prerequisite explanation.'
  },
  {
    id: 'session_expired_401',
    name: '401: Session Expired',
    category: 'Network & Edge Cases',
    description: 'Auth cookie expired. Local draft preserved with re-login prompt.'
  },
  {
    id: 'offline_network_error',
    name: 'Network Connection Failure',
    category: 'Network & Edge Cases',
    description: 'Simulates offline drop. Shows offline banner and preserves unsaved input.'
  }
];

export function getActiveScenarioId(): ScenarioId {
  const stored = localStorage.getItem(LIMITS.STORAGE_KEYS.ACTIVE_SCENARIO);
  if (stored && SCENARIO_CATALOG.some((s) => s.id === stored)) {
    return stored as ScenarioId;
  }
  return 'stage1_passed_stage2_current';
}

export function setActiveScenarioId(id: ScenarioId): void {
  localStorage.setItem(LIMITS.STORAGE_KEYS.ACTIVE_SCENARIO, id);
}

export function getProgressForActiveScenario(): ProgressResponse {
  const scenario = getActiveScenarioId();

  if (scenario === 'brand_new_candidate') {
    return fixtureProgressNewCandidate;
  }

  if (scenario === 'pass_all') {
    return fixtureProgressAllPassed;
  }

  const base: ProgressResponse = JSON.parse(JSON.stringify(fixtureProgressScreenshotCase));

  if (scenario === 'duplicate_409') {
    base.stages[1].status = 'queued';
    base.stages[1].latestSubmissionId = 'sub_active_409';
    return base;
  }

  if (scenario === 'slow_queue') {
    base.stages[1].status = 'queued';
    base.stages[1].latestSubmissionId = 'sub_slow_queue';
    return base;
  }

  if (scenario === 'fail_some_checks') {
    base.stages[1].status = 'failed';
    base.stages[1].latestSubmissionId = 'sub_failed_checks';
    base.stages[1].retry = {
      allowed: true,
      attemptsUsed: 1,
      attemptLimit: 8,
      cooldownEndsAt: new Date(Date.now() + 3 * 60 * 1000).toISOString()
    };
    return base;
  }

  if (scenario === 'needs_review') {
    base.stages[1].status = 'needs_review';
    base.stages[1].latestSubmissionId = 'sub_needs_review';
    return base;
  }

  if (scenario === 'infra_error') {
    base.stages[1].status = 'infra_error';
    base.stages[1].latestSubmissionId = 'sub_infra_error';
    base.stages[1].retry = {
      allowed: true,
      attemptsUsed: 0,
      attemptLimit: 8,
      cooldownEndsAt: null
    };
    return base;
  }

  if (scenario === 'cooldown_active') {
    base.stages[1].status = 'failed';
    base.stages[1].latestSubmissionId = 'sub_cooldown';
    base.stages[1].retry = {
      allowed: false,
      attemptsUsed: 2,
      attemptLimit: 8,
      cooldownEndsAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };
    return base;
  }

  if (scenario === 'attempt_limit') {
    base.stages[1].status = 'failed';
    base.stages[1].latestSubmissionId = 'sub_attempt_limit';
    base.stages[1].retry = {
      allowed: false,
      attemptsUsed: 8,
      attemptLimit: 8,
      cooldownEndsAt: null
    };
    return base;
  }

  // Check if user passed stage 2 in interactive session
  const passedStage2 = localStorage.getItem('byte_mock_passed_stage_2');
  if (passedStage2 === 'true') {
    base.percentComplete = 50;
    base.currentStageId = 3;
    base.stages[1].status = 'passed';
    base.stages[2].status = 'unlocked';
    return base;
  }

  return base;
}
