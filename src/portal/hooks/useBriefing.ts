import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/endpoints';
import { ApiError, Briefing } from '../types/api';

export function useBriefing(stageId: number) {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchBriefing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBriefing(stageId);
      setBriefing(res);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [stageId]);

  useEffect(() => {
    fetchBriefing();

    const handleScenarioChange = () => {
      fetchBriefing();
    };

    window.addEventListener('byte-scenario-changed', handleScenarioChange);
    return () => window.removeEventListener('byte-scenario-changed', handleScenarioChange);
  }, [fetchBriefing]);

  return { briefing, loading, error, refresh: fetchBriefing };
}
