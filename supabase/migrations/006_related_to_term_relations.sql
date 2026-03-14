-- 006_related_to_term_relations.sql
-- Marqueur de transition.
-- Les relations entre termes sont maintenant gerees uniquement via
-- `public.term_relations`. L'ancien champ `related` n'est plus la source de
-- verite et n'est plus converti automatiquement par la chaine SQL.

begin;

do $$
begin
  raise notice '006 skipped: relation migration now happens through canonical content and explicit term_relations imports.';
end
$$;

commit;
