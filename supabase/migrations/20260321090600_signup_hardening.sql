create table if not exists public.signup_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  ip_address text not null,
  requested_role text not null check (requested_role in ('leader', 'co-leader')),
  created_at timestamptz not null default now()
);

create index if not exists idx_signup_attempts_created_at on public.signup_attempts (created_at desc);
create index if not exists idx_signup_attempts_ip_created_at on public.signup_attempts (ip_address, created_at desc);
create index if not exists idx_signup_attempts_email_created_at on public.signup_attempts (email, created_at desc);

alter table public.signup_attempts enable row level security;

grant all on table public.signup_attempts to service_role;
