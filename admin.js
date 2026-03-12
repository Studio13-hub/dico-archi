const adminMessage = document.getElementById("admin-message");
const adminUser = document.getElementById("admin-user");
const adminRole = document.getElementById("admin-role");
const adminLogout = document.getElementById("admin-logout");

const termInput = document.getElementById("term");
const categoryInput = document.getElementById("category");
const statusInput = document.getElementById("term-status");
const definitionInput = document.getElementById("definition");
const exampleInput = document.getElementById("example");
const relatedInput = document.getElementById("related");
const imageUrlInput = document.getElementById("image-url");
const imageFileInput = document.getElementById("image-file");
const reviewerCommentInput = document.getElementById("reviewer-comment");
const submissionBanner = document.getElementById("submission-banner");
const uploadStatus = document.getElementById("upload-status");
const saveButton = document.getElementById("save");
const resetButton = document.getElementById("reset");
const termsTable = document.getElementById("terms-table");
const adminSearch = document.getElementById("admin-search");
const adminSort = document.getElementById("admin-sort");
const exportPublishedButton = document.getElementById("export-published");
const auditList = document.getElementById("audit-list");
const auditEmpty = document.getElementById("audit-empty");
const workflowButtons = document.querySelectorAll("[data-term-filter]");
const statDraft = document.getElementById("admin-stat-draft");
const statReview = document.getElementById("admin-stat-review");
const statPublished = document.getElementById("admin-stat-published");
const usersPanel = document.getElementById("users-panel");
const usersTable = document.getElementById("users-table");
const usersEmpty = document.getElementById("users-empty");
const chatFeedbackPanel = document.getElementById("chat-feedback-panel");
const chatFeedbackSummary = document.getElementById("chat-feedback-summary");
const chatFeedbackTop = document.getElementById("chat-feedback-top");
const chatFeedbackList = document.getElementById("chat-feedback-list");
const chatFeedbackEmpty = document.getElementById("chat-feedback-empty");
const chatFeedbackRating = document.getElementById("chat-feedback-rating");
const chatFeedbackSource = document.getElementById("chat-feedback-source");
const chatFeedbackExport = document.getElementById("chat-feedback-export");
const chatFeedbackRefresh = document.getElementById("chat-feedback-refresh");

let supabaseClient = null;
let currentUser = null;
let userProfile = null;
let canManageTerms = false;
let isSuperAdmin = false;
let terms = [];
let editingId = null;
let editingSubmission = null;
let supportsTermStatus = true;
let currentStatusFilter = "all";
let profiles = [];
let isSavingTerm = false;
let isProcessingSubmission = false;
let isDeletingTerm = false;
let updatingProfileId = null;
let adminFilterRafId = 0;
let isLoadingChatFeedback = false;
let lastChatFeedbackItems = [];

const ROLE_LABELS = {
  super_admin: "Super admin",
  maitre_apprentissage: "Formateur",
  apprenti: "Apprenti"
};

function normalizeProfile(profile) {
  if (!profile) return null;
  return {
    role: profile.role || (profile.is_editor ? "maitre_apprentissage" : "apprenti"),
    active: profile.active !== false,
    is_editor: Boolean(profile.is_editor)
  };
}

function canManageFromProfile(profile) {
  if (!profile || profile.active === false) return false;
  return profile.role === "super_admin" || profile.role === "maitre_apprentissage";
}

function isSuperAdminProfile(profile) {
  if (!profile || profile.active === false) return false;
  return profile.role === "super_admin";
}

function setMessage(text, isError = false) {
  adminMessage.textContent = text;
  adminMessage.style.color = isError ? "#d94e2b" : "#1f7a70";
}

function getErrorMessage(error, fallback = "Operation impossible.") {
  if (!error) return fallback;
  return error.message || String(error);
}

function isAuthError(error) {
  if (!error) return false;
  const code = String(error.code || "").toUpperCase();
  const message = String(error.message || "").toLowerCase();
  if (code === "401" || code === "403" || code === "PGRST301") return true;
  if (message.includes("jwt")) return true;
  if (message.includes("auth session missing")) return true;
  if (message.includes("token") && message.includes("expired")) return true;
  return false;
}

async function handleAuthError(error, contextLabel) {
  if (!isAuthError(error)) return false;
  const prefix = contextLabel ? `${contextLabel}: ` : "";
  setMessage(`${prefix}session expiree. Reconnecte-toi.`, true);
  try {
    if (supabaseClient) await supabaseClient.auth.signOut();
  } catch (_error) {
    // Ignore sign out errors.
  }
  window.location.href = "auth.html";
  return true;
}

function isMissingRpc(error, functionName) {
  if (!error) return false;
  if (error.code === "PGRST202") return true;
  const message = (error.message || "").toLowerCase();
  return message.includes("could not find") && message.includes((functionName || "").toLowerCase());
}

function setButtonBusy(button, busy, busyLabel, idleLabel) {
  if (!button) return;
  if (busy) {
    button.dataset.idleLabel = button.textContent || idleLabel;
    button.textContent = busyLabel;
    button.disabled = true;
    return;
  }
  button.textContent = button.dataset.idleLabel || idleLabel;
  button.disabled = false;
}

function isSafeImageUrl(value) {
  if (!value) return true;
  const raw = String(value).trim();
  if (!raw) return true;
  if (raw.startsWith("/")) return true;
  try {
    const parsed = new URL(raw, window.location.origin);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch (_error) {
    return false;
  }
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
      // Falls back to line parsing below.
    }
  }

  if (text.includes("\n")) {
    return text
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (text.includes("|")) {
    return text
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [text];
}

function dedupeMediaUrls(list) {
  const seen = new Set();
  const result = [];
  for (const item of list) {
    const normalized = String(item || "").trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }
  return result;
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

function isSupportedMediaUrl(url) {
  if (!isSafeImageUrl(url)) return false;
  if (isPdfUrl(url)) return true;
  return isLikelyImageUrl(url);
}

function formatMediaUrlsForInput(raw) {
  return parseMediaUrls(raw).join("\n");
}

function serializeMediaUrls(urls) {
  if (!urls.length) return null;
  if (urls.length === 1) return urls[0];
  return JSON.stringify(urls);
}

function hasSupabaseConfig() {
  return Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
}

function setUploadStatus(text) {
  uploadStatus.textContent = text;
}

function clearForm() {
  editingId = null;
  editingSubmission = null;
  termInput.value = "";
  categoryInput.value = "";
  if (statusInput) statusInput.value = "draft";
  definitionInput.value = "";
  exampleInput.value = "";
  relatedInput.value = "";
  imageUrlInput.value = "";
  imageFileInput.value = "";
  reviewerCommentInput.value = "";
  if (submissionBanner) submissionBanner.textContent = "";
  setUploadStatus("");
}

function normalizeRelated(raw) {
  return raw
    .split("|")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getTermStatus(item) {
  return item.status || "published";
}

function parseDateOrZero(value) {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

function compareTerms(a, b, mode) {
  const termA = (a.term || "").toLowerCase();
  const termB = (b.term || "").toLowerCase();
  const categoryA = (a.category || "").toLowerCase();
  const categoryB = (b.category || "").toLowerCase();
  const statusA = getTermStatus(a);
  const statusB = getTermStatus(b);
  const updatedA = parseDateOrZero(a.updated_at);
  const updatedB = parseDateOrZero(b.updated_at);

  switch (mode) {
    case "term_desc":
      return termB.localeCompare(termA, "fr");
    case "status": {
      const s = statusA.localeCompare(statusB, "fr");
      return s !== 0 ? s : termA.localeCompare(termB, "fr");
    }
    case "category": {
      const c = categoryA.localeCompare(categoryB, "fr");
      return c !== 0 ? c : termA.localeCompare(termB, "fr");
    }
    case "updated_desc": {
      if (updatedB !== updatedA) return updatedB - updatedA;
      return termA.localeCompare(termB, "fr");
    }
    case "updated_asc": {
      if (updatedA !== updatedB) return updatedA - updatedB;
      return termA.localeCompare(termB, "fr");
    }
    case "term_asc":
    default:
      return termA.localeCompare(termB, "fr");
  }
}

function updateWorkflowStats(list) {
  const draft = list.filter((item) => getTermStatus(item) === "draft").length;
  const review = list.filter((item) => getTermStatus(item) === "review").length;
  const published = list.filter((item) => getTermStatus(item) === "published").length;
  if (statDraft) statDraft.textContent = String(draft);
  if (statReview) statReview.textContent = String(review);
  if (statPublished) statPublished.textContent = String(published);
}

function updateFilterButtonsUi() {
  for (const btn of workflowButtons) {
    const active = btn.dataset.termFilter === currentStatusFilter;
    btn.classList.toggle("chip--active", active);
  }
}

function applyTermsView() {
  const query = adminSearch.value.trim().toLowerCase();
  const sortMode = adminSort ? adminSort.value : "term_asc";
  let filtered = terms.slice();
  if (currentStatusFilter !== "all") {
    filtered = filtered.filter((item) => getTermStatus(item) === currentStatusFilter);
  }
  if (query) {
    filtered = filtered.filter((item) =>
      [item.term, item.category, item.definition, item.example, ...(item.related || [])]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }
  filtered.sort((a, b) => compareTerms(a, b, sortMode));
  renderTable(filtered);
  updateWorkflowStats(terms);
  updateFilterButtonsUi();
}

function exportPublishedCsv() {
  const published = terms
    .filter((item) => getTermStatus(item) === "published")
    .sort((a, b) => compareTerms(a, b, "term_asc"));

  const esc = (value) => {
    const s = String(value ?? "");
    return `"${s.replaceAll('"', '""')}"`;
  };

  const rows = [
    ["term", "category", "status", "definition", "example", "related", "image_url", "updated_at"],
    ...published.map((item) => [
      item.term,
      item.category,
      getTermStatus(item),
      item.definition,
      item.example,
      (item.related || []).join(" | "),
      item.image_url || "",
      item.updated_at || ""
    ])
  ];

  const csv = rows.map((row) => row.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `dico-archi-published-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setMessage(`Export CSV termine (${published.length} termes publies).`);
}

function renderTable(list) {
  termsTable.innerHTML = "";

  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.textContent = "Aucun terme.";
    termsTable.appendChild(empty);
    return;
  }

  for (const item of list) {
    const row = document.createElement("div");
    row.className = "admin__row";

    const title = document.createElement("div");
    title.className = "admin__row-title";
    title.textContent = item.term;

    const info = document.createElement("div");
    info.className = "admin__row-info";
    const status = item.status || "published";
    info.textContent = `${item.category} · ${status.toUpperCase()} · ${item.definition}`;

    const actions = document.createElement("div");
    actions.className = "admin__row-actions";

    const editButton = document.createElement("button");
    editButton.className = "ghost";
    editButton.textContent = "Modifier";
    editButton.addEventListener("click", () => loadTerm(item));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Supprimer";
    deleteButton.addEventListener("click", () => removeTerm(item, deleteButton));

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    row.appendChild(title);
    row.appendChild(info);
    row.appendChild(actions);

    termsTable.appendChild(row);
  }
}

function renderSubmissions(list) {
  const container = document.getElementById("submissions");
  const empty = document.getElementById("submissions-empty");

  container.innerHTML = "";

  if (!list.length) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  for (const item of list) {
    const row = document.createElement("div");
    row.className = "admin__row";

    const title = document.createElement("div");
    title.className = "admin__row-title";
    title.textContent = item.term;

    const info = document.createElement("div");
    info.className = "admin__row-info";
    info.textContent = `${item.category} · ${item.definition}`;

    const meta = document.createElement("div");
    meta.className = "admin__row-meta";
    meta.textContent = `Par: ${item.submitter_email || "anonyme"}`;

    const status = document.createElement("div");
    status.className = `admin__row-status ${item.status || "pending"}`;
    status.textContent = item.status || "pending";

    const actions = document.createElement("div");
    actions.className = "admin__row-actions";

    const loadButton = document.createElement("button");
    loadButton.className = "ghost";
    loadButton.textContent = "Modifier";
    loadButton.dataset.submissionAction = "1";
    loadButton.disabled = isProcessingSubmission;
    loadButton.addEventListener("click", () => loadSubmission(item, row));

    const approveButton = document.createElement("button");
    approveButton.textContent = "Accepter";
    approveButton.dataset.submissionAction = "1";
    approveButton.disabled = isProcessingSubmission;
    approveButton.addEventListener("click", () => approveSubmission(item, approveButton));

    const rejectButton = document.createElement("button");
    rejectButton.className = "ghost";
    rejectButton.textContent = "Refuser";
    rejectButton.dataset.submissionAction = "1";
    rejectButton.disabled = isProcessingSubmission;
    rejectButton.addEventListener("click", () => rejectSubmission(item, rejectButton));

    actions.appendChild(loadButton);
    actions.appendChild(approveButton);
    actions.appendChild(rejectButton);

    row.appendChild(title);
    row.appendChild(info);
    row.appendChild(meta);
    row.appendChild(status);
    row.appendChild(actions);

    container.appendChild(row);
  }
}

function setSubmissionActionsDisabled(disabled) {
  const buttons = document.querySelectorAll("[data-submission-action]");
  for (const button of buttons) {
    button.disabled = disabled;
  }
}

function renderAudit(list) {
  auditList.innerHTML = "";

  if (!list.length) {
    if (auditEmpty) auditEmpty.style.display = "block";
    return;
  }

  if (auditEmpty) auditEmpty.style.display = "none";

  for (const item of list) {
    const row = document.createElement("div");
    row.className = "admin__row";

    const title = document.createElement("div");
    title.className = "admin__row-title";
    title.textContent = `${item.action}`;

    const info = document.createElement("div");
    info.className = "admin__row-info";
    info.textContent = `${item.entity || "-"} · ${item.actor_email || ""}`;

    const meta = document.createElement("div");
    meta.className = "admin__row-meta";
    const when = item.created_at ? new Date(item.created_at).toLocaleString() : "";
    meta.textContent = when;

    row.appendChild(title);
    row.appendChild(info);
    row.appendChild(meta);
    auditList.appendChild(row);
  }
}

function renderChatFeedback(list) {
  if (!chatFeedbackList || !chatFeedbackEmpty) return;
  chatFeedbackList.innerHTML = "";

  if (!list.length) {
    chatFeedbackEmpty.style.display = "block";
    return;
  }

  chatFeedbackEmpty.style.display = "none";

  for (const item of list) {
    const row = document.createElement("div");
    row.className = "admin__row";

    const when = item.created_at ? new Date(item.created_at).toLocaleString() : "-";
    const ratingLabel = item.rating === "up" ? "Utile" : "À améliorer";
    const sourceLabel = item.source === "ai" ? "IA" : "Fallback";

    const title = document.createElement("div");
    title.className = "admin__row-title";
    title.textContent = `${ratingLabel} · ${sourceLabel} · ${when}`;

    const info = document.createElement("div");
    info.className = "admin__row-info";
    info.textContent = item.user_message ? `Question: ${item.user_message}` : "Question: (non fournie)";

    const meta = document.createElement("div");
    meta.className = "admin__row-meta";
    const page = [item.page_title || "", item.page_path || ""].filter(Boolean).join(" · ");
    meta.textContent = page || "Page: inconnue";

    const answer = document.createElement("div");
    answer.className = "admin__row-meta";
    answer.textContent = `Réponse: ${item.assistant_message || ""}`.slice(0, 700);

    row.appendChild(title);
    row.appendChild(info);
    row.appendChild(meta);
    row.appendChild(answer);
    chatFeedbackList.appendChild(row);
  }
}

function normalizeQuestionKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function renderChatFeedbackSummary(list) {
  if (chatFeedbackSummary) chatFeedbackSummary.innerHTML = "";
  if (chatFeedbackTop) chatFeedbackTop.textContent = "";
  if (!chatFeedbackSummary) return;

  const up = list.filter((item) => item.rating === "up").length;
  const down = list.filter((item) => item.rating === "down").length;
  const total = list.length;
  const aiCount = list.filter((item) => item.source === "ai").length;
  const fallbackCount = total - aiCount;
  const usefulRatio = total ? Math.round((up / total) * 100) : 0;

  const stats = [
    ["Total", total],
    ["Utile", up],
    ["A ameliorer", down],
    ["Ratio utile", `${usefulRatio}%`],
    ["IA", aiCount],
    ["Fallback", fallbackCount]
  ];

  for (const [label, value] of stats) {
    const item = document.createElement("div");
    item.className = "dashboard__item";
    const itemLabel = document.createElement("span");
    itemLabel.className = "dashboard__label";
    itemLabel.textContent = label;
    const itemValue = document.createElement("strong");
    itemValue.textContent = String(value);
    item.appendChild(itemLabel);
    item.appendChild(itemValue);
    chatFeedbackSummary.appendChild(item);
  }

  if (!chatFeedbackTop) return;
  if (!list.length) {
    chatFeedbackTop.textContent = "Aucune question a analyser.";
    return;
  }

  const counts = new Map();
  for (const item of list) {
    const key = normalizeQuestionKey(item.user_message);
    if (!key) continue;
    const existing = counts.get(key) || {
      label: String(item.user_message || "").trim(),
      total: 0,
      down: 0
    };
    existing.total += 1;
    if (item.rating === "down") existing.down += 1;
    counts.set(key, existing);
  }

  const topItems = Array.from(counts.values())
    .sort((a, b) => {
      if (b.down !== a.down) return b.down - a.down;
      return b.total - a.total;
    })
    .slice(0, 3);

  if (!topItems.length) {
    chatFeedbackTop.textContent = "Pas assez de questions renseignées pour calculer un top.";
    return;
  }

  chatFeedbackTop.textContent = topItems
    .map((item) => `${item.label.slice(0, 90)} (${item.down} negatif(s) / ${item.total})`)
    .join(" | ");
}

function exportChatFeedbackCsv() {
  const items = lastChatFeedbackItems.slice();
  if (!items.length) {
    setMessage("Feedback chatbot: aucun resultat a exporter.", true);
    return;
  }

  const esc = (value) => {
    const s = String(value ?? "");
    return `"${s.replaceAll('"', '""')}"`;
  };

  const rows = [
    ["created_at", "rating", "source", "model", "page_title", "page_path", "user_message", "assistant_message"],
    ...items.map((item) => [
      item.created_at || "",
      item.rating || "",
      item.source || "",
      item.meta?.model || "",
      item.page_title || "",
      item.page_path || "",
      item.user_message || "",
      item.assistant_message || ""
    ])
  ];

  const csv = rows.map((row) => row.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dico-archi-chat-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setMessage(`Feedback chatbot: export CSV termine (${items.length} ligne(s)).`);
}

async function fetchChatFeedback() {
  if (!isSuperAdmin || !chatFeedbackPanel || !chatFeedbackList || !chatFeedbackRefresh) return;
  if (isLoadingChatFeedback) return;
  isLoadingChatFeedback = true;
  setButtonBusy(chatFeedbackRefresh, true, "Chargement...", "Rafraîchir");

  try {
    const rating = chatFeedbackRating ? chatFeedbackRating.value : "all";
    const source = chatFeedbackSource ? chatFeedbackSource.value : "all";
    const params = new URLSearchParams({ rating, source, limit: "120" });

    const response = await fetch(`/api/chat-feedback-list?${params.toString()}`);
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorText = payload?.error || "lecture feedback impossible";
      setMessage(`Feedback chatbot: ${errorText}`, true);
      lastChatFeedbackItems = [];
      renderChatFeedbackSummary([]);
      renderChatFeedback([]);
      return;
    }

    lastChatFeedbackItems = Array.isArray(payload.items) ? payload.items : [];
    renderChatFeedbackSummary(lastChatFeedbackItems);
    renderChatFeedback(lastChatFeedbackItems);
  } catch (error) {
    setMessage(`Feedback chatbot: ${getErrorMessage(error)}`, true);
    lastChatFeedbackItems = [];
    renderChatFeedbackSummary([]);
    renderChatFeedback([]);
  } finally {
    isLoadingChatFeedback = false;
    setButtonBusy(chatFeedbackRefresh, false, "Chargement...", "Rafraîchir");
  }
}

function loadTerm(item) {
  editingId = item.id;
  editingSubmission = null;
  termInput.value = item.term || "";
  categoryInput.value = item.category || "";
  if (statusInput) statusInput.value = item.status || "published";
  definitionInput.value = item.definition || "";
  exampleInput.value = item.example || "";
  relatedInput.value = (item.related || []).join(" | ");
  imageUrlInput.value = formatMediaUrlsForInput(item.image_url || "");
  reviewerCommentInput.value = "";
  if (submissionBanner) submissionBanner.textContent = "";
  termInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function loadSubmission(item, row) {
  editingSubmission = item;
  editingId = null;
  termInput.value = item.term || "";
  categoryInput.value = item.category || "";
  if (statusInput) statusInput.value = "review";
  definitionInput.value = item.definition || "";
  exampleInput.value = item.example || "";
  relatedInput.value = (item.related || []).join(" | ");
  imageUrlInput.value = formatMediaUrlsForInput(item.image_url || "");
  reviewerCommentInput.value = item.reviewer_comment || "";
  if (submissionBanner) submissionBanner.textContent = `Proposition chargee: ${item.term}`;
  if (row) row.classList.add("highlight");
  termInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function logAction(action, entity, entityId, details = {}) {
  if (!supabaseClient || !currentUser) return;
  await supabaseClient.from("audit_logs").insert({
    actor_id: currentUser.id,
    actor_email: currentUser.email,
    action,
    entity,
    entity_id: entityId,
    details
  });
}

async function removeTerm(item, actionButton) {
  if (!canManageTerms) return;
  if (isDeletingTerm) return;
  const confirmed = confirm(`Supprimer le terme "${item.term}" ?`);
  if (!confirmed) return;
  isDeletingTerm = true;
  setButtonBusy(actionButton, true, "Suppression...", "Supprimer");

  try {
    const { error } = await supabaseClient.from("terms").delete().eq("id", item.id);
    if (error) {
      if (await handleAuthError(error, "Termes")) return;
      setMessage(`Termes: ${getErrorMessage(error)}`, true);
      return;
    }

    await logAction("term_deleted", "terms", item.id, { term: item.term });
    setMessage("Termes: terme supprime.");
    await fetchTerms();
    await fetchAudit();
  } finally {
    isDeletingTerm = false;
    setButtonBusy(actionButton, false, "Suppression...", "Supprimer");
  }
}

async function uploadAsset(file) {
  if (!file) return "";
  const maxSizeBytes = 10 * 1024 * 1024;
  const mime = String(file.type || "").toLowerCase();
  const ext = String(file.name || "").toLowerCase().split(".").pop() || "";
  const allowedImageExt = ["png", "jpg", "jpeg", "webp", "gif", "svg"];
  const isPdf = mime === "application/pdf" || ext === "pdf";
  const isImage = mime.startsWith("image/") || allowedImageExt.includes(ext);

  if (!isPdf && !isImage) {
    throw new Error("Format non supporte. Utilise une image (png/jpg/webp/gif/svg) ou un PDF.");
  }
  if (file.size > maxSizeBytes) {
    throw new Error("Fichier trop lourd (max 10 MB).");
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${Date.now()}-${Math.random().toString(16).slice(2)}.${fileExt}`;

  setUploadStatus("Upload en cours...");
  const { error } = await supabaseClient.storage.from("term-images").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) {
    setUploadStatus("Erreur upload.");
    throw error;
  }

  const { data } = supabaseClient.storage.from("term-images").getPublicUrl(filePath);
  setUploadStatus("Upload termine.");
  return data.publicUrl;
}

async function saveTerm() {
  if (!canManageTerms) return;
  if (isSavingTerm) return;
  isSavingTerm = true;
  setButtonBusy(saveButton, true, "Enregistrement...", "Enregistrer");

  try {
    const term = termInput.value.trim();
    const category = categoryInput.value.trim();
    const definition = definitionInput.value.trim();
    const example = exampleInput.value.trim();
    const related = normalizeRelated(relatedInput.value || "");
    const typedMedia = parseMediaUrls(imageUrlInput.value);
    if (typedMedia.some((url) => !isSupportedMediaUrl(url))) {
      setMessage("Termes: URL media invalide (http/https + extension image ou .pdf).", true);
      return;
    }

    if (!term || !category || !definition) {
      setMessage("Termes: terme, categorie et definition sont requis.", true);
      return;
    }

    let mediaUrls = dedupeMediaUrls(typedMedia);
    if (imageFileInput.files && imageFileInput.files.length) {
      try {
        setUploadStatus(`Upload ${imageFileInput.files.length} fichier(s)...`);
        for (const file of Array.from(imageFileInput.files)) {
          const uploadedUrl = await uploadAsset(file);
          mediaUrls.push(uploadedUrl);
        }
        mediaUrls = dedupeMediaUrls(mediaUrls);
        imageUrlInput.value = mediaUrls.join("\n");
      } catch (error) {
        setMessage(`Termes: ${getErrorMessage(error)}`, true);
        return;
      }
    }

    const payload = {
      term,
      category,
      status: (statusInput && statusInput.value) ? statusInput.value : "published",
      definition,
      example,
      related,
      image_url: serializeMediaUrls(mediaUrls),
      updated_by: currentUser ? currentUser.id : null
    };

    const effectivePayload = supportsTermStatus
      ? payload
      : {
          term: payload.term,
          category: payload.category,
          definition: payload.definition,
          example: payload.example,
          related: payload.related,
          image_url: payload.image_url
        };

    const query = editingId
      ? supabaseClient.from("terms").update(effectivePayload).eq("id", editingId)
      : supabaseClient.from("terms").insert(effectivePayload).select("id").single();

    let { data, error } = await query;
    if (error && supportsTermStatus && error.message && error.message.includes("status")) {
      supportsTermStatus = false;
      const fallbackQuery = editingId
        ? supabaseClient.from("terms").update({
            term: payload.term,
            category: payload.category,
            definition: payload.definition,
            example: payload.example,
            related: payload.related,
            image_url: payload.image_url
          }).eq("id", editingId)
        : supabaseClient.from("terms").insert({
            term: payload.term,
            category: payload.category,
            definition: payload.definition,
            example: payload.example,
            related: payload.related,
            image_url: payload.image_url
          }).select("id").single();
      ({ data, error } = await fallbackQuery);
    }
    if (error) {
      if (await handleAuthError(error, "Termes")) return;
      setMessage(`Termes: ${getErrorMessage(error)}`, true);
      return;
    }

    const action = editingId ? "term_updated" : "term_created";
    const entityId = editingId || data?.id;
    await logAction(action, "terms", entityId, { term });

    setMessage(editingId ? "Termes: terme mis a jour." : "Termes: terme ajoute.");
    clearForm();
    await fetchTerms();
    await fetchAudit();
  } finally {
    isSavingTerm = false;
    setButtonBusy(saveButton, false, "Enregistrement...", "Enregistrer");
  }
}

async function fetchTerms() {
  const { data, error } = await supabaseClient
    .from("terms")
    .select("id, term, category, status, definition, example, related, image_url, updated_at")
    .order("term", { ascending: true });

  if (error) {
    if (await handleAuthError(error, "Termes")) return;
    if (error.message && error.message.includes("status")) {
      supportsTermStatus = false;
      const fallback = await supabaseClient
        .from("terms")
        .select("id, term, category, definition, example, related, image_url, updated_at")
        .order("term", { ascending: true });
      if (fallback.error) {
        if (await handleAuthError(fallback.error, "Termes")) return;
        setMessage(fallback.error.message, true);
        return;
      }
      terms = fallback.data || [];
      applyTermsView();
      return;
    }
    setMessage(error.message, true);
    return;
  }

  terms = data || [];
  applyTermsView();
}

async function fetchSubmissions() {
  const { data, error } = await supabaseClient
    .from("term_submissions")
    .select(
      "id, term, category, definition, example, related, image_url, submitted_by, submitter_email, status, reviewer_comment, created_at"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    if (await handleAuthError(error, "Propositions")) return;
    setMessage(`Propositions: ${getErrorMessage(error)}`, true);
    return;
  }

  renderSubmissions(data || []);
}

async function fetchAudit() {
  const { data, error } = await supabaseClient
    .from("audit_logs")
    .select("id, action, entity, actor_email, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (await handleAuthError(error, "Historique")) return;
    setMessage(error.message, true);
    return;
  }

  renderAudit(data || []);
}

function findTermByName(name) {
  const key = (name || "").trim().toLowerCase();
  if (!key) return null;
  return terms.find((item) => (item.term || "").trim().toLowerCase() === key) || null;
}

async function approveSubmission(item, actionButton) {
  if (isProcessingSubmission) return;
  isProcessingSubmission = true;
  setSubmissionActionsDisabled(true);
  setButtonBusy(actionButton, true, "Traitement...", "Accepter");

  try {
    const source = editingSubmission && editingSubmission.id === item.id ? editingSubmission : item;
    const typedMedia = parseMediaUrls(imageUrlInput.value);
    const sourceMedia = parseMediaUrls(source.image_url);
    const mediaUrls = dedupeMediaUrls(typedMedia.length ? typedMedia : sourceMedia);
    const payload = {
      term: termInput.value.trim() || source.term,
      category: categoryInput.value.trim() || source.category,
      definition: definitionInput.value.trim() || source.definition,
      example: exampleInput.value.trim() || source.example,
      related: normalizeRelated(relatedInput.value || source.related?.join(" | ") || ""),
      image_url: serializeMediaUrls(mediaUrls)
    };
    if (parseMediaUrls(payload.image_url).some((url) => !isSupportedMediaUrl(url))) {
      setMessage("Propositions: URL media invalide (http/https + extension image ou .pdf).", true);
      return;
    }

    const reviewerComment = reviewerCommentInput.value.trim() || null;

    const atomic = await supabaseClient.rpc("accept_submission_atomic", {
      target_submission_id: item.id,
      next_term: payload.term,
      next_category: payload.category,
      next_definition: payload.definition,
      next_example: payload.example || null,
      next_related: payload.related,
      next_image_url: payload.image_url || null,
      next_reviewer_comment: reviewerComment
    });
    if (atomic.error && !isMissingRpc(atomic.error, "accept_submission_atomic")) {
      if (await handleAuthError(atomic.error, "Propositions")) return;
      setMessage(`Propositions: ${getErrorMessage(atomic.error)}`, true);
      return;
    }

    if (atomic.error && isMissingRpc(atomic.error, "accept_submission_atomic")) {
      if (findTermByName(payload.term)) {
        setMessage(`Propositions: le terme "${payload.term}" existe deja. Utilise "Modifier".`, true);
        return;
      }

      const { data: existingRows, error: existingError } = await supabaseClient
        .from("terms")
        .select("id, term")
        .ilike("term", payload.term)
        .limit(1);
      if (existingError) {
        if (await handleAuthError(existingError, "Propositions")) return;
        setMessage(`Propositions: ${getErrorMessage(existingError)}`, true);
        return;
      }
      if (existingRows && existingRows.length) {
        setMessage(`Propositions: le terme "${payload.term}" existe deja.`, true);
        return;
      }

      const { error: insertError } = await supabaseClient.from("terms").insert(payload).select("id").single();
      if (insertError) {
        if (await handleAuthError(insertError, "Propositions")) return;
        setMessage(`Propositions: ${getErrorMessage(insertError)}`, true);
        return;
      }

      const { error: updateError } = await supabaseClient
        .from("term_submissions")
        .update({
          term: payload.term,
          category: payload.category,
          definition: payload.definition,
          example: payload.example,
          related: payload.related,
          image_url: payload.image_url,
          status: "accepted",
          reviewer_comment: reviewerComment,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", item.id);

      if (updateError) {
        if (await handleAuthError(updateError, "Propositions")) return;
        setMessage(`Propositions: ${getErrorMessage(updateError)}`, true);
        return;
      }
    }

    await logAction("submission_accepted", "term_submissions", item.id, { term: payload.term });
    setMessage("Propositions: proposition acceptee.");
    clearForm();
    await fetchTerms();
    await fetchSubmissions();
    await fetchAudit();
  } finally {
    isProcessingSubmission = false;
    setSubmissionActionsDisabled(false);
    setButtonBusy(actionButton, false, "Traitement...", "Accepter");
  }
}

async function rejectSubmission(item, actionButton) {
  if (isProcessingSubmission) return;
  const confirmed = confirm(`Refuser la proposition "${item.term}" ?`);
  if (!confirmed) return;
  isProcessingSubmission = true;
  setSubmissionActionsDisabled(true);
  setButtonBusy(actionButton, true, "Traitement...", "Refuser");

  try {
    const { error } = await supabaseClient
      .from("term_submissions")
      .update({
        status: "rejected",
        reviewer_comment: reviewerCommentInput.value.trim() || null,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", item.id);

    if (error) {
      if (await handleAuthError(error, "Propositions")) return;
      setMessage(`Propositions: ${getErrorMessage(error)}`, true);
      return;
    }

    await logAction("submission_rejected", "term_submissions", item.id, { term: item.term });

    setMessage("Propositions: proposition refusee.");
    clearForm();
    await fetchSubmissions();
    await fetchAudit();
  } finally {
    isProcessingSubmission = false;
    setSubmissionActionsDisabled(false);
    setButtonBusy(actionButton, false, "Traitement...", "Refuser");
  }
}

function renderProfiles(list) {
  if (!usersPanel || !usersTable || !usersEmpty) return;
  usersTable.innerHTML = "";

  if (!list.length) {
    usersEmpty.style.display = "block";
    return;
  }
  usersEmpty.style.display = "none";

  for (const item of list) {
    const row = document.createElement("div");
    row.className = "admin__row";

    const title = document.createElement("div");
    title.className = "admin__row-title";
    title.textContent = item.email || item.id;

    const info = document.createElement("div");
    info.className = "admin__row-info";
    const roleLabel = ROLE_LABELS[item.role] || item.role || "Apprenti";
    info.textContent = `${roleLabel} · ${item.active === false ? "Inactif" : "Actif"}`;

    const actions = document.createElement("div");
    actions.className = "admin__row-actions";

    const roleSelect = document.createElement("select");
    ["super_admin", "maitre_apprentissage", "apprenti"].forEach((role) => {
      const option = document.createElement("option");
      option.value = role;
      option.textContent = ROLE_LABELS[role];
      if ((item.role || "apprenti") === role) option.selected = true;
      roleSelect.appendChild(option);
    });

    const activeSelect = document.createElement("select");
    const optActive = document.createElement("option");
    optActive.value = "true";
    optActive.textContent = "Actif";
    if (item.active !== false) optActive.selected = true;
    const optInactive = document.createElement("option");
    optInactive.value = "false";
    optInactive.textContent = "Inactif";
    if (item.active === false) optInactive.selected = true;
    activeSelect.appendChild(optActive);
    activeSelect.appendChild(optInactive);

    const updateButton = document.createElement("button");
    updateButton.type = "button";
    updateButton.className = "ghost";
    updateButton.textContent = "Appliquer";
    updateButton.addEventListener("click", () =>
      updateProfile(item.id, roleSelect.value, activeSelect.value === "true", {
        roleSelect,
        activeSelect,
        updateButton
      })
    );

    if (item.id === currentUser.id) {
      roleSelect.disabled = true;
      activeSelect.disabled = true;
      updateButton.disabled = true;
      updateButton.title = "Ton propre role se modifie depuis un autre super admin.";
    }

    actions.appendChild(roleSelect);
    actions.appendChild(activeSelect);
    actions.appendChild(updateButton);

    row.appendChild(title);
    row.appendChild(info);
    row.appendChild(actions);
    usersTable.appendChild(row);
  }
}

async function fetchProfiles() {
  if (!isSuperAdmin || !usersPanel) return;
  let rows = null;
  let finalError = null;

  const direct = await supabaseClient
    .from("profiles")
    .select("id, email, role, active, is_editor, created_at")
    .order("created_at", { ascending: true });

  const directRows = direct.data || [];
  const directLooksIncomplete = directRows.length === 0 || directRows.some((row) => !row.role && row.is_editor == null);
  if (!direct.error && !directLooksIncomplete) {
    rows = directRows;
  } else {
    const rpc = await supabaseClient.rpc("admin_list_profiles");
    if (rpc.error) {
      finalError = direct.error || rpc.error;
      if (!direct.error && directLooksIncomplete) {
        finalError = new Error("lecture profiles vide/incomplete");
      }
    } else {
      rows = rpc.data || [];
    }
  }

  if (finalError) {
    if (await handleAuthError(finalError, "Gestion des roles")) return;
    setMessage(`Gestion des roles: ${getErrorMessage(finalError)}`, true);
    return;
  }

  profiles = (rows || []).map((item) => normalizeProfile(item) ? { ...item, ...normalizeProfile(item) } : item);
  if (!profiles.length) {
    setMessage("Gestion des roles: aucun profil visible.", true);
    renderProfiles([]);
    return;
  }
  renderProfiles(profiles);
}

async function updateProfile(profileId, role, active, controls) {
  if (!isSuperAdmin) return;
  if (updatingProfileId) return;
  updatingProfileId = profileId;
  if (controls?.roleSelect) controls.roleSelect.disabled = true;
  if (controls?.activeSelect) controls.activeSelect.disabled = true;
  setButtonBusy(controls?.updateButton, true, "Maj...", "Appliquer");

  const payload = { role, active };
  try {
    const direct = await supabaseClient
      .from("profiles")
      .update(payload)
      .eq("id", profileId)
      .select("id");
    const directUpdated = Array.isArray(direct.data) ? direct.data.length : 0;

    if (direct.error || directUpdated === 0) {
      const rpc = await supabaseClient.rpc("admin_update_profile", {
        target_profile_id: profileId,
        next_role: role,
        next_active: active
      });
      if (rpc.error) {
        if (await handleAuthError(rpc.error, "Gestion des roles")) return;
        setMessage(`Gestion des roles: ${getErrorMessage(rpc.error)}`, true);
        return;
      }
    }
    setMessage("Gestion des roles: profil utilisateur mis a jour.");
    await fetchProfiles();
  } finally {
    updatingProfileId = null;
    if (controls?.roleSelect) controls.roleSelect.disabled = false;
    if (controls?.activeSelect) controls.activeSelect.disabled = false;
    setButtonBusy(controls?.updateButton, false, "Maj...", "Appliquer");
  }
}

function filterTerms() {
  applyTermsView();
}

function scheduleAdminFilter() {
  if (adminFilterRafId) cancelAnimationFrame(adminFilterRafId);
  adminFilterRafId = requestAnimationFrame(() => {
    adminFilterRafId = 0;
    filterTerms();
  });
}

async function loadUser() {
  if (!hasSupabaseConfig()) {
    setMessage("Configuration Supabase manquante.", true);
    return;
  }

  supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  });
  const { data } = await supabaseClient.auth.getUser();
  currentUser = data?.user || null;

  if (!currentUser) {
    window.location.href = "auth.html";
    return;
  }

  adminUser.textContent = `Utilisateur: ${currentUser.email}`;

  let profile = null;
  const withRoles = await supabaseClient
    .from("profiles")
    .select("role, active, is_editor")
    .eq("id", currentUser.id)
    .single();
  if (!withRoles.error) {
    profile = withRoles.data;
  } else {
    const fallback = await supabaseClient
      .from("profiles")
      .select("is_editor")
      .eq("id", currentUser.id)
      .single();
    if (fallback.error) {
      if (await handleAuthError(fallback.error, "Session")) return;
      setMessage(fallback.error.message, true);
      return;
    }
    profile = fallback.data;
  }

  userProfile = normalizeProfile(profile);
  canManageTerms = canManageFromProfile(userProfile);
  isSuperAdmin = isSuperAdminProfile(userProfile);
  const roleLabel = ROLE_LABELS[userProfile?.role] || "Lecture seule";
  const activeLabel = userProfile?.active === false ? " (inactif)" : "";
  adminRole.textContent = `Role: ${roleLabel}${activeLabel}`;

  if (!canManageTerms) {
    window.location.href = "index.html";
    return;
  }

  if (usersPanel) usersPanel.hidden = !isSuperAdmin;
  if (chatFeedbackPanel) chatFeedbackPanel.hidden = !isSuperAdmin;

  await fetchTerms();
  await fetchSubmissions();
  await fetchAudit();
  if (isSuperAdmin) {
    await fetchProfiles();
    await fetchChatFeedback();
  }
}

async function logout() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}

saveButton.addEventListener("click", saveTerm);
resetButton.addEventListener("click", clearForm);
adminSearch.addEventListener("input", scheduleAdminFilter);
if (adminSort) adminSort.addEventListener("change", filterTerms);
adminLogout.addEventListener("click", logout);
if (exportPublishedButton) exportPublishedButton.addEventListener("click", exportPublishedCsv);
if (chatFeedbackRefresh) chatFeedbackRefresh.addEventListener("click", fetchChatFeedback);
if (chatFeedbackRating) chatFeedbackRating.addEventListener("change", fetchChatFeedback);
if (chatFeedbackSource) chatFeedbackSource.addEventListener("change", fetchChatFeedback);
if (chatFeedbackExport) chatFeedbackExport.addEventListener("click", exportChatFeedbackCsv);
for (const btn of workflowButtons) {
  btn.addEventListener("click", () => {
    currentStatusFilter = btn.dataset.termFilter || "all";
    applyTermsView();
  });
}

loadUser();
