import { describe, it, expect, vi } from 'vitest';
import { createFakeSubmission, getSubmissionCurrentStatus } from './fakeGrader';

describe('Fake Grader State Machine (WP9)', () => {
  it('initializes in queued status with queue position', () => {
    const sub = createFakeSubmission(2, 'pass', { queueMs: 1000, verifyingMs: 1000 });
    const status = getSubmissionCurrentStatus(sub.id);

    expect(status).not.toBeNull();
    expect(status?.status).toBe('queued');
    expect(status?.queuePosition).toBeDefined();
    expect(status?.checks.length).toBe(0); // Checks not revealed while queued
  });

  it('transitions to verifying status and runs simulated checks', async () => {
    const sub = createFakeSubmission(2, 'pass', { queueMs: 20, verifyingMs: 100 });

    // Wait for queue delay to pass
    await new Promise((resolve) => setTimeout(resolve, 35));

    const status = getSubmissionCurrentStatus(sub.id);
    expect(status?.status).toBe('verifying');
    expect(status?.queuePosition).toBeUndefined();
  });

  it('settles to passed terminal outcome and unlocks next stage', async () => {
    const sub = createFakeSubmission(2, 'pass', { queueMs: 10, verifyingMs: 20 });

    // Wait for completion
    await new Promise((resolve) => setTimeout(resolve, 45));

    const status = getSubmissionCurrentStatus(sub.id);
    expect(status?.status).toBe('passed');
    expect(status?.checks.length).toBeGreaterThan(0);
    expect(status?.checks.every((c) => c.passed)).toBe(true);
    expect(status?.nextStage?.status).toBe('unlocked');
  });

  it('settles to failed outcome with non-leaking guidance messages and cooldown', async () => {
    const sub = createFakeSubmission(2, 'fail', { queueMs: 10, verifyingMs: 20 });

    await new Promise((resolve) => setTimeout(resolve, 45));

    const status = getSubmissionCurrentStatus(sub.id);
    expect(status?.status).toBe('failed');
    expect(status?.retry.allowed).toBe(true);
    expect(status?.retry.cooldownEndsAt).not.toBeNull();

    // Check message does not leak exact count or answer keys
    const failedCheck = status?.checks.find((c) => !c.passed);
    expect(failedCheck).toBeDefined();
    expect(failedCheck?.message).not.toContain('secret');
  });

  it('handles infra_error without consuming candidate attempt', async () => {
    const sub = createFakeSubmission(1, 'infra_error', { queueMs: 10, verifyingMs: 20 });

    await new Promise((resolve) => setTimeout(resolve, 45));

    const status = getSubmissionCurrentStatus(sub.id);
    expect(status?.status).toBe('infra_error');
    expect(status?.retry.attemptsUsed).toBe(0); // Crucial: zero attempts consumed
  });
});
