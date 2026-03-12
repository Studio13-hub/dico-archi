-- Acceptation atomique d'une proposition:
-- - verrouille la proposition cible
-- - empeche double traitement concurrent
-- - empeche insertion d'un terme deja existant (insensible a la casse)

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
  resolved_category text;
  resolved_definition text;
  resolved_example text;
  resolved_related text[];
  resolved_image_url text;
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

  if coalesce(submission_row.status, 'pending') <> 'pending' then
    raise exception 'submission_already_processed';
  end if;

  resolved_term := coalesce(nullif(trim(next_term), ''), submission_row.term);
  resolved_category := coalesce(nullif(trim(next_category), ''), submission_row.category);
  resolved_definition := coalesce(nullif(trim(next_definition), ''), submission_row.definition);
  resolved_example := coalesce(next_example, submission_row.example);
  resolved_related := coalesce(next_related, submission_row.related, '{}'::text[]);
  resolved_image_url := coalesce(next_image_url, submission_row.image_url);

  if resolved_term is null or resolved_category is null or resolved_definition is null then
    raise exception 'missing_required_fields';
  end if;

  if exists (
    select 1
    from public.terms t
    where lower(t.term) = lower(resolved_term)
  ) then
    raise exception 'term_exists';
  end if;

  insert into public.terms (
    term,
    category,
    definition,
    example,
    related,
    image_url,
    status,
    updated_by
  )
  values (
    resolved_term,
    resolved_category,
    resolved_definition,
    resolved_example,
    resolved_related,
    resolved_image_url,
    'published',
    auth.uid()
  )
  returning id into created_term_id;

  update public.term_submissions
  set term = resolved_term,
      category = resolved_category,
      definition = resolved_definition,
      example = resolved_example,
      related = resolved_related,
      image_url = resolved_image_url,
      status = 'accepted',
      reviewer_comment = nullif(trim(next_reviewer_comment), ''),
      reviewed_at = now()
  where id = target_submission_id;

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
