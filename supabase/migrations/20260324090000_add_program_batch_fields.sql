alter table public.profiles
  add column if not exists program_batch text;

alter table public.profiles
  drop constraint if exists profiles_program_batch_check;

alter table public.profiles
  add constraint profiles_program_batch_check
  check (program_batch is null or program_batch in ('batch1', 'batch2'));

update public.profiles
set program_batch = 'batch1'
where role in ('leader', 'co-leader')
  and program_batch is null;

alter table public.beneficiaries
  add column if not exists program_batch text;

update public.beneficiaries
set program_batch = 'batch1'
where program_batch is null;

alter table public.beneficiaries
  alter column program_batch set default 'batch1';

alter table public.beneficiaries
  alter column program_batch set not null;

alter table public.beneficiaries
  drop constraint if exists beneficiaries_program_batch_check;

alter table public.beneficiaries
  add constraint beneficiaries_program_batch_check
  check (program_batch in ('batch1', 'batch2'));

create index if not exists idx_beneficiaries_program_batch
  on public.beneficiaries (program_batch);

alter table public.imports
  add column if not exists program_batch text;

alter table public.imports
  drop constraint if exists imports_program_batch_check;

alter table public.imports
  add constraint imports_program_batch_check
  check (program_batch is null or program_batch in ('batch1', 'batch2'));
