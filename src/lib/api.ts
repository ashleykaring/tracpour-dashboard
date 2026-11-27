import { FunctionsHttpError } from '@supabase/supabase-js';

import { computeDashboardMetrics } from './dashboard';
import { supabase } from './supabase';
import type { ActivityEvent, CreateJobInput, DashboardMetrics, Job, Load, StartPourInput, SupplierOrder, TruckingTicket } from './types';

async function request<T>(action: string, input: Record<string, unknown> = {}): Promise<T> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.functions.invoke<T>('dashboard', { body: { ...input, action } });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      if (typeof body?.message === 'string') throw new Error(body.message);
    }
    throw new Error('Unable to reach the dashboard. Check your connection and try again.');
  }
  return data as T;
}

export const getActivePour = () => request<Job | null>('active');
export const startPour = (input: StartPourInput) => request<Job>('start', input);
export const getLoadsForActivePour = () => request<Load[]>('loads');
export const getPourActivity = () => request<ActivityEvent[]>('activity');
export const getTicketsForActivePour = () => request<TruckingTicket[]>('tickets');
export const getSupplierOrderForActivePour = () => request<SupplierOrder | null>('supplier-order');
export const completeActivePour = () => request<Job>('complete');

export async function getDashboardSummary(): Promise<DashboardMetrics | null> {
  const activePour = await getActivePour();
  return activePour ? computeDashboardMetrics(activePour, await getLoadsForActivePour()) : null;
}

export const getActiveJob = getActivePour;
export const getLoadsForActiveJob = getLoadsForActivePour;
export const createJob = (input: CreateJobInput) => startPour(input);

export async function fetchTicketsWorkbook() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session || !url || !key) throw new Error('Please sign in to export tickets.');
  const response = await fetch(`${url.replace(/\/$/, '')}/functions/v1/dashboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${data.session.access_token}` },
    body: JSON.stringify({ action: 'export-tickets' }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? 'Unable to export tickets.');
  }
  const name = response.headers.get('Content-Disposition')?.match(/filename="([a-zA-Z0-9._-]+)"/)?.[1] ?? 'tickets.xlsx';
  return { bytes: await response.arrayBuffer(), filename: name };
}
