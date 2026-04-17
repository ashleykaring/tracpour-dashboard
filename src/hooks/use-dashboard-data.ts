import { useEffect, useMemo, useState } from 'react';

import { getActiveJob, getLoadsForActiveJob } from '@/lib/api';
import { computeDashboardMetrics } from '@/lib/dashboard';
import type { Job, Load } from '@/lib/types';

export function useDashboardData() {
  const [job, setJob] = useState<Job | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);

      const [activeJob, activeLoads] = await Promise.all([getActiveJob(), getLoadsForActiveJob()]);

      if (!isMounted) {
        return;
      }

      setJob(activeJob);
      setLoads(activeLoads);
      setIsLoading(false);
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    if (!job) {
      return null;
    }

    return computeDashboardMetrics(job, loads);
  }, [job, loads]);

  return { job, loads, metrics, isLoading };
}
