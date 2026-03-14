# Supabase - Source de vérité SQL

Ce dossier regroupe les scripts SQL et la structure logique de la base Dico-archi.

Ce document est la référence de navigation pour tout ce qui concerne :
- la structure des tables
- les rôles et permissions
- les scripts fonctionnels
- les seeds
- l’ordre de lecture et de vérification

## Structure

### `core/`

Socle principal de la base.

Contient notamment :
- `schema.sql`

Rôle :
- structure générale
- tables
- contraintes et index canoniques

### `security/`

Sécurité et gouvernance des accès de travail.

Contient notamment :
- policies
- helpers
- variantes de travail encore non fusionnées dans les migrations

### `migrations/`

Chaîne exécutable officielle.

Rôle :
- création du schéma core
- intégration auth/profiles
- unification des rôles
- sécurité RLS
- storage
- RPC admin

### `seeds/`

Sources SQL initiales compatibles avec le modèle core.

### `legacy/`

Scripts historiques conservés pour référence.

### `archive/`

Scripts retirés du flux actif, mais conservés à titre d’historique.

## Source active

Aujourd’hui, les sources actives sont :

- `core/schema.sql`
- `migrations/`
- `seeds/`

Le reste est soit archive, soit matériau de travail secondaire.

## Règle de classification

Chaque script doit pouvoir être qualifié comme :
- actif
- legacy-compatible
- archive-candidate
- archivé

Cette qualification doit être documentée avant tout nettoyage.

## Important

Aucune exécution SQL ne doit être faite sans validation explicite du responsable du projet.

Voir `../PROJECT_RULES.md`.
