# Setup DicoArchi

## Base de donnees

La structure active du projet repose sur :

- `supabase/core/schema.sql`
- `supabase/migrations/`
- `supabase/seeds/`

Pour un projet neuf, la source canonique est la chaine de migrations. Les scripts SQL archives
restent consultables dans `supabase/archive/root-legacy/` et `supabase/legacy/`, mais ils ne
doivent plus etre executes comme flux principal.

## Peuplement minimal

Le site public a besoin au minimum de :

1. categories
2. termes publies

Sources actuelles :

- `supabase/seeds/seed_categories_suisse_romande.sql`
- `supabase/seeds/seed_terms_core_01.sql`

## Frontend

Le frontend public actif est compose de :

- `index.html` + `index.page.js`
- `dictionnaire.html` + `dictionnaire.page.js`
- `category.html` + `category.js`
- `term.html` + `term.page.js`
- `supabaseClient.js`

La configuration client Supabase est lue depuis `config.js`.

## Vercel

Variables attendues :

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`

Le chatbot du site utilise Gemini. Les anciennes variables OpenAI ne font plus partie du flux
actif.
