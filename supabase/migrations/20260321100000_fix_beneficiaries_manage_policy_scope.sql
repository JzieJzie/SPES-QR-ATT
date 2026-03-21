-- Prevent write policy from unintentionally broadening SELECT access.
-- The previous FOR ALL policy allowed leaders to read all barangays.

drop policy if exists "Leaders and developers manage beneficiaries" on public.beneficiaries;

create policy "Leaders and developers insert beneficiaries"
  on public.beneficiaries
  for insert
  with check (public.current_role() = any (array['leader', 'developer']));

create policy "Leaders and developers update beneficiaries"
  on public.beneficiaries
  for update
  using (public.current_role() = any (array['leader', 'developer']))
  with check (public.current_role() = any (array['leader', 'developer']));

create policy "Leaders and developers delete beneficiaries"
  on public.beneficiaries
  for delete
  using (public.current_role() = any (array['leader', 'developer']));
