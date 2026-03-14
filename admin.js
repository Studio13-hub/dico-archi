const adminMessage = document.getElementById("admin-message");
const adminUser = document.getElementById("admin-user");
const adminRole = document.getElementById("admin-role");
const adminLogout = document.getElementById("admin-logout");

const termInput = document.getElementById("term");
const categoryInput = document.getElementById("category");
const categoryOptions = document.getElementById("category-options");
const statusInput = document.getElementById("term-status");
const definitionInput = document.getElementById("definition");
const exampleInput = document.getElementById("example");
const relatedInput = document.getElementById("related");
const imageUrlInput = document.getElementById("image-url");
const imageFileInput = document.getElementById("image-file");
const reviewerCommentInput = document.getElementById("reviewer-comment");
const submissionBanner = document.getElementById("submission-banner");
const mediaReviewTitle = document.getElementById("media-review-title");
const mediaReviewCopy = document.getElementById("media-review-copy");
const mediaReviewPreview = document.getElementById("media-review-preview");
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
const metricsSummary = document.getElementById("metrics-summary");
const metricsTopPages = document.getElementById("metrics-top-pages");
const metricsTopGames = document.getElementById("metrics-top-games");
const metricsRecent = document.getElementById("metrics-recent");
const metricsRefresh = document.getElementById("metrics-refresh");
const supabaseHelpers = window.DicoArchiSupabase;
const dicoApi = window.DicoArchiApi;

let supabaseClient = null;
let currentUser = null;
let userProfile = null;
let canManageTerms = false;
let isSuperAdmin = false;
let terms = [];
let categories = [];
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
let isLoadingMetrics = false;

const ROLE_LABELS = {
  super_admin: "Administration",
  formateur: "Relecture",
  apprenti: "Contributeur"
};

const GAME_LABELS = {
  quiz: "Quiz",
  rush: "Rush",
  swipe: "Swipe",
  daily: "Défi du jour",
  duel_beta: "Duel Beta"
};

const adminSections = Array.from(document.querySelectorAll("[data-admin-section]"));
const adminSectionButtons = Array.from(document.querySelectorAll("[data-admin-section-target]"));
let currentAdminSection = "overview";

function normalizeProfile(profile) {
  return supabaseHelpers?.normalizeProfile(profile) || null;
}

function canManageFromProfile(profile) {
  return supabaseHelpers?.isStaffProfile(profile) || false;
}

function isSuperAdminProfile(profile) {
  return supabaseHelpers?.isSuperAdminProfile(profile) || false;
}

function setMessage(text, isError = false) {
  adminMessage.textContent = text;
  adminMessage.style.color = isError ? "#d94e2b" : "#1f7a70";
}

function getErrorMessage(error, fallback = "Opération impossible.") {
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
  setMessage(`${prefix}session expirée. Reconnecte-toi.`, true);
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

function setAdminSection(section) {
  currentAdminSection = section || "overview";
  for (const panel of adminSections) {
    const visible = panel.dataset.adminSection === currentAdminSection;
    panel.hidden = !visible;
  }
  for (const button of adminSectionButtons) {
    button.classList.toggle("chip--active", button.dataset.adminSectionTarget === currentAdminSection);
  }
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

function setUploadStatus(text) {
  uploadStatus.textContent = text;
}

function getGameLabel(gameKey) {
  return GAME_LABELS[gameKey] || gameKey || "Jeu";
}

function formatPathLabel(value) {
  if (!value) return "/";
  const label = String(value).replace(/^\/+/, "") || "/";
  return label;
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
  renderMediaReviewPreview([]);
  setUploadStatus("");
}

function renderMediaReviewPreview(rawUrls) {
  if (!mediaReviewTitle || !mediaReviewCopy || !mediaReviewPreview) return;

  const mediaUrls = parseMediaUrls(rawUrls);
  mediaReviewPreview.innerHTML = "";

  if (!mediaUrls.length) {
    mediaReviewTitle.textContent = "Aucun média proposé";
    mediaReviewCopy.textContent =
      "Les liens proposés par les apprentis ou l’équipe apparaissent ici avant publication.";
    return;
  }

  mediaReviewTitle.textContent = `${mediaUrls.length} média${mediaUrls.length > 1 ? "s" : ""} à relire`;
  mediaReviewCopy.textContent =
    "Vérifiez la qualité, la pertinence et le bon format des liens avant d’accepter la proposition.";

  for (const url of mediaUrls) {
    const row = document.createElement("div");
    row.className = "admin__media-card";

    const title = document.createElement("div");
    title.className = "admin__row-title";
    title.textContent = getMediaTitle(url) || "Média proposé";

    const info = document.createElement("div");
    info.className = "admin__row-info";
    info.textContent = inferMediaType(url) === "pdf" ? "Document PDF" : "Image ou schéma";

    const preview = document.createElement("div");
    preview.className = "admin__media-preview";

    if (inferMediaType(url) === "pdf") {
      const pdfCard = document.createElement("div");
      pdfCard.className = "admin__media-preview admin__media-preview--pdf";
      pdfCard.textContent = "PDF";
      preview.appendChild(pdfCard);
    } else {
      const image = document.createElement("img");
      image.src = url;
      image.alt = getMediaTitle(url) || "Média proposé";
      image.loading = "lazy";
      preview.appendChild(image);
    }

    const meta = document.createElement("div");
    meta.className = "admin__row-meta";
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer noopener";
    link.textContent = "Ouvrir le média";
    meta.appendChild(link);

    row.appendChild(preview);
    row.appendChild(title);
    row.appendChild(info);
    row.appendChild(meta);
    mediaReviewPreview.appendChild(row);
  }
}

function normalizeRelated(raw) {
  return raw
    .split("|")
    .map((value) => value.trim())
    .filter(Boolean);
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function getCategoryName(item) {
  return item.category || item.categories?.name || "";
}

function normalizeWorkflowStatus(value) {
  if (!value) return "draft";
  if (value === "review") return "validated";
  return value;
}

function getWorkflowLabel(value) {
  const status = normalizeWorkflowStatus(value);
  if (status === "validated") return "À relire";
  if (status === "published") return "Publié";
  if (status === "submitted") return "Envoyée";
  if (status === "accepted") return "Acceptée";
  if (status === "rejected") return "Refusée";
  if (status === "draft") return "Brouillon";
  return status;
}

function inferMediaType(url) {
  if (isPdfUrl(url)) return "pdf";
  const lowered = String(url || "").toLowerCase();
  if (lowered.includes("schema")) return "schema";
  return "image";
}

function getMediaTitle(url) {
  const raw = String(url || "").trim();
  if (!raw) return null;
  const filename = raw.split("/").pop() || raw;
  return filename.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim() || null;
}

function formatShortDate(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getEditingTerm() {
  if (!editingId) return null;
  return terms.find((item) => item.id === editingId) || null;
}

function findCategoryByInput(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;
  const key = value.toLowerCase();
  return categories.find((item) => item.id === value || item.slug === key || item.name.toLowerCase() === key) || null;
}

function findTermByRelationInput(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;
  const key = value.toLowerCase();
  return terms.find((item) => {
    if ((item.term || "").trim().toLowerCase() === key) return true;
    if ((item.slug || "").trim().toLowerCase() === key) return true;
    return false;
  }) || null;
}

function populateCategoryOptions() {
  if (!categoryOptions) return;
  categoryOptions.innerHTML = "";
  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category.name;
    option.label = category.slug;
    categoryOptions.appendChild(option);
  }
}

function getTermStatus(item) {
  return normalizeWorkflowStatus(item.status || "published");
}

function parseDateOrZero(value) {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

function compareTerms(a, b, mode) {
  const termA = (a.term || "").toLowerCase();
  const termB = (b.term || "").toLowerCase();
  const categoryA = getCategoryName(a).toLowerCase();
  const categoryB = getCategoryName(b).toLowerCase();
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
      [item.term, getCategoryName(item), item.definition, item.example, ...(item.related || [])]
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
    ["term", "slug", "category", "status", "definition", "example", "related", "media_urls", "updated_at"],
    ...published.map((item) => [
      item.term,
      item.slug || "",
      getCategoryName(item),
      getTermStatus(item),
      item.definition,
      item.example,
      (item.related || []).join(" | "),
      (item.media_urls || []).join(" | "),
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
  setMessage(`Export CSV terminé (${published.length} termes publiés).`);
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
    const status = getTermStatus(item);
    info.textContent = `${getCategoryName(item)} · ${getWorkflowLabel(status)} · ${item.definition}`;

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
    const mediaCount = Array.isArray(item.media_urls) ? item.media_urls.length : 0;
    if (mediaCount) {
      row.classList.add("admin__row--has-media");
    }

    const title = document.createElement("div");
    title.className = "admin__row-title";
    title.textContent = item.term;

    const info = document.createElement("div");
    info.className = "admin__row-info";
    info.textContent = `${getCategoryName(item)} · ${item.definition}`;

    const meta = document.createElement("div");
    meta.className = "admin__row-meta";
    const mediaLabel = mediaCount ? ` · ${mediaCount} média proposé${mediaCount > 1 ? "s" : ""}` : "";
    const when = formatShortDate(item.created_at);
    meta.textContent = `Par : ${item.submitter_email || "anonyme"}${mediaLabel}${when ? ` · ${when}` : ""}`;

    const status = document.createElement("div");
    status.className = `admin__row-status ${item.status || "pending"}`;
    status.textContent = getWorkflowLabel(item.status || "submitted");

    if (mediaCount) {
      const mediaStrip = document.createElement("div");
      mediaStrip.className = "admin__media-strip";

      for (const url of item.media_urls.slice(0, 3)) {
        const mediaLink = document.createElement("a");
        mediaLink.className = "admin__media-chip";
        mediaLink.href = url;
        mediaLink.target = "_blank";
        mediaLink.rel = "noreferrer noopener";
        mediaLink.textContent = inferMediaType(url) === "pdf" ? "PDF" : (getMediaTitle(url) || "Image");
        mediaStrip.appendChild(mediaLink);
      }

      row.appendChild(mediaStrip);
    }

    if (mediaCount) {
      const mediaBadge = document.createElement("div");
      mediaBadge.className = "admin__row-status admin__row-status--media";
      mediaBadge.textContent = mediaCount > 1 ? `${mediaCount} médias` : "Média";
      row.appendChild(mediaBadge);
    }

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
    title.textContent = `${item.action_type}`;

    const info = document.createElement("div");
    info.className = "admin__row-info";
    info.textContent = `${item.target_table || "-"}`;

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
    ["À améliorer", down],
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
    chatFeedbackTop.textContent = "Aucune question à analyser.";
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
    .map((item) => `${item.label.slice(0, 90)} (${item.down} négatif(s) / ${item.total})`)
    .join(" | ");
}

function exportChatFeedbackCsv() {
  const items = lastChatFeedbackItems.slice();
  if (!items.length) {
    setMessage("Feedback chatbot : aucun résultat à exporter.", true);
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
  setMessage(`Feedback chatbot : export CSV terminé (${items.length} ligne(s)).`);
}

async function fetchChatFeedback() {
  if (!isSuperAdmin || !chatFeedbackPanel || !chatFeedbackList || !chatFeedbackRefresh) return;
  if (isLoadingChatFeedback) return;
  isLoadingChatFeedback = true;
  setButtonBusy(chatFeedbackRefresh, true, "Chargement...", "Rafraîchir");

  try {
    const sessionResult = await supabaseClient.auth.getSession();
    const accessToken = sessionResult?.data?.session?.access_token || "";
    if (!accessToken) {
      setMessage("Feedback chatbot : session admin introuvable.", true);
      lastChatFeedbackItems = [];
      renderChatFeedbackSummary([]);
      renderChatFeedback([]);
      return;
    }

    const rating = chatFeedbackRating ? chatFeedbackRating.value : "all";
    const source = chatFeedbackSource ? chatFeedbackSource.value : "all";
    const params = new URLSearchParams({ rating, source, limit: "120" });

    const response = await fetch(`/api/chat-feedback-list?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorText = payload?.error || "lecture feedback impossible";
      setMessage(`Feedback chatbot : ${errorText}`, true);
      lastChatFeedbackItems = [];
      renderChatFeedbackSummary([]);
      renderChatFeedback([]);
      return;
    }

    lastChatFeedbackItems = Array.isArray(payload.items) ? payload.items : [];
    renderChatFeedbackSummary(lastChatFeedbackItems);
    renderChatFeedback(lastChatFeedbackItems);
  } catch (error) {
    setMessage(`Feedback chatbot : ${getErrorMessage(error)}`, true);
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
  categoryInput.value = getCategoryName(item);
  if (statusInput) statusInput.value = getTermStatus(item);
  definitionInput.value = item.definition || "";
  exampleInput.value = item.example || "";
  relatedInput.value = (item.related || []).join(" | ");
  imageUrlInput.value = formatMediaUrlsForInput(item.media_urls || []);
  renderMediaReviewPreview(item.media_urls || []);
  reviewerCommentInput.value = item.reviewer_comment || "";
  if (submissionBanner) submissionBanner.textContent = "";
  termInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function loadSubmission(item, row) {
  editingSubmission = item;
  editingId = null;
  termInput.value = item.term || "";
  categoryInput.value = getCategoryName(item);
  if (statusInput) statusInput.value = "validated";
  definitionInput.value = item.definition || "";
  exampleInput.value = item.example || "";
  relatedInput.value = (item.related || []).join(" | ");
  imageUrlInput.value = formatMediaUrlsForInput(item.media_urls || []);
  renderMediaReviewPreview(item.media_urls || []);
  reviewerCommentInput.value = item.reviewer_comment || "";
  if (submissionBanner) {
    const mediaCount = Array.isArray(item.media_urls) ? item.media_urls.length : 0;
    const mediaLabel = mediaCount ? ` · ${mediaCount} média proposé${mediaCount > 1 ? "s" : ""}` : "";
    submissionBanner.textContent = `Proposition chargée : ${item.term}${mediaLabel}`;
  }
  if (row) row.classList.add("highlight");
  termInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function logAction(action, entity, entityId, details = {}) {
  if (!supabaseClient || !currentUser) return;
  await supabaseClient.from("audit_logs").insert({
    actor_id: currentUser.id,
    action_type: action,
    target_table: entity,
    target_id: entityId,
    details
  });
}

async function fetchCategories() {
  if (!dicoApi) return;
  try {
    categories = await dicoApi.fetchCategories();
    populateCategoryOptions();
  } catch (error) {
    setMessage(`Catégories : ${getErrorMessage(error)}`, true);
  }
}

async function syncTermMedia(termId, mediaUrls) {
  const { error: deleteError } = await supabaseClient.from("media").delete().eq("term_id", termId);
  if (deleteError) throw deleteError;

  if (!mediaUrls.length) return;

  const rows = mediaUrls.map((url, index) => ({
    term_id: termId,
    media_type: inferMediaType(url),
    url,
    title: getMediaTitle(url),
    alt_text: null,
    position: index,
    created_by: currentUser ? currentUser.id : null
  }));

  const { error: insertError } = await supabaseClient.from("media").insert(rows);
  if (insertError) throw insertError;
}

async function syncTermRelations(termId, relatedValues) {
  const relatedIds = Array.from(
    new Set(
      relatedValues
        .map((value) => findTermByRelationInput(value)?.id)
        .filter((id) => Boolean(id) && id !== termId)
    )
  );

  const { error: deleteError } = await supabaseClient
    .from("term_relations")
    .delete()
    .eq("source_term_id", termId)
    .eq("relation_type", "related");

  if (deleteError) throw deleteError;
  if (!relatedIds.length) return;

  const rows = relatedIds.map((targetId) => ({
    source_term_id: termId,
    target_term_id: targetId,
    relation_type: "related"
  }));

  const { error: insertError } = await supabaseClient.from("term_relations").insert(rows);
  if (insertError) throw insertError;
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
    setMessage("Termes : terme supprimé.");
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
    throw new Error("Format non supporté. Utilise une image (png/jpg/webp/gif/svg) ou un PDF.");
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
    setUploadStatus("Erreur d’import.");
    throw error;
  }

  const { data } = supabaseClient.storage.from("term-images").getPublicUrl(filePath);
  setUploadStatus("Import terminé.");
  return data.publicUrl;
}

async function saveTerm() {
  if (!canManageTerms) return;
  if (isSavingTerm) return;
  isSavingTerm = true;
  setButtonBusy(saveButton, true, "Enregistrement...", "Enregistrer");

  try {
    const term = termInput.value.trim();
    const category = findCategoryByInput(categoryInput.value);
    const definition = definitionInput.value.trim();
    const example = exampleInput.value.trim();
    const related = normalizeRelated(relatedInput.value || "");
    const typedMedia = parseMediaUrls(imageUrlInput.value);
    if (typedMedia.some((url) => !isSupportedMediaUrl(url))) {
      setMessage("Termes : lien média invalide (http/https + extension image ou .pdf).", true);
      return;
    }

    if (!term || !category || !definition) {
      setMessage("Termes : terme, catégorie et définition sont requis.", true);
      return;
    }

    let mediaUrls = dedupeMediaUrls(typedMedia);
    if (imageFileInput.files && imageFileInput.files.length) {
      try {
        setUploadStatus(`Import de ${imageFileInput.files.length} fichier(s)...`);
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

    const editingTerm = getEditingTerm();
    const nextStatus = (statusInput && statusInput.value) ? normalizeWorkflowStatus(statusInput.value) : "published";
    const payload = {
      term,
      slug: editingTerm?.slug || slugify(term),
      category_id: category.id,
      status: nextStatus,
      definition,
      example,
      reviewer_comment: reviewerCommentInput.value.trim() || null
    };

    const query = editingId
      ? supabaseClient.from("terms").update(payload).eq("id", editingId)
      : supabaseClient.from("terms").insert(payload).select("id").single();

    let { data, error } = await query;
    if (error) {
      if (await handleAuthError(error, "Termes")) return;
      setMessage(`Termes: ${getErrorMessage(error)}`, true);
      return;
    }

    const entityId = editingId || data?.id;
    await syncTermMedia(entityId, mediaUrls);
    await syncTermRelations(entityId, related);

    const action = editingId ? "term_updated" : "term_created";
    await logAction(action, "terms", entityId, { term });

    setMessage(editingId ? "Termes : terme mis à jour." : "Termes : terme ajouté.");
    clearForm();
    await fetchTerms();
    await fetchAudit();
  } finally {
    isSavingTerm = false;
    setButtonBusy(saveButton, false, "Enregistrement...", "Enregistrer");
  }
}

async function fetchTerms() {
  const [termsQuery, mediaQuery, relationsQuery] = await Promise.all([
    supabaseClient
      .from("terms")
      .select(`
        id,
        term,
        slug,
        category_id,
        status,
        definition,
        example,
        reviewer_comment,
        updated_at,
        categories:category_id (
          id,
          name,
          slug
        )
      `)
      .order("term", { ascending: true }),
    supabaseClient
      .from("media")
      .select("id, term_id, media_type, url, title, alt_text, position, created_at")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
    supabaseClient
      .from("term_relations")
      .select("source_term_id, target_term_id, relation_type")
      .eq("relation_type", "related")
  ]);

  if (termsQuery.error || mediaQuery.error || relationsQuery.error) {
    const error = termsQuery.error || mediaQuery.error || relationsQuery.error;
    if (await handleAuthError(error, "Termes")) return;
    setMessage(getErrorMessage(error), true);
    return;
  }

  const baseTerms = Array.isArray(termsQuery.data) ? termsQuery.data : [];
  const mediaRows = Array.isArray(mediaQuery.data) ? mediaQuery.data : [];
  const relationRows = Array.isArray(relationsQuery.data) ? relationsQuery.data : [];

  const mediaByTermId = new Map();
  for (const media of mediaRows) {
    const list = mediaByTermId.get(media.term_id) || [];
    list.push(media);
    mediaByTermId.set(media.term_id, list);
  }

  const termById = new Map(baseTerms.map((item) => [item.id, item]));
  const relatedNamesByTermId = new Map();
  for (const relation of relationRows) {
    const target = termById.get(relation.target_term_id);
    if (!target) continue;
    const list = relatedNamesByTermId.get(relation.source_term_id) || [];
    list.push(target.term);
    relatedNamesByTermId.set(relation.source_term_id, list);
  }

  terms = baseTerms.map((item) => {
    const itemMedia = mediaByTermId.get(item.id) || [];
    return {
      ...item,
      category: item.categories?.name || "",
      related: relatedNamesByTermId.get(item.id) || [],
      media: itemMedia,
      media_urls: itemMedia.map((media) => media.url)
    };
  });
  applyTermsView();
}

async function fetchSubmissions() {
  const { data, error } = await supabaseClient
    .from("term_submissions")
    .select(
      `
      id,
      term,
      slug,
      category_id,
      definition,
      example,
      media_urls,
      status,
      reviewer_comment,
      submitted_by,
      created_at
      `
    )
    .in("status", ["submitted", "validated"])
    .order("created_at", { ascending: false });

  if (error) {
    if (await handleAuthError(error, "Propositions")) return;
    setMessage(`Propositions: ${getErrorMessage(error)}`, true);
    return;
  }
  const items = (data || []).map((item) => ({
    ...item,
    category: categories.find((category) => category.id === item.category_id)?.name || "",
    related: [],
    media_urls: Array.isArray(item.media_urls) ? item.media_urls : [],
    submitter_email: ""
  }));

  renderSubmissions(items);
}

async function fetchAudit() {
  const { data, error } = await supabaseClient
    .from("audit_logs")
    .select("id, action_type, target_table, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (await handleAuthError(error, "Historique")) return;
    setMessage(error.message, true);
    return;
  }

  renderAudit(data || []);
}

function renderAdminMetrics(payload) {
  if (metricsSummary) metricsSummary.innerHTML = "";
  if (metricsTopPages) metricsTopPages.innerHTML = "";
  if (metricsTopGames) metricsTopGames.innerHTML = "";
  if (metricsRecent) metricsRecent.innerHTML = "";

  const summary = payload?.summary || {};
  const topPages = Array.isArray(payload?.topPages) ? payload.topPages : [];
  const topGames = Array.isArray(payload?.topGames) ? payload.topGames : [];
  const recentScores = Array.isArray(payload?.recentScores) ? payload.recentScores : [];

  if (metricsSummary) {
    const cards = [
      ["Vues 24 h", summary.pageViews24h || 0],
      ["Sessions 24 h", summary.uniqueSessions24h || 0],
      ["Vues 30 j", summary.totalViews30d || 0],
      ["Scores jeux 30 j", summary.scoreSubmissions30d || 0],
      ["Jeux suivis", summary.trackedGames30d || 0],
      ["Propositions en attente", summary.pendingSubmissions || 0]
    ];

    for (const [label, value] of cards) {
      const item = document.createElement("div");
      item.className = "dashboard__item";
      item.innerHTML = `<span class="dashboard__label">${label}</span><strong>${value}</strong>`;
      metricsSummary.appendChild(item);
    }
  }

  if (metricsTopPages) {
    if (!topPages.length) {
      const empty = document.createElement("div");
      empty.className = "meta meta--subtle";
      empty.textContent = "Pas encore assez de navigation enregistrée.";
      metricsTopPages.appendChild(empty);
    } else {
      for (const item of topPages) {
        const row = document.createElement("div");
        row.className = "admin__row";
        row.innerHTML = `
          <div class="admin__row-title">${item.pageTitle || formatPathLabel(item.pagePath)}</div>
          <div class="admin__row-meta">${formatPathLabel(item.pagePath)}</div>
          <div class="admin__row-info">${item.views} vues · ${item.uniqueSessions} sessions</div>
        `;
        metricsTopPages.appendChild(row);
      }
    }
  }

  if (metricsTopGames) {
    if (!topGames.length) {
      const empty = document.createElement("div");
      empty.className = "meta meta--subtle";
      empty.textContent = "Aucun score serveur enregistré pour l’instant.";
      metricsTopGames.appendChild(empty);
    } else {
      for (const item of topGames) {
        const row = document.createElement("div");
        row.className = "admin__row";
        row.innerHTML = `
          <div class="admin__row-title">${getGameLabel(item.gameKey)}</div>
          <div class="admin__row-info">${item.plays} parties · meilleur score ${item.bestScore}/${item.bestTotal || 0}</div>
          <div class="admin__row-meta">${item.bestCombo ? `combo ${item.bestCombo}` : ""}${item.bestStreak ? ` · série ${item.bestStreak}` : ""}${item.bestSeconds ? ` · ${item.bestSeconds}s` : ""}</div>
        `;
        metricsTopGames.appendChild(row);
      }
    }
  }

  if (metricsRecent) {
    const title = document.createElement("h3");
    title.textContent = "Derniers scores";
    metricsRecent.appendChild(title);

    if (!recentScores.length) {
      const empty = document.createElement("div");
      empty.className = "meta meta--subtle";
      empty.textContent = "Aucun score récent remonté.";
      metricsRecent.appendChild(empty);
    } else {
      for (const item of recentScores) {
        const row = document.createElement("div");
        row.className = "admin__row";
        const extras = [];
        if (item.modeLabel) extras.push(item.modeLabel);
        if (item.categoryLabel) extras.push(item.categoryLabel);
        if (item.bestCombo) extras.push(`combo ${item.bestCombo}`);
        if (item.bestStreak) extras.push(`série ${item.bestStreak}`);
        if (item.seconds) extras.push(`${item.seconds}s`);
        row.innerHTML = `
          <div class="admin__row-title">${getGameLabel(item.gameKey)}</div>
          <div class="admin__row-info">${item.score}/${item.total || 0}</div>
          <div class="admin__row-meta">${extras.join(" · ") || "Score enregistré"} · ${new Date(item.createdAt).toLocaleString("fr-CH")}</div>
        `;
        metricsRecent.appendChild(row);
      }
    }
  }
}

async function fetchAdminMetrics() {
  if (!isSuperAdmin || !metricsSummary || isLoadingMetrics) return;
  isLoadingMetrics = true;
  if (metricsRefresh) metricsRefresh.disabled = true;

  try {
    let payload = null;
    if (dicoApi?.fetchAdminMetrics) {
      payload = await dicoApi.fetchAdminMetrics();
    }
    renderAdminMetrics(payload || {});
  } catch (error) {
    if (await handleAuthError(error, "Suivi")) return;
    setMessage(`Suivi : ${getErrorMessage(error)}`, true);
  } finally {
    isLoadingMetrics = false;
    if (metricsRefresh) metricsRefresh.disabled = false;
  }
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
    const sourceMedia = parseMediaUrls(source.media_urls || []);
    const mediaUrls = dedupeMediaUrls(typedMedia.length ? typedMedia : sourceMedia);
    const category = findCategoryByInput(categoryInput.value || source.category || source.categories?.name || "");
    const payload = {
      term: termInput.value.trim() || source.term,
      slug: source.slug || slugify(termInput.value.trim() || source.term),
      category_id: category?.id || source.category_id || null,
      definition: definitionInput.value.trim() || source.definition,
      example: exampleInput.value.trim() || source.example,
      status: "published",
      reviewer_comment: reviewerCommentInput.value.trim() || null
    };
    const related = normalizeRelated(relatedInput.value || source.related?.join(" | ") || "");
    if (mediaUrls.some((url) => !isSupportedMediaUrl(url))) {
      setMessage("Propositions : URL média invalide (http/https + extension image ou .pdf).", true);
      return;
    }
    if (!payload.term || !payload.category_id || !payload.definition) {
      setMessage("Propositions: terme, categorie et definition sont requis.", true);
      return;
    }

    const reviewerComment = reviewerCommentInput.value.trim() || null;
    if (findTermByName(payload.term)) {
      setMessage(`Propositions : le terme "${payload.term}" existe déjà. Utilise « Modifier ».`, true);
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
      setMessage(`Propositions : le terme "${payload.term}" existe déjà.`, true);
      return;
    }

    const { data: createdTerm, error: insertError } = await supabaseClient
      .from("terms")
      .insert(payload)
      .select("id")
      .single();
    if (insertError) {
      if (await handleAuthError(insertError, "Propositions")) return;
      setMessage(`Propositions: ${getErrorMessage(insertError)}`, true);
      return;
    }

    await syncTermMedia(createdTerm.id, mediaUrls);
    await syncTermRelations(createdTerm.id, related);

    const { error: updateError } = await supabaseClient
      .from("term_submissions")
      .update({
        status: "accepted",
        reviewer_comment: reviewerComment,
        reviewed_by: currentUser ? currentUser.id : null
      })
      .eq("id", item.id);

    if (updateError) {
      if (await handleAuthError(updateError, "Propositions")) return;
      setMessage(`Propositions: ${getErrorMessage(updateError)}`, true);
      return;
    }

    await logAction("submission_accepted", "term_submissions", item.id, { term: payload.term });
    setMessage("Propositions : proposition acceptée.");
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
        reviewed_by: currentUser ? currentUser.id : null
      })
      .eq("id", item.id);

    if (error) {
      if (await handleAuthError(error, "Propositions")) return;
      setMessage(`Propositions: ${getErrorMessage(error)}`, true);
      return;
    }

    await logAction("submission_rejected", "term_submissions", item.id, { term: item.term });

    setMessage("Propositions : proposition refusée.");
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
    const roleLabel = ROLE_LABELS[item.role] || item.role || "Contributeur";
    info.textContent = `${roleLabel} · ${item.active === false ? "Inactif" : "Actif"}`;

    const actions = document.createElement("div");
    actions.className = "admin__row-actions";

    const roleSelect = document.createElement("select");
    ["super_admin", "formateur", "apprenti"].forEach((role) => {
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
      updateButton.title = "Ton propre rôle doit être modifié depuis un autre compte d’administration.";
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

  try {
    if (dicoApi) {
      rows = await dicoApi.listProfiles();
    } else {
      const rpc = await supabaseClient.rpc("admin_list_profiles");
      if (rpc.error) throw rpc.error;
      rows = rpc.data || [];
    }
  } catch (error) {
    const direct = await supabaseClient
      .from("profiles")
      .select("id, email, role, active, created_at")
      .order("created_at", { ascending: true });

    const directRows = direct.data || [];
    const directLooksIncomplete = directRows.length === 0 || directRows.some((row) => !row.role);
    if (!direct.error && !directLooksIncomplete) {
      rows = directRows;
    } else {
      finalError = direct.error || error;
      if (!direct.error && directLooksIncomplete) {
        finalError = new Error("lecture profiles vide/incomplete");
      }
    }
  }

  if (finalError) {
    if (await handleAuthError(finalError, "Gestion des rôles")) return;
    setMessage(`Gestion des rôles : ${getErrorMessage(finalError)}`, true);
    return;
  }

  profiles = (rows || []).map((item) => normalizeProfile(item) ? { ...item, ...normalizeProfile(item) } : item);
  if (!profiles.length) {
    setMessage("Gestion des rôles : aucun profil visible.", true);
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
    try {
      if (dicoApi) {
        await dicoApi.updateProfile(profileId, role, active);
      } else {
        const rpc = await supabaseClient.rpc("admin_update_profile", {
          target_profile_id: profileId,
          next_role: role,
          next_active: active
        });
        if (rpc.error) throw rpc.error;
      }
    } catch (error) {
      const direct = await supabaseClient
        .from("profiles")
        .update(payload)
        .eq("id", profileId)
        .select("id");
      const directUpdated = Array.isArray(direct.data) ? direct.data.length : 0;
      if (direct.error || directUpdated === 0) {
        if (await handleAuthError(error, "Gestion des rôles")) return;
        setMessage(`Gestion des rôles : ${getErrorMessage(error)}`, true);
        return;
      }
    }
    setMessage("Gestion des rôles : profil utilisateur mis à jour.");
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
  if (!supabaseHelpers || !supabaseHelpers.hasConfig()) {
    setMessage("Configuration Supabase manquante.", true);
    return;
  }

  supabaseClient = supabaseHelpers.getClient();
  currentUser = await supabaseHelpers.getCurrentUser();

  if (!currentUser) {
    window.location.href = "auth.html";
    return;
  }

  adminUser.textContent = `Utilisateur : ${currentUser.email}`;
  userProfile = normalizeProfile(await supabaseHelpers.getProfile(currentUser.id));
  canManageTerms = canManageFromProfile(userProfile);
  isSuperAdmin = isSuperAdminProfile(userProfile);
  const roleLabel = ROLE_LABELS[userProfile?.role] || "Lecture seule";
  const activeLabel = userProfile?.active === false ? " (inactif)" : "";
  adminRole.textContent = `Rôle : ${roleLabel}${activeLabel}`;

  if (!canManageTerms) {
    window.location.href = "index.html";
    return;
  }

  if (usersPanel && !isSuperAdmin && currentAdminSection === "accounts") {
    currentAdminSection = "overview";
  }
  if (chatFeedbackPanel && !isSuperAdmin && currentAdminSection === "stats") {
    currentAdminSection = "overview";
  }

  for (const button of adminSectionButtons) {
    const target = button.dataset.adminSectionTarget;
    const shouldHide = !isSuperAdmin && (target === "accounts" || target === "stats");
    button.hidden = shouldHide;
  }

  if (usersPanel) usersPanel.hidden = !isSuperAdmin || currentAdminSection !== "accounts";
  if (chatFeedbackPanel) chatFeedbackPanel.hidden = !isSuperAdmin || currentAdminSection !== "stats";
  setAdminSection(currentAdminSection);

  await fetchCategories();
  await fetchTerms();
  await fetchSubmissions();
  await fetchAudit();
  if (isSuperAdmin) {
    await fetchProfiles();
    await fetchAdminMetrics();
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
if (metricsRefresh) metricsRefresh.addEventListener("click", fetchAdminMetrics);
if (chatFeedbackRating) chatFeedbackRating.addEventListener("change", fetchChatFeedback);
if (chatFeedbackSource) chatFeedbackSource.addEventListener("change", fetchChatFeedback);
if (chatFeedbackExport) chatFeedbackExport.addEventListener("click", exportChatFeedbackCsv);
if (imageUrlInput) {
  imageUrlInput.addEventListener("input", () => renderMediaReviewPreview(imageUrlInput.value));
  imageUrlInput.addEventListener("change", () => renderMediaReviewPreview(imageUrlInput.value));
}
for (const button of adminSectionButtons) {
  button.addEventListener("click", () => {
    const target = button.dataset.adminSectionTarget || "overview";
    if (!isSuperAdmin && (target === "accounts" || target === "stats")) return;
    setAdminSection(target);
  });
}
for (const btn of workflowButtons) {
  btn.addEventListener("click", () => {
    currentStatusFilter = btn.dataset.termFilter || "all";
    applyTermsView();
  });
}

loadUser();
