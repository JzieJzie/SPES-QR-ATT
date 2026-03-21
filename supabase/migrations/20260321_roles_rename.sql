-- Rename role model:
-- admin -> leader
-- scanner -> co-leader
-- add developer with leader-level permissions

-- Update role data first.
update public.profiles
set role = case
  when role = 'admin' then 'leader'
  when role = 'scanner' then 'co-leader'
  when role in ('leader', 'co-leader', 'developer') then role
  else 'co-leader'
end;

-- Replace role check constraint with the new role set.
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles drop constraint profiles_role_check;
  end if;
end;
$$;

alter table public.profiles
  alter column role set default 'co-leader';

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('leader', 'co-leader', 'developer'));

-- New users default to co-leader.
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

-- Allow assigning all 3 roles.
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

-- Drop old policies.
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Admins can manage profiles" on public.profiles;
drop policy if exists "Authenticated can read barangays" on public.barangays;
drop policy if exists "Admins manage barangays" on public.barangays;
drop policy if exists "Authenticated can read beneficiaries" on public.beneficiaries;
drop policy if exists "Admins manage beneficiaries" on public.beneficiaries;
drop policy if exists "Authenticated can read qr metadata" on public.beneficiary_qr_codes;
drop policy if exists "Admins manage qr metadata" on public.beneficiary_qr_codes;
drop policy if exists "Scanner and admin can read events" on public.attendance_events;
drop policy if exists "Scanner and admin can insert events" on public.attendance_events;
drop policy if exists "Admins can update events" on public.attendance_events;
drop policy if exists "Scanner and admin can read daily" on public.attendance_daily;
drop policy if exists "Admins can manage daily" on public.attendance_daily;
drop policy if exists "Admins manage imports" on public.imports;
drop policy if exists "Admins read audit logs" on public.audit_logs;
drop policy if exists "System writes audit logs" on public.audit_logs;
drop policy if exists "Authenticated read QR files" on storage.objects;
drop policy if exists "Admins write QR files" on storage.objects;
drop policy if exists "Admins update QR files" on storage.objects;
drop policy if exists "Admins delete QR files" on storage.objects;

-- Drop new-name policies too, in case this migration is re-run.
drop policy if exists "Leaders and developers can manage profiles" on public.profiles;
drop policy if exists "Leaders and developers manage barangays" on public.barangays;
drop policy if exists "Leaders and developers manage beneficiaries" on public.beneficiaries;
drop policy if exists "Leaders and developers manage qr metadata" on public.beneficiary_qr_codes;
drop policy if exists "Co-leader leader and developer can read events" on public.attendance_events;
drop policy if exists "Co-leader leader and developer can insert events" on public.attendance_events;
drop policy if exists "Leaders and developers can update events" on public.attendance_events;
drop policy if exists "Co-leader leader and developer can read daily" on public.attendance_daily;
drop policy if exists "Leaders and developers can manage daily" on public.attendance_daily;
drop policy if exists "Leaders and developers manage imports" on public.imports;
drop policy if exists "Leaders and developers read audit logs" on public.audit_logs;
drop policy if exists "Leaders and developers write QR files" on storage.objects;
drop policy if exists "Leaders and developers update QR files" on storage.objects;
drop policy if exists "Leaders and developers delete QR files" on storage.objects;

-- Recreate policies with the new role model.
create policy "Users can read own profile"
on public.profiles for select
using (id = auth.uid() or public.current_role() in ('leader', 'developer'));

create policy "Leaders and developers can manage profiles"
on public.profiles for all
using (public.current_role() in ('leader', 'developer'))
with check (public.current_role() in ('leader', 'developer'));

create policy "Authenticated can read barangays"
on public.barangays for select
using (auth.uid() is not null);

create policy "Leaders and developers manage barangays"
on public.barangays for all
using (public.current_role() in ('leader', 'developer'))
with check (public.current_role() in ('leader', 'developer'));

create policy "Authenticated can read beneficiaries"
on public.beneficiaries for select
using (auth.uid() is not null);

create policy "Leaders and developers manage beneficiaries"
on public.beneficiaries for all
using (public.current_role() in ('leader', 'developer'))
with check (public.current_role() in ('leader', 'developer'));

create policy "Authenticated can read qr metadata"
on public.beneficiary_qr_codes for select
using (auth.uid() is not null);

create policy "Leaders and developers manage qr metadata"
on public.beneficiary_qr_codes for all
using (public.current_role() in ('leader', 'developer'))
with check (public.current_role() in ('leader', 'developer'));

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

create policy "Co-leader leader and developer can read daily"
on public.attendance_daily for select
using (public.current_role() in ('leader', 'co-leader', 'developer'));

create policy "Leaders and developers can manage daily"
on public.attendance_daily for all
using (public.current_role() in ('leader', 'developer'))
with check (public.current_role() in ('leader', 'developer'));

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
