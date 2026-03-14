Zone de travail pour convertir les brouillons et cours existants en contenu editorial exploitable.

But :
- conserver la matiere reelle extraite des supports sans polluer `content/terms.json`
- preparer la fusion vers le corpus canonique
- signaler les doublons, enrichissements et nouvelles fiches

Champs utiles :
- `target_category_slug` : categorie core visee
- `merge_strategy` :
  - `new_term` : nouvelle fiche a ajouter
  - `enrich_existing` : fiche deja presente, a enrichir ou fusionner
  - `needs_review` : terme ambigu, trop large ou a arbitrer
- `related_terms_raw` : relations brutes a convertir ensuite en slugs

Regle :
- `content/` = source canonique active
- `content/candidates/` = sas de conversion editorial
