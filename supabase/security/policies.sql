alter table public.terms enable row level security;
alter table public.term_submissions enable row level security;
alter table public.media enable row level security;
alter table public.profiles enable row level security;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.active = true
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'super_admin', false)
$$;

create or replace function public.is_formateur()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'formateur', false)
$$;

create or replace function public.is_apprenti()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'apprenti', false)
$$;

drop policy if exists "public_read_published_terms" on public.terms;
drop policy if exists "formateur_read_all_terms" on public.terms;
drop policy if exists "formateur_manage_terms" on public.terms;
drop policy if exists "super_admin_full_terms_select" on public.terms;
drop policy if exists "super_admin_full_terms_insert" on public.terms;
drop policy if exists "super_admin_full_terms_update" on public.terms;
drop policy if exists "super_admin_full_terms_delete" on public.terms;

create policy "public_read_published_terms"
on public.terms
for select
using (
  status = 'published'
  or public.is_formateur()
  or public.is_super_admin()
);

create policy "formateur_manage_terms"
on public.terms
for all
using (
  public.is_formateur()
  or public.is_super_admin()
)
with check (
  public.is_formateur()
  or public.is_super_admin()
);

create policy "super_admin_full_terms_delete"
on public.terms
for delete
using (public.is_super_admin());

drop policy if exists "apprenti_insert_own_submission" on public.term_submissions;
drop policy if exists "apprenti_read_own_submission" on public.term_submissions;
drop policy if exists "apprenti_update_own_submission" on public.term_submissions;
drop policy if exists "formateur_read_all_submissions" on public.term_submissions;
drop policy if exists "formateur_update_submissions" on public.term_submissions;
drop policy if exists "super_admin_full_submissions" on public.term_submissions;

create policy "apprenti_insert_own_submission"
on public.term_submissions
for insert
with check (
  public.is_apprenti()
  and submitted_by = auth.uid()
);

create policy "apprenti_read_own_submission"
on public.term_submissions
for select
using (
  submitted_by = auth.uid()
  or public.is_formateur()
  or public.is_super_admin()
);

create policy "apprenti_update_own_submission"
on public.term_submissions
for update
using (
  public.is_apprenti()
  and submitted_by = auth.uid()
)
with check (
  public.is_apprenti()
  and submitted_by = auth.uid()
);

create policy "formateur_read_all_submissions"
on public.term_submissions
for select
using (
  public.is_formateur()
  or public.is_super_admin()
);

create policy "formateur_update_submissions"
on public.term_submissions
for update
using (
  public.is_formateur()
  or public.is_super_admin()
)
with check (
  public.is_formateur()
  or public.is_super_admin()
);

create policy "super_admin_full_submissions"
on public.term_submissions
for all
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "public_read_media_for_published_terms" on public.media;
drop policy if exists "formateur_manage_media" on public.media;
drop policy if exists "super_admin_full_media" on public.media;

create policy "public_read_media_for_published_terms"
on public.media
for select
using (
  exists (
    select 1
    from public.terms t
    where t.id = media.term_id
      and (
        t.status = 'published'
        or public.is_formateur()
        or public.is_super_admin()
      )
  )
);

create policy "formateur_manage_media"
on public.media
for all
using (
  public.is_formateur()
  or public.is_super_admin()
)
with check (
  public.is_formateur()
  or public.is_super_admin()
);

create policy "super_admin_full_media"
on public.media
for delete
using (public.is_super_admin());

drop policy if exists "user_read_own_profile" on public.profiles;
drop policy if exists "user_update_own_profile" on public.profiles;
drop policy if exists "super_admin_full_profiles" on public.profiles;

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

create policy "super_admin_full_profiles"
on public.profiles
for all
using (public.is_super_admin())
with check (public.is_super_admin());
