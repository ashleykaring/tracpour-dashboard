import { useEffect, useMemo, useState } from 'react';

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

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard(showLoading = false) {
      if (showLoading) {
        setIsLoading(true);
      }

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
      setIsLoading(false);
    }

    void loadDashboard(true);
    const refreshInterval = setInterval(() => {
      void loadDashboard();
    }, DASHBOARD_REFRESH_MS);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, []);

  const metrics = useMemo(() => {
    if (!job) {
      return null;
    }

    return computeDashboardMetrics(job, loads);
  }, [job, loads]);

  return { job, loads, activity, tickets, supplierOrder, metrics, isLoading };
}
