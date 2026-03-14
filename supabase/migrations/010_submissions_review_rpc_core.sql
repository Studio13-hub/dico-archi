-- 010_submissions_review_rpc_core.sql
-- RPC core pour accepter une proposition de terme.

begin;

create or replace function public.accept_submission_atomic(
  target_submission_id uuid,
  next_term text default null,
  next_category text default null,
  next_definition text default null,
  next_example text default null,
  next_related text[] default null,
  next_image_url text default null,
  next_reviewer_comment text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  submission_row public.term_submissions%rowtype;
  resolved_term text;
  resolved_definition text;
  resolved_example text;
  resolved_reviewer_comment text;
  resolved_category_text text;
  resolved_category_id uuid;
  resolved_slug text;
  created_term_id uuid;
begin
  if not public.is_staff() then
    raise exception 'forbidden';
  end if;

  select *
  into submission_row
  from public.term_submissions
  where id = target_submission_id
  for update;

  if not found then
    raise exception 'submission_not_found';
  end if;

  if submission_row.status not in ('submitted', 'validated') then
    raise exception 'submission_already_processed';
  end if;

  resolved_term := coalesce(nullif(trim(next_term), ''), submission_row.term);
  resolved_definition := coalesce(nullif(trim(next_definition), ''), submission_row.definition);
  resolved_example := coalesce(next_example, submission_row.example);
  resolved_reviewer_comment := nullif(trim(next_reviewer_comment), '');
  resolved_category_text := nullif(trim(next_category), '');

  if resolved_category_text is not null then
    select c.id
    into resolved_category_id
    from public.categories c
    where lower(c.name) = lower(resolved_category_text)
       or c.slug = lower(regexp_replace(resolved_category_text, '[^a-zA-Z0-9]+', '-', 'g'))
    order by c.name asc
    limit 1;
  else
    resolved_category_id := submission_row.category_id;
  end if;

  resolved_slug := lower(regexp_replace(coalesce(resolved_term, ''), '[^a-zA-Z0-9]+', '-', 'g'));
  resolved_slug := regexp_replace(resolved_slug, '(^-+|-+$)', '', 'g');
  resolved_slug := regexp_replace(resolved_slug, '-{2,}', '-', 'g');

  if resolved_term is null or btrim(resolved_term) = ''
     or resolved_definition is null or btrim(resolved_definition) = ''
     or resolved_category_id is null
     or resolved_slug is null or btrim(resolved_slug) = '' then
    raise exception 'missing_required_fields';
  end if;

  if exists (
    select 1
    from public.terms t
    where lower(t.term) = lower(resolved_term)
       or lower(t.slug) = lower(resolved_slug)
  ) then
    raise exception 'term_exists';
  end if;

  insert into public.terms (
    term,
    slug,
    category_id,
    definition,
    example,
    status,
    submitted_by,
    reviewed_by,
    reviewer_comment,
    published_at
  )
  values (
    resolved_term,
    resolved_slug,
    resolved_category_id,
    resolved_definition,
    resolved_example,
    'published',
    submission_row.submitted_by,
    auth.uid(),
    resolved_reviewer_comment,
    now()
  )
  returning id into created_term_id;

  update public.term_submissions
  set term = resolved_term,
      slug = resolved_slug,
      category_id = resolved_category_id,
      definition = resolved_definition,
      example = resolved_example,
      status = 'accepted',
      reviewer_comment = resolved_reviewer_comment,
      reviewed_by = auth.uid(),
      updated_at = now()
  where id = target_submission_id;

  -- `next_related` et `next_image_url` restent acceptes pour compatibilite
  -- transitoire avec les anciens appels, mais ne sont plus persistes dans le
  -- schema core. Les relations et medias sont geres via `term_relations`
  -- et `media`.

  return created_term_id;
end;
$$;

grant execute on function public.accept_submission_atomic(
  uuid,
  text,
  text,
  text,
  text,
  text[],
  text,
  text
) to authenticated;

commit;
