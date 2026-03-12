alter table public.term_submissions
  add column if not exists status text default 'pending',
  add column if not exists reviewer_comment text,
  add column if not exists submitter_email text,
  add column if not exists reviewed_at timestamptz;

-- Les editeurs peuvent mettre a jour les propositions
drop policy if exists "editors can update submissions" on public.term_submissions;
drop policy if exists "staff can update submissions" on public.term_submissions;
create policy "staff can update submissions"
  on public.term_submissions for update
  using (public.is_staff())
  with check (public.is_staff());

-- Les auteurs peuvent voir leurs propositions
drop policy if exists "submitters can read own submissions" on public.term_submissions;
create policy "submitters can read own submissions"
  on public.term_submissions for select
  using (auth.uid() = submitted_by);
