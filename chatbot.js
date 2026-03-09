(function initDicoArchiChatbot() {
  const STORAGE_KEY = "dico_archi_chatbot_open_v1";
  const pageTitle = document.title || "DicoArchi";
  const pagePath = window.location.pathname || "/";

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function createElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function getLocalTerms() {
    if (Array.isArray(window.TERMS)) return window.TERMS;
    return [];
  }

  const TERM_INDEX = getLocalTerms()
    .map((item) => ({
      term: String(item?.term || "").trim(),
      key: normalize(item?.term || ""),
      definition: String(item?.definition || "").trim(),
      example: String(item?.example || "").trim(),
      category: String(item?.category || "").trim()
    }))
    .filter((item) => item.term && item.key)
    .sort((a, b) => b.key.length - a.key.length);

  function findBestTermInText(text) {
    const q = normalize(text);
    if (!q) return null;
    for (const entry of TERM_INDEX) {
      if (q === entry.key || q.includes(entry.key)) return entry;
    }
    return null;
  }

  function makeTermUrl(term) {
    return `term.html?term=${encodeURIComponent(term || "")}`;
  }

  function findTermAnswer(question) {
    const best = findBestTermInText(question);
    if (!best) return null;

    const parts = [];
    parts.push(`Terme: ${best.term}`);
    if (best.definition) parts.push(`Définition: ${best.definition}`);
    if (best.example) parts.push(`Exemple: ${best.example}`);
    if (best.category) parts.push(`Catégorie: ${best.category}`);
    parts.push(`Fiche: ${makeTermUrl(best.term)}`);
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
      return "L’espace admin est réservé aux rôles autorisés (super_admin/maître_apprentissage).";
    }

    if (q.includes("quiz")) {
      return "Le quiz se trouve sur dictionnaire.html. Clique sur “Mode quiz” pour démarrer.";
    }

    return "Je peux t’aider sur le vocabulaire d’architecture et l’usage du site (connexion, quiz, contributions, admin).";
  }

  function enrichAnswer(answer, question) {
    const clean = String(answer || "").trim();
    if (!clean) return { text: "", relatedTerm: null };

    const currentBest = findBestTermInText(clean) || findBestTermInText(question);
    if (!currentBest) return { text: clean, relatedTerm: null };

    if (normalize(clean).includes(normalize("fiche:"))) {
      return { text: clean, relatedTerm: currentBest.term };
    }

    const withLink = `${clean}\nFiche: ${makeTermUrl(currentBest.term)}`;
    return { text: withLink, relatedTerm: currentBest.term };
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
    return String(payload?.answer || "").trim();
  }

  const root = createElement("div", "chatbot");
  const toggle = createElement("button", "chatbot__toggle", "Assistant");
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Ouvrir le chatbot");

  const panel = createElement("section", "chatbot__panel");
  panel.hidden = true;

  const header = createElement("div", "chatbot__header");
  const title = createElement("strong", "", "Assistant DicoArchi");
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
  root.appendChild(toggle);
  root.appendChild(panel);
  document.body.appendChild(root);

  const history = [];

  function addAssistantActions(container, text, relatedTerm) {
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
      bubble.appendChild(createElement("p", "", line));
    }

    if (role === "assistant" && !options.noActions) {
      addAssistantActions(bubble, cleanText, options.relatedTerm || null);
    }

    messagesNode.appendChild(bubble);
    messagesNode.scrollTop = messagesNode.scrollHeight;
  }

  function setOpen(open) {
    panel.hidden = !open;
    toggle.hidden = open;
    try {
      window.localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
    } catch (_error) {
      // Ignore storage errors.
    }
    if (open) input.focus();
  }

  toggle.addEventListener("click", () => setOpen(true));
  closeButton.addEventListener("click", () => setOpen(false));

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
      try {
        answer = await askServer(history.slice(-8));
      } catch (_error) {
        answer = getFallbackAnswer(question);
      }

      const enriched = enrichAnswer(answer || getFallbackAnswer(question), question);
      typing.remove();
      pushMessage("assistant", enriched.text, { relatedTerm: enriched.relatedTerm });
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
})();
