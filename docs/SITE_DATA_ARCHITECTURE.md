# Architecture des donnees du site

Ce document fixe la strategie la plus sure pour transformer le document source du site en base de contenu durable.

## Principe

Ne pas injecter directement la taxonomie brute du document source dans la taxonomie active.

Le bon ordre est :

1. stocker la taxonomie cible en zone de preparation
2. enrichir les sous-categories avec de vraies fiches terme
3. publier seulement les blocs prets dans `content/v2`
4. projeter ensuite vers Supabase

## Stockage recommande

Source de reference :
- `content/candidates/site-rtf-taxonomy.json`

Source active :
- `content/v2/taxonomy/categories.json`
- `content/v2/taxonomy/subcategories.json`
- `content/v2/terms/*.json`
- `content/v2/relations/relations.json`
- `content/v2/media/media.json`

## Regle importante

Une categorie ou sous-categorie ne doit entrer dans la taxonomie active que si au moins un premier lot de fiches terme est pret, relu et publiable.

Sinon :
- le site gagne des categories vides
- la navigation devient trompeuse
- la maintenance devient confuse

## Workflow recommande

Pour chaque future sous-categorie :

1. choisir un bloc source dans `site-rtf-taxonomy.json`
2. rediger 5 a 10 vraies fiches dans `content/v2/terms/`
3. relire le francais
4. verifier `npm run content:validate`
5. verifier `npm run content:lint:fr`
6. publier

## Decision de structure

Le document source vise 13 categories x 13 sous-categories.

Cette ambition est bonne, mais elle doit etre introduite progressivement.

Strategie retenue :
- taxonomie cible complete : en preparation
- taxonomie active : seulement ce qui est deja soutenu par de vraies fiches

## Criteres de qualite

Comme DicoArchi est destine a des non-francophones, toute nouvelle fiche doit respecter :

- orthographe correcte
- accents complets
- ponctuation propre
- definition simple
- exemple concret
- categorie et sous-categorie claires

## Suite logique

Le prochain travail utile n'est pas d'ajouter 169 sous-categories vides.

Le prochain travail utile est :
- choisir une categorie cible du document source
- rediger un premier vrai lot de fiches riches
- integrer ces fiches dans `content/v2`
