Source canonique V2 du contenu DicoArchi.

Objectif :
- separer la taxonomie, les termes, les relations et les medias
- permettre un fichier par terme
- accueillir des champs riches sans casser le site actuel

Structure :
- `taxonomy/categories.json`
- `taxonomy/subcategories.json`
- `terms/*.json`
- `relations/relations.json`
- `media/media.json`
- `schemas/`
- `templates/`

Regles :
- `content/v2/` devient la source editoriale a enrichir
- le site actuel continue a projeter seulement les champs core necessaires
- les accents, l'orthographe et la ponctuation sont obligatoires
- un terme riche peut contenir des blocs vides, mais pas de `term`, `slug`, `category_slug`, `status` ou `content.definition` vides
