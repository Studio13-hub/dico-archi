-- 003_role_model_unification.sql
-- Unifie le modele de roles sur:
--   super_admin
--   formateur
--   apprenti

begin;

-- 1. Normalisation des valeurs existantes
alter table public.profiles
  alter column role set default 'apprenti';

update public.profiles
set role = case
  when role is null or btrim(role) = '' then 'apprenti'
  when role = 'maitre_apprentissage' then 'formateur'
  when role = 'super_admin' then 'super_admin'
  when role = 'formateur' then 'formateur'
  when role = 'apprenti' then 'apprenti'
  else 'apprenti'
end;

update public.profiles
set active = true
where active is null;

-- 2. Contrainte canonique de role
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'formateur', 'apprenti'));

-- 3. Helpers role canonique
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

create or replace function public.profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role()
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

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('super_admin', 'formateur'), false)
$$;

-- 4. Index utiles
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_active_idx on public.profiles (active);

commit;
