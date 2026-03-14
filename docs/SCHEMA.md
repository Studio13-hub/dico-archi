# Schema simple (debutant)

## Vue d'ensemble
1. Le site public lit les termes depuis Supabase.
2. Les utilisateurs creent un compte via `auth.html`.
3. Tu attribues un role (`super_admin`, `formateur`, `apprenti`) dans Supabase.
4. L'equipe de pilotage (super admin + formateur) ajoute/modifie dans `admin.html`.

## Donnees
- Table `terms`: les termes du dictionnaire.
- Table `profiles`: roles des utilisateurs (`role`, `active`, compatibilite historique `is_editor` si necessaire).
- Bucket `term-images`: images publiques.

## Acces
- Tout le monde peut lire.
- Seule l'equipe de pilotage peut ecrire.
- Les apprentis peuvent proposer via `term_submissions`.

## Import CSV (tableau partage)
1. Feuille Google Sheets avec colonnes:
   `term, category, definition, example, related, image_url`
2. Publier en CSV.
3. Lancer le script d'import localement.
