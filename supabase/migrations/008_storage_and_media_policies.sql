-- 008_storage_and_media_policies.sql
-- Configure le bucket term-images et les policies storage associees.

begin;

-- 1. Bucket canonique
insert into storage.buckets (id, name, public)
values ('term-images', 'term-images', false)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

-- 2. Validation MIME
create or replace function public.storage_mimetype_allowed(mimetype text)
returns boolean
language sql
immutable
as $$
  select lower(coalesce(mimetype, '')) in (
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif'
  )
$$;

-- 3. Resolution d'acces public:
-- l'objet storage doit correspondre a une entree media rattachee a un terme publie.
create or replace function public.storage_object_is_public_for_published_term(
  p_bucket_id text,
  p_object_name text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.media m
    join public.terms t on t.id = m.term_id
    where p_bucket_id = 'term-images'
      and t.status = 'published'
      and (
        m.url = p_object_name
        or m.url = p_bucket_id || '/' || p_object_name
        or m.url like '%' || '/storage/v1/object/public/' || p_bucket_id || '/' || p_object_name
        or m.url like '%' || '/storage/v1/object/sign/' || p_bucket_id || '/' || p_object_name || '%'
      )
  )
$$;

-- 4. Policies storage.objects
drop policy if exists "public_read_published_term_images" on storage.objects;
drop policy if exists "staff_upload_term_images" on storage.objects;
drop policy if exists "staff_update_term_images" on storage.objects;
drop policy if exists "staff_delete_term_images" on storage.objects;

create policy "public_read_published_term_images"
on storage.objects
for select
using (
  bucket_id = 'term-images'
  and public.storage_object_is_public_for_published_term(bucket_id, name)
);

create policy "staff_upload_term_images"
on storage.objects
for insert
with check (
  bucket_id = 'term-images'
  and public.is_staff()
  and public.storage_mimetype_allowed(metadata ->> 'mimetype')
);

create policy "staff_update_term_images"
on storage.objects
for update
using (
  bucket_id = 'term-images'
  and public.is_staff()
)
with check (
  bucket_id = 'term-images'
  and public.is_staff()
  and public.storage_mimetype_allowed(metadata ->> 'mimetype')
);

create policy "staff_delete_term_images"
on storage.objects
for delete
using (
  bucket_id = 'term-images'
  and public.is_staff()
);

commit;
