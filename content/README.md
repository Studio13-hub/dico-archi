Source canonique du contenu editorial DicoArchi.

Regles :
- `v2/` contient la source canonique riche en cours de generalisation.
- `categories.json`, `terms.json`, `relations.json`, `media.json` restent la projection core compatible avec le site actuel.
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
- le contenu final doit respecter l'orthographe francaise complete, avec accents et ponctuation rigoureuse

Exigence DicoArchi :
- le dictionnaire est pense pour des non-francophones
- les accents doivent etre conserves dans le contenu editorial final
- les definitions doivent rester simples, pedagogiques et faciles a comprendre

Controle recommande :
- validation structurelle : `npm run content:validate`
- controle linguistique : `npm run content:lint:fr`
- bootstrap V2 initial : `npm run content:v2:bootstrap`
