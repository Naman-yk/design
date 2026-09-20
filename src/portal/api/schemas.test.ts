import { describe, it, expect } from 'vitest';
import {
  ProgressResponseSchema,
  BriefingSchema,
  SubmissionStatusSchema,
  FindingRowSchema,
  RetryInfoSchema
} from './schemas';
import {
  fixtureProgressScreenshotCase,
  fixtureProgressNewCandidate,
  fixtureProgressAllPassed,
  mockBriefings
} from '../mocks/fixtures';

describe('Zod Schemas Validation (Part 6.2 Contracts)', () => {
  it('validates canonical screenshot progress fixture', () => {
    const result = ProgressResponseSchema.safeParse(fixtureProgressScreenshotCase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidate.code).toBe('BYTE-7F3K');
      expect(result.data.percentComplete).toBe(33);
      expect(result.data.stages[0].status).toBe('passed');
      expect(result.data.stages[1].status).toBe('unlocked');
      expect(result.data.stages[2].status).toBe('locked');
    }
  });

  it('validates brand new candidate progress fixture', () => {
    const result = ProgressResponseSchema.safeParse(fixtureProgressNewCandidate);
    expect(result.success).toBe(true);
  });

  it('validates all passed progress fixture', () => {
    const result = ProgressResponseSchema.safeParse(fixtureProgressAllPassed);
    expect(result.success).toBe(true);
  });

  it('validates all mock briefings against BriefingSchema', () => {
    for (const [id, briefing] of Object.entries(mockBriefings)) {
      const result = BriefingSchema.safeParse(briefing);
      expect(result.success, `Briefing ${id} failed validation`).toBe(true);
    }
  });

  it('validates FindingRow schema for Stage 4', () => {
    const validRow = {
      ruleId: 'a11y-contrast',
      selector: 'header .brand',
      evidence: 'Contrast ratio 2.8:1',
      severity: 'medium',
      why: 'Violates WCAG AA contrast standards',
      suggestedFix: 'color: #9ca3af'
    };

    expect(FindingRowSchema.safeParse(validRow).success).toBe(true);

    const invalidRow = {
      ruleId: '',
      selector: '',
      evidence: '',
      severity: 'medium',
      why: '',
      suggestedFix: ''
    };

    expect(FindingRowSchema.safeParse(invalidRow).success).toBe(false);
  });

  it('validates RetryInfo schema', () => {
    const validRetry = {
      allowed: true,
      attemptsUsed: 2,
      attemptLimit: 8,
      cooldownEndsAt: '2026-09-30T12:00:00Z'
    };

    expect(RetryInfoSchema.safeParse(validRetry).success).toBe(true);
  });
});
