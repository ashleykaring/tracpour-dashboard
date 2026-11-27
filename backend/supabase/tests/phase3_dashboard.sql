-- Run after user_owned_schema.sql and phase3_dashboard.sql in a disposable
-- Supabase project. All fixtures are rolled back.
begin;
insert into auth.users (id, email) values
  ('11000000-0000-0000-0000-000000000001', 'dashboard-a@example.invalid'),
  ('11000000-0000-0000-0000-000000000002', 'dashboard-b@example.invalid');
insert into public.trucking_tickets (user_id, status, ticket_number) values
  ('11000000-0000-0000-0000-000000000001', 'pending', 'a-ticket'),
  ('11000000-0000-0000-0000-000000000002', 'pending', 'b-ticket');

set local role authenticated;
select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"11000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
do $$
declare started public.pours;
begin
  started := public.start_user_pour('  A pour  ', 20);
  if started.user_id <> auth.uid() or started.name <> 'A pour' then raise exception 'Wrong pour owner or name'; end if;
  if not exists (select 1 from public.trucking_tickets where ticket_number = 'a-ticket' and job_id = started.id) then
    raise exception 'Own ticket was not attached';
  end if;
  begin
    perform public.start_user_pour('Second', 10);
    raise exception 'A second active pour was accepted';
  exception when unique_violation then null;
  end;
end $$;

select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claims', '{"sub":"11000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
do $$
declare started public.pours;
begin
  if not exists (select 1 from public.trucking_tickets where ticket_number = 'b-ticket' and job_id is null) then
    raise exception 'Another user''s ticket was attached';
  end if;
  started := public.start_user_pour('B pour', 10);
  if started.user_id <> auth.uid() then raise exception 'Wrong owner'; end if;
  if not exists (select 1 from public.trucking_tickets where ticket_number = 'b-ticket' and job_id = started.id) then
    raise exception 'User B''s ticket was not attached';
  end if;
end $$;

set local role anon;
do $$
begin
  begin
    perform public.start_user_pour('Anonymous', 10);
    raise exception 'Anonymous pour creation was accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
