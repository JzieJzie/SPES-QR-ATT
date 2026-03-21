do $$
declare
  v_tagapo_id uuid;
  v_upper_tagapo_id uuid;
begin
  select id into v_tagapo_id from public.barangays where name = 'Tagapo' limit 1;
  select id into v_upper_tagapo_id from public.barangays where name = 'TAGAPO' limit 1;

  if v_tagapo_id is null then
    raise exception 'Tagapo not found';
  end if;

  if v_upper_tagapo_id is null then
    raise notice 'No TAGAPO duplicate found';
    return;
  end if;

  update public.profiles
  set barangay_id = v_tagapo_id
  where barangay_id = v_upper_tagapo_id;

  update public.beneficiaries
  set barangay_id = v_tagapo_id
  where barangay_id = v_upper_tagapo_id;

  delete from public.barangays
  where id = v_upper_tagapo_id;
end
$$;