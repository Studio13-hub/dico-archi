(function initDicoArchiChatbot() {
  const STORAGE_KEY = "dico_archi_chatbot_open_v1";
  const SESSION_KEY = "dico_archi_chatbot_session_v1";
  const FEEDBACK_KEY = "dico_archi_chatbot_feedback_v1";
  const pageTitle = document.title || "Dico-Archi";
  const pagePath = window.location.pathname || "/";
  const isHomePage = document.body?.classList.contains("page-home");
  const feedbackState = new Set();

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function normalizeForTermMatch(value) {
    return normalize(value)
      .replace(/[^a-z0-9\s-]+/g, " ")
      .replace(/\b([a-z0-9-]{4,})s\b/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }

  function createElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function parseAssistantLinkLine(line) {
    const match = String(line || "").match(/^-\s+(.+?)\s*:\s*(term\.html\?slug=[^\s]+)\s*$/i);
    if (!match) return null;
    return {
      label: match[1].trim(),
      href: match[2].trim()
    };
  }

  let publishedTermsCache = Array.isArray(window.TERMS) ? window.TERMS.slice() : [];

  function slugify(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function buildTermIndex(items) {
    return (Array.isArray(items) ? items : [])
      .map((item) => ({
      term: String(item?.term || "").trim(),
      slug: String(item?.slug || slugify(item?.term || "")).trim(),
      key: normalize(item?.term || ""),
      matchKey: normalizeForTermMatch(item?.term || ""),
      definition: String(item?.definition || "").trim(),
      example: String(item?.example || "").trim(),
      category: String(item?.category || item?.categories?.name || "").trim()
    }))
    .filter((item) => item.term && item.key)
    .sort((a, b) => b.key.length - a.key.length);
  }

  let TERM_INDEX = buildTermIndex(publishedTermsCache);

  function findBestTermInText(text) {
    const q = normalize(text);
    const qMatch = normalizeForTermMatch(text);
    if (!q) return null;
    for (const entry of TERM_INDEX) {
      if (
        q === entry.key
        || q.includes(entry.key)
        || (entry.matchKey && (qMatch === entry.matchKey || qMatch.includes(entry.matchKey)))
      ) {
        return entry;
      }
    }
    return null;
  }

  function makeTermUrl(termOrEntry) {
    if (termOrEntry && typeof termOrEntry === "object") {
      const slug = String(termOrEntry.slug || "").trim() || slugify(termOrEntry.term || "");
      return `term.html?slug=${encodeURIComponent(slug)}`;
    }
    return `term.html?slug=${encodeURIComponent(slugify(termOrEntry || ""))}`;
  }

  async function refreshPublishedTerms() {
    if (!window.DicoArchiApi?.fetchPublishedTermsBasic) return;

    try {
      const items = await window.DicoArchiApi.fetchPublishedTermsBasic();
      if (!Array.isArray(items) || !items.length) return;
      publishedTermsCache = items;
      TERM_INDEX = buildTermIndex(publishedTermsCache);
    } catch (_error) {
      // Keep the current fallback index if network/API loading fails.
    }
  }

  function getSessionId() {
    try {
      const existing = window.localStorage.getItem(SESSION_KEY);
      if (existing) return existing;
      const created = `s_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      window.localStorage.setItem(SESSION_KEY, created);
      return created;
    } catch (_error) {
      return `s_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }
  }

  function findTermAnswer(question) {
    const best = findBestTermInText(question);
    if (!best) return null;

    const parts = [];
    parts.push(`Terme: ${best.term}`);
    if (best.definition) parts.push(`Définition: ${best.definition}`);
    if (best.example) parts.push(`Exemple: ${best.example}`);
    if (best.category) parts.push(`Catégorie: ${best.category}`);
    parts.push(`Fiche: ${makeTermUrl(best)}`);
    return parts.join("\n");
  }

  function isLikelyOutOfScope(question) {
    const q = normalize(question);
    if (!q) return false;
    const architectureHints = [
      "sia",
      "aeai",
      "beton",
      "béton",
      "chantier",
      "architect",
      "dessin",
      "construction",
      "materiau",
      "matériau",
      "dictionnaire",
      "quiz",
      "contrib",
      "admin",
      "compte",
      "terme",
      "categorie",
      "catégorie"
    ];
    if (architectureHints.some((hint) => q.includes(normalize(hint)))) return false;

    const offTopicHints = ["foot", "bitcoin", "bourse", "musique", "recette", "voyage", "politique"];
    return offTopicHints.some((hint) => q.includes(hint));
  }

  function getFallbackAnswer(question) {
    const q = normalize(question);
    const termAnswer = findTermAnswer(question);
    if (termAnswer) return termAnswer;

    if (isLikelyOutOfScope(question)) {
      return "Je suis spécialisé dans l’architecture et l’usage de ce site. Pose-moi une question sur les termes, le quiz, la connexion, les contributions ou l’administration.";
    }

    if (q.includes("connexion") || q.includes("compte") || q.includes("login")) {
      return "Tu peux te connecter sur la page auth.html, puis ouvrir compte.html pour voir ton rôle.";
    }

    if (q.includes("contrib") || q.includes("proposition")) {
      return "Pour proposer un terme, ouvre contribuer.html puis envoie le formulaire.";
    }

    if (q.includes("admin")) {
      return "L’espace admin est réservé aux rôles autorisés. Ouvre admin.html si ton compte a un rôle Formateur ou Administration.";
    }

    if (q.includes("quiz")) {
      return "Tu peux ouvrir quiz.html depuis la page Jeux. Si tu veux réviser avant, passe aussi par le dictionnaire et les catégories.";
    }

    if (q.includes("jeu") || q.includes("flashcards") || q.includes("match") || q.includes("defi")) {
      return "Les jeux sont regroupés sur games.html. Tu y trouveras le quiz, les flashcards, le match et le défi du jour.";
    }

    return "Je peux t’aider sur le vocabulaire d’architecture et l’usage du site (connexion, quiz, contributions, admin).";
  }

  function enrichAnswer(answer, question) {
    const clean = String(answer || "").trim();
    if (!clean) return { text: "", relatedTerm: null };

    const normalizedAnswer = normalize(clean);
    const explicitLinks = (clean.match(/term\.html\?slug=/g) || []).length;
    const isDisambiguation = normalizedAnswer.includes("tu veux parler de");
    if (isDisambiguation || explicitLinks > 1) {
      return { text: clean, relatedTerm: null };
    }

    const currentBest = findBestTermInText(clean) || findBestTermInText(question);
    if (!currentBest) return { text: clean, relatedTerm: null };

    if (normalizedAnswer.includes(normalize("fiche:")) || explicitLinks === 1) {
      return { text: clean, relatedTerm: currentBest };
    }

    const withLink = `${clean}\nFiche: ${makeTermUrl(currentBest)}`;
    return { text: withLink, relatedTerm: currentBest };
  }

  function getStoredFeedbackMap() {
    try {
      const raw = window.localStorage.getItem(FEEDBACK_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function setStoredFeedbackMap(value) {
    try {
      window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(value));
    } catch (_error) {
      // Ignore storage errors.
    }
  }

  function buildFeedbackKey({ sessionId, rating, text }) {
    return `${sessionId}::${rating}::${normalize(text).slice(0, 220)}`;
  }

  function canSendFeedback({ sessionId, rating, text }) {
    const map = getStoredFeedbackMap();
    const key = buildFeedbackKey({ sessionId, rating, text });
    if (map[key]) {
      return { ok: false, reason: "duplicate" };
    }
    return { ok: true, key };
  }

  function markFeedbackSent({ sessionId, rating, text }) {
    const map = getStoredFeedbackMap();
    const now = Date.now();
    map[buildFeedbackKey({ sessionId, rating, text })] = now;
    setStoredFeedbackMap(map);
  }

  async function askServer(messages) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        context: `${pageTitle} (${pagePath})`
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error || `http_${response.status}`);
    }

    const payload = await response.json();
    return {
      answer: String(payload?.answer || "").trim(),
      model: String(payload?.model || "").trim()
    };
  }

  async function sendFeedback(payload) {
    const response = await fetch("/api/chat-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error || `http_${response.status}`);
    }
  }

  const root = createElement("div", "chatbot");
  const hint = createElement("div", "chatbot__hint", "Poser une question sur un terme");
  const toggle = createElement("button", "chatbot__toggle", "Assistant");
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Ouvrir le chatbot");

  const panel = createElement("section", "chatbot__panel");
  panel.hidden = true;

  const header = createElement("div", "chatbot__header");
  const title = createElement("strong", "", "Assistant Dico-Archi");
  const closeButton = createElement("button", "chatbot__close", "Fermer");
  closeButton.type = "button";
  header.appendChild(title);
  header.appendChild(closeButton);

  const messagesNode = createElement("div", "chatbot__messages");

  const form = createElement("form", "chatbot__form");
  const input = createElement("input", "chatbot__input");
  input.type = "text";
  input.placeholder = "Pose une question...";
  input.maxLength = 500;
  const sendButton = createElement("button", "chatbot__send", "Envoyer");
  sendButton.type = "submit";

  form.appendChild(input);
  form.appendChild(sendButton);

  const note = createElement(
    "div",
    "chatbot__note",
    "Réponse IA: vérifie les points techniques importants dans les fiches du dictionnaire."
  );

  panel.appendChild(header);
  panel.appendChild(messagesNode);
  panel.appendChild(form);
  panel.appendChild(note);
  if (isHomePage) {
    root.appendChild(hint);
  }
  root.appendChild(toggle);
  root.appendChild(panel);
  document.body.appendChild(root);

  const history = [];

  function addAssistantActions(container, text, relatedTerm, messageKey, source, model) {
    const actions = createElement("div", "chatbot__actions");

    const copyBtn = createElement("button", "chatbot__action", "Copier");
    copyBtn.type = "button";
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copié";
        setTimeout(() => {
          copyBtn.textContent = "Copier";
        }, 1200);
      } catch (_error) {
        copyBtn.textContent = "Échec copie";
        setTimeout(() => {
          copyBtn.textContent = "Copier";
        }, 1200);
      }
    });

    actions.appendChild(copyBtn);

    if (relatedTerm) {
      const link = createElement("a", "chatbot__action chatbot__action--link", "Voir la fiche");
      link.href = makeTermUrl(relatedTerm);
      actions.appendChild(link);
    }

    const usefulBtn = createElement("button", "chatbot__action", "Utile");
    usefulBtn.type = "button";

    const improveBtn = createElement("button", "chatbot__action", "À améliorer");
    improveBtn.type = "button";

    const status = createElement("span", "chatbot__feedback-status");

    async function submitFeedback(rating) {
      if (feedbackState.has(messageKey)) return;
      const sessionId = getSessionId();
      const gate = canSendFeedback({ sessionId, rating, text });
      if (!gate.ok) {
        status.textContent = "Retour deja envoye.";
        return;
      }
      usefulBtn.disabled = true;
      improveBtn.disabled = true;
      status.textContent = "Envoi...";
      try {
        await sendFeedback({
          rating,
          assistantMessage: text,
          userMessage: history.filter((item) => item.role === "user").slice(-1)[0]?.content || "",
          pagePath,
          pageTitle,
          source: source || "fallback",
          model: model || "",
          sessionId
        });
        markFeedbackSent({ sessionId, rating, text });
        feedbackState.add(messageKey);
        status.textContent = "Merci pour ton retour.";
      } catch (_error) {
        usefulBtn.disabled = false;
        improveBtn.disabled = false;
        status.textContent = "Retour non enregistre.";
      }
    }

    usefulBtn.addEventListener("click", () => submitFeedback("up"));
    improveBtn.addEventListener("click", () => submitFeedback("down"));

    actions.appendChild(usefulBtn);
    actions.appendChild(improveBtn);
    actions.appendChild(status);

    container.appendChild(actions);
  }

  function pushMessage(role, text, options = {}) {
    const cleanText = String(text || "").trim();
    if (!cleanText) return;

    history.push({ role, content: cleanText });
    if (history.length > 16) history.splice(0, history.length - 16);

    const bubble = createElement("div", `chatbot__msg chatbot__msg--${role}`);
    const lines = cleanText.split("\n");
    for (const line of lines) {
      const parsedLink = role === "assistant" ? parseAssistantLinkLine(line) : null;
      if (parsedLink) {
        const link = createElement("a", "chatbot__inline-link", parsedLink.label);
        link.href = parsedLink.href;
        bubble.appendChild(link);
      } else {
        bubble.appendChild(createElement("p", "", line));
      }
    }

    if (role === "assistant" && !options.noActions) {
      const key = options.messageKey || `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      addAssistantActions(
        bubble,
        cleanText,
        options.relatedTerm || null,
        key,
        options.source || "fallback",
        options.model || ""
      );
    }

    messagesNode.appendChild(bubble);
    messagesNode.scrollTop = messagesNode.scrollHeight;
  }

  function setOpen(open) {
    panel.hidden = !open;
    panel.style.display = open ? "grid" : "none";
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Fermer assistant" : "Assistant";
    if (hint) {
      hint.hidden = open;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
    } catch (_error) {
      // Ignore storage errors.
    }
    if (open) input.focus();
  }

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(panel.hidden);
  });

  closeButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
  });

  closeButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (panel.hidden) return;
    if (panel.contains(target)) return;
    if (toggle.contains(target)) return;
    setOpen(false);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    input.value = "";
    pushMessage("user", question, { noActions: true });
    sendButton.disabled = true;

    const typing = createElement("div", "chatbot__msg chatbot__msg--assistant", "...");
    messagesNode.appendChild(typing);
    messagesNode.scrollTop = messagesNode.scrollHeight;

    try {
      let answer = "";
      let source = "fallback";
      let model = "";
      try {
        const serverResult = await askServer(history.slice(-8));
        answer = serverResult.answer;
        model = serverResult.model;
        source = "ai";
      } catch (_error) {
        answer = getFallbackAnswer(question);
      }

      const enriched = enrichAnswer(answer || getFallbackAnswer(question), question);
      typing.remove();
      pushMessage("assistant", enriched.text, {
        relatedTerm: enriched.relatedTerm,
        messageKey: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        source,
        model
      });
    } finally {
      sendButton.disabled = false;
      input.focus();
    }
  });

  pushMessage(
    "assistant",
    "Bonjour. Je peux t’aider sur les termes d’architecture, le quiz, la connexion, les contributions et la navigation du site.",
    { noActions: false }
  );

  let shouldOpen = false;
  try {
    shouldOpen = window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch (_error) {
    shouldOpen = false;
  }
  setOpen(shouldOpen);
  refreshPublishedTerms();
})();
