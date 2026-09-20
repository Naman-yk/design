import { describe, it, expect } from 'vitest';
import { toUserMessage, isRetryable, isAuthError, ERROR_MAPPINGS } from './errors';

describe('Error Mapping (Section 5.9 Table)', () => {
  it('maps UNAUTHENTICATED (401) correctly', () => {
    const err = { error: { code: 'UNAUTHENTICATED', message: 'Session expired' } };
    const mapped = toUserMessage(err);

    expect(mapped.code).toBe('UNAUTHENTICATED');
    expect(mapped.title).toBe('Session Expired');
    expect(mapped.consumesAttempt).toBe(false);
    expect(isAuthError(err)).toBe(true);
  });

  it('maps STAGE_LOCKED (403) with prerequisite hint', () => {
    const err = { error: { code: 'STAGE_LOCKED', message: 'Stage is locked' } };
    const mapped = toUserMessage(err);

    expect(mapped.code).toBe('STAGE_LOCKED');
    expect(mapped.title).toBe('Stage Locked');
    expect(mapped.isRetryable).toBe(false);
    expect(mapped.consumesAttempt).toBe(false);
  });

  it('maps STAGE_NOT_RELEASED (403) with formatted scheduled date if provided', () => {
    const err = {
      error: {
        code: 'STAGE_NOT_RELEASED',
        message: 'Not released',
        details: { releaseAt: '2026-10-01T10:00:00Z' }
      }
    };
    const mapped = toUserMessage(err);

    expect(mapped.code).toBe('STAGE_NOT_RELEASED');
    expect(mapped.message).toContain('scheduled to open on');
  });

  it('maps FILE_TOO_LARGE (413) without consuming attempt', () => {
    const err = { error: { code: 'FILE_TOO_LARGE', message: 'File too big' } };
    const mapped = toUserMessage(err);

    expect(mapped.code).toBe('FILE_TOO_LARGE');
    expect(mapped.title).toBe('File Too Large');
    expect(mapped.consumesAttempt).toBe(false);
    expect(mapped.isRetryable).toBe(true);
  });

  it('maps MANIFEST_MISMATCH (422) with actionable advice', () => {
    const err = { error: { code: 'MANIFEST_MISMATCH', message: 'Manifest mismatch' } };
    const mapped = toUserMessage(err);

    expect(mapped.code).toBe('MANIFEST_MISMATCH');
    expect(mapped.message).toContain('assigned starter kit');
    expect(mapped.consumesAttempt).toBe(false);
  });

  it('maps INVALID_ARCHIVE (422) without consuming attempt', () => {
    const err = { error: { code: 'INVALID_ARCHIVE', message: 'Corrupted zip' } };
    const mapped = toUserMessage(err);

    expect(mapped.code).toBe('INVALID_ARCHIVE');
    expect(mapped.consumesAttempt).toBe(false);
  });

  it('maps SUBMISSION_IN_PROGRESS (409) preventing duplicate submissions', () => {
    const err = { error: { code: 'SUBMISSION_IN_PROGRESS', message: 'In progress' } };
    const mapped = toUserMessage(err);

    expect(mapped.code).toBe('SUBMISSION_IN_PROGRESS');
    expect(mapped.isRetryable).toBe(false);
  });

  it('maps COOLDOWN (429) as retryable without consuming attempt', () => {
    const err = { error: { code: 'COOLDOWN', message: 'Cooldown active' } };
    const mapped = toUserMessage(err);

    expect(mapped.code).toBe('COOLDOWN');
    expect(mapped.isRetryable).toBe(true);
    expect(mapped.consumesAttempt).toBe(false);
  });

  it('maps INTERNAL (500) as infrastructure error without consuming attempt', () => {
    const err = { error: { code: 'INTERNAL', message: 'Server error' } };
    const mapped = toUserMessage(err);

    expect(mapped.code).toBe('INTERNAL');
    expect(mapped.isRetryable).toBe(true);
    expect(mapped.consumesAttempt).toBe(false);
  });

  it('handles client-side Network and Abort errors gracefully', () => {
    const abortErr = new Error('The operation was aborted');
    abortErr.name = 'AbortError';
    expect(toUserMessage(abortErr).code).toBe('TIMEOUT');

    const netErr = new Error('Failed to fetch');
    expect(toUserMessage(netErr).code).toBe('NETWORK_ERROR');
  });

  it('all mappings defined in Section 5.9 have non-empty titles and messages', () => {
    const expectedCodes = [
      'UNAUTHENTICATED',
      'STAGE_LOCKED',
      'STAGE_NOT_RELEASED',
      'NOT_FOUND',
      'VALIDATION_FAILED',
      'FILE_TOO_LARGE',
      'INVALID_ARCHIVE',
      'MANIFEST_MISMATCH',
      'SUBMISSION_IN_PROGRESS',
      'COOLDOWN',
      'ATTEMPT_LIMIT',
      'RATE_LIMITED',
      'INTERNAL',
      'NETWORK_ERROR',
      'TIMEOUT',
      'SCHEMA_MISMATCH'
    ];

    for (const code of expectedCodes) {
      expect(ERROR_MAPPINGS[code]).toBeDefined();
      expect(ERROR_MAPPINGS[code].title.length).toBeGreaterThan(0);
      expect(ERROR_MAPPINGS[code].message.length).toBeGreaterThan(0);
    }
  });
});
