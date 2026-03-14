Source canonique du contenu editorial DicoArchi.

Regles :
- `categories.json` contient la taxonomie canonique.
- `terms.json` contient les fiches termes canoniques.
- `relations.json` contient les relations explicites entre slugs.
- `media.json` contient les medias relies aux termes.

Contraintes :
- plus de `category` libre dans les termes : utiliser `category_slug`
- plus de `related` en texte libre : utiliser `relations.json`
- plus de `image_url` dans les termes : utiliser `media.json`
- `slug` doit etre stable et unique
- `status` doit rester dans le modele core (`draft`, `submitted`, `validated`, `published`)
