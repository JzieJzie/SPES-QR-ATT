create or replace function public.list_leader_directory()
returns table (
  id uuid,
  full_name text,
  role text,
  barangay_name text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    p.role,
    b.name as barangay_name
  from public.profiles p
  left join public.barangays b on b.id = p.barangay_id
  where p.role in ('leader', 'co-leader')
  order by p.full_name nulls last, p.created_at;
$$;

grant execute on function public.list_leader_directory() to authenticated, service_role;
