import { useState, useEffect, useCallback, useRef } from 'react';
import SystemMetricsAPI, { SystemMetrics } from './SystemMetricsAPI';

interface UseSystemMetricsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface UseSystemMetricsReturn {
  metrics: SystemMetrics | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export const useSystemMetrics = (
  options: UseSystemMetricsOptions = {}
): UseSystemMetricsReturn => {
  const { autoRefresh = false, refreshInterval = 5000 } = options;
  
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SystemMetricsAPI.getMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get metrics'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(refresh, refreshInterval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refresh]);

  return { metrics, loading, error, refresh };
};
