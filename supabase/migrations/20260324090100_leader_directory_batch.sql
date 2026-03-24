drop function if exists public.list_leader_directory();

drop function if exists public.list_leader_directory_public();

create or replace function public.list_leader_directory()
returns table (
  id uuid,
  full_name text,
  role text,
  program_batch text,
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
    p.program_batch,
    b.name as barangay_name,
    p.avatar_url
  from public.profiles p
  left join public.barangays b on b.id = p.barangay_id
  where p.role in ('leader', 'co-leader')
  order by p.full_name nulls last, p.created_at;
$$;

grant execute on function public.list_leader_directory() to authenticated, service_role;

create or replace function public.list_leader_directory_public()
returns table (
  id uuid,
  full_name text,
  role text,
  program_batch text,
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
    p.program_batch,
    b.name as barangay_name,
    p.avatar_url
  from public.profiles p
  left join public.barangays b on b.id = p.barangay_id
  where p.role in ('leader', 'co-leader')
  order by p.full_name nulls last, p.created_at;
$$;

grant execute on function public.list_leader_directory_public() to anon, authenticated, service_role;
