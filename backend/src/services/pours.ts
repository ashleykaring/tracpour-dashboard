import { requireData, supabase, throwIfSupabaseError } from '../db';
import type { DashboardSummary } from '../domain';
import type {
  ActivityEventRecord,
  LoadRecord,
  PourRecord,
  TruckingTicketRecord,
} from '../records';

export async function getActivePourRecord(): Promise<PourRecord | null> {
  const { data, error } = await supabase
    .from('pours')
    .select('*')
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle<PourRecord>();

  throwIfSupabaseError(error);
  return data;
}

export async function createPour(input: {
  name: string;
  expectedYardage: number;
  startedAt?: string;
}): Promise<PourRecord> {
  const { data, error } = await supabase
    .from('pours')
    .insert({
      name: input.name,
      expected_yardage: input.expectedYardage,
      status: 'active',
      started_at: input.startedAt ?? new Date().toISOString(),
    })
    .select('*')
    .single<PourRecord>();

  throwIfSupabaseError(error);
  return requireData(data, 'Unable to create pour.');
}

export async function completePour(pourId: string): Promise<PourRecord> {
  const timestamp = new Date().toISOString();
  const { data, error } = await supabase
    .from('pours')
    .update({
      status: 'completed',
      ended_at: timestamp,
      updated_at: timestamp,
    })
    .eq('id', pourId)
    .select('*')
    .single<PourRecord>();

  throwIfSupabaseError(error);
  return requireData(data, 'Unable to complete pour.');
}

export async function listLoadsForPour(jobId: string) {
  const { data, error } = await supabase
    .from('loads')
    .select('*')
    .eq('job_id', jobId)
    .order('sequence_number', { ascending: true })
    .returns<LoadRecord[]>();

  throwIfSupabaseError(error);
  return data ?? [];
}

export async function listActivityForPour(jobId: string) {
  const { data, error } = await supabase
    .from('activity_events')
    .select('*')
    .eq('job_id', jobId)
    .order('timestamp', { ascending: false })
    .returns<ActivityEventRecord[]>();

  throwIfSupabaseError(error);
  return data ?? [];
}

export async function listTicketsForPour(jobId: string) {
  const { data, error } = await supabase
    .from('trucking_tickets')
    .select('*')
    .eq('job_id', jobId)
    .order('delivered_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .returns<TruckingTicketRecord[]>();

  throwIfSupabaseError(error);
  return data ?? [];
}

export async function computeDashboardSummary(pour: PourRecord): Promise<DashboardSummary> {
  const { data, error } = await supabase
    .from('loads')
    .select('*')
    .eq('job_id', pour.id)
    .eq('status', 'completed')
    .returns<LoadRecord[]>();

  throwIfSupabaseError(error);
  return summarizeLoads(pour, data ?? []);
}

function summarizeLoads(pour: PourRecord, completedLoads: LoadRecord[]): DashboardSummary {
  const totalPoured = completedLoads.reduce((sum, load) => sum + load.yardage, 0);
  const remainingYardage = Math.max(pour.expected_yardage - totalPoured, 0);
  const rawProgress = pour.expected_yardage > 0 ? (totalPoured / pour.expected_yardage) * 100 : 0;
  const latestCompletedLoad = [...completedLoads]
    .filter((load) => load.completed_at)
    .sort((left, right) => (right.completed_at ?? '').localeCompare(left.completed_at ?? ''))[0];

  return {
    totalPoured,
    expectedYardage: pour.expected_yardage,
    remainingYardage,
    completedTruckCount: completedLoads.length,
    progressPercentage: Math.min(rawProgress, 100),
    lastCompletedAt: latestCompletedLoad?.completed_at ?? null,
  };
}
