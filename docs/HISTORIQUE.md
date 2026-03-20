# Historique des changements - Dico-archi

## 2026-03-20

### Clarification finale des surfaces de travail + simplification de la fiche terme
- commits pousses sur `main`:
  - `c2821d0`
  - `a6c44b0`
  - `352102e`
- effets fonctionnels:
  - empilement propre `Assistant` + `Ecouter / Traduire`
  - reduction du contenu principal quand le dock est ouvert sur desktop
  - verification explicite que `Bois lamellé-collé` reste expose publiquement
  - `Mon compte`, `Contribuer` et `Administration` recales sur un usage plus evident
  - fiche terme redecoupee en sequence de lecture plus lisible
  - etat vide media rendu explicite au lieu de masquer la section
- verification finale:
  - suite publique Playwright:
    - `31 passed`

### Recette workflow prod refermee
- [scripts/e2e_prod_editorial_workflow.js](/Users/awat/workspace/projects/dico-archi/scripts/e2e_prod_editorial_workflow.js) a ete referme fonctionnellement
- ameliorations ajoutees:
  - logs d’etapes
  - screenshot automatique en echec
  - mode headless configurable
- premier rerun:
  - blocage sandbox Chromium local
  - rerun hors sandbox ensuite
- vrai probleme isole:
  - l’assertion du script apres `Refuser` etait invalide
  - une proposition `rejected` disparait de la file `#submissions`
  - elle n’y reste pas avec le badge `Refusée`
- correctif:
  - le script attend maintenant:
    - soit le message `proposition refusée`
    - soit la disparition de la ligne
- verification finale reussie en prod:
  - terme:
    - `Workflow réel 2026-03-20-11-56`
  - id:
    - `7d565e71-331a-4c42-a981-b2048c522963`
  - cycle complet:
    - depot
    - refus commente
    - message
    - correction
    - resoumission
    - verification finale formateur

### Grand lot UX / produit valide
- commits pousses sur `main`:
  - `2f7371c`
  - `112e012`
  - `4554e5f`
  - `8fe4d40`
  - `f5ff99d`
  - `4eb77f5`
  - `46228f7`
  - `96128b9`
  - `3af306a`
- effet global:
  - admin simplifie
  - roles visibles clarifies
  - surfaces connectees allegées
  - entrees publiques renforcees
  - libelles d’action homogenises
- verification finale:
  - suite publique Playwright:
    - `27 passed`
  - verification connectee `Formateur`:
    - `admin`
    - `stats`
    - `compte`
    - `contribuer`
    - OK

### Script workflow prod remis a niveau
- commit utile:
  - `4d288a5`
- [scripts/e2e_prod_editorial_workflow.js](/Users/awat/workspace/projects/dico-archi/scripts/e2e_prod_editorial_workflow.js) ne depend plus de credentials figes
- le script sait maintenant:
  - lire ses comptes via variables d’environnement
  - tolerer les lenteurs auth de prod
  - ouvrir le bloc riche de `Contribuer`
  - cibler le bouton `Relire` dans `Admin`
- etat de sortie:
  - les comptes `apprenti` et `formateur` sont valides en prod
  - la vraie recette complete reste a instrumenter plus finement avant cloture totale
### Projet Supabase mis en pause
- alerte externe recue le `2026-03-20`:
  - le projet Supabase free-tier `Le dictionnaire - dessinateur en architecture` a ete mis en pause apres 7 jours d’inactivite
- verification technique le meme jour:
  - Vercel prod pointe en fait vers `https://iuvjmctrzgztelrsuquc.supabase.co`
  - le projet Supabase actif du workspace est `iuvjmctrzgztelrsuquc` (`dico-archi-clean`)
  - le projet mis en pause `lzkgvqoohknurqlbwfro` est donc un ancien projet distinct
- impact:
  - risque d’indisponibilite temporaire sur les parcours relies a Supabase
  - `Suivi` admin peut sembler casse alors que le probleme vient du projet pause
- reprise conseillee:
  - verification Vercel + workspace local confirmee sur `iuvjmctrzgztelrsuquc`
  - ancien projet `lzkgvqoohknurqlbwfro` supprime ensuite pour eviter les confusions futures

### Nettoyage final + validation prod
- commit de cloture:
  - `fe4b7b1`
- etat final confirme:
  - `git status --short` vide
  - `main` pousse
  - prod redeployee
  - alias final:
    - `https://dico-archi.vercel.app`
- recette validee:
  - controles `HTTP 200` sur `admin`, `admin?section=stats`, `compte`, `contribuer`
  - verification staff authentifiee `Formateur` OK
  - `Suivi actif` confirme

## 2026-03-19

### Dock traduction + corpus admin fusionne
- lot final pousse en prod avec commits:
  - `ac1866c`
  - `a915149`
  - `0e6eeb1`
  - `d774d05`
- `Ecouter / Traduire` devient un vrai outil transversal:
  - lanceur permanent au-dessus de l’assistant
  - dock lateral
  - fermeture reelle
  - fallback serveur robuste si Gemini renvoie un JSON invalide
- preuve fonctionnelle:
  - `Fiche mise en avant` -> `Scheda in evidenza`
- `admin.html` / `admin.js`:
  - `Corpus` fusionne maintenant base Supabase et contenu canonique public
  - `Bois lamellé-collé` peut apparaitre dans l’admin meme sans ligne DB existante
  - les fiches canoniques sont marquées `Contenu canonique` avec action `Importer`
- ajustements UI:
  - hamburger remis au premier plan
  - hints assistant / traduction homogenises
  - marge laterale adaptee au dock
- verification finale:
  - `27 passed`
- prod finale:
  - `https://dico-archi.vercel.app`

### Base produit durcie + reprise des pages majeures
- environnement local de test corrige durablement:
  - `playwright.config.js` utilise maintenant `vercel dev --listen 4173`
  - la reference `python3 -m http.server` n’est plus la base pour tester les routes `POST /api/...`
  - `term.page.js` expose un etat de readiness explicite
  - `Test/e2e/public-pages.spec.js` attend le rendu reel de la fiche
  - suite publique revalidee:
    - `25 passed`
- progression produit page par page:
  - `index.html`:
    - accueil plus demonstratif
    - suppression du lien mort d’accueil
  - `dictionnaire.html`:
    - repères de lecture
    - termes utiles a ouvrir en premier
  - `category.html`:
    - categories plus orientees parcours
  - `term.html`:
    - bloc orientation metier
    - suite utile contextuelle
  - `contribuer.html`:
    - decoupage `Essentiel / Medias / Approfondir`
    - resume de progression
  - `compte.html`:
    - bloc `Priorite du moment`
  - `admin.html`:
    - bloc `Priorite staff`
    - resume contextuel dans `Corpus`
- etat de sortie:
  - lot garde local pour validation humaine avant commit / redeploiement

### Contribution simplifiee + aide allophone clarifiee
- `contribuer.html` simplifiee une deuxieme fois, de maniere plus radicale:
  - suppression des blocs `Workflow`
  - suppression des cartes de consigne au-dessus du formulaire
  - maintien d’un seul flux de saisie continu
- `term.html` / `term.page.js` clarifies pour les allophones:
  - bloc renomme `Traduction et prononciation`
  - boutons plus explicites
  - ajout de `Francais`
  - comportement direct pour reafficher la fiche source en francais
- `styles.css` ajuste pour soutenir ce lot
- verification ciblee:
  - `node --check term.page.js`
  - `npx playwright test Test/e2e/public-pages.spec.js --grep "contribuer|term"`
  - resultat: `6 passed`
- cloture:
  - commit `5e7d541`
  - push `main`
  - redeploiement prod Vercel
  - alias final confirme: `https://dico-archi.vercel.app`

### Verification reelle + cloture git
- verification locale large relancee sur le lot courant
- checks confirmes:
  - `npm run content:validate`
  - `npx playwright test Test/e2e/public-pages.spec.js`
- resultat confirme:
  - validation contenu OK
  - `23 passed`
- verification live Supabase reconfirmee:
  - `page_views` actif
  - `game_scores` actif
  - `notifications` actif
  - `submission_messages` actif mais encore vide au moment du controle
- proposition test retrouvee en prod:
  - `Terme test contribution image`
  - id `cba9eb0c-24cf-4cf6-b493-5c3e0491c507`
  - statut reel: `submitted`
- ensuite, verification complete reellement bouclee le meme jour avec comptes dedies:
  - `dico.apprenti.workflow.20260319@proton.me`
  - `dico.formateur.workflow.20260319@proton.me`
  - proposition: `Workflow réel 2026-03-19-10-37`
  - id: `b62302b5-6b9b-44dd-be2f-92e63f69937a`
  - cycle confirme:
    - soumission
    - refus commente
    - message editorial
    - correction
    - resoumission
    - verification admin `Retour apprenti`
- point pratique confirme:
  - `signed_upload_prepare_failed` en local n’est pas un verdict produit si la page tourne sous `python3 -m http.server`
  - il faut la prod ou un vrai environnement Vercel pour tester `POST /api/...`

## 2026-03-18

### Workflow editorial pro
- `Mon compte` devient un vrai centre de suivi:
  - boite de reception
  - echanges editoriaux
  - reponse apprenti
  - resoumission
- `Contribuer` sait maintenant rouvrir une proposition refusee:
  - pre-remplissage complet
  - mode correction
  - update de la proposition existante
  - renvoi `resubmitted`
- `Administration` gagne:
  - `Decisions recentes`
  - `Dossier`
  - timeline
  - conversation editoriale
  - priorisation des retours apprenti
- nouvelles migrations:
  - `020_notifications_inbox.sql`
  - `021_submission_messages.sql`
  - `022_submission_resubmission_flow.sql`
- verification locale reconfirme:
  - checks JS OK
  - smokes `compte.html` / `contribuer.html` OK
- etat de sortie:
  - `020/021/022` appliquees en base
  - prod redeployee
  - lot workflow editorial remis en etat `local = prod`

### Contribution riche / cloture session
- `contribuer.html` simplifiee en flux unique, sur une seule page
- suppression des doublons les plus visibles dans le parcours de depot
- `contribuer.page.js` corrige:
  - `rich_payload` est maintenant bien envoye lors d’une soumission complete
- `api/categories.js` corrige:
  - l’API publique renvoie maintenant aussi les `id` de categories
- migration SQL ajoutee puis appliquee:
  - `supabase/migrations/019_rich_payload_terms_and_submissions.sql`
- verification live effectuee avec une vraie proposition apprenti et une vraie image temporaire
- proposition test creee:
  - `Terme test contribution image`
  - id `cba9eb0c-24cf-4cf6-b493-5c3e0491c507`

### Structure durable / roles
- roles visibles unifies sur:
  - `Public`
  - `Apprenti`
  - `Formateur`
  - `Administration`
- frontiere produit clarifiee:
  - `Mon compte` = orientation + suivi
  - `Contribuer` = depot
  - `Administration` = validation + gouvernance

### Contribution / modele fiche terme
- `contribuer.html` adopte une structure plus proche des fiches termes riches
- reference explicite au modele `Bois lamellé-collé` pour guider la qualite du depot
- ajout d’un apercu `slug` et d’un controle editorial plus proche de la structure cible dans `contribuer.page.js`

### Verification
- checks JS OK:
  - `compte.js`
  - `contribuer.page.js`
- Playwright cible valide:
  - `4 passed`

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

## 2026-03-17

### Git / prod
- lot local fragmente en trois commits coherents puis pousse sur `main`
- HEAD utile actuel:
  - `35fa29c` `Document workflow and content operations`
- `origin/main` synchronise
- redeploiement prod execute via `vercel --prod`
- alias `https://dico-archi.vercel.app` reconfirme

### Verification
- smoke tests publics relances:
  - `npm run test:ui`
  - resultat:
    - `19 passed`
- controles prod directs effectues:
  - homepage OK
  - `dictionnaire.html` OK
  - `api/home-metrics` OK

### Conclusion
- etat `local = prod` atteint pour le lot actuellement versionne
- prochain travail recommande:
  - parcours reel en prod
  - amelioration qualitative assistant
  - reprise visuelle des pages majeures restantes

## 2026-03-17 - lot local non pousse

### Fiche terme materiau
- nouveau terme V2 local:
  - [bois-lamelle-colle.json](/Users/awat/workspace/projects/dico-archi/content/v2/terms/bois-lamelle-colle.json)
- enrichissement connexe:
  - [dalle-beton.json](/Users/awat/workspace/projects/dico-archi/content/v2/terms/dalle-beton.json)
- refonte locale en cours sur:
  - [term.html](/Users/awat/workspace/projects/dico-archi/term.html)
  - [term.page.js](/Users/awat/workspace/projects/dico-archi/term.page.js)
  - [styles.css](/Users/awat/workspace/projects/dico-archi/styles.css)
- smoke test cible ajoute / maintenu sur:
  - [public-pages.spec.js](/Users/awat/workspace/projects/dico-archi/Test/e2e/public-pages.spec.js)

### Direction retenue
- vraie fiche `materiau` avec onglets
- zone `Visuels` reservee en bas pour:
  - image
  - dessin technique
- essai d’un chemin de navigation local en haut de page

### Point de reprise exact
- reprendre l’alignement fin et la finition pro de la fiche `Bois lamellé-collé`
- decider ensuite si le chemin de navigation doit etre reutilise plus largement
- seulement apres, attaquer le modele `construction`
