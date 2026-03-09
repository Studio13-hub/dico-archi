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

  function findTermAnswer(question) {
    const terms = getLocalTerms();
    if (!terms.length) return null;

    const q = normalize(question);
    let best = null;

    for (const item of terms) {
      const term = String(item.term || "").trim();
      if (!term) continue;
      const key = normalize(term);
      if (!key) continue;
      if (q === key || q.includes(key)) {
        if (!best || key.length > best.key.length) {
          best = { key, item };
        }
      }
    }

    if (!best) return null;

    const term = best.item;
    const parts = [];
    parts.push(`Terme: ${term.term}`);
    if (term.definition) parts.push(`Définition: ${term.definition}`);
    if (term.example) parts.push(`Exemple: ${term.example}`);
    if (term.category) parts.push(`Catégorie: ${term.category}`);
    parts.push(`Fiche: term.html?term=${encodeURIComponent(term.term || "")}`);
    return parts.join("\n");
  }

  function getFallbackAnswer(question) {
    const q = normalize(question);
    const termAnswer = findTermAnswer(question);
    if (termAnswer) return termAnswer;

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

  panel.appendChild(header);
  panel.appendChild(messagesNode);
  panel.appendChild(form);
  root.appendChild(toggle);
  root.appendChild(panel);
  document.body.appendChild(root);

  const history = [];

  function pushMessage(role, text) {
    const cleanText = String(text || "").trim();
    if (!cleanText) return;

    history.push({ role, content: cleanText });
    if (history.length > 16) history.splice(0, history.length - 16);

    const bubble = createElement("div", `chatbot__msg chatbot__msg--${role}`);
    const lines = cleanText.split("\n");
    for (const line of lines) {
      bubble.appendChild(createElement("p", "", line));
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
    pushMessage("user", question);
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

      typing.remove();
      pushMessage("assistant", answer || getFallbackAnswer(question));
    } finally {
      sendButton.disabled = false;
      input.focus();
    }
  });

  pushMessage(
    "assistant",
    "Bonjour. Je peux t’aider sur les termes d’architecture, le quiz, la connexion, les contributions et la navigation du site."
  );

  let shouldOpen = false;
  try {
    shouldOpen = window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch (_error) {
    shouldOpen = false;
  }
  setOpen(shouldOpen);
})();
