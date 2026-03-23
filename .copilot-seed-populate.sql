do $$
declare
  v_barangay record;
  v_existing_beneficiaries integer;
  v_to_add integer;
  v_i integer;
  v_seq integer;
  v_slug text;
  v_clean_name text;
  v_email text;
  v_full_name text;
  v_user_id uuid;
  v_leader_count integer;
  v_coleader_count integer;
  v_target_coleaders integer := 2;
  v_password text := 'TempPass#2026';
  v_test_account_email text := 'testemail@att.com';
  v_test_account_password text := 'Testatt_12';
  v_test_account_name text := 'Smoke CoLeader';
  v_test_account_user_id uuid;
  v_test_account_barangay_id uuid;
begin
  -- Ensure a fixed test co-leader account exists for manual QA sign-in.
  select id into v_test_account_barangay_id
  from public.barangays
  where upper(name) = 'TAGAPO'
  limit 1;

  if v_test_account_barangay_id is null then
    select id into v_test_account_barangay_id
    from public.barangays
    order by name
    limit 1;
  end if;

  if v_test_account_barangay_id is not null then
    select id into v_test_account_user_id
    from auth.users
    where lower(email) = lower(v_test_account_email)
    limit 1;

    if v_test_account_user_id is null then
      insert into auth.users (
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        is_sso_user,
        is_anonymous
      )
      values (
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        v_test_account_email,
        crypt(v_test_account_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', v_test_account_name),
        now(),
        now(),
        false,
        false
      )
      returning id into v_test_account_user_id;
    else
      update auth.users
      set encrypted_password = crypt(v_test_account_password, gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          raw_user_meta_data = jsonb_set(
            coalesce(raw_user_meta_data, '{}'::jsonb),
            '{full_name}',
            to_jsonb(v_test_account_name::text),
            true
          ),
          updated_at = now()
      where id = v_test_account_user_id;
    end if;

    insert into public.profiles (id, full_name, role, barangay_id, email_verified)
    values (v_test_account_user_id, v_test_account_name, 'co-leader', v_test_account_barangay_id, true)
    on conflict (id) do update
    set full_name = excluded.full_name,
        role = 'co-leader',
        barangay_id = excluded.barangay_id,
        email_verified = true;
  end if;

  for v_barangay in
    select id, name
    from public.barangays
    order by name
  loop
    v_clean_name := lower(regexp_replace(v_barangay.name, '[^a-zA-Z0-9]+', '-', 'g'));
    v_clean_name := trim(both '-' from v_clean_name);
    v_slug := case when v_clean_name = '' then 'barangay' else v_clean_name end;

    -- Ensure exactly at least one leader per barangay.
    select count(*) into v_leader_count
    from public.profiles
    where barangay_id = v_barangay.id and role = 'leader';

    if v_leader_count < 1 then
      v_email := format('leader.%s@spes-seed.local', v_slug);
      v_full_name := format('SPES Leader %s', v_barangay.name);

      select id into v_user_id
      from auth.users
      where lower(email) = lower(v_email)
      limit 1;

      if v_user_id is null then
        insert into auth.users (
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at,
          is_sso_user,
          is_anonymous
        )
        values (
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          v_email,
          crypt(v_password, gen_salt('bf')),
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object('full_name', v_full_name),
          now(),
          now(),
          false,
          false
        )
        returning id into v_user_id;
      end if;

      insert into public.profiles (id, full_name, role, barangay_id, email_verified)
      values (v_user_id, v_full_name, 'leader', v_barangay.id, true)
      on conflict (id) do update
      set full_name = excluded.full_name,
          role = 'leader',
          barangay_id = excluded.barangay_id,
          email_verified = true;
    end if;

    -- Ensure 1-2 co-leaders per barangay; we standardize to 2 for complete coverage.
    select count(*) into v_coleader_count
    from public.profiles
    where barangay_id = v_barangay.id and role = 'co-leader';

    if v_coleader_count < v_target_coleaders then
      for v_i in (v_coleader_count + 1)..v_target_coleaders loop
        v_email := format('coleader%s.%s@spes-seed.local', v_i, v_slug);
        v_full_name := format('SPES Co-Leader %s %s', v_i, v_barangay.name);

        select id into v_user_id
        from auth.users
        where lower(email) = lower(v_email)
        limit 1;

        if v_user_id is null then
          insert into auth.users (
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            is_sso_user,
            is_anonymous
          )
          values (
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            v_email,
            crypt(v_password, gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('full_name', v_full_name),
            now(),
            now(),
            false,
            false
          )
          returning id into v_user_id;
        end if;

        insert into public.profiles (id, full_name, role, barangay_id, email_verified)
        values (v_user_id, v_full_name, 'co-leader', v_barangay.id, true)
        on conflict (id) do update
        set full_name = excluded.full_name,
            role = 'co-leader',
            barangay_id = excluded.barangay_id,
            email_verified = true;
      end loop;
    end if;

    -- Ensure 50 beneficiaries per barangay.
    select count(*) into v_existing_beneficiaries
    from public.beneficiaries
    where barangay_id = v_barangay.id;

    v_to_add := greatest(0, 50 - v_existing_beneficiaries);

    if v_to_add > 0 then
      for v_i in 1..v_to_add loop
        v_seq := v_existing_beneficiaries + v_i;

        insert into public.beneficiaries (
          last_name,
          first_name,
          middle_name,
          barangay_id,
          is_archived
        )
        values (
          format('%s-LN%03s', upper(left(regexp_replace(v_barangay.name, '[^A-Za-z0-9]', '', 'g'), 6)), v_seq),
          format('FN%03s', v_seq),
          format('MN%03s', v_seq),
          v_barangay.id,
          false
        );
      end loop;
    end if;
  end loop;

  -- Ensure all beneficiaries have QR metadata records.
  insert into public.beneficiary_qr_codes (beneficiary_ref, qr_value, qr_image_path)
  select ben.id, ben.beneficiary_id, ben.beneficiary_id || '.png'
  from public.beneficiaries ben
  left join public.beneficiary_qr_codes qr on qr.beneficiary_ref = ben.id
  where qr.id is null;
end;
$$;
