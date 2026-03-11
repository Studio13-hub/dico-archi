-- Fallback robuste pour gestion des roles depuis admin.html
-- Evite les conflits RLS recursifs sur public.profiles

create or replace function public.admin_list_profiles()
returns table (
  id uuid,
  email text,
  role text,
  active boolean,
  is_editor boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'forbidden';
  end if;

  return query
  select p.id, p.email, p.role, p.active, p.is_editor, p.created_at
  from public.profiles p
  order by p.created_at asc;
end;
$$;

create or replace function public.admin_update_profile(
  target_profile_id uuid,
  next_role text,
  next_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'forbidden';
  end if;

  if target_profile_id = auth.uid() then
    raise exception 'cannot_update_self';
  end if;

  if next_role not in ('super_admin', 'maitre_apprentissage', 'apprenti') then
    raise exception 'invalid_role';
  end if;

  update public.profiles
  set role = next_role,
      active = coalesce(next_active, true),
      is_editor = case
        when next_role in ('super_admin', 'maitre_apprentissage') then true
        else false
      end
  where id = target_profile_id;
end;
$$;

grant execute on function public.admin_list_profiles() to authenticated;
grant execute on function public.admin_update_profile(uuid, text, boolean) to authenticated;
