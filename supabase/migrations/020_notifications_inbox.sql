begin;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  severity text not null default 'info',
  title text not null,
  body text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_label text,
  related_table text,
  related_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_kind_not_blank check (btrim(kind) <> ''),
  constraint notifications_title_not_blank check (btrim(title) <> ''),
  constraint notifications_body_not_blank check (btrim(body) <> ''),
  constraint notifications_severity_check check (severity in ('info', 'success', 'warning', 'danger'))
);

alter table public.notifications add column if not exists severity text not null default 'info';
alter table public.notifications add column if not exists actor_id uuid references public.profiles(id) on delete set null;
alter table public.notifications add column if not exists actor_label text;
alter table public.notifications add column if not exists metadata jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notifications_severity_check'
  ) then
    alter table public.notifications
      add constraint notifications_severity_check
      check (severity in ('info', 'success', 'warning', 'danger'));
  end if;
end
$$;

create index if not exists notifications_recipient_idx
  on public.notifications(recipient_id, created_at desc);

create index if not exists notifications_related_idx
  on public.notifications(related_table, related_id);

create index if not exists notifications_actor_idx
  on public.notifications(actor_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "recipient_read_own_notifications" on public.notifications;
drop policy if exists "recipient_update_own_notifications" on public.notifications;
drop policy if exists "staff_insert_notifications" on public.notifications;

create policy "recipient_read_own_notifications"
on public.notifications
for select
using (
  recipient_id = auth.uid()
  or public.is_staff()
);

create policy "recipient_update_own_notifications"
on public.notifications
for update
using (
  recipient_id = auth.uid()
  or public.is_staff()
)
with check (
  recipient_id = auth.uid()
  or public.is_staff()
);

create policy "staff_insert_notifications"
on public.notifications
for insert
with check (public.is_staff());

commit;
