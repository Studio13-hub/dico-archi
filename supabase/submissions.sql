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
drop policy if exists "authenticated can insert submissions" on public.term_submissions;
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

-- Les profils staff actifs peuvent lire et supprimer
drop policy if exists "editors can read submissions" on public.term_submissions;
drop policy if exists "staff can read submissions" on public.term_submissions;
create policy "staff can read submissions"
  on public.term_submissions for select
  using (public.is_staff());

drop policy if exists "editors can delete submissions" on public.term_submissions;
drop policy if exists "staff can delete submissions" on public.term_submissions;
create policy "staff can delete submissions"
  on public.term_submissions for delete
  using (public.is_staff());
