create table if not exists public.term_submissions (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  category text not null,
  definition text not null,
  example text,
  related text[] default '{}'::text[],
  image_url text,
  submitted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.term_submissions enable row level security;

-- Les utilisateurs connectes peuvent proposer
create policy "authenticated can insert submissions"
  on public.term_submissions for insert
  with check (auth.uid() is not null);

-- Les editeurs peuvent lire et supprimer
create policy "editors can read submissions"
  on public.term_submissions for select
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_editor
  ));

create policy "editors can delete submissions"
  on public.term_submissions for delete
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_editor
  ));
