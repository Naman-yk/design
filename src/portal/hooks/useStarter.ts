import { useCallback, useState } from 'react';
import { api } from '../api/endpoints';
import { ApiError, StarterResponse } from '../types/api';

export function useStarter(stageId: number) {
  const [starter, setStarter] = useState<StarterResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchStarter = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getStarter(stageId);
      setStarter(res);
      return res;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [stageId]);

  return { starter, loading, error, fetchStarter };
}
