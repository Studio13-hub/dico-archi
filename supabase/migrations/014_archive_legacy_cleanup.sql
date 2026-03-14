-- 014_archive_legacy_cleanup.sql
-- Nettoyage final des reliquats les plus frequents du modele legacy.

begin;

alter table if exists public.terms
  drop column if exists category,
  drop column if exists related,
  drop column if exists image_url,
  drop column if exists updated_by;

alter table if exists public.term_submissions
  drop column if exists category,
  drop column if exists related,
  drop column if exists image_url,
  drop column if exists submitter_email,
  drop column if exists reviewed_at;

do $$
begin
  raise notice '014 cleanup executed: common flat legacy columns were dropped if they still existed.';
end
$$;

commit;
