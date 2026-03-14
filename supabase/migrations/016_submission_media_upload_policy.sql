begin;

drop policy if exists "authenticated_upload_submission_media" on storage.objects;
drop policy if exists "authenticated_read_submission_media" on storage.objects;
drop policy if exists "authenticated_delete_submission_media" on storage.objects;

create policy "authenticated_upload_submission_media"
on storage.objects
for insert
with check (
  bucket_id = 'term-images'
  and auth.uid() is not null
  and split_part(name, '/', 1) = 'submissions'
  and split_part(name, '/', 2) = auth.uid()::text
  and public.storage_mimetype_allowed(metadata ->> 'mimetype')
);

create policy "authenticated_read_submission_media"
on storage.objects
for select
using (
  bucket_id = 'term-images'
  and (
    public.storage_object_is_public_for_published_term(bucket_id, name)
    or (
      auth.uid() is not null
      and split_part(name, '/', 1) = 'submissions'
      and (
        split_part(name, '/', 2) = auth.uid()::text
        or public.is_staff()
      )
    )
  )
);

create policy "authenticated_delete_submission_media"
on storage.objects
for delete
using (
  bucket_id = 'term-images'
  and auth.uid() is not null
  and split_part(name, '/', 1) = 'submissions'
  and (
    split_part(name, '/', 2) = auth.uid()::text
    or public.is_staff()
  )
);

commit;
