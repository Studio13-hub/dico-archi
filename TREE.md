# TREE

Carte simplifiée du repository Dico-archi.

## Racine

- `README.md` : entrée générale du projet
- `PROJECT_RULES.md` : règles de gouvernance
- `CHANGELOG.md` : évolutions importantes validées
- `TREE.md` : carte du repository

## Front principal

- `index.html` : page d’accueil
- `dictionnaire.html` : page dictionnaire principale
- `term.html` : fiche terme
- `category.html` : vue catégorie
- `auth.html` : connexion / création de compte
- `compte.html` : compte utilisateur
- `contribuer.html` : contribution
- `admin.html` : administration

## Logique front

- `*.js` : scripts principaux du site
- `styles.css` : styles globaux
- `assets/` : illustrations et médias statiques
- `api/` : endpoints serveur

## Données

- `data/content/` : données éditoriales et fichiers de contenu
- `data/cache/` : caches temporaires
- `data/exports/` : exports et snapshots

## Documentation

- `docs/README.md` : porte d’entrée documentaire
- `docs/current/` : état actuel et reprise
- `docs/reference/` : documentation stable
- `docs/history/` : journal, décisions, archives
- `docs/drafts/` : brouillons
- `docs/archive/` : documentation sortie du flux actif

## Base de données

- `supabase/README.md` : source de vérité SQL
- `supabase/core/` : socle base et storage
- `supabase/security/` : rôles, sécurité, policies
- `supabase/features/` : scripts fonctionnels
- `supabase/seeds/` : alimentation de contenu
- `supabase/migrations_manual/` : migrations manuelles documentées
- `supabase/archive/` : scripts sortis du flux actif

## Scripts

- `scripts/README.md` : index des scripts
- `scripts/checks/` : contrôles
- `scripts/content/` : import et transformation de contenu
- `scripts/maintenance/` : maintenance projet
- `scripts/archive/` : scripts non actifs

## Sauvegarde

- `backups/README.md` : politique de sauvegarde
- `backups/manifests/` : manifests de sauvegarde

## Codex

- `.codex/memories/` : mémoire persistante du projet
- `.codex/sessions/` : traces de sessions Codex
