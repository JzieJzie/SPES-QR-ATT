create or replace function public.list_users_scoped()
returns table (
  id uuid,
  full_name text,
  role text,
  barangay_id uuid,
  barangay_name text,
  avatar_url text,
  email_verified boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  with me as (
    select role, barangay_id
    from public.profiles
    where id = auth.uid()
  )
  select
    p.id,
    p.full_name,
    p.role,
    p.barangay_id,
    b.name as barangay_name,
    p.avatar_url,
    p.email_verified,
    p.created_at,
    p.updated_at
  from public.profiles p
  left join public.barangays b on b.id = p.barangay_id
  cross join me
  where
    case
      when me.role = 'developer' then true
      when me.role in ('leader', 'co-leader') then p.barangay_id = me.barangay_id
      else p.id = auth.uid()
    end
  order by p.created_at;
$$;

grant execute on function public.list_users_scoped() to authenticated, service_role;
