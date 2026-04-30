import { useEffect, useMemo, useState } from 'react';

import { getActivePour, getLoadsForActivePour, getPourActivity, getTicketsForActivePour } from '@/lib/api';
import { computeDashboardMetrics } from '@/lib/dashboard';
import type { ActivityEvent, Job, Load, TruckingTicket } from '@/lib/types';

export function useDashboardData() {
  const [job, setJob] = useState<Job | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [tickets, setTickets] = useState<TruckingTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);

      const [activeJob, activeLoads, pourActivity, truckingTickets] = await Promise.all([
        getActivePour(),
        getLoadsForActivePour(),
        getPourActivity(),
        getTicketsForActivePour(),
      ]);

      if (!isMounted) {
        return;
      }

      setJob(activeJob);
      setLoads(activeLoads);
      setActivity(pourActivity);
      setTickets(truckingTickets);
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

  return { job, loads, activity, tickets, metrics, isLoading };
}
