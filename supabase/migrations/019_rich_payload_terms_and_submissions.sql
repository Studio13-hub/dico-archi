begin;

alter table if exists public.terms
add column if not exists rich_payload jsonb not null default '{}'::jsonb;

alter table if exists public.term_submissions
add column if not exists rich_payload jsonb not null default '{}'::jsonb;

commit;
