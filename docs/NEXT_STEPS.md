# Prochaines etapes (reprise)

## Priorite 1 - Validation complete post-session
1. Tester le flux "mot de passe oublie":
   - `auth.html` -> bouton reset
   - mail de reset recu
   - nouveau mot de passe applique.
2. Tester media:
   - contribution/admin refusent `.avif/.bmp/...`
   - acceptent `.jpg/.png/.webp/.gif/.svg/.pdf`
   - fiche affiche image/PDF sans bug.
3. Tester mobile:
   - dock visible et utilisable sur `index.html` et `term.html`
   - pas de recouvrement genant sur formulaires.
4. Tester scenarios session:
   - expiration token sur `admin.html`, `contribuer.html`, `compte.html`
   - reaction UI immediate entre onglets (login/logout).

## Priorite 2 - Stabilisation contenu et data
5. Executer un cycle editorial complet:
   - proposition apprenti
   - review/accept admin
   - publication visible sur site.
6. Verifier les categories ajoutees:
   - `Toitures plates`
   - `Bases des materiaux`
7. Si besoin, synchroniser DB avec seeds:
   - `supabase/seed_toitures_plates.sql`
   - `supabase/seed_bases_materiaux.sql`.

## Priorite 3 - Evolutions recommandees
8. Ajouter un module utilisateur:
   - vrais `Favoris`
   - `Historique` lisible depuis UI (les termes recents existent deja en localStorage).
9. Renforcer UX fiche:
   - variantes auto mieux classees
   - mini-illustrations dans variantes si media dispo.
10. Nettoyage technique:
   - valider fichiers tracked/untracked
   - preparer commits propres par lot (securite / UX / contenu).

## SQL deja applique dans Supabase (session 2026-03-09)
- `supabase/media_security.sql` execute avec succes.
- Les controles media sont actifs en base et sur storage.
