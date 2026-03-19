begin;

create table if not exists public.submission_messages (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.term_submissions(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  audience text not null default 'internal',
  body text not null,
  created_at timestamptz not null default now(),
  constraint submission_messages_audience_check check (audience in ('internal', 'submitter')),
  constraint submission_messages_body_not_blank check (btrim(body) <> '')
);

create index if not exists submission_messages_submission_idx
  on public.submission_messages(submission_id, created_at asc);

create index if not exists submission_messages_author_idx
  on public.submission_messages(author_id, created_at desc);

alter table public.submission_messages enable row level security;

drop policy if exists "staff_read_submission_messages" on public.submission_messages;
drop policy if exists "submitter_read_own_submission_messages" on public.submission_messages;
drop policy if exists "staff_insert_submission_messages" on public.submission_messages;
drop policy if exists "submitter_insert_own_submission_messages" on public.submission_messages;

create policy "staff_read_submission_messages"
on public.submission_messages
for select
using (public.is_staff());

create policy "submitter_read_own_submission_messages"
on public.submission_messages
for select
using (
  exists (
    select 1
    from public.term_submissions s
    where s.id = public.submission_messages.submission_id
      and s.submitted_by = auth.uid()
      and public.submission_messages.audience = 'submitter'
  )
);

create policy "staff_insert_submission_messages"
on public.submission_messages
for insert
with check (
  public.is_staff()
  and author_id = auth.uid()
);

create policy "submitter_insert_own_submission_messages"
on public.submission_messages
for insert
with check (
  author_id = auth.uid()
  and audience = 'submitter'
  and exists (
    select 1
    from public.term_submissions s
    where s.id = public.submission_messages.submission_id
      and s.submitted_by = auth.uid()
  )
);

commit;
