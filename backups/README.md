# Backups

Ce dossier définit le cadre de sauvegarde et de reprise du projet Dico-archi.

Il ne doit pas devenir un dépôt de fichiers non documentés.

## Objectif

Permettre :
- la traçabilité des sauvegardes
- la préparation de plans de reprise
- la restauration méthodique en cas d’incident

## Structure

### `manifests/`

Manifests textuels décrivant :
- ce qui a été sauvegardé
- quand
- dans quel contexte
- où se trouve la sauvegarde réelle
- quel est son périmètre

Exemples de périmètre :
- contenu
- exports
- snapshot base
- configuration
- médias

## Règles

- ne pas déposer de backups opaques sans description
- toujours documenter la date, le contenu et le but
- distinguer sauvegarde projet, sauvegarde contenu et sauvegarde base
- l’existence d’une sauvegarde doit pouvoir être comprise sans ouvrir un fichier binaire

## Référence associée

Le plan de reprise incident doit être documenté dans :
- `docs/reference/RECOVERY_PLAN.md`

## Important

Toute opération de sauvegarde ou restauration sensible doit être explicitement validée.

Voir `../PROJECT_RULES.md`.
