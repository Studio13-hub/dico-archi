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

## Contenu editorial
La source canonique du contenu ne passe plus par un CSV legacy.

Elle repose maintenant sur :
- `content/categories.json`
- `content/terms.json`
- `content/relations.json`
- `content/media.json`

Le SQL d'import core est genere depuis ces fichiers.
