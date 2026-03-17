# Historique des changements - Dico-archi

## 2026-03-09

### Architecture pages
- `index.html` devient page de bienvenue.
- `dictionnaire.html` devient la page dictionnaire principale.
- liens internes recables vers `dictionnaire.html`.

### Fiabilite session / navigation
- harmonisation des etats auth entre pages (`app.js`, `nav.js`, `compte.js`, `contribuer.js`, `admin.js`).
- gestion explicite des erreurs session/JWT expire.
- verrous anti double clic et actions concurrentes.

### Securite / deploiement
- headers de securite Vercel maintenus et verifies en prod.
- controles media front + SQL maintenus.

### Chatbot
- widget global sur toutes les pages (`chatbot.js`).
- backend IA serveur (`api/chat.js`) migre vers Gemini.
- fallback local conserve pour continuite de service.
- UX chatbot amelioree:
  - bouton `Copier`
  - lien `Voir la fiche`
  - fermeture robuste (bouton, ESC, clic exterieur)
  - contraste texte corrige.

### Feedback chatbot + observabilite
- endpoint insertion: `api/chat-feedback.js`.
- table SQL: `supabase/chatbot_feedback.sql`.
- endpoint lecture admin: `api/chat-feedback-list.js`.
- section admin super admin: `Feedback chatbot` (filtres + rafraichissement).

### Outillage qualite
- `scripts/term_quality_check.js` renforce (doublons, references, media).
- `scripts/check_resume.sh` aligne avec arborescence actuelle.
- `.gitignore` complete (`.DS_Store`, `*.log`, `supabase/.temp/`, `__pycache__/`, `*.pyc`).

## 2026-03-10

### Chatbot / feedback
- `api/chat.js` expose maintenant le `model` Gemini effectif dans la reponse.
- `chatbot.js` transmet ce `model` dans les feedbacks au lieu d'un champ vide.
- anti-spam feedback ajoute:
  - blocage doublon sur meme session/message/note
  - pas de cooldown global entre deux reponses differentes.

### Admin super admin
- section `Feedback chatbot` enrichie avec:
  - stats compactes
  - top questions a reprendre
  - export CSV du jeu de resultats filtre.

### SQL / roles
- scripts Supabase legacy harmonises avec le modele de roles:
  - ajout de `role` / `active` et helpers `profile_role()`, `is_staff()`, `is_super_admin()` dans `schema.sql`
  - policies historiques `terms`, `submissions`, `audit_logs`, `storage.objects` recablees sur `public.is_staff()`
  - compatibilite ancienne colonne `is_editor` maintenue comme fallback.

## 2026-03-11

### Roles / autorisations
- faille legacy corrigee:
  - un profil `apprenti` avec `is_editor = true` ne conserve plus de droits staff
  - `is_staff()` et le front appliquent maintenant une logique `role` d'abord, fallback `is_editor` uniquement si `role` est absent
  - `admin_update_profile(...)` remet `is_editor` en coherence lors d'un changement de role
  - `roles_rdr.sql` ajoute un backfill pour nettoyer les profils incoherents.

### Vocabulaire UI
- libelle `Formateur` adopte cote site pour le role technique `maitre_apprentissage`.
- structure fonctionnelle explicitee:
  - `Super admin`: gestion complete
  - `Formateur`: validation et correction editoriale
  - `Apprenti`: contribution soumise a validation
  - `Public`: consultation.

## 2026-03-14

### Auth / profils
- creation de compte, confirmation email et provisioning `profiles` remis en etat
- pages `auth`, `compte`, `contribuer` et `admin` isolees proprement pour eviter les collisions JS

### UX / roles
- vocabulaire visible simplifie:
  - `Contributeur`
  - `Relecture`
  - `Administration`
- admin reorganisee en sections plus lisibles:
  - `Vue d’ensemble`
  - `Corpus`
  - `Comptes`
  - `Suivi`

### Contribution / medias
- `contribuer.html` refondue pour etre plus claire
- upload temporaire de medias implemente via URL signee:
  - `api/submission-media-upload.js`
  - `supabaseClient.js`
  - `contribuer.page.js`
- apercus medias admin ajoutes dans `admin.js`

### Corpus / contenu
- premier lot `Façades` ajoute au corpus V2 et publie
- fiches terme rendues plus editoriales avec sections riches

### Jeux / engagement
- pile ludique structuree autour de:
  - `Quiz`
  - `Swipe`
  - `Rush`
  - `Defi du jour`
  - `Duel Beta`

### Stats / suivi
- socle de suivi serveur ajoute:
  - `supabase/migrations/017_metrics_and_game_scores.sql`
  - `api/track-page.js`
  - `api/game-score.js`
  - `api/admin-metrics.js`
  - `tracker.js`
- l’admin peut maintenant afficher:
  - vues 24 h
  - sessions 24 h
  - pages les plus vues
  - jeux les plus actifs
  - derniers scores
- point restant:
  - migration SQL `017_metrics_and_game_scores.sql` a executer en base pour activer les donnees reelles

## 2026-03-15

### Admin / suivi
- compteurs admin corriges:
  - `A relire` compte maintenant bien les termes `validated`
- section `Suivi` durcie:
  - message explicite si les tables de suivi sont absentes
  - rendu DOM sans `innerHTML` pour les donnees serveur
- chargement admin fiabilise:
  - `Comptes` et `Suivi` caches tant que le role n’est pas confirme
  - etat `Rôle : chargement...` / `Rôle : indisponible` ajoute

### Tracking
- normalisation ajoutee pour eviter le dedoublement de l’accueil entre `/` et `index.html`
  - a l’insertion dans `api/track-page.js`
  - a l’aggregation dans `api/admin-metrics.js`

### Cap produit
- nouvel ordre directeur fixe pour la suite:
  - esthetique
  - fonctionnement
  - roles
  - pages
  - contenus
  - acces / attribution
- references produit retenues:
  - entree plus visuelle et plus spatiale type univers / batiments, avec interet pour la 3D
  - lecture plus editoriale et plus lisible type dictionnaire de reference

### Accueil / marque / direction visuelle
- `index.html` reprise en profondeur sur une logique plus editoriale et plus institutionnelle
- marque accueil alignee sur:
  - `Dico-Archi`
  - `Le dictionnaire du dessinateur en architecture`
- navigation desktop visible ajoutee sur l’accueil
- `Fiche du jour` conservee comme composant de preuve editoriale
- acces principaux de l’accueil reordonnes pour privilegier:
  - dictionnaire
  - categories
  - methodologie
- stats publiques retirees du home
- jeux retires des acces principaux du home
- section centrale stabilisee en `Cadre éditorial`
- footer simplifie et rendu plus statutaire
- assistant conserve sur l’accueil, mais recadre avec un libelle d’usage
- trame technique tres discrete ajoutee dans le hero pour renforcer la sensation “architecture”

### Verification UI
- Playwright installe et adopte comme verifier standard pour les lots UI publics:
  - `playwright.config.js`
  - `Test/e2e/public-pages.spec.js`
- l’accueil est desormais valide a chaque lot par:
  - smoke test
  - test d’interactions
  - capture visuelle locale

## 2026-03-16

### Mon compte
- `compte.html` aligne sur la marque `Dico-Archi`
- bouton `Se déconnecter` harmonise avec les autres actions
- `compte.js` accepte explicitement la barre d’espace sur les liens rendus visuellement comme boutons

### Admin / accessibilite / fiabilite
- `admin.html` restructure les onglets comme un vrai `tablist` accessible:
  - `role="tablist"`
  - `role="tab"`
  - `role="tabpanel"`
  - `aria-selected`
  - `aria-controls`
  - `tabindex`
- `admin.js` ajoute la navigation clavier des onglets:
  - fleches gauche/droite/haut/bas
  - `Home`
  - `End`
  - activation `Espace`
- permissions d’interface alignees:
  - `Suivi` visible pour le staff
  - `Comptes` reserve au `super_admin`
  - `Feedback assistant` reserve au `super_admin`
- rechargement des donnees a l’ouverture des onglets sensibles:
  - `Comptes`
  - `Suivi`
  - `Feedback assistant`
- bloc `Suivi` clarifie:
  - message de chargement
  - date de derniere actualisation
  - nettoyage propre du rendu avant refresh

### Verification
- verification locale repetee apres les lots du jour:
  - `node --check admin.js`
  - `node --check compte.js`
  - `npm run test:ui`
- premier cycle public du jour valide en `9 passed`
- couverture Playwright etendue ensuite:
  - pages secondaires:
    - `auth.html`
    - `compte.html`
    - `contribuer.html`
    - `methodologie.html`
    - `games.html`
  - pages de jeux:
    - `quiz.html`
    - `flashcards.html`
    - `match.html`
    - `daily.html`
    - `memory.html`
  - mock de `/api/quiz` ajoute pour les smoke tests locaux des jeux
  - resultat final consolide:
    - `19 passed`

### Deploiement
- redeploiement production effectue via `vercel --prod`
- alias production confirme:
  - `https://dico-archi.vercel.app`
- verification HTTP prod:
  - statut `200`
  - headers de securite Vercel toujours presents

### Supabase
- nouvelle migration dans le flux actif:
  - `supabase/migrations/018_site_visitors.sql`
- code serveur deja branche sur `site_visitors`:
  - `api/track-page.js`
  - `api/home-metrics.js`
- runbook de sortie pret:
  - `docs/SUPABASE_018_RUNBOOK.md`
- authentification CLI finalement realisee dans la meme session
- `supabase db push` reste bloque depuis cette machine a cause d’un timeout reseau vers Postgres
- migration `018_site_visitors.sql` appliquee avec succes via SQL Editor Supabase
- verification post-migration effectuee:
  - `api/home-metrics` repond en production
  - `admin.html` -> `Suivi` charge correctement
  - routes jeux prod repondent toutes en `HTTP 200`

### Dette de coherence restante
- la dette de marque a ete largement reduite le `2026-03-16`
- restent surtout des identifiants techniques JS volontairement conserves:
  - `window.DicoArchiApi`
  - `window.DicoArchiSupabase`
  - `window.DicoArchiMetrics`
- correctif final de coherence tracking:
  - `api/admin-metrics.js` remappe maintenant certains titres de pages par chemin canonique pour eviter l’affichage de vieilles marques dans `Suivi`
- correctif final de coherence feedback:
  - `api/chat-feedback-list.js` remappe aussi les titres historiques du panneau `Feedback assistant`

### Assistant Gemini
- `api/chat.js` n’utilise plus l’appel REST manuel Gemini
- backend migre vers le SDK officiel `@google/genai`
- modele par defaut retenu:
  - `gemini-2.5-flash`
- verification de fin de session:
  - reponse prod valide sur une question simple de definition
  - `model: gemini-2.5-flash`
  - Playwright public revalide hors sandbox en `19 passed`
- couches d’amelioration ajoutees ensuite:
  - reponses deterministes pour navigation et messages tres courts
  - reponses de terme alimentees par le corpus canonique `content/v2`
  - tolerance sur pluriels, fautes mineures et lettres repetees
  - desambiguïsation sur termes proches
  - clarification sans faux lien unique final
  - rendu chatbot nettoye:
    - liens de clarification cliquables
    - URLs brutes retirees
    - typographie plus lisible
