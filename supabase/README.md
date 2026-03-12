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
- `storage.sql`
- `audit.sql`

Rôle :
- structure générale
- tables
- fonctions de base
- storage
- audit

### `security/`

Sécurité et gouvernance des accès.

Contient notamment :
- rôles
- policies
- RPC liées à l’administration
- règles de sécurité médias

### `features/`

Scripts SQL liés aux fonctionnalités métier.

Exemples :
- workflow éditorial
- soumissions
- acceptation atomique
- feedback chatbot

### `seeds/`

Scripts de contenu et d’alimentation.

### `migrations_manual/`

Historique manuel des migrations à tracer explicitement si nécessaire.

### `archive/`

Scripts retirés du flux actif, mais conservés à titre d’historique.

## Règle de classification

Chaque script doit pouvoir être qualifié comme :
- actif
- legacy-compatible
- archive-candidate
- archivé

Cette qualification doit être documentée avant tout nettoyage.

## Source de vérité

- la logique structurelle doit être cohérente avec `docs/reference/DATA_MODEL.md`
- la logique de sécurité doit être cohérente avec `docs/reference/SECURITY.md`
- la logique rôles et workflow doit être cohérente avec `docs/reference/ROLES_WORKFLOW.md`

## Important

Aucune exécution SQL ne doit être faite sans validation explicite du responsable du projet.

Voir `../PROJECT_RULES.md`.
