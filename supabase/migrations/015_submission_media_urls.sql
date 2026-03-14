alter table if exists public.term_submissions
add column if not exists media_urls text[] not null default '{}'::text[];
