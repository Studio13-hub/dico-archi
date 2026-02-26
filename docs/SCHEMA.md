# Schema simple (debutant)

## Vue d'ensemble
1. Le site public lit les termes depuis Supabase.
2. Les utilisateurs creent un compte via `auth.html`.
3. Tu actives le role editeur dans Supabase.
4. Les editeurs ajoutent/modifient dans `admin.html` ou via import CSV.

## Donnees
- Table `terms`: les termes du dictionnaire.
- Table `profiles`: roles des utilisateurs (is_editor).
- Bucket `term-images`: images publiques.

## Acces
- Tout le monde peut lire.
- Seuls les editeurs peuvent ecrire.

## Import CSV (tableau partage)
1. Feuille Google Sheets avec colonnes:
   `term, category, definition, example, related, image_url`
2. Publier en CSV.
3. Lancer le script d'import localement.
