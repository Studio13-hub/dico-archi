alter table public.term_submissions
  add column if not exists status text default 'pending',
  add column if not exists reviewer_comment text,
  add column if not exists submitter_email text,
  add column if not exists reviewed_at timestamptz;

-- Les editeurs peuvent mettre a jour les propositions
create policy "editors can update submissions"
  on public.term_submissions for update
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_editor
  ));

-- Les auteurs peuvent voir leurs propositions
create policy "submitters can read own submissions"
  on public.term_submissions for select
  using (auth.uid() = submitted_by);
