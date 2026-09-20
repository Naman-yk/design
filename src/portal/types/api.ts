/**
 * BYTE Archive 047 — TypeScript API interfaces
 * Source of truth for client and mock layer (Spec Part 6.2)
 */

export type StageStatus =
  | 'scheduled'
  | 'locked'
  | 'unlocked'
  | 'in_progress'
  | 'queued'
  | 'verifying'
  | 'passed'
  | 'failed'
  | 'needs_review'
  | 'infra_error';

export interface RetryInfo {
  allowed: boolean;
  attemptsUsed: number;
  attemptLimit: number;
  cooldownEndsAt: string | null; // ISO timestamp, server time
}

export interface StageSummary {
  id: number; // 0..6
  title: string;
  subtitle?: string;
  status: StageStatus;
  releaseAt?: string; // set when status is "scheduled"
  estimatedMinutes?: string; // e.g. "25-35 minutes"
  workspaceLabel?: string; // e.g. "Assigned project"
  retry?: RetryInfo;
  latestSubmissionId?: string;
}

export interface ProgressResponse {
  serverNow: string;
  candidate: {
    code: string;
    track: 'webdev' | 'appdev';
    variantLabel: string;
  };
  percentComplete: number; // computed by backend
  currentStageId: number | null;
  stages: StageSummary[];
}

export interface RuleOption {
  id: string;
  label: string;
  isDecoy?: boolean;
}

export interface Briefing {
  stageId: number;
  title: string;
  subtitle?: string;
  story: string; // markdown narrative
  goal: string;
  deliverables: string[];
  constraints: string[];
  allowedResources: string[];
  checksSummary: string[]; // categories only, never leaked expected values
  estimatedMinutes: string;
  acceptedFormats: Array<'zip' | 'findings' | 'deployment'>;
  workspace: {
    hostedAvailable: boolean;
    hostedUrl?: string;
    zipAvailable: boolean;
    localSteps: string[];
  };
  ruleIds?: RuleOption[]; // Stage 4 dropdown (includes decoys)
  specimenUrl?: string; // Stage 4 specimen URL
  minFindings?: number; // Stage 4 completeness requirement
  logSections: string[];
}

export interface StarterResponse {
  kind: 'zip' | 'hosted';
  url: string;
  expiresAt: string;
  version: string;
}

export interface SubmissionCreated {
  submissionId: string;
  status: 'queued';
  queuePosition?: number;
}

export interface CheckResult {
  id: string;
  label: string;
  passed: boolean;
  message: string;
}

export interface SubmissionStatus {
  id: string;
  stageId: number;
  attempt: number;
  status: 'queued' | 'verifying' | 'passed' | 'failed' | 'needs_review' | 'infra_error';
  queuePosition?: number;
  checks: CheckResult[];
  retry: RetryInfo;
  nextStage?: {
    id: number;
    status: StageStatus;
  };
  createdAt: string;
  finishedAt?: string;
  message?: string;
}

export interface LogDraft {
  sections: Record<string, string>;
  version: number;
  updatedAt: string;
  isFinal: boolean;
}

export interface FindingRow {
  id?: string; // local UI key
  ruleId: string;
  selector: string;
  evidence: string;
  severity: 'high' | 'medium' | 'low';
  why: string;
  suggestedFix: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
