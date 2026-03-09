-- Migration roles RDR:
-- super_admin, maitre_apprentissage, apprenti
-- Compatible avec l'ancien champ profiles.is_editor

alter table public.profiles
  add column if not exists role text,
  add column if not exists active boolean default true;

update public.profiles
set role = case
  when coalesce(is_editor, false) then 'maitre_apprentissage'
  else 'apprenti'
end
where role is null;

alter table public.profiles
  alter column role set default 'apprenti';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('super_admin', 'maitre_apprentissage', 'apprenti'));
  end if;
end $$;

update public.profiles
set active = true
where active is null;

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_active_idx on public.profiles (active);

create or replace function public.profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and coalesce(p.active, true) = true
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and coalesce(p.active, true) = true
      and (
        p.role in ('super_admin', 'maitre_apprentissage')
        or coalesce(p.is_editor, false) = true
      )
  )
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and coalesce(p.active, true) = true
      and p.role = 'super_admin'
  )
$$;

-- profiles policies
drop policy if exists "users can read own profile" on public.profiles;
drop policy if exists "staff can read profiles" on public.profiles;
drop policy if exists "super_admin can read profiles" on public.profiles;
drop policy if exists "super_admin can update profiles" on public.profiles;

create policy "users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "super_admin can read profiles"
  on public.profiles for select
  using (public.is_super_admin());

create policy "super_admin can update profiles"
  on public.profiles for update
  using (public.is_super_admin())
  with check (
    role in ('super_admin', 'maitre_apprentissage', 'apprenti')
  );

-- terms policies
drop policy if exists "public can read terms" on public.terms;
drop policy if exists "public can read published terms" on public.terms;
drop policy if exists "editors can insert terms" on public.terms;
drop policy if exists "editors can update terms" on public.terms;
drop policy if exists "editors can delete terms" on public.terms;
drop policy if exists "staff can insert terms" on public.terms;
drop policy if exists "staff can update terms" on public.terms;
drop policy if exists "staff can delete terms" on public.terms;

create policy "public can read published terms"
  on public.terms for select
  using (
    coalesce(status, 'published') = 'published'
    or public.is_staff()
  );

create policy "staff can insert terms"
  on public.terms for insert
  with check (public.is_staff());

create policy "staff can update terms"
  on public.terms for update
  using (public.is_staff())
  with check (public.is_staff());

create policy "staff can delete terms"
  on public.terms for delete
  using (public.is_staff());

-- submissions policies
drop policy if exists "authenticated can insert submissions" on public.term_submissions;
drop policy if exists "submitters can read own submissions" on public.term_submissions;
drop policy if exists "editors can read submissions" on public.term_submissions;
drop policy if exists "editors can update submissions" on public.term_submissions;
drop policy if exists "editors can delete submissions" on public.term_submissions;
drop policy if exists "staff can read submissions" on public.term_submissions;
drop policy if exists "staff can update submissions" on public.term_submissions;
drop policy if exists "staff can delete submissions" on public.term_submissions;

create policy "authenticated can insert submissions"
  on public.term_submissions for insert
  with check (
    auth.uid() is not null
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.active, true) = true
    )
  );

create policy "submitters can read own submissions"
  on public.term_submissions for select
  using (auth.uid() = submitted_by);

create policy "staff can read submissions"
  on public.term_submissions for select
  using (public.is_staff());

create policy "staff can update submissions"
  on public.term_submissions for update
  using (public.is_staff())
  with check (public.is_staff());

create policy "staff can delete submissions"
  on public.term_submissions for delete
  using (public.is_staff());

-- audit policies
drop policy if exists "editors can read audit logs" on public.audit_logs;
drop policy if exists "editors can insert audit logs" on public.audit_logs;
drop policy if exists "staff can read audit logs" on public.audit_logs;
drop policy if exists "staff can insert audit logs" on public.audit_logs;

create policy "staff can read audit logs"
  on public.audit_logs for select
  using (public.is_staff());

create policy "staff can insert audit logs"
  on public.audit_logs for insert
  with check (public.is_staff());

-- storage policies
drop policy if exists "public read term images" on storage.objects;
drop policy if exists "editors can upload term images" on storage.objects;
drop policy if exists "editors can update term images" on storage.objects;
drop policy if exists "editors can delete term images" on storage.objects;
drop policy if exists "staff can upload term images" on storage.objects;
drop policy if exists "staff can update term images" on storage.objects;
drop policy if exists "staff can delete term images" on storage.objects;

create policy "public read term images"
  on storage.objects for select
  using (bucket_id = 'term-images');

create policy "staff can upload term images"
  on storage.objects for insert
  with check (
    bucket_id = 'term-images'
    and public.is_staff()
  );

create policy "staff can update term images"
  on storage.objects for update
  using (
    bucket_id = 'term-images'
    and public.is_staff()
  );

create policy "staff can delete term images"
  on storage.objects for delete
  using (
    bucket_id = 'term-images'
    and public.is_staff()
  );
