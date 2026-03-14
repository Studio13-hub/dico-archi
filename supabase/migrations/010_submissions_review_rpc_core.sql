-- 010_submissions_review_rpc_core.sql
-- Marqueur de transition.
-- Le workflow actif d'acceptation des propositions est maintenant gere
-- directement par l'admin core et n'impose plus ce RPC dans la chaine
-- initiale de migrations.

begin;

do $$
begin
  raise notice '010 skipped: submission acceptance now uses the direct core workflow; no legacy review RPC is required in the base migration chain.';
end
$$;

commit;
