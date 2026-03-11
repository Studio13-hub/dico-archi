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
   - `supabase/chatbot_feedback.sql` (si tu utilises le feedback chatbot)

### Ordre recommande pour une base deja existante
Si la base existe deja et que tu veux reappliquer les scripts de securite/roles apres cette session:
1. `supabase/schema.sql`
2. `supabase/storage.sql`
3. `supabase/submissions.sql`
4. `supabase/submissions_update.sql`
5. `supabase/audit.sql`
6. `supabase/terms_workflow.sql`
7. `supabase/roles_rdr.sql`
8. `supabase/chatbot_feedback.sql` (si besoin)

`supabase/roles_rdr.sql` reste le script final de reference pour recaler les policies staff/super admin.

## 2) Configurer le site
1. Remplis `config.js` avec les valeurs Supabase.
2. Ouvre `index.html` pour tester.

## 3) Ajouter les roles RDR
1. Chaque personne cree son compte via `auth.html`.
2. Dans Supabase (Table editor), mets a jour `profiles.role`:
   - `super_admin`: gestion totale + gestion utilisateurs
   - `maitre_apprentissage`: affiche comme `Formateur` sur le site, gestion editoriale (termes, propositions, audit)
   - `apprenti`: contribution via `contribuer.html`
3. Active/desactive un compte avec `profiles.active` (`true`/`false`).
4. Verifie l'acces a `admin.html`:
   - autorise pour `super_admin` et `maitre_apprentissage` (`Formateur`)
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
   - `GEMINI_API_KEY` (obligatoire pour les reponses IA)
   - `GEMINI_MODEL` (optionnel, defaut: `gemini-2.5-flash-lite`)
4. Sans cle API, le chatbot reste actif avec reponses locales de secours.

## 7) Feedback chatbot vers Supabase (optionnel mais recommande)
1. Execute `supabase/chatbot_feedback.sql` dans le SQL Editor.
2. Configure dans Vercel:
   - `SUPABASE_URL` (URL du projet)
   - `SUPABASE_SERVICE_ROLE_KEY` (cle service role, serveur uniquement)
3. La route `api/chat-feedback.js` enregistre les retours `👍/👎` pour ameliorer les reponses.
