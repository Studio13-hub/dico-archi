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
