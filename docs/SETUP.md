# Setup Dico Architecture CH (simple et pro)

## 1) Creer Supabase
1. Va sur Supabase et cree un projet.
2. Recupere l'URL du projet et la cle `anon`.
3. Dans l'onglet SQL Editor, colle `supabase/schema.sql` et execute.
4. Dans l'onglet SQL Editor, colle `supabase/storage.sql` et execute.

## 2) Configurer le site
1. Remplis `config.js` avec les valeurs Supabase.
2. Ouvre `index.html` pour tester.

## 3) Ajouter des editeurs
1. L'editeur se cree un compte via `auth.html`.
2. Dans Supabase (Table editor), passe `profiles.is_editor` a `true` pour cet utilisateur.

## 4) Importer un tableau partage (Google Sheets)
1. Cree une feuille Google Sheets avec les colonnes:
   `term, category, definition, example, related, image_url`
2. Publie la feuille en CSV et recupere l'URL.
3. Lance l'import:
   `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... CSV_URL=... python3 scripts/import_terms.py`

## 5) Hebergement simple
- Vercel ou Netlify: depose le dossier.
- Pointage d'un domaine perso possible plus tard.
