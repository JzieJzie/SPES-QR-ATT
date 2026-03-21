-- Extensions
create extension if not exists pgcrypto;

-- Core tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'co-leader' check (role in ('leader', 'co-leader', 'developer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.barangays (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

create sequence if not exists public.beneficiary_id_seq start 1;

create or replace function public.generate_next_beneficiary_id()
returns text
language plpgsql
as $$
declare
  seq_value bigint;
begin
  seq_value := nextval('public.beneficiary_id_seq');
  return format('SPES-%s', lpad(seq_value::text, 4, '0'));
end;
$$;

create table if not exists public.beneficiaries (
  id uuid primary key default gen_random_uuid(),
  beneficiary_id text unique not null default public.generate_next_beneficiary_id(),
  last_name text not null,
  first_name text not null,
  middle_name text,
  barangay_id uuid not null references public.barangays(id),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.beneficiary_qr_codes (
  id uuid primary key default gen_random_uuid(),
  beneficiary_ref uuid not null unique references public.beneficiaries(id) on delete cascade,
  qr_value text not null unique,
  qr_image_path text not null,
  generated_at timestamptz not null default now()
);

create table if not exists public.attendance_events (
  id uuid primary key default gen_random_uuid(),
  beneficiary_ref uuid not null references public.beneficiaries(id),
  attendance_date date not null,
  scanned_at timestamptz not null,
  event_type text check (event_type in ('AM_IN', 'AM_OUT', 'PM_IN', 'PM_OUT')),
  session_name text check (session_name in ('MORNING', 'AFTERNOON')),
  is_late boolean not null default false,
  is_early_out boolean not null default false,
  is_extra_punch boolean not null default false,
  punch_sequence integer not null default 1,
  remarks text,
  scanned_by uuid references public.profiles(id),
  device_info text,
  status text not null default 'accepted' check (status in ('accepted', 'duplicate', 'invalid_window', 'manual', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_daily (
  id uuid primary key default gen_random_uuid(),
  beneficiary_ref uuid not null references public.beneficiaries(id),
  attendance_date date not null,
  am_time_in timestamptz,
  am_time_in_late boolean not null default false,
  am_time_out timestamptz,
  am_time_out_early boolean not null default false,
  pm_time_in timestamptz,
  pm_time_in_late boolean not null default false,
  pm_time_out timestamptz,
  pm_time_out_early boolean not null default false,
  extra_am_in_count integer not null default 0,
  extra_am_out_count integer not null default 0,
  extra_pm_in_count integer not null default 0,
  extra_pm_out_count integer not null default 0,
  remarks text,
  updated_at timestamptz not null default now(),
  unique (beneficiary_ref, attendance_date)
);

create table if not exists public.imports (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_type text not null,
  total_rows integer not null,
  success_rows integer not null,
  failed_rows integer not null,
  imported_by uuid references public.profiles(id),
  imported_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id),
  action text not null,
  entity_name text not null,
  entity_id text not null,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_beneficiaries_beneficiary_id on public.beneficiaries (beneficiary_id);
create index if not exists idx_beneficiaries_archived on public.beneficiaries (is_archived);
create index if not exists idx_attendance_events_ref_date on public.attendance_events (beneficiary_ref, attendance_date);
create index if not exists idx_attendance_events_scanned_at on public.attendance_events (scanned_at);
create index if not exists idx_attendance_events_status on public.attendance_events (status);
create index if not exists idx_attendance_daily_date on public.attendance_daily (attendance_date);
create index if not exists idx_imports_imported_at on public.imports (imported_at desc);
create index if not exists idx_audit_logs_entity on public.audit_logs (entity_name, entity_id);

-- Updated-at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_beneficiaries_updated_at on public.beneficiaries;
create trigger trg_beneficiaries_updated_at
before update on public.beneficiaries
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_attendance_daily_updated_at on public.attendance_daily;
create trigger trg_attendance_daily_updated_at
before update on public.attendance_daily
for each row execute procedure public.set_updated_at();

-- Auto profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'co-leader')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Recompute daily summary from raw events
create or replace function public.recompute_attendance_daily(
  p_beneficiary_ref uuid,
  p_attendance_date date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_daily_id uuid;
begin
  insert into public.attendance_daily (beneficiary_ref, attendance_date)
  values (p_beneficiary_ref, p_attendance_date)
  on conflict (beneficiary_ref, attendance_date) do update
  set updated_at = now()
  returning id into v_daily_id;

  with ranked as (
    select
      id,
      beneficiary_ref,
      attendance_date,
      scanned_at,
      event_type,
      is_late,
      is_early_out,
      row_number() over (partition by event_type order by scanned_at asc) as rn,
      case when event_type = 'AM_IN' and row_number() over (partition by event_type order by scanned_at asc) > 1 then 1 else 0 end as extra_am_in,
      case when event_type = 'AM_OUT' and row_number() over (partition by event_type order by scanned_at asc) > 1 then 1 else 0 end as extra_am_out,
      case when event_type = 'PM_IN' and row_number() over (partition by event_type order by scanned_at asc) > 1 then 1 else 0 end as extra_pm_in,
      case when event_type = 'PM_OUT' and row_number() over (partition by event_type order by scanned_at asc) > 1 then 1 else 0 end as extra_pm_out
    from public.attendance_events
    where beneficiary_ref = p_beneficiary_ref
      and attendance_date = p_attendance_date
      and status in ('accepted', 'duplicate', 'manual')
      and event_type is not null
  )
  update public.attendance_daily d
  set
    am_time_in = (select scanned_at from ranked where event_type = 'AM_IN' and rn = 1),
    am_time_in_late = coalesce((select is_late from ranked where event_type = 'AM_IN' and rn = 1), false),
    am_time_out = (select scanned_at from ranked where event_type = 'AM_OUT' and rn = 1),
    am_time_out_early = coalesce((select is_early_out from ranked where event_type = 'AM_OUT' and rn = 1), false),
    pm_time_in = (select scanned_at from ranked where event_type = 'PM_IN' and rn = 1),
    pm_time_in_late = coalesce((select is_late from ranked where event_type = 'PM_IN' and rn = 1), false),
    pm_time_out = (select scanned_at from ranked where event_type = 'PM_OUT' and rn = 1),
    pm_time_out_early = coalesce((select is_early_out from ranked where event_type = 'PM_OUT' and rn = 1), false),
    extra_am_in_count = coalesce((select sum(extra_am_in) from ranked), 0),
    extra_am_out_count = coalesce((select sum(extra_am_out) from ranked), 0),
    extra_pm_in_count = coalesce((select sum(extra_pm_in) from ranked), 0),
    extra_pm_out_count = coalesce((select sum(extra_pm_out) from ranked), 0),
    updated_at = now()
  where d.beneficiary_ref = p_beneficiary_ref and d.attendance_date = p_attendance_date;

  return v_daily_id;
end;
$$;

-- Scan processing with duplicate protection and deterministic windows
create or replace function public.record_attendance_scan(
  p_beneficiary_id text,
  p_device_info text default null
)
returns table (
  event_id uuid,
  status text,
  message text,
  event_type text,
  scanned_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_local_time time := (now() at time zone 'Asia/Manila')::time;
  v_attendance_date date := (now() at time zone 'Asia/Manila')::date;
  v_beneficiary public.beneficiaries%rowtype;
  v_event_type text := null;
  v_session_name text := null;
  v_is_late boolean := false;
  v_is_early_out boolean := false;
  v_status text := 'accepted';
  v_message text := 'Accepted';
  v_existing_scan timestamptz;
  v_punch_sequence integer := 1;
  v_is_extra boolean := false;
  v_event_id uuid;
  v_am_out timestamptz;
begin
  select * into v_beneficiary
  from public.beneficiaries
  where beneficiary_id = p_beneficiary_id;

  if not found then
    return query select null::uuid, 'rejected', 'Beneficiary not found', null::text, v_now;
    return;
  end if;

  if v_beneficiary.is_archived then
    insert into public.attendance_events (
      beneficiary_ref, attendance_date, scanned_at, status, remarks, device_info, scanned_by
    )
    values (
      v_beneficiary.id,
      v_attendance_date,
      v_now,
      'rejected',
      'Archived beneficiary',
      p_device_info,
      auth.uid()
    )
    returning id into v_event_id;

    return query select v_event_id, 'rejected', 'Archived beneficiary cannot be scanned', null::text, v_now;
    return;
  end if;

  select am_time_out into v_am_out
  from public.attendance_daily
  where beneficiary_ref = v_beneficiary.id and attendance_date = v_attendance_date;

  if v_local_time >= time '06:00:00' and v_local_time <= time '09:00:00' then
    v_event_type := 'AM_IN';
    v_session_name := 'MORNING';
    v_is_late := v_local_time >= time '07:21:00';
    v_message := case when v_is_late then 'Late AM time-in' else 'On-time AM time-in' end;
  elsif v_local_time > time '09:00:00' and v_local_time < time '12:00:00' then
    v_event_type := 'AM_OUT';
    v_session_name := 'MORNING';
    v_is_early_out := v_local_time < time '11:50:00';
    v_message := case when v_is_early_out then 'Early AM time-out' else 'Regular AM time-out' end;
  elsif v_local_time >= time '12:00:00' and v_local_time <= time '12:30:00' then
    if v_am_out is null then
      v_event_type := 'AM_OUT';
      v_session_name := 'MORNING';
      v_message := 'Regular AM time-out';
    else
      v_event_type := 'PM_IN';
      v_session_name := 'AFTERNOON';
      v_is_late := v_local_time >= time '13:21:00';
      v_message := case when v_is_late then 'Late PM time-in' else 'On-time PM time-in' end;
    end if;
  elsif v_local_time > time '12:30:00' and v_local_time <= time '15:00:00' then
    v_event_type := 'PM_IN';
    v_session_name := 'AFTERNOON';
    v_is_late := v_local_time >= time '13:21:00';
    v_message := case when v_is_late then 'Late PM time-in' else 'On-time PM time-in' end;
  elsif v_local_time > time '15:00:00' and v_local_time <= time '18:00:00' then
    v_event_type := 'PM_OUT';
    v_session_name := 'AFTERNOON';
    v_is_early_out := v_local_time < time '16:50:00';
    v_message := case when v_is_early_out then 'Early PM time-out' else 'Regular PM time-out' end;
  else
    v_status := 'invalid_window';
    v_message := 'Invalid scan window';
  end if;

  if v_status = 'accepted' then
    select e.scanned_at into v_existing_scan
    from public.attendance_events e
    where e.beneficiary_ref = v_beneficiary.id
      and e.attendance_date = v_attendance_date
      and e.event_type = v_event_type
    order by e.scanned_at desc
    limit 1;

    if v_existing_scan is not null and extract(epoch from (v_now - v_existing_scan)) <= 10 then
      v_status := 'duplicate';
      v_message := 'Duplicate scan';
      v_is_extra := true;
    end if;

    select count(*) + 1 into v_punch_sequence
    from public.attendance_events e
    where e.beneficiary_ref = v_beneficiary.id
      and e.attendance_date = v_attendance_date
      and e.event_type = v_event_type;

    if v_punch_sequence > 1 then
      v_is_extra := true;
      if v_status = 'accepted' then
        v_message := 'Re-entry';
      end if;
    end if;
  end if;

  insert into public.attendance_events (
    beneficiary_ref,
    attendance_date,
    scanned_at,
    event_type,
    session_name,
    is_late,
    is_early_out,
    is_extra_punch,
    punch_sequence,
    remarks,
    scanned_by,
    device_info,
    status
  )
  values (
    v_beneficiary.id,
    v_attendance_date,
    v_now,
    v_event_type,
    v_session_name,
    v_is_late,
    v_is_early_out,
    v_is_extra,
    v_punch_sequence,
    case when v_status = 'invalid_window' then 'Manual adjustment required' else v_message end,
    auth.uid(),
    p_device_info,
    v_status
  )
  returning id into v_event_id;

  if v_status in ('accepted', 'duplicate', 'manual') and v_event_type is not null then
    perform public.recompute_attendance_daily(v_beneficiary.id, v_attendance_date);
  end if;

  return query select v_event_id, v_status, v_message, v_event_type, v_now;
end;
$$;

create or replace function public.today_attendance_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.attendance_events
  where attendance_date = (now() at time zone 'Asia/Manila')::date
    and status = 'accepted';
$$;

create or replace function public.set_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_role not in ('leader', 'co-leader', 'developer') then
    raise exception 'Invalid role';
  end if;

  update public.profiles
  set role = p_role
  where id = p_user_id;

  insert into public.audit_logs (actor_user_id, action, entity_name, entity_id, new_values)
  values (auth.uid(), 'set_role', 'profiles', p_user_id::text, jsonb_build_object('role', p_role));
end;
$$;

-- Storage bucket for QR codes
insert into storage.buckets (id, name, public)
values ('qr-codes', 'qr-codes', false)
on conflict (id) do nothing;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.barangays enable row level security;
alter table public.beneficiaries enable row level security;
alter table public.beneficiary_qr_codes enable row level security;
alter table public.attendance_events enable row level security;
alter table public.attendance_daily enable row level security;
alter table public.imports enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Profiles
create policy "Users can read own profile"
on public.profiles for select
using (id = auth.uid() or public.current_role() in ('leader', 'developer'));

create policy "Leaders and developers can manage profiles"
on public.profiles for all
using (public.current_role() in ('leader', 'developer'))
with check (public.current_role() in ('leader', 'developer'));

-- Barangays
create policy "Authenticated can read barangays"
on public.barangays for select
using (auth.uid() is not null);

create policy "Leaders and developers manage barangays"
on public.barangays for all
using (public.current_role() in ('leader', 'developer'))
with check (public.current_role() in ('leader', 'developer'));

-- Beneficiaries
create policy "Authenticated can read beneficiaries"
on public.beneficiaries for select
using (auth.uid() is not null);

create policy "Leaders and developers manage beneficiaries"
on public.beneficiaries for all
using (public.current_role() in ('leader', 'developer'))
with check (public.current_role() in ('leader', 'developer'));

-- QR codes
create policy "Authenticated can read qr metadata"
on public.beneficiary_qr_codes for select
using (auth.uid() is not null);

create policy "Leaders and developers manage qr metadata"
on public.beneficiary_qr_codes for all
using (public.current_role() in ('leader', 'developer'))
with check (public.current_role() in ('leader', 'developer'));

-- Attendance events
create policy "Co-leader leader and developer can read events"
on public.attendance_events for select
using (public.current_role() in ('leader', 'co-leader', 'developer'));

create policy "Co-leader leader and developer can insert events"
on public.attendance_events for insert
with check (public.current_role() in ('leader', 'co-leader', 'developer'));

create policy "Leaders and developers can update events"
on public.attendance_events for update
using (public.current_role() in ('leader', 'developer'))
with check (public.current_role() in ('leader', 'developer'));

-- Attendance daily
create policy "Co-leader leader and developer can read daily"
on public.attendance_daily for select
using (public.current_role() in ('leader', 'co-leader', 'developer'));

create policy "Leaders and developers can manage daily"
on public.attendance_daily for all
using (public.current_role() in ('leader', 'developer'))
with check (public.current_role() in ('leader', 'developer'));

-- Imports and audit
create policy "Leaders and developers manage imports"
on public.imports for all
using (public.current_role() in ('leader', 'developer'))
with check (public.current_role() in ('leader', 'developer'));

create policy "Leaders and developers read audit logs"
on public.audit_logs for select
using (public.current_role() in ('leader', 'developer'));

create policy "System writes audit logs"
on public.audit_logs for insert
with check (auth.uid() is not null);

-- Storage policies
create policy "Authenticated read QR files"
on storage.objects for select
using (bucket_id = 'qr-codes' and auth.role() = 'authenticated');

create policy "Leaders and developers write QR files"
on storage.objects for insert
with check (
  bucket_id = 'qr-codes'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role in ('leader', 'developer')
  )
);

create policy "Leaders and developers update QR files"
on storage.objects for update
using (
  bucket_id = 'qr-codes'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role in ('leader', 'developer')
  )
)
with check (
  bucket_id = 'qr-codes'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role in ('leader', 'developer')
  )
);

create policy "Leaders and developers delete QR files"
on storage.objects for delete
using (
  bucket_id = 'qr-codes'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role in ('leader', 'developer')
  )
);

-- Grants
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to authenticated, service_role;
grant all on all sequences in schema public to authenticated, service_role;
grant execute on function public.record_attendance_scan(text, text) to authenticated, service_role;
grant execute on function public.recompute_attendance_daily(uuid, date) to authenticated, service_role;
grant execute on function public.set_user_role(uuid, text) to authenticated, service_role;
grant execute on function public.today_attendance_count() to authenticated, service_role;
