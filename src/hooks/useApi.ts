// Custom React hook for API requests with loading, error, and refetch state.

import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../services/api';

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(
          new ApiError(
            'INTERNAL_ERROR',
            err instanceof Error ? err.message : 'An unexpected error occurred',
          ),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: fetchData };
}
