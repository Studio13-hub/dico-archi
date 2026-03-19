begin;

alter table public.term_submissions
  drop constraint if exists term_submissions_status_check;

alter table public.term_submissions
  add constraint term_submissions_status_check
  check (status in ('draft', 'submitted', 'validated', 'rejected', 'accepted', 'resubmitted'));

drop policy if exists "submitter_update_own_submission" on public.term_submissions;

create policy "submitter_update_own_submission"
on public.term_submissions
for update
using (
  submitted_by = auth.uid()
  and status in ('draft', 'submitted', 'rejected')
)
with check (
  submitted_by = auth.uid()
  and status in ('draft', 'submitted', 'rejected', 'resubmitted')
);

commit;
