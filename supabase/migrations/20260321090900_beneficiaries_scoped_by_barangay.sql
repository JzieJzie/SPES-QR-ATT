drop policy if exists "Authenticated can read beneficiaries" on public.beneficiaries;

create policy "Authenticated can read beneficiaries"
on public.beneficiaries for select
using (
  auth.uid() is not null
  and (
    public.current_role() = 'developer'
    or (
      public.current_role() in ('leader', 'co-leader')
      and barangay_id = (
        select p.barangay_id
        from public.profiles p
        where p.id = auth.uid()
      )
    )
  )
);
