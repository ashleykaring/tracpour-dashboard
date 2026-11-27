-- Clean-install schema for the user-owned Supabase implementation.
-- Apply only to a new, empty Supabase database. The current Railway backend is
-- incompatible with this schema; do not apply it to the running application.
begin;

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table public.pours (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  name text not null,
  expected_yardage double precision not null check (expected_yardage > 0),
  status text not null default 'active' check (status in ('active', 'completed')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  supplier_order_number text,
  supplier_plant_id text,
  supplier_plant_name text,
  supplier_name text,
  supplier_platform text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check (ended_at is null or ended_at >= started_at)
);

create unique index pours_one_active_per_user on public.pours(user_id) where status = 'active';
create index pours_user_status_idx on public.pours(user_id, status);

create table public.loads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  job_id uuid not null,
  sequence_number integer not null,
  status text not null check (status in ('completed', 'incomplete')),
  completed_at timestamptz,
  yardage double precision not null,
  yardage_source text not null check (yardage_source in ('default', 'actual')),
  created_at timestamptz not null default now(),
  unique (job_id, sequence_number),
  foreign key (job_id, user_id) references public.pours(id, user_id) on delete cascade
);
create index loads_user_job_idx on public.loads(user_id, job_id);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  job_id uuid not null,
  type text not null check (type in ('engine_start', 'engine_stop')),
  timestamp timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key (job_id, user_id) references public.pours(id, user_id) on delete cascade
);
create index activity_events_user_job_time_idx on public.activity_events(user_id, job_id, timestamp);

create table public.trucking_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  job_id uuid,
  status text not null check (status in ('available', 'pending')),
  truck_label text,
  ticket_number text,
  delivered_at timestamptz,
  yardage double precision,
  download_url text,
  created_at timestamptz not null default now(),
  foreign key (job_id, user_id) references public.pours(id, user_id) on delete set null (job_id)
);
create index tickets_user_job_idx on public.trucking_tickets(user_id, job_id);
create index tickets_user_job_number_idx on public.trucking_tickets(user_id, job_id, ticket_number);
create index tickets_user_job_url_idx on public.trucking_tickets(user_id, job_id, download_url);
create index tickets_user_unassigned_idx on public.trucking_tickets(user_id, created_at) where job_id is null;

-- Device creation, key rotation and revocation are trusted server operations.
create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  name text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  revoked_at timestamptz,
  unique (id, user_id)
);
create index devices_user_idx on public.devices(user_id);

-- Only a SHA-256 digest of a randomly generated device key is stored here.
-- This schema is not exposed to authenticated or anonymous clients.
create table private.device_credentials (
  device_id uuid primary key,
  user_id uuid not null references auth.users(id),
  key_hash bytea not null unique check (octet_length(key_hash) = 32),
  created_at timestamptz not null default now(),
  foreign key (device_id, user_id) references public.devices(id, user_id) on delete cascade
);
revoke all on private.device_credentials from public, anon, authenticated;
grant all on private.device_credentials to service_role;
alter table private.device_credentials enable row level security;

create table public.raw_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  device_id uuid not null,
  external_event_id uuid not null,
  job_id uuid,
  type text not null check (type in ('truck_enter', 'truck_leave', 'engine_start', 'engine_stop')),
  timestamp timestamptz not null,
  received_at timestamptz not null default now(),
  payload_json jsonb,
  processing_status text not null default 'pending'
    check (processing_status in ('pending', 'processed', 'unassigned', 'failed')),
  unique (device_id, external_event_id),
  foreign key (device_id, user_id) references public.devices(id, user_id),
  foreign key (job_id, user_id) references public.pours(id, user_id) on delete set null (job_id)
);
create index raw_events_user_job_idx on public.raw_events(user_id, job_id);
create index raw_events_user_time_idx on public.raw_events(user_id, timestamp);
create index raw_events_unprocessed_idx on public.raw_events(processing_status, received_at)
  where processing_status in ('pending', 'failed');

alter table public.pours enable row level security;
alter table public.loads enable row level security;
alter table public.activity_events enable row level security;
alter table public.trucking_tickets enable row level security;
alter table public.devices enable row level security;
alter table public.raw_events enable row level security;

-- Apply both USING and WITH CHECK so clients cannot read another user's rows,
-- insert a row for another user, or transfer ownership by updating user_id.
create policy pours_owner on public.pours for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy loads_owner on public.loads for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy activity_events_owner on public.activity_events for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy trucking_tickets_owner on public.trucking_tickets for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy devices_owner_read on public.devices for select to authenticated
  using ((select auth.uid()) = user_id);
create policy raw_events_owner_read on public.raw_events for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.pours, public.loads, public.activity_events, public.trucking_tickets,
  public.devices, public.raw_events from public, anon, authenticated;
grant select, insert, update, delete on public.pours, public.loads, public.activity_events,
  public.trucking_tickets to authenticated;
grant select on public.devices, public.raw_events to authenticated;
grant all on public.pours, public.loads, public.activity_events, public.trucking_tickets,
  public.devices, public.raw_events to service_role;

commit;
