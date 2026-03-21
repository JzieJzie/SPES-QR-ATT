alter table public.profiles
  add column if not exists barangay_id uuid references public.barangays(id),
  add column if not exists avatar_url text,
  add column if not exists email_verified boolean not null default false;

create table if not exists public.email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_verification_tokens_user_id
  on public.email_verification_tokens(user_id);

create index if not exists idx_email_verification_tokens_expires_at
  on public.email_verification_tokens(expires_at)
  where used_at is null;

create or replace function public.update_my_profile(
  p_full_name text,
  p_barangay_id uuid,
  p_avatar_url text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.profiles
  set
    full_name = nullif(trim(p_full_name), ''),
    barangay_id = p_barangay_id,
    avatar_url = p_avatar_url
  where id = auth.uid();
end;
$$;

insert into storage.buckets (id, name, public)
values ('profile-pictures', 'profile-pictures', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated can read profile pictures" on storage.objects;
create policy "Authenticated can read profile pictures"
on storage.objects for select
using (bucket_id = 'profile-pictures' and auth.role() = 'authenticated');

drop policy if exists "Users can upload own profile picture" on storage.objects;
create policy "Users can upload own profile picture"
on storage.objects for insert
with check (
  bucket_id = 'profile-pictures'
  and auth.uid() is not null
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can update own profile picture" on storage.objects;
create policy "Users can update own profile picture"
on storage.objects for update
using (
  bucket_id = 'profile-pictures'
  and auth.uid() is not null
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'profile-pictures'
  and auth.uid() is not null
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can delete own profile picture" on storage.objects;
create policy "Users can delete own profile picture"
on storage.objects for delete
using (
  bucket_id = 'profile-pictures'
  and auth.uid() is not null
  and split_part(name, '/', 1) = auth.uid()::text
);

grant all on table public.email_verification_tokens to service_role;
grant execute on function public.update_my_profile(text, uuid, text) to authenticated, service_role;
