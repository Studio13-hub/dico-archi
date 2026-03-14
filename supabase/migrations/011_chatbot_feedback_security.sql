-- 011_chatbot_feedback_security.sql
-- Table et securite du feedback chatbot.

begin;

create table if not exists public.chatbot_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  rating text not null check (rating in ('up', 'down')),
  user_message text,
  assistant_message text not null,
  page_path text,
  page_title text,
  source text not null default 'fallback' check (source in ('ai', 'fallback')),
  session_id text,
  meta jsonb not null default '{}'::jsonb
);

alter table public.chatbot_feedback
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists rating text,
  add column if not exists user_message text,
  add column if not exists assistant_message text,
  add column if not exists page_path text,
  add column if not exists page_title text,
  add column if not exists source text not null default 'fallback',
  add column if not exists session_id text,
  add column if not exists meta jsonb not null default '{}'::jsonb;

update public.chatbot_feedback
set source = 'fallback'
where source is null;

update public.chatbot_feedback
set meta = '{}'::jsonb
where meta is null;

alter table public.chatbot_feedback
  alter column rating type text
  using case
    when rating is null then null
    when rating::text in ('1', 'up', 'true') then 'up'
    when rating::text in ('-1', '0', 'down', 'false') then 'down'
    else lower(rating::text)
  end;

alter table public.chatbot_feedback
  alter column source set default 'fallback',
  alter column meta set default '{}'::jsonb;

alter table public.chatbot_feedback
  drop constraint if exists chatbot_feedback_rating_check,
  drop constraint if exists chatbot_feedback_source_check;

alter table public.chatbot_feedback
  add constraint chatbot_feedback_rating_check
  check (rating in ('up', 'down'));

alter table public.chatbot_feedback
  add constraint chatbot_feedback_source_check
  check (source in ('ai', 'fallback'));

create index if not exists chatbot_feedback_created_at_idx on public.chatbot_feedback (created_at desc);
create index if not exists chatbot_feedback_rating_idx on public.chatbot_feedback (rating);
create index if not exists chatbot_feedback_source_idx on public.chatbot_feedback (source);

alter table public.chatbot_feedback enable row level security;

drop policy if exists "super_admin_read_chatbot_feedback" on public.chatbot_feedback;
drop policy if exists "super_admin_delete_chatbot_feedback" on public.chatbot_feedback;

create policy "super_admin_read_chatbot_feedback"
on public.chatbot_feedback
for select
using (public.is_super_admin());

create policy "super_admin_delete_chatbot_feedback"
on public.chatbot_feedback
for delete
using (public.is_super_admin());

commit;
