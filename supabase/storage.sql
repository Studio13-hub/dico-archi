-- Bucket public pour les images
insert into storage.buckets (id, name, public)
values ('term-images', 'term-images', true)
on conflict (id) do nothing;

-- Lecture publique des images
drop policy if exists "public read term images" on storage.objects;
create policy "public read term images"
  on storage.objects for select
  using (bucket_id = 'term-images');

-- Upload reserve aux profils staff actifs
drop policy if exists "editors can upload term images" on storage.objects;
drop policy if exists "staff can upload term images" on storage.objects;
create policy "staff can upload term images"
  on storage.objects for insert
  with check (
    bucket_id = 'term-images'
    and public.is_staff()
  );

drop policy if exists "editors can update term images" on storage.objects;
drop policy if exists "staff can update term images" on storage.objects;
create policy "staff can update term images"
  on storage.objects for update
  using (
    bucket_id = 'term-images'
    and public.is_staff()
  );

drop policy if exists "editors can delete term images" on storage.objects;
drop policy if exists "staff can delete term images" on storage.objects;
create policy "staff can delete term images"
  on storage.objects for delete
  using (
    bucket_id = 'term-images'
    and public.is_staff()
  );
