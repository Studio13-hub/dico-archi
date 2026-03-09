# Historique des changements - Dico-archi

## 2026-03-09

### Securite frontend
- `term.js` et `category.js`:
  - remplacement des insertions `innerHTML` dynamiques par construction DOM securisee (`textContent`, `createElement`) sur les breadcrumbs.
- Validation URL image ajoutee:
  - `admin.js`, `contribuer.js`, `app.js`, `term.js`
  - schema accepte: `https`, `http` (et chemins relatifs), rejet des schemas non fiables.

### Performance frontend
- Recherche debounced via `requestAnimationFrame`:
  - `app.js` (recherche dictionnaire)
  - `admin.js` (recherche termes admin)
- `app.js`:
  - pagination legere du listing public (`TERMS_BATCH_SIZE=24`)
  - rendu progressif avec bouton `Afficher plus` pour limiter la charge DOM initiale
  - pre-index `search_text` calcule au chargement pour accelerer le filtrage en frappe.
  - mode accueil public "categories d'abord":
    - pas de liste de fiches massive au chargement
    - affichage des fiches uniquement apres selection categorie/recherche/voir toutes.

### Securite deploiement
- Ajout de `vercel.json`:
  - `Content-Security-Policy` restrictive compatible Supabase + jsdelivr + Vercel Insights
  - headers de securite HTTP: `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, `CORP`.
- Deploiement prod Vercel realise et controle des headers confirme via `curl -I` (`/` et `/admin.html`).

### Frontend admin
- `admin.js`:
  - etats de chargement ajoutes sur actions critiques (enregistrement, validation/rejet, update role)
  - protections anti double-clic et requetes concurrentes
  - anti-doublon sur acceptation d'une proposition (controle local + requete DB)
  - messages utilisateur plus explicites par bloc fonctionnel
  - detection explicite des erreurs d'auth/session (JWT/token expire)
  - redirection automatique vers `auth.html` quand la session n'est plus valide
  - verrou de suppression terme + verrou global actions de propositions pendant traitement.

### Session/navigation
- `contribuer.js`:
  - verrou anti double soumission
  - bouton "Envoi..." pendant requete
  - session expiree geree avec message clair + formulaire bloque.
- `app.js`, `nav.js`, `compte.js`:
  - synchronisation UI login/logout via `onAuthStateChange`
  - coherence de l'etat connecte entre onglets.

### Hygiene repository
- `.gitignore`:
  - ajout `.DS_Store`, `*.log`, `supabase/.temp/`.

### Roles / fiabilite Supabase
- Renforcement du fallback RPC (`admin_list_profiles`, `admin_update_profile`) quand lecture/update directe `profiles` est vide ou non concluante.
- Reduction du risque de faux positif sur mise a jour role/active en contexte RLS.

### Workflow editorial (concurrence)
- Nouvelle migration SQL: `supabase/submissions_accept_atomic.sql`
  - fonction `accept_submission_atomic(...)` en transaction avec verrou `FOR UPDATE` sur `term_submissions`
  - blocage des doubles traitements et des doublons de terme (comparaison insensible a la casse)
- `admin.js` utilise la RPC atomique en priorite, avec fallback non bloquant si la migration n'est pas encore deployee.

### Contenu dictionnaire
- Ajout categorie `Toitures plates` dans `data.js` + seed SQL (`supabase/seed_toitures_plates.sql`).
- Ajout categorie `Bases des materiaux` (CM0) dans `data.js` + seed SQL (`supabase/seed_bases_materiaux.sql`).

### Media / fiche terme
- Passage en mode multi-medias:
  - saisie multi-URL (une par ligne) + upload multiple image/PDF en admin
  - serialisation compatible dans `image_url` (string ou JSON array)
  - rendu fiche: galerie images + carte PDF + lightbox.
- Lightbox:
  - fermeture clic overlay/ESC
  - navigation `precedent/suivant` + fleches clavier.
- Correctif bug rendu:
  - ajout `.media-lightbox[hidden] { display:none !important; }`
  - mitigation AVIF: rendu image limite aux formats stables (`png/jpg/jpeg/webp/gif/svg`).

### Securite media (front + DB + storage)
- Front:
  - `admin.js` et `contribuer.js` valident strictement URL media (http/https + extensions autorisees)
  - upload admin limite types + taille max 10 MB.
- SQL:
  - nouveau script `supabase/media_security.sql`
  - fonctions `is_valid_media_url` / `is_valid_media_payload`
  - CHECK constraints sur `terms.image_url` et `term_submissions.image_url`
  - policies storage MIME strictes (`image/png,jpeg,webp,gif,svg+xml,application/pdf`)
  - script execute avec succes dans Supabase.

### UX refonte (inspiree mockups initiaux)
- `index.html`:
  - bloc "Acces rapide" (tous les termes / quiz / categories / contribuer)
  - dock mobile fixe (Accueil / Quiz / Hasard / Haut).
- `term.html`:
  - meta lecture (`/terme/`) + chip categorie
  - bloc "Types et variantes" lie aux termes associes
  - dock mobile fixe (Accueil / Quiz / Copier lien / Haut).

### Authentification
- Ajout du flux "Mot de passe oublie ?":
  - envoi email de reset via Supabase
  - ecran de saisie nouveau mot de passe au retour lien mail
  - mise a jour du mot de passe via `auth.updateUser(...)`.

## 2026-03-08

### Plateforme
- Setup production confirme sur Vercel.
- Connexion Supabase active (auth/session/profile).

### Donnees et SQL
- Workflow termes avec statut editorial (`published` public).
- Migration roles RDR ajoutee:
  - `profiles.role`
  - `profiles.active`
  - policies role-based
- Fallback admin pour profils ajoute:
  - `admin_list_profiles()`
  - `admin_update_profile(...)`

### Frontend
- Nouvelles pages:
  - `term.html`
  - `category.html`
  - `compte.html`
- Admin upgrade:
  - stats workflow
  - filtres par statut
  - tri multi-criteres
  - export CSV published
  - gestion utilisateurs (super admin)
- Navigation:
  - menu hamburger global
  - statut session visible
  - logo/badge renvoi dictionnaire

### A verifier apres chaque reprise
1. RLS profils: pas de recursion.
2. Section "Gestion des utilisateurs" visible en super admin.
3. Login mobile Safari + navigation clavier.
