
import { useState, useEffect } from 'react';

export interface ApiResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useApi<T>(
  apiFunction: () => Promise<T>,
  dependencies: any[] = []
): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await apiFunction();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, isLoading, error };
}
