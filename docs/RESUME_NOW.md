# Resume now (2026-03-14)

## Etat global

- Production active : `https://dico-archi.vercel.app`
- Frontend et API Vercel alignes sur le projet Supabase `iuvjmctrzgztelrsuquc`
- Pages publiques remises en service :
  - home
  - dictionnaire
  - categorie
  - fiche terme
- Le site utilise maintenant le schema core de bout en bout
- Le legacy principal a ete sorti du flux actif et archive

## Architecture active

- frontend : pages HTML statiques + `*.page.js`
- client Supabase partage : `supabaseClient.js`
- backend Vercel : `api/search.js`, `api/terms.js`, `api/categories.js`, `api/chat.js`
- source canonique base : `supabase/core/schema.sql`
- execution base : `supabase/migrations/`
- seeds actives : `supabase/seeds/`

## Points verifies

- `config.js` pointe sur le bon projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` Vercel a ete recalee
- `package.json` permet a Vercel de charger `@supabase/supabase-js`
- les scripts inline ont ete extraits pour respecter la CSP
- les categories et premiers termes core ont ete charges dans la base distante

## Hygiene repo

- scripts frontend morts archives dans `archive/frontend/`
- anciens scripts de contenu archives dans `scripts/archive/`
- anciens SQL racine archives dans `supabase/archive/root-legacy/`

## Points encore a faire

1. completer les migrations encore vides
2. construire un pipeline legacy -> core pour enrichir les contenus
3. nettoyer la documentation historique restante
4. faire tourner les cles sensibles exposees pendant la session
