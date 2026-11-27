-- Apply after user_owned_schema.sql. This operation runs as the authenticated
-- caller, so table grants, RLS, and the per-user active-pour constraint apply.
begin;

create function public.start_user_pour(
  p_name text,
  p_expected_yardage double precision,
  p_started_at timestamptz default null,
  p_supplier_order_number text default null,
  p_supplier_plant_id text default null,
  p_supplier_plant_name text default null,
  p_supplier_name text default null,
  p_supplier_platform text default null
)
returns public.pours
language plpgsql security invoker set search_path = '' as $$
declare
  result public.pours;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_name is null or length(btrim(p_name)) = 0 or length(p_name) > 200
     or p_expected_yardage is null or p_expected_yardage <= 0
     or p_expected_yardage in ('NaN'::double precision, 'Infinity'::double precision, '-Infinity'::double precision) then
    raise exception 'Invalid pour details' using errcode = '22023';
  end if;

  insert into public.pours (name, expected_yardage, started_at, supplier_order_number,
    supplier_plant_id, supplier_plant_name, supplier_name, supplier_platform)
  values (btrim(p_name), p_expected_yardage, coalesce(p_started_at, now()),
    nullif(btrim(p_supplier_order_number), ''), nullif(btrim(p_supplier_plant_id), ''),
    nullif(btrim(p_supplier_plant_name), ''), nullif(btrim(p_supplier_name), ''),
    nullif(btrim(p_supplier_platform), ''))
  returning * into result;

  update public.trucking_tickets set job_id = result.id
    where user_id = auth.uid() and job_id is null and created_at >= now() - interval '24 hours';
  return result;
end $$;

revoke all on function public.start_user_pour(text, double precision, timestamptz, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.start_user_pour(text, double precision, timestamptz, text, text, text, text, text)
  to authenticated;

commit;
