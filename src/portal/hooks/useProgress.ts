import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/endpoints';
import { ApiError, ProgressResponse } from '../types/api';

export function useProgress() {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProgress();
      setData(res);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();

    const handleScenarioChange = () => {
      fetchProgress();
    };

    window.addEventListener('byte-scenario-changed', handleScenarioChange);
    return () => window.removeEventListener('byte-scenario-changed', handleScenarioChange);
  }, [fetchProgress]);

  return { data, loading, error, refresh: fetchProgress };
}
