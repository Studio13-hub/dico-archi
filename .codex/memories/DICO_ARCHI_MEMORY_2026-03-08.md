# DICO_ARCHI_MEMORY_2026-03-08

## Etat final session (2026-03-09)
- Projet: `/Users/awat/Desktop/Studio13/Projects/Dico-archi`
- Branche: `main`
- Production active: `https://dico-archi.vercel.app`
- Etat git: propre et synchronise avec `origin/main`.

## Structure pages actuelle
- `index.html`: page de bienvenue
- `dictionnaire.html`: page principale dictionnaire
- pages secondaires: `term.html`, `category.html`, `auth.html`, `contribuer.html`, `compte.html`, `admin.html`

## Chatbot (etat actuel)
- Widget global actif sur toutes les pages (`chatbot.js`).
- Backend IA: `api/chat.js` (Gemini).
- Variables Vercel attendues:
  - `GEMINI_API_KEY`
  - `GEMINI_MODEL` (recommande: `gemini-2.5-flash-lite`)
- Fallback local actif si API indisponible.
- UX chatbot active:
  - `Copier`
  - `Voir la fiche`
  - fermeture robuste (bouton / ESC / clic exterieur)
  - contraste saisie et bulle utilisateur corrige.

## Feedback chatbot
- Insertion feedback: `api/chat-feedback.js`
- Lecture feedback admin: `api/chat-feedback-list.js`
- SQL table: `supabase/chatbot_feedback.sql`
- Section admin (super admin): `Feedback chatbot` + filtres + rafraichissement
- Variables Vercel serveur requises:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Supabase / securite
- `supabase/media_security.sql` applique.
- grants chatbot feedback appliques (service role insertion/select).
- verifier periodiquement Advisor (RLS/permissions).

## Docs alignees session
- `docs/RESUME_NOW.md`
- `docs/NEXT_STEPS.md`
- `docs/JOURNAL.md`
- `docs/HISTORIQUE.md`
- `docs/SETUP.md`

## Prochaine reprise (commande macro)
- Utiliser: `RepriseDico-archi`
- Checklist immediate:
  1. `git status --short`
  2. `git log --oneline -20`
  3. `python3 -m http.server 4173`
  4. verifier chatbot:
     - reponse IA
     - bouton `Utile/A ameliorer`
     - section admin `Feedback chatbot`.
