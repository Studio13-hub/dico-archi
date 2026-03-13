# Prochaines etapes (reprise)

## Priorite 1 - Stabilisation chatbot
1. Ajouter un tracking `model` fiable dans les feedbacks (`meta.model`) pour analyse.
2. Ajouter une vue admin compacte: stats feedback (up/down, ratio, top questions).
3. Ajouter anti-spam feedback (cooldown/session).

## Priorite 2 - Qualite contenu
4. Revoir les termes les plus feedbackes en `A ameliorer`.
5. Completer les fiches manquantes (definitions courtes, exemples, liens associes).
6. Verifier coherence orthographe/accents sur pages secondaires (`term`, `category`, `admin`).

## Priorite 3 - Fiabilite long terme
7. Ajouter sauvegarde periodique/export feedback chatbot (CSV admin).
8. Ajouter tests smoke automatises pour routes critiques (`/`, `/dictionnaire.html`, `/admin.html`, `/api/chat`).
9. Continuer l'assainissement des messages UI (francais homogène) sans regression fonctionnelle.
