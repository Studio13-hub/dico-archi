create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  entity text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

alter table public.audit_logs enable row level security;

create policy "editors can read audit logs"
  on public.audit_logs for select
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_editor
  ));

create policy "editors can insert audit logs"
  on public.audit_logs for insert
  with check (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_editor
  ));
