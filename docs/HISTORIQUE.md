# Historique des changements - Dico-archi

## 2026-03-09

### Architecture pages
- `index.html` devient page de bienvenue.
- `dictionnaire.html` devient la page dictionnaire principale.
- liens internes recables vers `dictionnaire.html`.

### Fiabilite session / navigation
- harmonisation des etats auth entre pages (`app.js`, `nav.js`, `compte.js`, `contribuer.js`, `admin.js`).
- gestion explicite des erreurs session/JWT expire.
- verrous anti double clic et actions concurrentes.

### Securite / deploiement
- headers de securite Vercel maintenus et verifies en prod.
- controles media front + SQL maintenus.

### Chatbot
- widget global sur toutes les pages (`chatbot.js`).
- backend IA serveur (`api/chat.js`) migre vers Gemini.
- fallback local conserve pour continuite de service.
- UX chatbot amelioree:
  - bouton `Copier`
  - lien `Voir la fiche`
  - fermeture robuste (bouton, ESC, clic exterieur)
  - contraste texte corrige.

### Feedback chatbot + observabilite
- endpoint insertion: `api/chat-feedback.js`.
- table SQL: `supabase/chatbot_feedback.sql`.
- endpoint lecture admin: `api/chat-feedback-list.js`.
- section admin super admin: `Feedback chatbot` (filtres + rafraichissement).

### Outillage qualite
- `scripts/term_quality_check.js` renforce (doublons, references, media).
- `scripts/check_resume.sh` aligne avec arborescence actuelle.
- `.gitignore` complete (`.DS_Store`, `*.log`, `supabase/.temp/`, `__pycache__/`, `*.pyc`).
