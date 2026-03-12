-- Schema de base pour Dico Architecture CH
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text default 'apprenti',
  active boolean default true,
  is_editor boolean default false,
  created_at timestamptz default now(),
  constraint profiles_role_check check (role in ('super_admin', 'maitre_apprentissage', 'apprenti'))
);

create table if not exists public.terms (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  category text not null,
  definition text not null,
  example text,
  related text[] default '{}'::text[],
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists terms_category_idx on public.terms (category);
create index if not exists terms_term_idx on public.terms (term);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_terms_updated_at on public.terms;

create trigger set_terms_updated_at
before update on public.terms
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.terms enable row level security;
alter table public.profiles enable row level security;

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
        or (p.role is null and coalesce(p.is_editor, false) = true)
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

-- Lecture publique
drop policy if exists "public can read terms" on public.terms;
drop policy if exists "public can read published terms" on public.terms;
create policy "public can read terms"
  on public.terms for select
  using (true);

-- Edition reservee aux profils staff actifs
drop policy if exists "editors can insert terms" on public.terms;
drop policy if exists "staff can insert terms" on public.terms;
create policy "staff can insert terms"
  on public.terms for insert
  with check (public.is_staff());

drop policy if exists "editors can update terms" on public.terms;
drop policy if exists "staff can update terms" on public.terms;
create policy "staff can update terms"
  on public.terms for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "editors can delete terms" on public.terms;
drop policy if exists "staff can delete terms" on public.terms;
create policy "staff can delete terms"
  on public.terms for delete
  using (public.is_staff());

-- Les utilisateurs peuvent lire leur profil (pas modifier is_editor)
drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);
