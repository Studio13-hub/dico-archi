# Journal de bord - Dico-archi

## 2026-03-09
- Reprise macro `RepriseDico-archi` executee (diagnostic git/docs/code + serveur local).
- Pipeline livraison complete durant la session:
  - commits atomiques successifs
  - push `main`
  - deploiements Vercel prod verifies.

### Refonte structure des pages
- `index.html` transforme en page de bienvenue.
- `dictionnaire.html` cree comme page dictionnaire principale.
- navigation recablee vers `dictionnaire.html`.
- texte d'accueil remplace par version inclusive avec accents FR.

### Durcissement fiabilite/front
- synchronisation auth multi-pages (`app.js`, `nav.js`, `compte.js`, `contribuer.js`, `admin.js`).
- gestion session expiree plus robuste.
- verrous anti double-action sur operations sensibles.
- correction UX chatbot: fermeture fiable (bouton/ESC/clic exterieur), contraste saisie + bulle utilisateur.

### Chatbot
- ajout widget global `chatbot.js` sur toutes les pages.
- backend IA `api/chat.js`.
- migration OpenAI -> Gemini (`GEMINI_API_KEY`, `GEMINI_MODEL`).
- ajout fallback local intelligent (termes/navigation) si API indisponible.
- enrichissement UX:
  - bouton `Copier`
  - lien `Voir la fiche`
  - recadrage hors sujet.

### Feedback chatbot
- collecte feedback `Utile` / `A ameliorer` ajoutee (`api/chat-feedback.js`).
- table SQL `supabase/chatbot_feedback.sql` ajoutee.
- corrections config Vercel/Supabase appliquees pour insertion serveur.
- panneau super admin `Feedback chatbot` ajoute dans `admin.html`:
  - API `api/chat-feedback-list.js`
  - filtres note/source + rafraichissement.

### Qualite / outillage
- `scripts/term_quality_check.js` renforce:
  - detection doublons insensible casse/accents
  - verification references liees
  - validation URL media.
- `scripts/check_resume.sh` aligne avec structure actuelle et checks JS/quality.
- `.gitignore` complete (`.DS_Store`, logs, temp, pycache).

## 2026-03-10
- Reprise `RepriseDico-archi` executee en diagnostic lecture seule (git/docs/code + roles SQL + serveur local).
- Chatbot / feedback durcis:
  - `api/chat.js` retourne aussi le `model` Gemini effectif pour tracer la reponse servie.
  - `chatbot.js` attache le `model` au feedback et ajoute un anti-spam par session:
    - doublon meme message/note bloque
    - cooldown court entre deux feedbacks.
  - `api/chat-feedback.js` ajoute une protection serveur:
    - dedupe par `session_id + rating + assistant_message`
    - cooldown serveur 15 s par session.
- Dashboard super admin enrichi:
  - stats compactes feedback chatbot
  - top questions les plus negativement notees
  - export CSV depuis `admin.html` / `admin.js`.
- Assainissement SQL legacy:
  - scripts historiques `schema.sql`, `audit.sql`, `submissions.sql`, `submissions_update.sql`, `storage.sql`, `terms_workflow.sql`
  - policies alignees sur `public.is_staff()` et sur `profiles.role` / `profiles.active`
  - compatibilite `is_editor` conservee via les helpers staff existants.
- Ajustement UX feedback chatbot:
  - suppression du cooldown global entre deux reponses differentes
  - maintien du blocage doublon sur une meme reponse dans une meme session.

## 2026-03-11
- Reprise `RepriseDico-archi` executee avec diagnostic lecture seule puis patch role/permissions valide.
- Durcissement roles / permissions:
  - correction du risque legacy ou un profil retrograde en `apprenti` pouvait conserver des droits staff via `is_editor = true`
  - `public.is_staff()` passe en logique `role` prioritaire, `is_editor` uniquement en fallback si `role` est absent
  - `admin_update_profile(...)` resynchronise maintenant `is_editor` avec le role cible
  - backfill ajoute dans `supabase/roles_rdr.sql` pour remettre `is_editor` en coherence avec `role`.
- Alignement UX des roles:
  - libelle public `Formateur` affiche a la place de `Maitre apprentissage`
  - pages `admin`, `compte`, `contribuer`, `auth`, `nav` alignees sur ce vocabulaire
  - le slug technique `maitre_apprentissage` est conserve en base pour compatibilite.
- Serveur local relance:
  - `python3 -m http.server 4173` actif pendant la session de reprise.

## 2026-03-14
- Session longue de stabilisation produit + UX + workflow editorial.
- Parcours publics et auth fiabilises:
  - inscription, confirmation email, creation automatique du profil
  - correction des collisions JS multi-pages
  - harmonisation des menus et de l’etat de session
- Roles visibles simplifiés cote interface:
  - `Contributeur`
  - `Relecture`
  - `Administration`
- `Mon compte` rendu vraiment utile avec role, etat, actions utiles et dernieres propositions.
- `Contribuer` renforce:
  - meilleur guidage
  - vrais labels
  - controle qualite en direct
  - upload temporaire de medias fonctionnel
- Workflow media:
  - upload temporaire via URL signee
  - URLs reinjectees automatiquement dans la proposition
  - apercu admin des images/PDF a valider
- Pile ludique consolidee:
  - `Quiz`
  - `Swipe`
  - `Rush`
  - `Defi du jour`
  - `Duel Beta`
- Bloc `Façades` ajoute au corpus V2 puis publie en prod.
- Premier lot `stats + scores` implemente:
  - migration `017_metrics_and_game_scores.sql`
  - endpoint `api/track-page.js`
  - endpoint `api/game-score.js`
  - endpoint `api/admin-metrics.js`
  - `tracker.js` branche sur les pages principales
  - admin section `Suivi` enrichie
- Reste a faire au prochain demarrage:
  - executer la migration `017_metrics_and_game_scores.sql` dans Supabase
  - verifier les premieres stats et scores remontes dans l’admin
