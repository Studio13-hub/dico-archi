-- 007_security_rls_core.sql
-- Active RLS sur les tables core et pose les policies canoniques.

begin;

-- 1. Activer RLS partout sur le core
alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.terms enable row level security;
alter table public.media enable row level security;
alter table public.term_relations enable row level security;
alter table public.term_submissions enable row level security;
alter table public.audit_logs enable row level security;

-- 2. Categories
drop policy if exists "public_read_categories" on public.categories;
drop policy if exists "staff_manage_categories" on public.categories;

create policy "public_read_categories"
on public.categories
for select
using (true);

create policy "staff_manage_categories"
on public.categories
for all
using (public.is_staff())
with check (public.is_staff());

-- 3. Profiles
drop policy if exists "user_read_own_profile" on public.profiles;
drop policy if exists "user_update_own_profile" on public.profiles;
drop policy if exists "super_admin_manage_profiles" on public.profiles;

create policy "user_read_own_profile"
on public.profiles
for select
using (
  id = auth.uid()
  or public.is_super_admin()
);

create policy "user_update_own_profile"
on public.profiles
for update
using (
  id = auth.uid()
  or public.is_super_admin()
)
with check (
  id = auth.uid()
  or public.is_super_admin()
);

create policy "super_admin_manage_profiles"
on public.profiles
for all
using (public.is_super_admin())
with check (public.is_super_admin());

-- 4. Terms
drop policy if exists "public_read_published_terms" on public.terms;
drop policy if exists "staff_manage_terms" on public.terms;

create policy "public_read_published_terms"
on public.terms
for select
using (
  status = 'published'
  or public.is_staff()
);

create policy "staff_manage_terms"
on public.terms
for all
using (public.is_staff())
with check (public.is_staff());

-- 5. Media
drop policy if exists "public_read_media_for_published_terms" on public.media;
drop policy if exists "staff_manage_media" on public.media;

create policy "public_read_media_for_published_terms"
on public.media
for select
using (
  exists (
    select 1
    from public.terms t
    where t.id = public.media.term_id
      and (
        t.status = 'published'
        or public.is_staff()
      )
  )
);

create policy "staff_manage_media"
on public.media
for all
using (public.is_staff())
with check (public.is_staff());

-- 6. Term relations
drop policy if exists "public_read_term_relations_for_published_terms" on public.term_relations;
drop policy if exists "staff_manage_term_relations" on public.term_relations;

create policy "public_read_term_relations_for_published_terms"
on public.term_relations
for select
using (
  exists (
    select 1
    from public.terms src
    join public.terms dst on dst.id = public.term_relations.target_term_id
    where src.id = public.term_relations.source_term_id
      and src.status = 'published'
      and dst.status = 'published'
  )
  or public.is_staff()
);

create policy "staff_manage_term_relations"
on public.term_relations
for all
using (public.is_staff())
with check (public.is_staff());

-- 7. Term submissions
drop policy if exists "authenticated_insert_own_submission" on public.term_submissions;
drop policy if exists "submitter_read_own_submission" on public.term_submissions;
drop policy if exists "submitter_update_own_submission" on public.term_submissions;
drop policy if exists "staff_read_all_submissions" on public.term_submissions;
drop policy if exists "staff_update_submissions" on public.term_submissions;
drop policy if exists "super_admin_delete_submissions" on public.term_submissions;

create policy "authenticated_insert_own_submission"
on public.term_submissions
for insert
with check (
  auth.uid() is not null
  and submitted_by = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
  )
);

create policy "submitter_read_own_submission"
on public.term_submissions
for select
using (
  submitted_by = auth.uid()
  or public.is_staff()
);

create policy "submitter_update_own_submission"
on public.term_submissions
for update
using (
  submitted_by = auth.uid()
  and status in ('draft', 'submitted')
)
with check (
  submitted_by = auth.uid()
  and status in ('draft', 'submitted')
);

create policy "staff_read_all_submissions"
on public.term_submissions
for select
using (public.is_staff());

create policy "staff_update_submissions"
on public.term_submissions
for update
using (public.is_staff())
with check (public.is_staff());

create policy "super_admin_delete_submissions"
on public.term_submissions
for delete
using (public.is_super_admin());

-- 8. Audit logs
drop policy if exists "staff_read_audit_logs" on public.audit_logs;
drop policy if exists "staff_insert_audit_logs" on public.audit_logs;

create policy "staff_read_audit_logs"
on public.audit_logs
for select
using (public.is_staff());

create policy "staff_insert_audit_logs"
on public.audit_logs
for insert
with check (public.is_staff());

commit;
