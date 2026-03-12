-- 002_auth_profile_integration.sql
-- Lie public.profiles a auth.users et cree automatiquement les profils.

begin;

-- 1. FK canonique profiles.id -> auth.users.id
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_id_auth_users_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_id_auth_users_fkey
      foreign key (id)
      references auth.users(id)
      on delete cascade;
  end if;
end $$;

-- 2. Fonction d'auto-creation / synchronisation minimale du profil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  resolved_email text;
  resolved_display_name text;
begin
  resolved_email := coalesce(
    nullif(btrim(new.email), ''),
    new.id::text || '@placeholder.local'
  );

  resolved_display_name := nullif(
    btrim(
      coalesce(
        new.raw_user_meta_data ->> 'display_name',
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        ''
      )
    ),
    ''
  );

  insert into public.profiles (
    id,
    email,
    display_name,
    role,
    active
  )
  values (
    new.id,
    resolved_email,
    resolved_display_name,
    'apprenti',
    true
  )
  on conflict (id) do update
  set email = excluded.email,
      display_name = coalesce(public.profiles.display_name, excluded.display_name);

  return new;
end;
$$;

-- 3. Trigger sur auth.users
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- 4. Backfill des profils deja existants
insert into public.profiles (
  id,
  email,
  display_name,
  role,
  active
)
select
  u.id,
  coalesce(nullif(btrim(u.email), ''), u.id::text || '@placeholder.local') as email,
  nullif(
    btrim(
      coalesce(
        u.raw_user_meta_data ->> 'display_name',
        u.raw_user_meta_data ->> 'full_name',
        u.raw_user_meta_data ->> 'name',
        ''
      )
    ),
    ''
  ) as display_name,
  'apprenti' as role,
  true as active
from auth.users u
on conflict (id) do update
set email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name);

commit;
