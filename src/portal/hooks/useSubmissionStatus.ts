import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/endpoints';
import { LIMITS } from '../config/limits';
import { ApiError, SubmissionStatus } from '../types/api';

export function useSubmissionStatus(submissionId: string | null | undefined) {
  const [status, setStatus] = useState<SubmissionStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);
  const isTerminalRef = useRef<boolean>(false);

  const poll = useCallback(async () => {
    if (!submissionId || isTerminalRef.current) return;

    try {
      const data = await api.getSubmission(submissionId);
      setStatus(data);
      setLoading(false);

      if (['passed', 'failed', 'needs_review', 'infra_error'].includes(data.status)) {
        isTerminalRef.current = true;
        return; // Terminal state reached: stop polling
      }
    } catch (err: any) {
      setError(err);
      setLoading(false);
    }

    // Schedule next poll if still pending
    if (!isTerminalRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed > LIMITS.POLLING.MAX_TOTAL_MS) {
        // Stop after 15 mins hard limit
        return;
      }

      let baseInterval = LIMITS.POLLING.FAST_INTERVAL_MS;
      if (elapsed > LIMITS.POLLING.MEDIUM_DURATION_MS) {
        baseInterval = LIMITS.POLLING.SLOW_INTERVAL_MS;
      } else if (elapsed > LIMITS.POLLING.FAST_DURATION_MS) {
        baseInterval = LIMITS.POLLING.MEDIUM_INTERVAL_MS;
      }

      // Add +/- 20% jitter
      const jitterFactor = 1 + (Math.random() * 2 - 1) * LIMITS.POLLING.JITTER_RATIO;
      const intervalWithJitter = Math.round(baseInterval * jitterFactor);

      timerRef.current = setTimeout(poll, intervalWithJitter);
    }
  }, [submissionId]);

  useEffect(() => {
    if (!submissionId) return;

    startTimeRef.current = Date.now();
    isTerminalRef.current = false;
    setLoading(true);
    poll();

    // Tab visibility handling: pause on hidden, immediate poll on focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isTerminalRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        poll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [submissionId, poll]);

  return { status, loading, error, isTerminal: isTerminalRef.current };
}
