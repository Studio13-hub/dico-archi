create table if not exists public.site_visitors (
  visitor_id text primary key,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  first_page_path text,
  last_page_path text
);

create index if not exists site_visitors_last_seen_at_idx
on public.site_visitors (last_seen_at desc);

alter table public.site_visitors enable row level security;
