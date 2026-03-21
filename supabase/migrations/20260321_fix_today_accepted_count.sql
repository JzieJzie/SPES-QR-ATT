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
