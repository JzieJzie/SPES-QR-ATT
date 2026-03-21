create or replace function public.public_dashboard_counts()
returns table (
  active_beneficiaries bigint,
  archived_beneficiaries bigint,
  today_accepted_scans bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from public.beneficiaries b where b.is_archived = false) as active_beneficiaries,
    (select count(*) from public.beneficiaries b where b.is_archived = true) as archived_beneficiaries,
    (select public.today_attendance_count()) as today_accepted_scans;
$$;

grant execute on function public.public_dashboard_counts() to anon, authenticated, service_role;

create or replace function public.list_leader_directory_public()
returns table (
  id uuid,
  full_name text,
  role text,
  barangay_name text,
  avatar_url text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    p.role,
    b.name as barangay_name,
    p.avatar_url
  from public.profiles p
  left join public.barangays b on b.id = p.barangay_id
  where p.role in ('leader', 'co-leader')
  order by p.full_name nulls last, p.created_at;
$$;

grant execute on function public.list_leader_directory_public() to anon, authenticated, service_role;
