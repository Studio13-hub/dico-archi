alter table public.terms
  add column if not exists status text default 'published',
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

create index if not exists terms_status_idx on public.terms (status);

-- En public, n'afficher que les termes publies.
drop policy if exists "public can read terms" on public.terms;
create policy "public can read published terms"
  on public.terms for select
  using (
    status = 'published'
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_editor
    )
  );
