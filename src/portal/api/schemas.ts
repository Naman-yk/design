import { z } from 'zod';

export const StageStatusSchema = z.enum([
  'scheduled',
  'locked',
  'unlocked',
  'in_progress',
  'queued',
  'verifying',
  'passed',
  'failed',
  'needs_review',
  'infra_error'
]);

export const RetryInfoSchema = z.object({
  allowed: z.boolean(),
  attemptsUsed: z.number(),
  attemptLimit: z.number(),
  cooldownEndsAt: z.string().nullable()
});

export const StageSummarySchema = z.object({
  id: z.number(),
  title: z.string(),
  subtitle: z.string().optional(),
  status: StageStatusSchema,
  releaseAt: z.string().optional(),
  estimatedMinutes: z.string().optional(),
  workspaceLabel: z.string().optional(),
  retry: RetryInfoSchema.optional(),
  latestSubmissionId: z.string().optional()
});

export const ProgressResponseSchema = z.object({
  serverNow: z.string(),
  candidate: z.object({
    code: z.string(),
    track: z.enum(['webdev', 'appdev']),
    variantLabel: z.string()
  }),
  percentComplete: z.number(),
  currentStageId: z.number().nullable(),
  stages: z.array(StageSummarySchema)
});

export const RuleOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  isDecoy: z.boolean().optional()
});

export const BriefingSchema = z.object({
  stageId: z.number(),
  title: z.string(),
  story: z.string(),
  goal: z.string(),
  deliverables: z.array(z.string()),
  constraints: z.array(z.string()),
  allowedResources: z.array(z.string()),
  checksSummary: z.array(z.string()),
  estimatedMinutes: z.string(),
  acceptedFormats: z.array(z.enum(['zip', 'findings', 'deployment'])),
  workspace: z.object({
    hostedAvailable: z.boolean(),
    hostedUrl: z.string().optional(),
    zipAvailable: z.boolean(),
    localSteps: z.array(z.string())
  }),
  ruleIds: z.array(RuleOptionSchema).optional(),
  specimenUrl: z.string().optional(),
  minFindings: z.number().optional(),
  logSections: z.array(z.string())
});

export const StarterResponseSchema = z.object({
  kind: z.enum(['zip', 'hosted']),
  url: z.string(),
  expiresAt: z.string(),
  version: z.string()
});

export const SubmissionCreatedSchema = z.object({
  submissionId: z.string(),
  status: z.literal('queued'),
  queuePosition: z.number().optional()
});

export const CheckResultSchema = z.object({
  id: z.string(),
  label: z.string(),
  passed: z.boolean(),
  message: z.string()
});

export const SubmissionStatusSchema = z.object({
  id: z.string(),
  stageId: z.number(),
  attempt: z.number(),
  status: z.enum(['queued', 'verifying', 'passed', 'failed', 'needs_review', 'infra_error']),
  queuePosition: z.number().optional(),
  checks: z.array(CheckResultSchema),
  retry: RetryInfoSchema,
  nextStage: z
    .object({
      id: z.number(),
      status: StageStatusSchema
    })
    .optional(),
  createdAt: z.string(),
  finishedAt: z.string().optional(),
  message: z.string().optional()
});

export const LogDraftSchema = z.object({
  sections: z.record(z.string(), z.string()),
  version: z.number(),
  updatedAt: z.string(),
  isFinal: z.boolean()
});

export const FindingRowSchema = z.object({
  id: z.string().optional(),
  ruleId: z.string().min(1, 'Please select a rule category'),
  selector: z.string().min(1, 'Selector is required (e.g. .btn-primary, #nav)'),
  evidence: z.string().min(1, 'Evidence is required'),
  severity: z.enum(['high', 'medium', 'low']),
  why: z.string().min(1, 'Explanation of why this violates the rule is required'),
  suggestedFix: z.string().min(1, 'Suggested remediation code or action is required')
});

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional()
  })
});
