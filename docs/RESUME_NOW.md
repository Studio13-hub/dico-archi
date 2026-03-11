# Resume now (2026-03-10)

## Etat global
- Production active: `https://dico-archi.vercel.app`
- `main` a ete mis a jour et pousse sur `origin/main`.
- Structure roles produit clarifiee:
  - `Public` = consultation libre
  - `Apprenti` = contribution
  - `Formateur` = validation/correction (slug technique conserve: `maitre_apprentissage`)
  - `Super admin` = gestion complete
- Architecture pages:
  - `index.html` = page de bienvenue
  - `dictionnaire.html` = page principale du dictionnaire
- Chatbot en production:
  - IA Gemini active (`/api/chat`)
  - fallback local actif si API indisponible
  - feedback `Utile` / `A ameliorer` actif (`/api/chat-feedback`)
  - dashboard feedback visible en super admin (`/api/chat-feedback-list` + section admin)
  - stats feedback + top questions + export CSV actifs
  - un vote possible par reponse dans une meme conversation.
- Base Supabase recalee pendant la session:
  - scripts roles / submissions / audit / storage / feedback executes avec succes.

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
   - bloc `Qui peut faire quoi ?` visible avec les 4 roles
   - ligne workflow `Apprenti -> Formateur -> Publication -> Public` visible
   - chatbot ouvrable/fermeture OK (bouton + ESC + clic exterieur)
   - contraste saisie + bulles utilisateur lisible
   - lien `Voir la fiche` present sur reponses pertinentes.
   - un feedback peut etre envoye sur plusieurs reponses differentes dans la meme conversation.
3. `admin.html` (super admin):
   - section `Feedback chatbot` visible
   - filtres `Utile/A ameliorer`, `IA/Fallback` fonctionnels
   - stats feedback visibles
   - bouton `Exporter CSV` visible
   - bouton `Rafraichir` charge des lignes.
4. `auth.html`:
   - login OK
   - reset mot de passe OK.

## Supabase / SQL deja en place
- `supabase/media_security.sql` applique.
- `supabase/chatbot_feedback.sql` cree.
- `supabase/roles_rdr.sql` applique.
- `supabase/profiles_admin_rpc.sql` applique.
- `supabase/submissions_accept_atomic.sql` applique.
- Grants executes pour insertion via service role.

## Variables Vercel attendues
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (actuel recommande: `gemini-2.5-flash-lite`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Derniers commits utiles
- `462725d` `Relax chatbot feedback throttle per response`
- `81641a8` `Harden chatbot feedback and align legacy Supabase roles`
