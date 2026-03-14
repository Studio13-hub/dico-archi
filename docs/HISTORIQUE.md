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
