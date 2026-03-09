# Resume now (2026-03-09)

## Etat global
- Production active: `https://dico-archi.vercel.app`
- Worktree: propre sur `main` (synchronise avec `origin/main`).
- Architecture pages:
  - `index.html` = page de bienvenue
  - `dictionnaire.html` = page principale du dictionnaire
- Chatbot en production:
  - IA Gemini active (`/api/chat`)
  - fallback local actif si API indisponible
  - feedback `Utile` / `A ameliorer` actif (`/api/chat-feedback`)
  - dashboard feedback visible en super admin (`/api/chat-feedback-list` + section admin).

## Verifications immediates au redemarrage
```bash
cd /Users/awat/Desktop/Studio13/Projects/Dico-archi
git status --short
git log --oneline -20
python3 -m http.server 4173
```

## Verifications fonctionnelles prioritaires
1. `index.html`:
   - page de bienvenue affichee
   - bouton `Acceder au site` -> `dictionnaire.html`.
2. `dictionnaire.html`:
   - chatbot ouvrable/fermeture OK (bouton + ESC + clic exterieur)
   - contraste saisie + bulles utilisateur lisible
   - lien `Voir la fiche` present sur reponses pertinentes.
3. `admin.html` (super admin):
   - section `Feedback chatbot` visible
   - filtres `Utile/A ameliorer`, `IA/Fallback` fonctionnels
   - bouton `Rafraichir` charge des lignes.
4. `auth.html`:
   - login OK
   - reset mot de passe OK.

## Supabase / SQL deja en place
- `supabase/media_security.sql` applique.
- `supabase/chatbot_feedback.sql` cree.
- Grants executes pour insertion via service role.

## Variables Vercel attendues
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (actuel recommande: `gemini-2.5-flash-lite`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
