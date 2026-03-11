const cards = document.getElementById("cards");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const randomButton = document.getElementById("random");
const sortSelect = document.getElementById("sort");
const meta = document.getElementById("meta");
const syncStatus = document.getElementById("sync-status");
const statTotal = document.getElementById("stat-total");
const statCategories = document.getElementById("stat-categories");
const categoryGrid = document.getElementById("category-grid");
const clearFiltersButton = document.getElementById("clear-filters");
const viewAllTermsButton = document.getElementById("view-all-terms");
const termsPanel = document.getElementById("terms-panel");
const quickAllButton = document.getElementById("qa-all");
const quickQuizButton = document.getElementById("qa-quiz");
const quickCategoriesButton = document.getElementById("qa-categories");
const quizToggle = document.getElementById("quiz-toggle");
const quizSection = document.getElementById("quiz");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const quizScore = document.getElementById("quiz-score");
const quizStreak = document.getElementById("quiz-streak");
const quizLevel = document.getElementById("quiz-level");
const quizTimer = document.getElementById("quiz-timer");
const quizModeSelect = document.getElementById("quiz-mode");
const quizEffectsToggle = document.getElementById("quiz-effects-toggle");
const quizProgressBar = document.getElementById("quiz-progress-bar");
const quizBadge = document.getElementById("quiz-badge");
const quizLeaderboard = document.getElementById("quiz-leaderboard");
const quizNext = document.getElementById("quiz-next");
const quizReplay = document.getElementById("quiz-replay");
const quizExit = document.getElementById("quiz-exit");
const authStatus = document.getElementById("auth-status");
const authLink = document.getElementById("auth-link");
const logoutButton = document.getElementById("logout");
const adminLink = document.getElementById("admin-link");
const dockHomeButton = document.getElementById("dock-home");
const dockQuizButton = document.getElementById("dock-quiz");
const dockRandomButton = document.getElementById("dock-random");
const dockTopButton = document.getElementById("dock-top");

let allTerms = [];
let supabaseClient = null;
let filterRafId = 0;
let filteredTerms = [];
let visibleTermsCount = 0;
let loadMoreButton = null;
let showAllTermsRequested = false;
const TERMS_BATCH_SIZE = 24;
const QUIZ_STORAGE_KEY = "dico_archi_quiz_scores_v1";
const QUIZ_MODES = {
  easy: { label: "Facile", duration: 45, optionsCount: 3 },
  medium: { label: "Moyen", duration: 30, optionsCount: 4 },
  hard: { label: "Difficile", duration: 20, optionsCount: 4 }
};
let quizPrefs = {
  mode: "medium",
  effectsOn: true
};
let quizAudioContext = null;
const FALLBACK_TERMS = [
  {
    term: "SIA 102",
    category: "Normes",
    definition: "Reglement qui decrit les prestations de l'architecte en Suisse.",
    example: "Base pour cadrer les phases du mandat.",
    related: ["Phases SIA 102"],
    image_url: ""
  },
  {
    term: "Avant-projet",
    category: "Phases",
    definition: "Phase de conception initiale pour tester les options du projet.",
    example: "Esquisses, volumetrie, premiers choix.",
    related: ["Projet"],
    image_url: ""
  },
  {
    term: "Permis de construire",
    category: "Administratif",
    definition: "Autorisation officielle avant de demarrer certains travaux.",
    example: "Depot des plans a la commune.",
    related: ["Projet"],
    image_url: ""
  },
  {
    term: "CFC",
    category: "Normes",
    definition: "Classification des couts de construction par lots de travaux.",
    example: "Utilise pour structurer le devis.",
    related: ["Devis"],
    image_url: ""
  },
  {
    term: "Direction des travaux",
    category: "Chantier",
    definition: "Pilotage du chantier pour qualite, delais et couts.",
    example: "Coordination entreprises et suivi execution.",
    related: ["Chantier"],
    image_url: ""
  }
];

const CATEGORY_IMAGE_MAP = {
  normes: "assets/illustrations/normes.svg",
  phases: "assets/illustrations/phases.svg",
  chantier: "assets/illustrations/chantier.svg",
  dessin: "assets/illustrations/dessin.svg",
  administratif: "assets/illustrations/default.svg"
};

function getLocalTermsRaw() {
  if (Array.isArray(window.TERMS)) return window.TERMS;
  if (typeof TERMS !== "undefined" && Array.isArray(TERMS)) return TERMS;
  return [];
}

function hasSupabaseConfig() {
  return Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
}

function setSyncStatus(text) {
  if (!syncStatus) return;
  syncStatus.textContent = text;
}

function isStaffProfile(profile) {
  if (!profile) return false;
  if (profile.active === false) return false;
  const role = profile.role || (profile.is_editor ? "maitre_apprentissage" : "apprenti");
  return role === "super_admin" || role === "maitre_apprentissage";
}

function setAuthUi({ user, profile }) {
  const isStaff = isStaffProfile(profile);
  if (authStatus) {
    authStatus.textContent = user ? `Connecté: ${user.email}` : "Non connecté";
  }
  if (authLink) {
    authLink.hidden = false;
    authLink.href = user ? "compte.html" : "auth.html";
    authLink.textContent = user ? "Mon compte" : "Connexion";
  }
  if (logoutButton) logoutButton.hidden = !user;
  if (adminLink) adminLink.hidden = !isStaff;
}

async function fetchProfileForUser(userId) {
  if (!userId || !supabaseClient) return null;

  const withRoles = await supabaseClient
    .from("profiles")
    .select("role, active, is_editor")
    .eq("id", userId)
    .single();

  if (!withRoles.error) return withRoles.data || null;

  const fallback = await supabaseClient
    .from("profiles")
    .select("is_editor")
    .eq("id", userId)
    .single();

  if (!fallback.error) return fallback.data || null;
  return null;
}

function normalizeTerm(item) {
  const related = Array.isArray(item.related)
    ? item.related
    : item.related
      ? String(item.related).split("|").map((value) => value.trim()).filter(Boolean)
      : [];

  const term = item.term || "";
  const category = item.category || "Non classe";
  const definition = item.definition || "";
  const example = item.example || "";
  const searchText = [term, definition, example, ...related].join(" ").toLowerCase();
  const media_urls = parseMediaUrls(item.image_url);

  return {
    term,
    category,
    definition,
    example,
    related,
    image_url: item.image_url || "",
    media_urls,
    search_text: searchText
  };
}

function normalizeCategoryKey(value) {
  return (value || "").trim().toLowerCase();
}

function mergeTerms(primary, secondary) {
  const byTerm = new Map();

  for (const item of secondary) {
    const key = (item.term || "").trim().toLowerCase();
    if (!key) continue;
    byTerm.set(key, item);
  }

  for (const item of primary) {
    const key = (item.term || "").trim().toLowerCase();
    if (!key) continue;
    byTerm.set(key, item);
  }

  return Array.from(byTerm.values()).sort((a, b) => a.term.localeCompare(b.term, "fr"));
}

function isVisibleTerm(item) {
  const t = (item.term || "").trim().toLowerCase();
  if (!t) return false;
  if (t.startsWith("test")) return false;
  if (t.includes("e2e")) return false;
  if (t.includes("__audit")) return false;
  return true;
}

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function resolveCardImage(item) {
  const imageFromMedia = getPrimaryImageUrl(item);
  if (imageFromMedia) return imageFromMedia;
  const key = normalizeCategoryKey(item.category);
  return CATEGORY_IMAGE_MAP[key] || "assets/illustrations/default.svg";
}

function parseMediaUrls(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((item) => String(item || "").trim()).filter(Boolean);

  const text = String(raw).trim();
  if (!text) return [];

  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || "").trim()).filter(Boolean);
      }
    } catch (_error) {
      // Fallback below.
    }
  }

  if (text.includes("\n")) {
    return text
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  if (text.includes("|")) {
    return text
      .split("|")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [text];
}

function isPdfUrl(url) {
  if (!url) return false;
  const raw = String(url).trim().toLowerCase();
  if (!raw) return false;
  try {
    const parsed = new URL(raw, window.location.origin);
    return parsed.pathname.endsWith(".pdf");
  } catch (_error) {
    return raw.endsWith(".pdf");
  }
}

function isLikelyImageUrl(url) {
  if (!url) return false;
  const raw = String(url).trim();
  if (!raw) return false;
  try {
    const parsed = new URL(raw, window.location.origin);
    const path = parsed.pathname.toLowerCase();
    return [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].some((ext) => path.endsWith(ext));
  } catch (_error) {
    const lowered = raw.toLowerCase();
    return [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].some((ext) => lowered.endsWith(ext));
  }
}

function getPrimaryImageUrl(item) {
  const media = Array.isArray(item?.media_urls) ? item.media_urls : parseMediaUrls(item?.image_url);
  for (const url of media) {
    if (!isSafeImageUrl(url)) continue;
    if (isPdfUrl(url)) continue;
    if (!isLikelyImageUrl(url)) continue;
    return url;
  }
  return "";
}

function isSafeImageUrl(value) {
  if (!value) return false;
  const raw = String(value).trim();
  if (!raw) return false;
  if (raw.startsWith("/")) return true;
  try {
    const parsed = new URL(raw, window.location.origin);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch (_error) {
    return false;
  }
}

function createTermUrl(term) {
  return `term.html?term=${encodeURIComponent(term || "")}`;
}

function createCategoryUrl(category) {
  return `category.html?name=${encodeURIComponent(category || "")}`;
}

function buildCategoryOptions(terms) {
  const categories = Array.from(new Set(terms.map((t) => t.category))).sort();
  clearChildren(categorySelect);

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Toutes les catégories";
  categorySelect.appendChild(allOption);

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  }
}

function renderCategoryGrid(terms) {
  if (!categoryGrid) return;
  clearChildren(categoryGrid);

  const counts = new Map();
  for (const item of terms) {
    const key = item.category || "Non classe";
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const categories = Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0], "fr"));
  for (const [category, count] of categories) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-tile";
    button.setAttribute("aria-label", `Ouvrir la catégorie ${category}`);

    const title = document.createElement("strong");
    title.textContent = category;
    const meta = document.createElement("span");
    meta.textContent = `${count} terme${count > 1 ? "s" : ""}`;

    button.appendChild(title);
    button.appendChild(meta);
    button.addEventListener("click", () => {
      showAllTermsRequested = false;
      categorySelect.value = category;
      filterTerms();
      if (termsPanel) termsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    categoryGrid.appendChild(button);
  }
}

function updateStats(visibleCount) {
  if (statTotal) statTotal.textContent = String(visibleCount);
  if (statCategories) {
    const count = new Set(allTerms.map((t) => t.category)).size;
    statCategories.textContent = String(count);
  }
}

function ensureLoadMoreButton() {
  if (loadMoreButton || !cards || !cards.parentElement) return;
  loadMoreButton = document.createElement("button");
  loadMoreButton.type = "button";
  loadMoreButton.className = "ghost";
  loadMoreButton.id = "load-more";
  loadMoreButton.textContent = "Afficher plus";
  loadMoreButton.addEventListener("click", () => {
    visibleTermsCount = Math.min(visibleTermsCount + TERMS_BATCH_SIZE, filteredTerms.length);
    renderVisibleTerms();
  });
  cards.parentElement.appendChild(loadMoreButton);
}

function updateLoadMoreUi() {
  if (!loadMoreButton) return;
  if (!shouldShowTerms()) {
    loadMoreButton.hidden = true;
    return;
  }
  const remaining = Math.max(filteredTerms.length - visibleTermsCount, 0);
  if (!remaining) {
    loadMoreButton.hidden = true;
    return;
  }
  loadMoreButton.hidden = false;
  loadMoreButton.textContent = `Afficher plus (${remaining})`;
}

function render(list, totalCount = list.length) {
  clearChildren(cards);

  if (list.length === 0) {
    const empty = document.createElement("div");
    empty.className = "card";
    const title = document.createElement("h3");
    title.textContent = "Pas de résultat";
    const example = document.createElement("div");
    example.className = "example";
    example.textContent = "Essaie un autre mot ou une autre catégorie.";
    empty.appendChild(title);
    empty.appendChild(example);
    cards.appendChild(empty);
    meta.textContent = "0 terme";
    updateStats(0);
    updateLoadMoreUi();
    return;
  }

  for (const item of list) {
    const card = document.createElement("article");
    card.className = "card";

    const tag = document.createElement("a");
    tag.className = "tag";
    tag.href = createCategoryUrl(item.category);
    tag.textContent = item.category;

    const title = document.createElement("h3");
    title.textContent = item.term;

    const image = document.createElement("img");
    image.className = "card__image";
    image.src = resolveCardImage(item);
    image.alt = item.term;
    image.loading = "lazy";
    image.decoding = "async";
    card.appendChild(image);

    const definition = document.createElement("div");
    definition.textContent = item.definition;

    const example = document.createElement("div");
    example.className = "example";
    example.textContent = item.example;

    const related = document.createElement("div");
    related.className = "related";
    related.textContent = item.related.length ? `Lié à: ${item.related.join(", ")}` : "";

    card.appendChild(tag);
    card.appendChild(title);
    card.appendChild(definition);
    if (item.example) card.appendChild(example);
    if (item.related.length) card.appendChild(related);

    const actions = document.createElement("div");
    actions.className = "card__actions";
    const detailsLink = document.createElement("a");
    detailsLink.className = "card__link";
    detailsLink.href = createTermUrl(item.term);
    detailsLink.textContent = "Voir fiche";
    actions.appendChild(detailsLink);
    card.appendChild(actions);

    cards.appendChild(card);
  }

  if (totalCount > list.length) {
    meta.textContent = `${list.length} / ${totalCount} termes`;
  } else {
    meta.textContent = `${list.length} terme${list.length > 1 ? "s" : ""}`;
  }
  updateStats(totalCount);
  updateLoadMoreUi();
}

function renderVisibleTerms() {
  const visible = filteredTerms.slice(0, visibleTermsCount);
  render(visible, filteredTerms.length);
}

function resetVisibleTerms(list) {
  filteredTerms = list;
  visibleTermsCount = Math.min(TERMS_BATCH_SIZE, filteredTerms.length);
  renderVisibleTerms();
}

function shouldShowTerms() {
  const query = searchInput.value.trim();
  const hasCategoryFilter = categorySelect.value !== "all";
  return Boolean(query) || hasCategoryFilter || showAllTermsRequested;
}

function getFilteredTerms() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const sortMode = sortSelect ? sortSelect.value : "az";

  let filtered = allTerms;
  if (query) {
    filtered = filtered.filter((t) => (t.search_text || "").includes(query));
  }

  if (category !== "all") {
    filtered = filtered.filter((t) => t.category === category);
  }

  if (sortMode === "category") {
    filtered.sort((a, b) => {
      const byCategory = a.category.localeCompare(b.category, "fr");
      if (byCategory !== 0) return byCategory;
      return a.term.localeCompare(b.term, "fr");
    });
  } else {
    filtered.sort((a, b) => a.term.localeCompare(b.term, "fr"));
  }

  return filtered;
}

function filterTerms() {
  if (!shouldShowTerms()) {
    if (termsPanel) termsPanel.hidden = true;
    filteredTerms = [];
    visibleTermsCount = 0;
    if (meta) meta.textContent = "Choisis une catégorie pour commencer.";
    updateStats(0);
    updateLoadMoreUi();
    return;
  }

  if (termsPanel) termsPanel.hidden = false;
  const nextFiltered = getFilteredTerms();
  resetVisibleTerms(nextFiltered);
}

function scheduleFilterTerms() {
  if (filterRafId) cancelAnimationFrame(filterRafId);
  filterRafId = requestAnimationFrame(() => {
    filterRafId = 0;
    filterTerms();
  });
}

searchInput.addEventListener("input", scheduleFilterTerms);
categorySelect.addEventListener("change", () => {
  const query = searchInput.value.trim();
  if (categorySelect.value === "all" && !query) {
    showAllTermsRequested = true;
  } else {
    showAllTermsRequested = false;
  }
  filterTerms();
});
if (sortSelect) sortSelect.addEventListener("change", filterTerms);

randomButton.addEventListener("click", () => {
  const pool = categorySelect.value === "all"
    ? allTerms
    : allTerms.filter((t) => t.category === categorySelect.value);
  const choice = pool[Math.floor(Math.random() * pool.length)];
  if (!choice) return;
  searchInput.value = choice.term;
  filterTerms();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

let quizState = {
  total: 0,
  correct: 0,
  current: null,
  started: false,
  streak: 0,
  bestStreak: 0,
  timeLeft: QUIZ_MODES[quizPrefs.mode].duration,
  timerId: null,
  ended: false
};

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getCurrentQuizModeConfig() {
  return QUIZ_MODES[quizPrefs.mode] || QUIZ_MODES.medium;
}

function formatQuizDuration() {
  return `${getCurrentQuizModeConfig().duration}s`;
}

function safeReadScores() {
  try {
    const raw = window.localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return { easy: [], medium: [], hard: [] };
    const parsed = JSON.parse(raw);
    return {
      easy: Array.isArray(parsed.easy) ? parsed.easy : [],
      medium: Array.isArray(parsed.medium) ? parsed.medium : [],
      hard: Array.isArray(parsed.hard) ? parsed.hard : []
    };
  } catch (_error) {
    return { easy: [], medium: [], hard: [] };
  }
}

function safeWriteScores(scores) {
  try {
    window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(scores));
  } catch (_error) {
    // Ignore storage failures.
  }
}

function saveQuizScore() {
  const scores = safeReadScores();
  const bucket = scores[quizPrefs.mode] || [];
  const ratio = quizState.total ? quizState.correct / quizState.total : 0;
  bucket.push({
    correct: quizState.correct,
    total: quizState.total,
    ratio,
    date: new Date().toISOString()
  });
  bucket.sort((a, b) => {
    if (b.ratio !== a.ratio) return b.ratio - a.ratio;
    return b.correct - a.correct;
  });
  scores[quizPrefs.mode] = bucket.slice(0, 5);
  safeWriteScores(scores);
}

function renderLeaderboard() {
  if (!quizLeaderboard) return;
  const scores = safeReadScores();
  const bucket = scores[quizPrefs.mode] || [];
  if (!bucket.length) {
    quizLeaderboard.textContent = "Aucune manche terminée.";
    return;
  }
  const lines = bucket.map((entry, index) => {
    const pct = Math.round(entry.ratio * 100);
    return `${index + 1}. ${entry.correct}/${entry.total} (${pct}%)`;
  });
  quizLeaderboard.textContent = lines.join(" · ");
}

function ensureAudioContext() {
  if (quizAudioContext) return quizAudioContext;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  quizAudioContext = new Ctx();
  return quizAudioContext;
}

function playTone(type) {
  if (!quizPrefs.effectsOn) return;
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  if (type === "ok") osc.frequency.value = 620;
  else if (type === "ko") osc.frequency.value = 240;
  else osc.frequency.value = 480;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc.start(now);
  osc.stop(now + 0.18);
}

function pulseQuizSection(className) {
  if (!quizSection || !quizPrefs.effectsOn) return;
  quizSection.classList.remove("quiz--celebrate", "quiz--shake");
  quizSection.classList.add(className);
  setTimeout(() => quizSection.classList.remove(className), 260);
}

function updateScore() {
  quizScore.textContent = `${quizState.correct} / ${quizState.total}`;
  if (quizStreak) quizStreak.textContent = `Série: ${quizState.streak} (meilleure: ${quizState.bestStreak})`;
  if (quizTimer) quizTimer.textContent = `Temps: ${quizState.timeLeft}s`;
  if (quizLevel) {
    if (quizState.total < 3) {
      quizLevel.textContent = `Niveau: ${getCurrentQuizModeConfig().label} · Échauffement`;
    } else {
      const ratio = quizState.correct / quizState.total;
      if (ratio >= 0.8) quizLevel.textContent = `Niveau: ${getCurrentQuizModeConfig().label} · Expert`;
      else if (ratio >= 0.55) quizLevel.textContent = `Niveau: ${getCurrentQuizModeConfig().label} · Solide`;
      else quizLevel.textContent = `Niveau: ${getCurrentQuizModeConfig().label} · En progression`;
    }
  }
  if (quizProgressBar) {
    const pct = Math.min(quizState.total, 10) / 10;
    quizProgressBar.style.width = `${Math.round(pct * 100)}%`;
  }
}

function stopQuizTimer() {
  if (!quizState.timerId) return;
  clearInterval(quizState.timerId);
  quizState.timerId = null;
}

function computeQuizBadge() {
  if (quizState.total < 3) return { label: "Badge: Participant", cls: "bronze" };
  const ratio = quizState.correct / quizState.total;
  if (ratio >= 0.8) return { label: "Badge: Or", cls: "gold" };
  if (ratio >= 0.55) return { label: "Badge: Argent", cls: "silver" };
  return { label: "Badge: Bronze", cls: "bronze" };
}

function endQuizRound(reason) {
  if (quizState.ended) return;
  quizState.ended = true;
  stopQuizTimer();
  quizNext.disabled = true;
  const buttons = quizOptions.querySelectorAll("button");
  buttons.forEach((btn) => (btn.disabled = true));

  const badge = computeQuizBadge();
  if (quizBadge) {
    quizBadge.textContent = `${badge.label} · Score: ${quizState.correct}/${quizState.total}`;
    quizBadge.classList.remove("hidden", "gold", "silver", "bronze");
    quizBadge.classList.add(badge.cls);
  }
  if (quizReplay) quizReplay.classList.remove("hidden");
  quizFeedback.classList.remove("ok", "ko");
  quizFeedback.classList.add("ok");
  quizFeedback.textContent = reason || "Fin de manche.";
  saveQuizScore();
  renderLeaderboard();
  playTone("end");
  pulseQuizSection("quiz--celebrate");
}

function startQuizTimer() {
  stopQuizTimer();
  quizState.timeLeft = getCurrentQuizModeConfig().duration;
  updateScore();
  quizState.timerId = setInterval(() => {
    quizState.timeLeft -= 1;
    if (quizState.timeLeft <= 0) {
      quizState.timeLeft = 0;
      updateScore();
      endQuizRound("Temps ecoule. Clique sur Rejouer pour une nouvelle manche.");
      return;
    }
    updateScore();
  }, 1000);
}

function resetQuizIntro() {
  stopQuizTimer();
  quizState = {
    total: 0,
    correct: 0,
    current: null,
    started: false,
    streak: 0,
    bestStreak: 0,
    timeLeft: getCurrentQuizModeConfig().duration,
    timerId: null,
    ended: false
  };
  quizQuestion.textContent = `Prêt ? Clique sur “Démarrer le quiz” (chrono ${formatQuizDuration()}).`;
  quizFeedback.textContent = "";
  quizFeedback.classList.remove("ok", "ko");
  quizOptions.innerHTML = "";
  if (quizBadge) {
    quizBadge.textContent = "";
    quizBadge.classList.add("hidden");
    quizBadge.classList.remove("gold", "silver", "bronze");
  }
  if (quizReplay) quizReplay.classList.add("hidden");
  quizNext.textContent = "Démarrer le quiz";
  quizNext.disabled = false;
  if (quizEffectsToggle) quizEffectsToggle.textContent = `Effets: ${quizPrefs.effectsOn ? "ON" : "OFF"}`;
  if (quizModeSelect) quizModeSelect.value = quizPrefs.mode;
  updateScore();
  renderLeaderboard();
}

function openQuizPanel() {
  if (!quizSection) return;
  if (quizSection.classList.contains("hidden")) {
    quizSection.classList.remove("hidden");
    resetQuizIntro();
  }
  window.scrollTo({ top: quizSection.offsetTop - 20, behavior: "smooth" });
}

function buildQuestion() {
  if (quizState.ended) return;
  const pool = getFilteredTerms();
  if (pool.length < 2) {
    quizQuestion.textContent = "Ajoute plus de termes ou elargis les filtres pour lancer un quiz.";
    quizOptions.innerHTML = "";
    quizNext.textContent = "Démarrer le quiz";
    quizNext.disabled = true;
    return;
  }

  const mode = getCurrentQuizModeConfig();
  const correct = pool[Math.floor(Math.random() * pool.length)];
  let distractorPool = pool.filter((t) => t.term !== correct.term);
  if (quizPrefs.mode === "hard") {
    const sameCategory = distractorPool.filter((t) => t.category === correct.category);
    if (sameCategory.length >= mode.optionsCount - 1) {
      distractorPool = sameCategory;
    }
  }
  const others = shuffle(distractorPool).slice(0, Math.max(1, mode.optionsCount - 1));
  const options = shuffle([correct, ...others]);

  quizState.current = correct;
  if (quizPrefs.mode === "hard") {
    quizQuestion.textContent = `Definition exacte de : ${correct.term} ?`;
  } else {
    quizQuestion.textContent = `Que veut dire : ${correct.term} ? (Categorie: ${correct.category})`;
  }
  quizFeedback.textContent = "";
  quizFeedback.classList.remove("ok", "ko");
  quizOptions.innerHTML = "";
  quizNext.textContent = "Question suivante";
  quizNext.disabled = true;

  for (const option of options) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = option.definition;
    btn.addEventListener("click", () => handleAnswer(btn, option.term === correct.term));
    quizOptions.appendChild(btn);
  }
}

function handleAnswer(button, isCorrect) {
  if (quizState.ended) return;
  const buttons = quizOptions.querySelectorAll("button");
  buttons.forEach((btn) => (btn.disabled = true));

  quizState.total += 1;
  if (isCorrect) {
    quizState.correct += 1;
    quizState.streak += 1;
    if (quizState.streak > quizState.bestStreak) quizState.bestStreak = quizState.streak;
    button.classList.add("correct");
    quizFeedback.classList.remove("ko");
    quizFeedback.classList.add("ok");
    const cheers = [
      "Excellent, bonne reponse.",
      "Parfait, tu maitrises ce terme.",
      "Bien joue, continue comme ca."
    ];
    quizFeedback.textContent = cheers[Math.floor(Math.random() * cheers.length)];
    playTone("ok");
    pulseQuizSection("quiz--celebrate");
  } else {
    quizState.streak = 0;
    button.classList.add("wrong");
    quizFeedback.classList.remove("ok");
    quizFeedback.classList.add("ko");
    const retries = [
      "Pas loin. On retente.",
      "Presque. Prochaine question.",
      "Ce n'est pas grave, on continue."
    ];
    const prefix = retries[Math.floor(Math.random() * retries.length)];
    quizFeedback.textContent = `${prefix} Bonne reponse: ${quizState.current.definition}`;
    playTone("ko");
    pulseQuizSection("quiz--shake");
  }

  quizNext.textContent = "Question suivante";
  quizNext.disabled = false;
  updateScore();
}

quizToggle.addEventListener("click", () => {
  if (quizSection.classList.contains("hidden")) {
    openQuizPanel();
    return;
  }
  quizSection.classList.add("hidden");
});

quizNext.addEventListener("click", () => {
  if (quizState.ended) return;
  if (!quizState.started) {
    quizState.started = true;
    startQuizTimer();
    buildQuestion();
    return;
  }
  buildQuestion();
});

if (quizModeSelect) {
  quizModeSelect.addEventListener("change", () => {
    quizPrefs.mode = quizModeSelect.value in QUIZ_MODES ? quizModeSelect.value : "medium";
    resetQuizIntro();
  });
}

if (quizEffectsToggle) {
  quizEffectsToggle.addEventListener("click", () => {
    quizPrefs.effectsOn = !quizPrefs.effectsOn;
    quizEffectsToggle.textContent = `Effets: ${quizPrefs.effectsOn ? "ON" : "OFF"}`;
  });
}

if (quizReplay) {
  quizReplay.addEventListener("click", () => {
    resetQuizIntro();
    quizState.started = true;
    startQuizTimer();
    buildQuestion();
    if (quizScore) {
      quizScore.classList.add("quiz__score--pulse");
      setTimeout(() => quizScore.classList.remove("quiz__score--pulse"), 260);
    }
  });
}

quizExit.addEventListener("click", () => {
  stopQuizTimer();
  quizSection.classList.add("hidden");
});

async function loadTerms() {
  const localTerms = getLocalTermsRaw().map(normalizeTerm);

  if (!hasSupabaseConfig()) {
    allTerms = localTerms;
    buildCategoryOptions(allTerms);
    renderCategoryGrid(allTerms);
    filterTerms();
    setSyncStatus("Mode local: configure Supabase pour la synchro.");
    setAuthUi({ user: null, profile: null });
    return;
  }

  try {
    supabaseClient = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage
        }
      }
    );

    const { data: userData } = await supabaseClient.auth.getUser();
    const user = userData?.user || null;
    let profile = null;

    if (user) {
      profile = await fetchProfileForUser(user.id);
    }

    setAuthUi({ user, profile });
    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user || null;
      let nextProfile = null;
      if (nextUser) {
        nextProfile = await fetchProfileForUser(nextUser.id);
      }
      setAuthUi({ user: nextUser, profile: nextProfile });
    });

    const { data, error } = await supabaseClient
      .from("terms")
      .select("term, category, definition, example, related, image_url")
      .order("term", { ascending: true });

    if (error) throw error;

    const remoteTerms = (data || []).map(normalizeTerm);
    allTerms = mergeTerms(remoteTerms, localTerms).filter(isVisibleTerm);

    if (!remoteTerms.length && localTerms.length) {
      setSyncStatus("Supabase vide: affichage local de secours.");
    } else {
      setSyncStatus(
        `Données synchronisées (${remoteTerms.length} Supabase + ${localTerms.length} local).`
      );
    }
  } catch (err) {
    console.error(err);
    allTerms = localTerms.filter(isVisibleTerm);
    setSyncStatus("Erreur de synchro Supabase: affichage local.");
  }

  if (!allTerms.length) {
    allTerms = FALLBACK_TERMS.map(normalizeTerm).filter(isVisibleTerm);
    setSyncStatus("Mode secours: affichage d’un contenu intégré.");
  }

  buildCategoryOptions(allTerms);
  renderCategoryGrid(allTerms);
  filterTerms();
}

loadTerms();

ensureLoadMoreButton();

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    if (!supabaseClient) return;
    try {
      await supabaseClient.auth.signOut();
      setAuthUi({ user: null, profile: null });
    } catch (_error) {
      setSyncStatus("Erreur de déconnexion: recharge la page si besoin.");
    }
  });
}

if (clearFiltersButton) {
  clearFiltersButton.addEventListener("click", () => {
    showAllTermsRequested = false;
    searchInput.value = "";
    categorySelect.value = "all";
    if (sortSelect) sortSelect.value = "az";
    filterTerms();
  });
}

if (viewAllTermsButton) {
  viewAllTermsButton.addEventListener("click", () => {
    showAllTermsRequested = true;
    searchInput.value = "";
    categorySelect.value = "all";
    if (sortSelect) sortSelect.value = "az";
    filterTerms();
    if (termsPanel) termsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (quickAllButton) {
  quickAllButton.addEventListener("click", () => {
    if (viewAllTermsButton) viewAllTermsButton.click();
  });
}

if (quickQuizButton) {
  quickQuizButton.addEventListener("click", () => {
    openQuizPanel();
  });
}

if (quickCategoriesButton) {
  quickCategoriesButton.addEventListener("click", () => {
    const quickPanel = document.querySelector(".quick");
    if (quickPanel) quickPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (dockHomeButton) {
  dockHomeButton.addEventListener("click", () => {
    const hero = document.querySelector(".hero");
    if (hero) hero.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (dockQuizButton) {
  dockQuizButton.addEventListener("click", () => openQuizPanel());
}

if (dockRandomButton) {
  dockRandomButton.addEventListener("click", () => {
    if (randomButton) randomButton.click();
  });
}

if (dockTopButton) {
  dockTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function openQuizFromHashIfNeeded() {
  if (window.location.hash !== "#quiz") return;
  openQuizPanel();
}

window.addEventListener("hashchange", openQuizFromHashIfNeeded);
openQuizFromHashIfNeeded();
