# Dico-archi

Dico-archi est un dictionnaire d’architecture conçu pour aider les débutants, apprentis, étudiants et jeunes professionnels à mieux comprendre le vocabulaire du métier, les bases techniques, les notions de chantier, les normes et la pratique quotidienne en bureau d’architecture.

## Vision

Le projet vise une plateforme éditoriale et pédagogique durable, claire, sérieuse, maintenable et attractive.

Le site doit permettre :
- la consultation publique des définitions
- la contribution encadrée
- la validation pédagogique par des formateurs
- la supervision complète par un Super Admin
- un apprentissage utile, y compris via des mécanismes ludiques comme le quiz

## Rôles produit

- `Public` : consultation libre
- `Apprenti` : propose du contenu soumis à validation
- `Formateur` : valide, corrige, améliore ou refuse les propositions
- `Super Admin` : supervision complète du site, des utilisateurs et de la structure

## Structure du projet

Les repères principaux sont :

- `TREE.md` : carte rapide du repository
- `PROJECT_RULES.md` : règles de travail du projet
- `CHANGELOG.md` : évolutions importantes validées
- `docs/` : documentation active, de référence, historique et brouillons
- `supabase/` : scripts SQL et organisation base de données
- `scripts/` : scripts de contrôle, maintenance et contenu
- `backups/` : politique de sauvegarde et manifests
- `.codex/` : mémoire et traces liées aux sessions Codex

## Démarrage rapide

Le projet repose actuellement sur un site statique HTML / CSS / JS avec intégration Supabase et déploiement Vercel.

Repères de travail :
- pages publiques : `index.html`, `dictionnaire.html`, `term.html`, `category.html`
- contribution et compte : `auth.html`, `compte.html`, `contribuer.html`
- administration : `admin.html`
- scripts serveur : `api/`
- client Supabase partagé : `supabaseClient.js`
- contenu base de données : `supabase/core/`, `supabase/migrations/`, `supabase/seeds/`
- contenu éditorial canonique : `content/`

## Lecture recommandée en reprise

Ordre conseillé :
1. `PROJECT_RULES.md`
2. `TREE.md`
3. `docs/README.md`
4. `docs/current/REPRISE_DICO_ARCHI.md`
5. `docs/current/RESUME_NOW.md`
6. `docs/current/NEXT_STEPS.md`

## Important

Aucune modification structurelle, suppression, migration ou exécution sensible ne doit être faite sans validation explicite du responsable du projet.

Voir `PROJECT_RULES.md`.
