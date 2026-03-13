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

drop policy if exists "editors can read audit logs" on public.audit_logs;
drop policy if exists "staff can read audit logs" on public.audit_logs;
create policy "staff can read audit logs"
  on public.audit_logs for select
  using (public.is_staff());

drop policy if exists "editors can insert audit logs" on public.audit_logs;
drop policy if exists "staff can insert audit logs" on public.audit_logs;
create policy "staff can insert audit logs"
  on public.audit_logs for insert
  with check (public.is_staff());
