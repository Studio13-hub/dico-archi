-- 009_admin_rpc_core.sql
-- RPC admin reservees au super_admin.

begin;

create or replace function public.admin_list_profiles()
returns table (
  id uuid,
  email text,
  role text,
  active boolean,
  display_name text,
  created_at timestamptz,
  updated_at timestamptz
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
  select
    p.id,
    p.email,
    p.role,
    p.active,
    p.display_name,
    p.created_at,
    p.updated_at
  from public.profiles p
  order by p.created_at asc, p.email asc;
end;
$$;

create or replace function public.admin_update_profile(
  target_profile_id uuid,
  next_role text,
  next_active boolean
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles%rowtype;
begin
  if not public.is_super_admin() then
    raise exception 'forbidden';
  end if;

  if target_profile_id is null then
    raise exception 'target_profile_id_required';
  end if;

  if next_role not in ('super_admin', 'formateur', 'apprenti') then
    raise exception 'invalid_role';
  end if;

  if target_profile_id = auth.uid() and coalesce(next_active, true) = false then
    raise exception 'cannot_deactivate_self';
  end if;

  update public.profiles
  set role = next_role,
      active = coalesce(next_active, public.profiles.active),
      updated_at = now()
  where id = target_profile_id
  returning * into updated_profile;

  if not found then
    raise exception 'profile_not_found';
  end if;

  return updated_profile;
end;
$$;

grant execute on function public.admin_list_profiles() to authenticated;
grant execute on function public.admin_update_profile(uuid, text, boolean) to authenticated;

commit;
