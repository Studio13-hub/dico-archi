-- 004_legacy_terms_to_core.sql
-- Marqueur de transition.
-- Le projet a finalement bascule sur une recreation propre du schema core
-- et sur un pipeline editorial versionne (`content/*.json`).
--
-- Cette migration reste intentionnellement sans transformation destructive:
-- la conversion legacy -> core n'est plus rejouee automatiquement via la chaine
-- SQL, mais par generation de contenu canonique puis import propre.

begin;

do $$
begin
  raise notice '004 skipped: legacy flat terms are not migrated in-place anymore; use the canonical content pipeline instead.';
end
$$;

commit;
