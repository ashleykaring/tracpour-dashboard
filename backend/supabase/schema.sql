create extension if not exists pgcrypto;

create table if not exists public.pours (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  expected_yardage double precision not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pours_status on public.pours(status);

create table if not exists public.loads (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.pours(id) on delete cascade,
  sequence_number integer not null,
  status text not null check (status in ('completed', 'incomplete')),
  completed_at timestamptz,
  yardage double precision not null,
  yardage_source text not null check (yardage_source in ('default', 'actual')),
  created_at timestamptz not null default now(),
  unique (job_id, sequence_number)
);

create index if not exists idx_loads_job_id on public.loads(job_id);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.pours(id) on delete cascade,
  type text not null check (type in ('engine_start', 'engine_stop')),
  timestamp timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_events_job_time on public.activity_events(job_id, timestamp);

create table if not exists public.trucking_tickets (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.pours(id) on delete set null,
  status text not null check (status in ('available', 'pending')),
  truck_label text,
  ticket_number text,
  delivered_at timestamptz,
  yardage double precision,
  download_url text,
  created_at timestamptz not null default now()
);

alter table public.trucking_tickets alter column job_id drop not null;
alter table public.trucking_tickets drop constraint if exists trucking_tickets_job_id_fkey;
alter table public.trucking_tickets
  add constraint trucking_tickets_job_id_fkey
  foreign key (job_id) references public.pours(id) on delete set null;

create index if not exists idx_trucking_tickets_job_id on public.trucking_tickets(job_id);
create index if not exists idx_trucking_tickets_job_ticket_number on public.trucking_tickets(job_id, ticket_number);
create index if not exists idx_trucking_tickets_unassigned_recent
  on public.trucking_tickets(created_at)
  where job_id is null;

create table if not exists public.raw_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.pours(id) on delete set null,
  type text not null check (type in ('truck_enter', 'truck_leave', 'engine_start', 'engine_stop')),
  timestamp timestamptz not null,
  received_at timestamptz not null default now(),
  payload_json jsonb
);

create index if not exists idx_raw_events_job_id on public.raw_events(job_id);
create index if not exists idx_raw_events_timestamp on public.raw_events(timestamp);

alter table public.pours enable row level security;
alter table public.loads enable row level security;
alter table public.activity_events enable row level security;
alter table public.trucking_tickets enable row level security;
alter table public.raw_events enable row level security;

grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

alter default privileges in schema public grant all privileges on tables to service_role;
alter default privileges in schema public grant all privileges on sequences to service_role;
