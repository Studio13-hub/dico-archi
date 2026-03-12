create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_not_blank check (btrim(name) <> ''),
  constraint categories_slug_not_blank check (btrim(slug) <> '')
);

create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  role text not null default 'apprenti',
  active boolean not null default true,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_not_blank check (btrim(email) <> ''),
  constraint profiles_role_check check (role in ('super_admin', 'formateur', 'apprenti'))
);

create table if not exists public.terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  slug text not null unique,
  category_id uuid references public.categories(id) on delete set null,
  definition text not null,
  example text,
  status text not null default 'draft',
  reviewer_comment text,
  submitted_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint terms_term_not_blank check (btrim(term) <> ''),
  constraint terms_slug_not_blank check (btrim(slug) <> ''),
  constraint terms_definition_not_blank check (btrim(definition) <> ''),
  constraint terms_status_check check (status in ('draft', 'submitted', 'validated', 'published'))
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  term_id uuid not null references public.terms(id) on delete cascade,
  media_type text not null,
  url text not null,
  title text,
  alt_text text,
  position integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_type_check check (media_type in ('image', 'pdf', 'schema')),
  constraint media_url_not_blank check (btrim(url) <> ''),
  constraint media_position_non_negative check (position >= 0)
);

create table if not exists public.term_relations (
  id uuid primary key default gen_random_uuid(),
  source_term_id uuid not null references public.terms(id) on delete cascade,
  target_term_id uuid not null references public.terms(id) on delete cascade,
  relation_type text not null,
  created_at timestamptz not null default now(),
  constraint term_relations_type_not_blank check (btrim(relation_type) <> ''),
  constraint term_relations_no_self_reference check (source_term_id <> target_term_id),
  constraint term_relations_unique unique (source_term_id, target_term_id, relation_type)
);

create table if not exists public.term_submissions (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  slug text,
  category_id uuid references public.categories(id) on delete set null,
  definition text not null,
  example text,
  status text not null default 'draft',
  reviewer_comment text,
  submitted_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint term_submissions_term_not_blank check (btrim(term) <> ''),
  constraint term_submissions_definition_not_blank check (btrim(definition) <> ''),
  constraint term_submissions_status_check check (status in ('draft', 'submitted', 'validated', 'rejected', 'accepted'))
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action_type text not null,
  target_table text not null,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_action_type_not_blank check (btrim(action_type) <> ''),
  constraint audit_logs_target_table_not_blank check (btrim(target_table) <> '')
);

create index if not exists categories_parent_id_idx on public.categories(parent_id);
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_active_idx on public.profiles(active);
create index if not exists terms_category_id_idx on public.terms(category_id);
create index if not exists terms_status_idx on public.terms(status);
create index if not exists terms_submitted_by_idx on public.terms(submitted_by);
create index if not exists terms_reviewed_by_idx on public.terms(reviewed_by);
create index if not exists media_term_id_idx on public.media(term_id);
create index if not exists media_created_by_idx on public.media(created_by);
create index if not exists term_relations_source_idx on public.term_relations(source_term_id);
create index if not exists term_relations_target_idx on public.term_relations(target_term_id);
create index if not exists term_submissions_category_id_idx on public.term_submissions(category_id);
create index if not exists term_submissions_status_idx on public.term_submissions(status);
create index if not exists term_submissions_submitted_by_idx on public.term_submissions(submitted_by);
create index if not exists term_submissions_reviewed_by_idx on public.term_submissions(reviewed_by);
create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index if not exists audit_logs_target_idx on public.audit_logs(target_table, target_id);
