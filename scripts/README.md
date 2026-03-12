# Scripts Dico-archi

Ce dossier regroupe les scripts utilitaires du projet.

Le but est d’éviter un dossier `scripts/` fourre-tout et de rendre chaque script identifiable.

## Structure

### `checks/`

Scripts de vérification.

Exemples :
- contrôles de cohérence
- contrôles de reprise
- vérifications qualité

### `content/`

Scripts liés aux imports, transformations ou traitements de contenu éditorial.

### `maintenance/`

Scripts de maintenance du projet.

Exemples :
- génération de sitemap
- synchronisation technique
- tâches de support

### `archive/`

Scripts non actifs, conservés pour mémoire ou référence.
Ils ne doivent pas être utilisés comme scripts de travail courant.

## Règles

- chaque script doit avoir un but clair
- le nom du script doit décrire sa fonction
- les scripts non actifs ne doivent pas rester mélangés avec les scripts de production
- si un script devient obsolète, il doit être archivé proprement ou supprimé plus tard après validation

## Précaution

Avant de déplacer un script, vérifier :
- les chemins utilisés dans le script
- les documents qui le référencent
- les commandes de reprise existantes
