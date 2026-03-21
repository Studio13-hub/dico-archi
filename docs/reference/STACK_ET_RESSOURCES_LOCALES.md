# Stack et ressources locales - Dico-archi

Date: 2026-03-21
Workspace principal: `/Users/awat/workspace/projects/dico-archi`

## Lecture rapide

Ce document separe:
- ce qui est utilise et stocke localement sur la machine
- ce qui est utilise par le projet mais heberge a l’exterieur

Notation:
- `🟣` = element local present sur la machine

## 1. Projet principal

| Element | Role | Emplacement |
|---|---|---|
| 🟣 Dossier principal du projet | Racine de travail contenant le site, les scripts, les tests, le contenu, les docs et la config | `/Users/awat/workspace/projects/dico-archi` |
| 🟣 Depot Git local | Historique local des changements et synchronisation avec le depot distant | `/Users/awat/workspace/projects/dico-archi/.git` |

## 2. Frontend du site

| Element | Role | Emplacement |
|---|---|---|
| 🟣 Pages HTML | Structure des pages publiques et connectees | `/Users/awat/workspace/projects/dico-archi/*.html` |
| 🟣 JavaScript front | Logique des pages, interactions, rendu dynamique | `/Users/awat/workspace/projects/dico-archi/*.js` |
| 🟣 Feuille de style principale | Apparence visuelle, responsive, hierarchie des ecrans | `/Users/awat/workspace/projects/dico-archi/styles.css` |
| 🟣 Images statiques du site | Illustrations et medias servis par le front | `/Users/awat/workspace/projects/dico-archi/assets` |
| 🟣 Images de termes | Medias publics relies aux fiches termes | `/Users/awat/workspace/projects/dico-archi/term-images` |

## 3. Pages et scripts principaux

| Element | Role | Emplacement |
|---|---|---|
| 🟣 Accueil | Point d’entree public du site | `/Users/awat/workspace/projects/dico-archi/index.html` |
| 🟣 Dictionnaire | Liste et navigation des termes | `/Users/awat/workspace/projects/dico-archi/dictionnaire.html` |
| 🟣 Fiche terme | Affichage detaille d’un terme | `/Users/awat/workspace/projects/dico-archi/term.html` |
| 🟣 Contribution | Depot des propositions de termes | `/Users/awat/workspace/projects/dico-archi/contribuer.html` |
| 🟣 Mon compte | Suivi personnel, messages, propositions | `/Users/awat/workspace/projects/dico-archi/compte.html` |
| 🟣 Administration | Relecture, corpus, suivi, comptes | `/Users/awat/workspace/projects/dico-archi/admin.html` |
| 🟣 Assistant / aide lecture | Assistant et outil `Ecouter / Traduire` | `/Users/awat/workspace/projects/dico-archi/chatbot.js` |
| 🟣 Logique fiche terme | Rendu des contenus riches, medias, traduction | `/Users/awat/workspace/projects/dico-archi/term.page.js` |
| 🟣 Logique admin | Panneaux staff et gestion du corpus | `/Users/awat/workspace/projects/dico-archi/admin.js` |
| 🟣 Logique contribution | Formulaire et workflow de contribution | `/Users/awat/workspace/projects/dico-archi/contribuer.page.js` |
| 🟣 Logique compte | Lecture des roles, messages et suivi | `/Users/awat/workspace/projects/dico-archi/compte.js` |

## 4. Backend du projet

| Element | Role | Emplacement |
|---|---|---|
| 🟣 Dossier API | Endpoints serverless du projet | `/Users/awat/workspace/projects/dico-archi/api` |
| 🟣 API termes | Renvoie les fiches termes | `/Users/awat/workspace/projects/dico-archi/api/terms.js` |
| 🟣 API categories | Renvoie categories et corpus public | `/Users/awat/workspace/projects/dico-archi/api/categories.js` |
| 🟣 API recherche | Recherche des termes | `/Users/awat/workspace/projects/dico-archi/api/search.js` |
| 🟣 API chat | Assistant et traduction | `/Users/awat/workspace/projects/dico-archi/api/chat.js` |
| 🟣 API suivi admin | Metriques et signaux d’usage | `/Users/awat/workspace/projects/dico-archi/api/admin-metrics.js` |
| 🟣 API quiz | Donnees de jeu | `/Users/awat/workspace/projects/dico-archi/api/quiz.js` |
| 🟣 API upload media contribution | Preparation / traitement des medias proposes | `/Users/awat/workspace/projects/dico-archi/api/submission-media-upload.js` |
| 🟣 Canonical content adapter | Pont entre contenu JSON et API publique | `/Users/awat/workspace/projects/dico-archi/api/_canonical_content.js` |

## 5. Contenu editorial versionne

| Element | Role | Emplacement |
|---|---|---|
| 🟣 Dossier contenu canonique | Source editoriale versionnee du dictionnaire | `/Users/awat/workspace/projects/dico-archi/content/v2` |
| 🟣 Termes | Un fichier JSON par terme | `/Users/awat/workspace/projects/dico-archi/content/v2/terms` |
| 🟣 Relations | Liens entre termes | `/Users/awat/workspace/projects/dico-archi/content/v2/relations/relations.json` |
| 🟣 Medias canoniques | Liste des medias associes aux termes | `/Users/awat/workspace/projects/dico-archi/content/v2/media/media.json` |
| 🟣 Taxonomie | Categories et sous-categories | `/Users/awat/workspace/projects/dico-archi/content/v2/taxonomy` |
| 🟣 Schema de terme | Regles de structure des fiches | `/Users/awat/workspace/projects/dico-archi/content/v2/schemas/term.schema.json` |
| 🟣 Fiche `Bois lamelle-colle` | Fiche editoriale modele actuelle | `/Users/awat/workspace/projects/dico-archi/content/v2/terms/bois-lamelle-colle.json` |

## 6. Medias locaux ajoutes au projet

| Element | Role | Emplacement |
|---|---|---|
| 🟣 Dossier medias `Bois lamelle-colle` | Images publiques liees a la fiche | `/Users/awat/workspace/projects/dico-archi/term-images/bois-lamelle-colle` |
| 🟣 Photo source 1 | Image importee depuis le dossier OneDrive local | `/Users/awat/Downloads/OneDrive_1_19-03-2026/Charpente lamellé collé.jpg` |
| 🟣 Photo source 2 | Image importee depuis le dossier OneDrive local | `/Users/awat/Downloads/OneDrive_1_19-03-2026/best-wood-kvh-1.jpg` |
| 🟣 Photo source 3 | Image importee depuis le dossier OneDrive local | `/Users/awat/Downloads/OneDrive_1_19-03-2026/lamelle-colle-et-contrecolle.jpg` |
| 🟣 Images integrees au site | Copies renommees et servies par le projet | `/Users/awat/workspace/projects/dico-archi/term-images/bois-lamelle-colle` |

## 7. Base de donnees et SQL

| Element | Role | Emplacement |
|---|---|---|
| 🟣 Dossier Supabase local | Configuration, migrations, seeds et SQL du projet | `/Users/awat/workspace/projects/dico-archi/supabase` |
| 🟣 Migrations | Evolution de la structure de base de donnees | `/Users/awat/workspace/projects/dico-archi/supabase/migrations` |
| 🟣 Seeds | Donnees d’initialisation SQL | `/Users/awat/workspace/projects/dico-archi/supabase/seeds` |
| 🟣 Config Supabase locale | Parametres de travail Supabase | `/Users/awat/workspace/projects/dico-archi/supabase/config.toml` |
| 🟣 Client Supabase front | Connexion du site au backend Supabase | `/Users/awat/workspace/projects/dico-archi/supabaseClient.js` |
| 🟣 Migration 017 | Metriques de pages et scores de jeux | `/Users/awat/workspace/projects/dico-archi/supabase/migrations/017_metrics_and_game_scores.sql` |
| 🟣 Migration 019 | Payloads riches pour termes et soumissions | `/Users/awat/workspace/projects/dico-archi/supabase/migrations/019_rich_payload_terms_and_submissions.sql` |
| 🟣 Migrations 020 a 022 | Notifications, messages editoriaux, resoumission | `/Users/awat/workspace/projects/dico-archi/supabase/migrations` |

## 8. Tests, validation et qualite

| Element | Role | Emplacement |
|---|---|---|
| 🟣 Tests E2E publics | Verification automatique des parcours publics | `/Users/awat/workspace/projects/dico-archi/Test/e2e/public-pages.spec.js` |
| 🟣 Config Playwright | Parametres de lancement des tests UI | `/Users/awat/workspace/projects/dico-archi/playwright.config.js` |
| 🟣 Resultats de tests | Screenshots et artefacts de test locaux | `/Users/awat/workspace/projects/dico-archi/test-results` |
| 🟣 Scripts de validation contenu | Verification structurelle du corpus | `/Users/awat/workspace/projects/dico-archi/scripts/content/validate_core_content.js` |
| 🟣 Scripts de stats contenu | Analyse du volume et de la repartition du contenu | `/Users/awat/workspace/projects/dico-archi/scripts/content/content_stats.js` |
| 🟣 Scripts d’audit contenu | Priorisation des trous editoriaux | `/Users/awat/workspace/projects/dico-archi/scripts/content/content_audit.js` |

## 9. Scripts techniques et publication

| Element | Role | Emplacement |
|---|---|---|
| 🟣 Scripts contenu | Transformation, publication, validation du corpus | `/Users/awat/workspace/projects/dico-archi/scripts/content` |
| 🟣 Script de recette workflow prod | Test automatise du circuit apprenti / formateur | `/Users/awat/workspace/projects/dico-archi/scripts/e2e_prod_editorial_workflow.js` |
| 🟣 Configuration Vercel | Reglages de deploiement et runtime | `/Users/awat/workspace/projects/dico-archi/vercel.json` |
| 🟣 Config Node / npm | Dependances et commandes du projet | `/Users/awat/workspace/projects/dico-archi/package.json` |
| 🟣 Lockfile npm | Version exacte des dependances | `/Users/awat/workspace/projects/dico-archi/package-lock.json` |
| 🟣 Dependances installees | Bibliotheques telechargees localement | `/Users/awat/workspace/projects/dico-archi/node_modules` |

## 10. Documentation et memoire

| Element | Role | Emplacement |
|---|---|---|
| 🟣 Dossier docs | Documentation de projet | `/Users/awat/workspace/projects/dico-archi/docs` |
| 🟣 Resume now | Etat immediat du projet | `/Users/awat/workspace/projects/dico-archi/docs/RESUME_NOW.md` |
| 🟣 Next steps | Priorites de reprise | `/Users/awat/workspace/projects/dico-archi/docs/NEXT_STEPS.md` |
| 🟣 Journal | Chronologie detaillee du travail effectue | `/Users/awat/workspace/projects/dico-archi/docs/JOURNAL.md` |
| 🟣 Historique | Vue synthetique des lots de changements | `/Users/awat/workspace/projects/dico-archi/docs/HISTORIQUE.md` |
| 🟣 Memoire Codex du projet | Memoire longue de reprise | `/Users/awat/.codex/memories/DICO_ARCHI_MEMORY_2026-03-08.md` |

## 11. Outils installes sur la machine

| Element | Role | Emplacement |
|---|---|---|
| 🟣 Node.js | Runtime JavaScript pour scripts et outils | `/usr/local/bin/node` |
| 🟣 npm | Gestionnaire de dependances et scripts | `/usr/local/bin/npm` |
| 🟣 Git | Versionnement du projet | `/usr/local/bin/git` |
| 🟣 Vercel CLI | Lancement local et deploiement | `/usr/local/bin/vercel` |
| 🟣 Python 3 | Outil systeme secondaire utilise ponctuellement | `/usr/local/bin/python3` |
| 🟣 osascript | Outil macOS pour automatisation AppleScript | `/usr/bin/osascript` |

## 12. Services utilises mais externes a la machine

| Element | Role | Emplacement |
|---|---|---|
| GitHub | Depot distant et synchronisation | Externe |
| Vercel | Publication du site et execution des API serverless | Externe |
| Supabase | Base de donnees, authentification, roles, donnees dynamiques | Externe |
| Domaine web | Adresse publique stable du site | Externe |
| Futur stockage media pro | Stockage durable des images et PDF quand le volume augmentera | Externe |

## 13. Langages et formats utilises

| Element | Role | Emplacement |
|---|---|---|
| 🟣 HTML | Structure des pages web | `/Users/awat/workspace/projects/dico-archi/*.html` |
| 🟣 CSS | Presentation visuelle du site | `/Users/awat/workspace/projects/dico-archi/styles.css` |
| 🟣 JavaScript | Logique frontend, backend et scripts | `/Users/awat/workspace/projects/dico-archi/*.js`, `/api`, `/scripts` |
| 🟣 SQL | Structure et evolution de la base | `/Users/awat/workspace/projects/dico-archi/supabase` |
| 🟣 JSON | Contenu canonique, taxonomie, medias | `/Users/awat/workspace/projects/dico-archi/content/v2` |

## 14. Resume ultra court

Le projet utilise localement:
- un site en `HTML / CSS / JavaScript`
- des API serverless JavaScript
- une base preparee en `SQL` via Supabase
- un contenu canonique versionne en `JSON`
- des tests Playwright
- des medias locaux integres dans le repo
- des outils de dev locaux:
  - `node`
  - `npm`
  - `git`
  - `vercel`

Les services externes principaux sont:
- GitHub
- Vercel
- Supabase
- le futur domaine `.ch`
- un futur stockage media professionnel
