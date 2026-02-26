-- Bucket public pour les images
insert into storage.buckets (id, name, public)
values ('term-images', 'term-images', true)
on conflict (id) do nothing;

-- Lecture publique des images
create policy "public read term images"
  on storage.objects for select
  using (bucket_id = 'term-images');

-- Upload reserve aux editeurs
create policy "editors can upload term images"
  on storage.objects for insert
  with check (
    bucket_id = 'term-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_editor
    )
  );

create policy "editors can update term images"
  on storage.objects for update
  using (
    bucket_id = 'term-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_editor
    )
  );

create policy "editors can delete term images"
  on storage.objects for delete
  using (
    bucket_id = 'term-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_editor
    )
  );
