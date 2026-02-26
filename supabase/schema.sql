-- Schema de base pour Dico Architecture CH
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_editor boolean default false,
  created_at timestamptz default now()
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

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.terms enable row level security;
alter table public.profiles enable row level security;

-- Lecture publique
create policy "public can read terms"
  on public.terms for select
  using (true);

-- Edition reservee aux editeurs
create policy "editors can insert terms"
  on public.terms for insert
  with check (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_editor
  ));

create policy "editors can update terms"
  on public.terms for update
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_editor
  ));

create policy "editors can delete terms"
  on public.terms for delete
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_editor
  ));

-- Les utilisateurs peuvent lire leur profil (pas modifier is_editor)
create policy "users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);
