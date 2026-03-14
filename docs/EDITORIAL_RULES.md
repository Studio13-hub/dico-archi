# Règles éditoriales DicoArchi

Ce dictionnaire est conçu pour les non-francophones.

Objectif :
- garantir une orthographe française précise
- utiliser correctement les accents (`é`, `è`, `à`, `ç`, `û`, etc.)
- garder une ponctuation rigoureuse
- proposer des définitions claires, pédagogiques et adaptées à tous les niveaux

## Principes

- un terme visible doit être écrit en français correct
- les accents ne sont pas optionnels dans le contenu éditorial final
- une définition doit être simple, courte et se terminer par une ponctuation forte
- un exemple doit être concret et compréhensible en bureau, sur plan ou sur chantier
- le ton doit être explicatif, jamais jargonnant pour le plaisir
- les sigles doivent être explicités si leur sens n'est pas évident

## Règles de rédaction

- préférer une phrase courte à une phrase longue
- utiliser les apostrophes et accents correctement
- éviter les formulations télégraphiques si elles nuisent à la compréhension
- éviter les doublons d'information entre définition et exemple
- garder le même terme français principal dans le titre, la fiche et les relations

## Règles de ponctuation

- `definition` doit se terminer par `.`, `?` ou `!`
- `example` doit se terminer par `.`, `?` ou `!`
- éviter les doubles espaces
- éviter les listes cachées dans une seule phrase si elles rendent la lecture confuse

## Règles de qualité linguistique

- ne pas laisser une version ASCII simplifiée si la forme accentuée est la forme correcte
- exemples fréquents :
  - `Etancheite` -> `Étanchéité`
  - `Facade` -> `Façade`
  - `Echelle` -> `Échelle`
  - `Acrotere` -> `Acrotère`
  - `interieur` -> `intérieur`
  - `batiment` -> `bâtiment`

## Pipeline

- `content/` reste la source canonique
- la validation structurelle passe par `npm run content:validate`
- la vérification linguistique passe par `npm run content:lint:fr`
- la présence d'avertissements linguistiques doit être traitée avant une bascule éditoriale importante
