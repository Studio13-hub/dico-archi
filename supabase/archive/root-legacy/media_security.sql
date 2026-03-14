-- Durcissement media: formats autorises + policies storage strictes
-- A executer dans Supabase SQL Editor

create or replace function public.is_valid_media_url(url text)
returns boolean
language sql
immutable
as $$
  select coalesce(
    url ~* '^https?://[^[:space:]]+\\.(png|jpe?g|webp|gif|svg|pdf)(\\?[^[:space:]#]*)?(#[^[:space:]]*)?$',
    false
  );
$$;

create or replace function public.is_valid_media_payload(payload text)
returns boolean
language plpgsql
immutable
as $$
declare
  v text := btrim(coalesce(payload, ''));
  arr jsonb;
  elem text;
begin
  if payload is null or v = '' then
    return true;
  end if;

  if left(v, 1) = '[' then
    begin
      arr := v::jsonb;
    exception
      when others then
        return false;
    end;

    if jsonb_typeof(arr) <> 'array' then
      return false;
    end if;

    if jsonb_array_length(arr) = 0 then
      return true;
    end if;

    for elem in select jsonb_array_elements_text(arr)
    loop
      if not public.is_valid_media_url(elem) then
        return false;
      end if;
    end loop;

    return true;
  end if;

  return public.is_valid_media_url(v);
end;
$$;

-- Nettoyage des valeurs existantes non conformes avant ajout des CHECK constraints
update public.terms
set image_url = null
where not public.is_valid_media_payload(image_url);

update public.term_submissions
set image_url = null
where not public.is_valid_media_payload(image_url);

alter table public.terms
  drop constraint if exists terms_image_url_media_check;

alter table public.terms
  add constraint terms_image_url_media_check
  check (public.is_valid_media_payload(image_url));

alter table public.term_submissions
  drop constraint if exists term_submissions_image_url_media_check;

alter table public.term_submissions
  add constraint term_submissions_image_url_media_check
  check (public.is_valid_media_payload(image_url));

-- Storage: limiter upload/update aux types image/PDF autorises
drop policy if exists "staff can upload term images" on storage.objects;
drop policy if exists "staff can update term images" on storage.objects;

create policy "staff can upload term images"
  on storage.objects for insert
  with check (
    bucket_id = 'term-images'
    and public.is_staff()
    and lower(coalesce(metadata->>'mimetype', '')) in (
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf'
    )
  );

create policy "staff can update term images"
  on storage.objects for update
  using (
    bucket_id = 'term-images'
    and public.is_staff()
  )
  with check (
    bucket_id = 'term-images'
    and public.is_staff()
    and lower(coalesce(metadata->>'mimetype', '')) in (
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf'
    )
  );
