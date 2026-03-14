Source canonique du contenu editorial DicoArchi.

Regles :
- `categories.json` contient la taxonomie canonique.
- `terms.json` contient les fiches termes canoniques.
- `relations.json` contient les relations explicites entre slugs.
- `media.json` contient les medias relies aux termes.
- `templates/` contient les gabarits a dupliquer pour ajouter du contenu proprement.
- `candidates/` contient la matiere editoriale extraite des anciens cours, a revoir avant fusion.

Contraintes :
- plus de `category` libre dans les termes : utiliser `category_slug`
- plus de `related` en texte libre : utiliser `relations.json`
- plus de `image_url` dans les termes : utiliser `media.json`
- `slug` doit etre stable et unique
- `status` doit rester dans le modele core (`draft`, `submitted`, `validated`, `published`)

Recommandations editoriales :
- une definition = une idee claire, sans phrase trop longue
- un exemple = une situation concrete de bureau, dessin ou chantier
- un slug = stable dans le temps, meme si le style du terme evolue
- une relation = explicite et utile pour la navigation
- un media = rattache a un terme via `term_slug`, jamais stocke dans le terme lui-meme
