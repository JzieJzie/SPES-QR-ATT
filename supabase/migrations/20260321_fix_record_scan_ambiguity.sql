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
    from public.attendance_events
    where beneficiary_ref = v_beneficiary.id
      and attendance_date = v_attendance_date
      and event_type = v_event_type;

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
