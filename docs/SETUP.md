# Setup Dico Architecture CH (simple et pro)

## 1) Creer Supabase
1. Va sur Supabase et cree un projet.
2. Recupere l'URL du projet et la cle `anon`.
3. Dans l'onglet SQL Editor, execute les scripts dans cet ordre:
   - `supabase/schema.sql`
   - `supabase/storage.sql`
   - `supabase/submissions.sql`
   - `supabase/submissions_update.sql`
   - `supabase/audit.sql`
   - `supabase/terms_workflow.sql`
   - `supabase/roles_rdr.sql`

## 2) Configurer le site
1. Remplis `config.js` avec les valeurs Supabase.
2. Ouvre `index.html` pour tester.

## 3) Ajouter les roles RDR
1. Chaque personne cree son compte via `auth.html`.
2. Dans Supabase (Table editor), mets a jour `profiles.role`:
   - `super_admin`: gestion totale + gestion utilisateurs
   - `maitre_apprentissage`: gestion editoriale (termes, propositions, audit)
   - `apprenti`: contribution via `contribuer.html`
3. Active/desactive un compte avec `profiles.active` (`true`/`false`).
4. Verifie l'acces a `admin.html`:
   - autorise pour `super_admin` et `maitre_apprentissage`
   - refuse pour `apprenti` ou compte inactif

## 4) Importer un tableau partage (Google Sheets)
1. Cree une feuille Google Sheets avec les colonnes:
   `term, category, definition, example, related, image_url`
2. Publie la feuille en CSV et recupere l'URL.
3. Lance l'import:
   `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... CSV_URL=... python3 scripts/import_terms.py`

## 5) Hebergement simple
- Vercel ou Netlify: depose le dossier.
- Pointage d'un domaine perso possible plus tard.

## 6) Chatbot IA (optionnel)
1. Le widget chatbot est charge sur toutes les pages (`chatbot.js`).
2. La route serveur est `api/chat.js` (Vercel Function).
3. Configure les variables d'environnement dans Vercel:
   - `OPENAI_API_KEY` (obligatoire pour les reponses IA)
   - `OPENAI_MODEL` (optionnel, defaut: `gpt-4o-mini`)
4. Sans cle API, le chatbot reste actif avec reponses locales de secours.
