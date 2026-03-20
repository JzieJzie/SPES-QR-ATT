insert into public.barangays (name)
values
  ('APLAYA'),
  ('BALIBAGO'),
  ('TAGAPO')
on conflict (name) do nothing;

insert into public.beneficiaries (last_name, first_name, middle_name, barangay_id)
select 'SANTOS', 'MARIA', 'LOPEZ', b.id from public.barangays b where b.name = 'APLAYA'
on conflict do nothing;

insert into public.beneficiaries (last_name, first_name, middle_name, barangay_id)
select 'DELA CRUZ', 'JUAN', 'RAMOS', b.id from public.barangays b where b.name = 'BALIBAGO'
on conflict do nothing;

insert into public.beneficiary_qr_codes (beneficiary_ref, qr_value, qr_image_path)
select ben.id, ben.beneficiary_id, ben.beneficiary_id || '.png'
from public.beneficiaries ben
left join public.beneficiary_qr_codes qr on qr.beneficiary_ref = ben.id
where qr.id is null;
