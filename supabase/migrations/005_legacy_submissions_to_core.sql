-- 005_legacy_submissions_to_core.sql
-- Marqueur de transition pour les anciennes propositions.
-- La structure finale utilise `term_submissions.category_id` et les statuts core.
-- Aucune migration automatique n'est rejouee ici car le projet courant ne
-- s'appuie plus sur une base legacy a convertir en place.

begin;

do $$
begin
  raise notice '005 skipped: legacy submissions are no longer migrated in-place; current environments start from the core schema.';
end
$$;

commit;
