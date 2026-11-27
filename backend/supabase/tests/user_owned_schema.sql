-- Run after user_owned_schema.sql against a disposable Supabase database as an
-- administrative role, e.g. psql -v ON_ERROR_STOP=1 -f this-file.sql.
-- The transaction rolls back all fixtures, including the two test users.
begin;

insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'schema-test-a@example.invalid'),
  ('10000000-0000-0000-0000-000000000002', 'schema-test-b@example.invalid');

insert into public.pours (id, user_id, name, expected_yardage) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'A', 10),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'B', 10);
insert into public.devices (id, user_id, name) values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'A device');
insert into private.device_credentials (device_id, user_id, key_hash) values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', decode(repeat('ab', 32), 'hex'));
insert into public.raw_events (user_id, device_id, external_event_id, type, timestamp, processing_status) values
  ('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   '40000000-0000-0000-0000-000000000001', 'engine_start', now(), 'unassigned');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

do $$
begin
  if (select count(*) from public.pours) <> 1
     or (select count(*) from public.devices) <> 1
     or (select count(*) from public.raw_events where job_id is null) <> 1 then
    raise exception 'User A cannot see exactly their own data';
  end if;

  insert into public.trucking_tickets (job_id, status, ticket_number)
    values ('20000000-0000-0000-0000-000000000001', 'pending', 'test-ticket');

  begin
    update public.pours set user_id = '10000000-0000-0000-0000-000000000002'
      where id = '20000000-0000-0000-0000-000000000001';
    raise exception 'Ownership transfer was accepted';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.pours (user_id, name, expected_yardage)
      values ('10000000-0000-0000-0000-000000000002', 'forged', 1);
    raise exception 'Forged user_id was accepted';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.pours (name, expected_yardage) values ('second active', 1);
    raise exception 'Second active pour was accepted';
  exception when unique_violation then null;
  end;

  begin
    insert into public.loads (job_id, sequence_number, status, yardage, yardage_source)
      values ('20000000-0000-0000-0000-000000000002', 1, 'completed', 1, 'actual');
    raise exception 'Cross-owner pour reference was accepted';
  exception when foreign_key_violation then null;
  end;

  begin
    perform key_hash from private.device_credentials;
    raise exception 'Device key hashes were exposed';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.devices set revoked_at = now();
    raise exception 'Device lifecycle allowed a direct client write';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.raw_events (user_id, device_id, external_event_id, type, timestamp)
      values ('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
              '40000000-0000-0000-0000-000000000002', 'engine_stop', now());
    raise exception 'Direct client event insertion was accepted';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
do $$
begin
  if (select count(*) from public.pours) <> 1
     or (select count(*) from public.devices) <> 0
     or (select count(*) from public.raw_events) <> 0 then
    raise exception 'User B can see another user''s data';
  end if;
  update public.pours set name = 'changed' where id = '20000000-0000-0000-0000-000000000001';
  if found then raise exception 'User B updated user A''s pour'; end if;
end $$;

reset role;
do $$
begin
  begin
    insert into public.raw_events (user_id, device_id, external_event_id, type, timestamp)
      values ('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
              '40000000-0000-0000-0000-000000000001', 'engine_start', now());
    raise exception 'Duplicate device event was accepted';
  exception when unique_violation then null;
  end;
  begin
    insert into public.raw_events (user_id, device_id, external_event_id, type, timestamp)
      values ('10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001',
              '40000000-0000-0000-0000-000000000003', 'engine_start', now());
    raise exception 'Cross-owner device reference was accepted';
  exception when foreign_key_violation then null;
  end;

  delete from public.pours where id = '20000000-0000-0000-0000-000000000001';
  if not exists (select 1 from public.trucking_tickets
                 where ticket_number = 'test-ticket' and job_id is null
                   and user_id = '10000000-0000-0000-0000-000000000001') then
    raise exception 'Deleting a pour did not preserve the unassigned ticket and its owner';
  end if;
end $$;

set local role anon;
do $$
begin
  begin
    perform id from public.pours;
    raise exception 'Anonymous read was accepted';
  exception when insufficient_privilege then null;
  end;
end $$;

rollback;
