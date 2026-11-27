import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getActivePour,
  getLoadsForActivePour,
  getPourActivity,
  getSupplierOrderForActivePour,
  getTicketsForActivePour,
} from '@/lib/api';
import { computeDashboardMetrics } from '@/lib/dashboard';
import type { ActivityEvent, Job, Load, SupplierOrder, TruckingTicket } from '@/lib/types';

const DASHBOARD_REFRESH_MS = 10000;

export function useDashboardData() {
  const [job, setJob] = useState<Job | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [tickets, setTickets] = useState<TruckingTicket[]>([]);
  const [supplierOrder, setSupplierOrder] = useState<SupplierOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const retry = useCallback(() => setRetryAttempt((attempt) => attempt + 1), []);

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    async function loadDashboard() {
      if (isFetching) {
        return;
      }

      isFetching = true;
      setIsRefreshing(true);

      try {
        const [activeJob, activeLoads, pourActivity, truckingTickets, activeSupplierOrder] = await Promise.all([
          getActivePour(),
          getLoadsForActivePour(),
          getPourActivity(),
          getTicketsForActivePour(),
          getSupplierOrderForActivePour(),
        ]);

        if (!isMounted) {
          return;
        }

        setJob(activeJob);
        setLoads(activeLoads);
        setActivity(pourActivity);
        setTickets(truckingTickets);
        setSupplierOrder(activeSupplierOrder);
        setError(null);
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unable to load pour data.');
        }
      } finally {
        isFetching = false;
        if (isMounted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void loadDashboard();
    const refreshInterval = setInterval(() => {
      void loadDashboard();
    }, DASHBOARD_REFRESH_MS);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [retryAttempt]);

  const metrics = useMemo(() => {
    if (!job) {
      return null;
    }

    return computeDashboardMetrics(job, loads);
  }, [job, loads]);

  return { job, loads, activity, tickets, supplierOrder, metrics, isLoading, isRefreshing, error, retry };
}
