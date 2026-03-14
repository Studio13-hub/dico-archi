begin;

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  page_path text not null,
  page_title text,
  session_id text not null,
  visitor_id text,
  user_id uuid references public.profiles(id) on delete set null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_page_path_idx on public.page_views (page_path);
create index if not exists page_views_session_id_idx on public.page_views (session_id);

alter table public.page_views enable row level security;

create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  game_key text not null,
  session_id text not null,
  user_id uuid references public.profiles(id) on delete set null,
  score integer not null default 0,
  total integer not null default 0,
  elapsed_seconds integer,
  best_combo integer,
  best_streak integer,
  moves integer,
  known integer,
  review integer,
  mode_label text,
  category_label text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists game_scores_created_at_idx on public.game_scores (created_at desc);
create index if not exists game_scores_game_key_idx on public.game_scores (game_key);
create index if not exists game_scores_session_id_idx on public.game_scores (session_id);

alter table public.game_scores enable row level security;

commit;
