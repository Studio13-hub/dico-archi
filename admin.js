const adminMessage = document.getElementById("admin-message");
const adminUser = document.getElementById("admin-user");
const adminRole = document.getElementById("admin-role");
const adminPermissions = document.getElementById("admin-permissions");
const adminLogout = document.getElementById("admin-logout");
const adminFocusTitle = document.getElementById("admin-focus-title");
const adminFocusAction = document.getElementById("admin-focus-action");
const adminFocusCopy = document.getElementById("admin-focus-copy");
const adminFocusDestination = document.getElementById("admin-focus-destination");
const adminFocusDestinationCopy = document.getElementById("admin-focus-destination-copy");
const adminFocusNote = document.getElementById("admin-focus-note");
const adminFocusNoteCopy = document.getElementById("admin-focus-note-copy");

const termInput = document.getElementById("term");
const categoryInput = document.getElementById("category");
const categoryOptions = document.getElementById("category-options");
const statusInput = document.getElementById("term-status");
const definitionInput = document.getElementById("definition");
const exampleInput = document.getElementById("example");
const richExplanationInput = document.getElementById("rich-explanation");
const richApplicationsInput = document.getElementById("rich-applications");
const richNormsInput = document.getElementById("rich-norms");
const richConstraintsInput = document.getElementById("rich-constraints");
const richDrawingNoteInput = document.getElementById("rich-drawing-note");
const richIdentificationInput = document.getElementById("rich-identification");
const richPropertiesInput = document.getElementById("rich-properties");
const richUsesInput = document.getElementById("rich-uses");
const richImplementationInput = document.getElementById("rich-implementation");
const richVigilanceInput = document.getElementById("rich-vigilance");
const richAdvantagesInput = document.getElementById("rich-advantages");
const richDrawbacksInput = document.getElementById("rich-drawbacks");
const richReferencesInput = document.getElementById("rich-references");
const richConfusionsInput = document.getElementById("rich-confusions");
const relatedInput = document.getElementById("related");
const imageUrlInput = document.getElementById("image-url");
const imageFileInput = document.getElementById("image-file");
const reviewerCommentInput = document.getElementById("reviewer-comment");
const submissionBanner = document.getElementById("submission-banner");
const submissionDossierKicker = document.getElementById("submission-dossier-kicker");
const submissionDossierTerm = document.getElementById("submission-dossier-term");
const submissionDossierStatus = document.getElementById("submission-dossier-status");
const submissionDossierSubmitter = document.getElementById("submission-dossier-submitter");
const submissionDossierReviewer = document.getElementById("submission-dossier-reviewer");
const submissionDossierCategory = document.getElementById("submission-dossier-category");
const submissionDossierCreated = document.getElementById("submission-dossier-created");
const submissionDossierMediaCount = document.getElementById("submission-dossier-media-count");
const submissionDossierRich = document.getElementById("submission-dossier-rich");
const submissionDossierCommentState = document.getElementById("submission-dossier-comment-state");
const submissionDossierUpdated = document.getElementById("submission-dossier-updated");
const submissionDossierDefinition = document.getElementById("submission-dossier-definition");
const submissionDossierExample = document.getElementById("submission-dossier-example");
const submissionDossierMedia = document.getElementById("submission-dossier-media");
const submissionDossierTimeline = document.getElementById("submission-dossier-timeline");
const submissionDossierMessages = document.getElementById("submission-dossier-messages");
const submissionMessageBody = document.getElementById("submission-message-body");
const submissionSendMessage = document.getElementById("submission-send-message");
const submissionOpenCorpus = document.getElementById("submission-open-corpus");
const submissionBackOverview = document.getElementById("submission-back-overview");
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
const adminCorpusFocusTitle = document.getElementById("admin-corpus-focus-title");
const adminCorpusFocusCopy = document.getElementById("admin-corpus-focus-copy");
const adminCorpusSourceTitle = document.getElementById("admin-corpus-source-title");
const adminCorpusSourceCopy = document.getElementById("admin-corpus-source-copy");
const adminCorpusNoteTitle = document.getElementById("admin-corpus-note-title");
const adminCorpusNoteCopy = document.getElementById("admin-corpus-note-copy");
const auditList = document.getElementById("audit-list");
const auditEmpty = document.getElementById("audit-empty");
const workflowButtons = document.querySelectorAll("[data-term-filter]");
const decisionSearch = document.getElementById("decision-search");
const decisionFilter = document.getElementById("decision-filter");
const decisionEmpty = document.getElementById("decision-empty");
const decisionList = document.getElementById("decision-list");
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
const metricsStatus = document.getElementById("metrics-status");
const metricsUpdatedAt = document.getElementById("metrics-updated-at");
const metricsScope = document.getElementById("metrics-scope");
const supabaseHelpers = window.DicoArchiSupabase;
const dicoApi = window.DicoArchiApi;

let supabaseClient = null;
let currentUser = null;
let userProfile = null;
let canManageTerms = false;
let isSuperAdmin = false;
let terms = [];
let submissions = [];
let categories = [];
let editingId = null;
let editingSubmission = null;
let supportsTermStatus = true;
let currentStatusFilter = "all";
let profiles = [];
let recentDecisions = [];
let isSavingTerm = false;
let isProcessingSubmission = false;
let isDeletingTerm = false;
let updatingProfileId = null;
let adminFilterRafId = 0;
let isLoadingChatFeedback = false;
let lastChatFeedbackItems = [];
let isLoadingMetrics = false;
let adminPermissionsReady = false;
let canViewStats = false;
let lastMetricsLoadedAt = "";
let highlightedSubmissionId = "";
let decisionFilterRafId = 0;
let activeSubmissionRecord = null;
let activeSubmissionMessages = [];

const ROLE_LABELS = {
  super_admin: "Administration",
  formateur: "Formateur",
  apprenti: "Apprenti"
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
const initialAdminParams = new URLSearchParams(window.location.search);
const initialAdminSection = String(initialAdminParams.get("section") || "").trim();
let currentAdminSection = initialAdminSection || "overview";
let requestedSubmissionId = String(initialAdminParams.get("submission") || "").trim();
let requestedTermId = String(initialAdminParams.get("term") || "").trim();

async function fetchCanonicalPublishedTerms() {
  try {
    const response = await fetch("/api/categories?resource=terms", { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json().catch(() => ({}));
    return Array.isArray(payload?.terms) ? payload.terms : [];
  } catch (_error) {
    return [];
  }
}

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

function clearMessage() {
  if (!adminMessage) return;
  adminMessage.textContent = "";
  adminMessage.style.color = "";
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

function isMissingNotificationsSupport(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return message.includes("notifications") && (
    message.includes("does not exist")
    || message.includes("not exist")
    || message.includes("could not find")
    || message.includes("relation")
  );
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

function updateSubmissionMessageAvailability() {
  if (!submissionSendMessage) return;
  const isReady = Boolean(activeSubmissionRecord?.id);
  submissionSendMessage.disabled = !isReady;
  if (!isReady) {
    submissionSendMessage.textContent = "Envoyer au contributeur";
    submissionSendMessage.dataset.idleLabel = "Envoyer au contributeur";
  }
}

function setAdminFocusPanel({ title, action, copy, destination, destinationCopy, note, noteCopy }) {
  if (adminFocusTitle) adminFocusTitle.textContent = title;
  if (adminFocusAction) adminFocusAction.textContent = action;
  if (adminFocusCopy) adminFocusCopy.textContent = copy;
  if (adminFocusDestination) adminFocusDestination.textContent = destination;
  if (adminFocusDestinationCopy) adminFocusDestinationCopy.textContent = destinationCopy;
  if (adminFocusNote) adminFocusNote.textContent = note;
  if (adminFocusNoteCopy) adminFocusNoteCopy.textContent = noteCopy;
}

function updateAdminFocusPanel() {
  const pendingSubmissions = submissions.filter((item) => ["submitted", "validated", "resubmitted"].includes(String(item?.status || "")));
  const correctionQueue = submissions.filter((item) => String(item?.status || "") === "resubmitted").length;

  if (!adminPermissionsReady) {
    setAdminFocusPanel({
      title: "Chargement des priorités",
      action: "Lire les accès",
      copy: "Le premier écran se met à jour dès que le rôle staff est confirmé.",
      destination: "Vue d’ensemble",
      destinationCopy: "L’orientation dépend du niveau d’accès réel.",
      note: "Séparer les espaces",
      noteCopy: "Vue d’ensemble trie, Corpus corrige, Suivi mesure, Comptes administre."
    });
    return;
  }

  if (!canManageTerms) {
    setAdminFocusPanel({
      title: "Accès restreint",
      action: "Revenir à un espace autorisé",
      copy: "Ce compte ne dispose pas des droits staff nécessaires pour piloter l’admin.",
      destination: "Mon compte",
      destinationCopy: "Vérifier le rôle et l’état du compte avant de continuer.",
      note: "Administration réservée au staff",
      noteCopy: "Les workflows éditoriaux complets restent limités à Formateur et Administration."
    });
    return;
  }

  if (correctionQueue > 0) {
    setAdminFocusPanel({
      title: `${correctionQueue} correction${correctionQueue > 1 ? "s" : ""} apprenti à reprendre`,
      action: "Ouvrir les propositions renvoyées",
      copy: "Les retours apprenti traités en premier évitent d’allonger la boucle de relecture.",
      destination: "Vue d’ensemble",
      destinationCopy: "La file met déjà en avant les propositions resoumises et leur dossier.",
      note: "Corriger avant de publier",
      noteCopy: "Passe ensuite dans Corpus pour harmoniser la fiche avant validation finale."
    });
    return;
  }

  if (pendingSubmissions.length > 0) {
    setAdminFocusPanel({
      title: `${pendingSubmissions.length} proposition${pendingSubmissions.length > 1 ? "s" : ""} en file`,
      action: "Trier la file de validation",
      copy: "La priorité actuelle est de qualifier les propositions avant de retoucher le corpus publié.",
      destination: "Vue d’ensemble",
      destinationCopy: "Charge une proposition depuis la file puis ouvre son dossier ou le Corpus.",
      note: "Décider clairement",
      noteCopy: "Valider, demander une correction ou refuser avec une raison explicite."
    });
    return;
  }

  if (canViewStats && currentAdminSection === "stats") {
    setAdminFocusPanel({
      title: "Lire les signaux d’usage",
      action: "Analyser le suivi",
      copy: "La file est calme; le bon usage de ce temps est la lecture des métriques et de l’historique.",
      destination: "Suivi",
      destinationCopy: "Vérifier les pages les plus vues, les jeux actifs et les retours assistant si autorisé.",
      note: "Ne pas confondre pilotage et édition",
      noteCopy: "Le suivi éclaire les priorités éditoriales, mais les corrections restent dans Corpus."
    });
    return;
  }

  setAdminFocusPanel({
    title: isSuperAdmin ? "Pilotage de la plateforme" : "Maintenance du corpus",
    action: isSuperAdmin ? "Balancer comptes, corpus et suivi" : "Reprendre une fiche publiée",
    copy: isSuperAdmin
      ? "La file est stable; tu peux arbitrer entre structure du corpus, rôles et suivi global."
      : "La file est stable; tu peux consacrer le temps disponible à l’harmonisation éditoriale.",
    destination: isSuperAdmin ? "Comptes ou Suivi" : "Corpus",
    destinationCopy: isSuperAdmin
      ? "Choisis la section selon le besoin: accès, métriques ou maintenance éditoriale."
      : "Charge un terme publié ou un brouillon pour améliorer la qualité du corpus.",
    note: "Garder les sections nettes",
    noteCopy: "Éviter de traiter la file, corriger une fiche et auditer les métriques dans le même mouvement."
  });
}

function updateAdminCorpusSummary() {
  if (adminCorpusFocusTitle) adminCorpusFocusTitle.textContent = "Aucune fiche chargée";
  if (adminCorpusFocusCopy) adminCorpusFocusCopy.textContent = "Ouvre un terme ou une proposition pour commencer l’édition.";
  if (adminCorpusSourceTitle) adminCorpusSourceTitle.textContent = "Corpus publié";
  if (adminCorpusSourceCopy) adminCorpusSourceCopy.textContent = "Les propositions staff et apprenti ne suivent pas exactement le même flux.";
  if (adminCorpusNoteTitle) adminCorpusNoteTitle.textContent = "Corriger avant de décider";
  if (adminCorpusNoteCopy) {
    adminCorpusNoteCopy.textContent = "Valider seulement quand définition, catégorie, médias et repères riches sont cohérents.";
  }

  if (editingSubmission) {
    const mediaCount = Array.isArray(editingSubmission.media_urls) ? editingSubmission.media_urls.length : 0;
    if (adminCorpusFocusTitle) adminCorpusFocusTitle.textContent = editingSubmission.term || "Proposition chargée";
    if (adminCorpusFocusCopy) {
      adminCorpusFocusCopy.textContent = `Proposition en cours de relecture${mediaCount ? ` avec ${mediaCount} média${mediaCount > 1 ? "s" : ""}` : ""}.`;
    }
    if (adminCorpusSourceTitle) adminCorpusSourceTitle.textContent = "File de validation";
    if (adminCorpusSourceCopy) {
      adminCorpusSourceCopy.textContent = `Statut actuel: ${getWorkflowLabel(editingSubmission.status || "submitted")}.`;
    }
    if (adminCorpusNoteTitle) adminCorpusNoteTitle.textContent = "Réponse attendue au contributeur";
    if (adminCorpusNoteCopy) {
      adminCorpusNoteCopy.textContent = editingSubmission.reviewer_comment
        ? `Dernier commentaire staff: ${editingSubmission.reviewer_comment}`
        : "Ajoute un commentaire clair si la proposition doit repartir en correction.";
    }
    return;
  }

  const editingTerm = getEditingTerm();
  if (editingTerm) {
    if (adminCorpusFocusTitle) adminCorpusFocusTitle.textContent = editingTerm.term || "Fiche chargée";
    if (adminCorpusFocusCopy) {
      adminCorpusFocusCopy.textContent = `Fiche du corpus en édition dans ${getCategoryName(editingTerm) || "une catégorie non renseignée"}.`;
    }
    if (adminCorpusSourceTitle) adminCorpusSourceTitle.textContent = "Corpus existant";
    if (adminCorpusSourceCopy) {
      adminCorpusSourceCopy.textContent = `Statut éditorial: ${getWorkflowLabel(getTermStatus(editingTerm))}.`;
    }
    if (adminCorpusNoteTitle) adminCorpusNoteTitle.textContent = "Harmonisation";
    if (adminCorpusNoteCopy) {
      adminCorpusNoteCopy.textContent = "Profite de cette passe pour vérifier définition, exemples, termes liés et structure riche.";
    }
  }
}

function setAdminSection(section) {
  currentAdminSection = section || "overview";
  updateSubmissionTabVisibility();
  for (const panel of adminSections) {
    const visible = panel.dataset.adminSection === currentAdminSection && canAccessAdminFeature(panel.dataset.adminAccess || "");
    panel.hidden = !visible;
  }
  for (const button of adminSectionButtons) {
    const canAccess = canAccessAdminFeature(button.dataset.adminAccess || "");
    button.hidden = !canAccess;
    const isActive = canAccess && button.dataset.adminSectionTarget === currentAdminSection;
    button.classList.toggle("chip--active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.tabIndex = isActive ? 0 : -1;
  }
  updateAdminFocusPanel();
}

function updateSubmissionTabVisibility() {
  const button = document.getElementById("admin-tab-submission");
  if (!button) return;
  button.hidden = !adminPermissionsReady || !activeSubmissionRecord;
}

function syncAdminUrl({ section = currentAdminSection, submissionId = "", termId = "" } = {}) {
  const url = new URL(window.location.href);
  if (section && section !== "overview") url.searchParams.set("section", section);
  else url.searchParams.delete("section");
  if (submissionId) url.searchParams.set("submission", submissionId);
  else url.searchParams.delete("submission");
  if (termId) url.searchParams.set("term", termId);
  else url.searchParams.delete("term");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function updateAdminContextCopy() {
  if (adminPermissions) {
    const capabilities = ["Vue d’ensemble", "Corpus"];
    if (canViewStats) capabilities.push("Suivi");
    if (isSuperAdmin) {
      capabilities.push("Comptes");
      capabilities.push("Feedback assistant");
    }
    adminPermissions.textContent = adminPermissionsReady
      ? `Accès : ${capabilities.join(" · ")}`
      : "Accès : chargement...";
  }

  if (metricsScope) {
    if (!adminPermissionsReady) {
      metricsScope.textContent = "Le volet Suivi regroupe les métriques d’usage et l’historique éditorial.";
    } else if (isSuperAdmin) {
      metricsScope.textContent = "Le volet Suivi regroupe les métriques d’usage, l’historique éditorial et le panneau Feedback assistant.";
    } else if (canViewStats) {
      metricsScope.textContent = "Le volet Suivi regroupe les métriques d’usage et l’historique éditorial. Le panneau Feedback assistant reste réservé à l’Administration.";
    } else {
      metricsScope.textContent = "Le volet Suivi regroupe les métriques d’usage et l’historique éditorial.";
    }
  }
  updateAdminFocusPanel();
}

function getVisibleAdminSectionButtons() {
  return adminSectionButtons.filter((button) => !button.hidden && canAccessAdminFeature(button.dataset.adminAccess || ""));
}

function focusAdminSectionButton(direction) {
  const visibleButtons = getVisibleAdminSectionButtons();
  if (!visibleButtons.length) return;

  const activeElement = document.activeElement;
  const currentIndex = visibleButtons.indexOf(activeElement);
  const fallbackIndex = Math.max(0, visibleButtons.findIndex((button) => button.dataset.adminSectionTarget === currentAdminSection));
  let nextIndex = currentIndex >= 0 ? currentIndex : fallbackIndex;

  if (direction === "first") nextIndex = 0;
  else if (direction === "last") nextIndex = visibleButtons.length - 1;
  else nextIndex = (nextIndex + direction + visibleButtons.length) % visibleButtons.length;

  const nextButton = visibleButtons[nextIndex];
  if (nextButton) nextButton.focus();
}

function canAccessAdminFeature(requiredAccess) {
  if (!requiredAccess) return true;
  if (requiredAccess === "super_admin") return isSuperAdmin;
  if (requiredAccess === "staff") return canManageTerms;
  return false;
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
  highlightedSubmissionId = "";
  activeSubmissionRecord = null;
  termInput.value = "";
  categoryInput.value = "";
  if (statusInput) statusInput.value = "draft";
  definitionInput.value = "";
  exampleInput.value = "";
  if (richExplanationInput) richExplanationInput.value = "";
  if (richApplicationsInput) richApplicationsInput.value = "";
  if (richNormsInput) richNormsInput.value = "";
  if (richConstraintsInput) richConstraintsInput.value = "";
  if (richDrawingNoteInput) richDrawingNoteInput.value = "";
  if (richIdentificationInput) richIdentificationInput.value = "";
  if (richPropertiesInput) richPropertiesInput.value = "";
  if (richUsesInput) richUsesInput.value = "";
  if (richImplementationInput) richImplementationInput.value = "";
  if (richVigilanceInput) richVigilanceInput.value = "";
  if (richAdvantagesInput) richAdvantagesInput.value = "";
  if (richDrawbacksInput) richDrawbacksInput.value = "";
  if (richReferencesInput) richReferencesInput.value = "";
  if (richConfusionsInput) richConfusionsInput.value = "";
  relatedInput.value = "";
  imageUrlInput.value = "";
  imageFileInput.value = "";
  reviewerCommentInput.value = "";
  if (submissionBanner) submissionBanner.textContent = "";
  document.querySelectorAll(".admin__row.highlight").forEach((row) => row.classList.remove("highlight"));
  renderMediaReviewPreview([]);
  setUploadStatus("");
  updateSubmissionMessageAvailability();
  updateAdminCorpusSummary();
  syncAdminUrl({ section: currentAdminSection });
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

function parseLineList(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFactLines(value) {
  return parseLineList(value)
    .map((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) return null;
      const label = line.slice(0, separatorIndex).trim();
      const factValue = line.slice(separatorIndex + 1).trim();
      if (!label || !factValue) return null;
      return { label, value: factValue };
    })
    .filter(Boolean);
}

function formatFactLines(values) {
  if (!Array.isArray(values)) return "";
  return values
    .map((item) => {
      const label = String(item?.label || "").trim();
      const value = String(item?.value || "").trim();
      if (!label || !value) return "";
      return `${label}: ${value}`;
    })
    .filter(Boolean)
    .join("\n");
}

function formatLineList(values) {
  return Array.isArray(values) ? values.filter(Boolean).join("\n") : "";
}

function makeSection(title, items) {
  const cleanItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!cleanItems.length) return null;
  return { title, items: cleanItems };
}

function getRichDefaults() {
  return {
    kind: "complete",
    label: "Fiche complète",
    headline: "Comprendre le terme, son rôle et sa mise en œuvre",
    note: "Cette fiche rassemble dans un même format la définition, les usages, les points de vigilance et les repères utiles au bureau."
  };
}

function buildRichPayloadFromInputs() {
  const defaults = getRichDefaults();
  const explanation = richExplanationInput?.value.trim() || "";
  const applications = parseLineList(richApplicationsInput?.value);
  const norms = parseLineList(richNormsInput?.value);
  const constraints = parseLineList(richConstraintsInput?.value);
  const drawingNote = richDrawingNoteInput?.value.trim() || "";
  const identificationFacts = parseFactLines(richIdentificationInput?.value);
  const detailSections = [
    identificationFacts.length ? { title: "Identification", facts: identificationFacts } : null,
    makeSection("Propriétés", parseLineList(richPropertiesInput?.value)),
    makeSection("Usages courants", parseLineList(richUsesInput?.value)),
    makeSection("Mise en œuvre", parseLineList(richImplementationInput?.value)),
    makeSection("Vigilance", parseLineList(richVigilanceInput?.value)),
    makeSection("Avantages", parseLineList(richAdvantagesInput?.value)),
    makeSection("Inconvénients", parseLineList(richDrawbacksInput?.value)),
    makeSection("Références", parseLineList(richReferencesInput?.value)),
    makeSection("À ne pas confondre", parseLineList(richConfusionsInput?.value))
  ].filter(Boolean);

  const hasRichContent = Boolean(
    explanation
    || applications.length
    || norms.length
    || constraints.length
    || drawingNote
    || detailSections.length
  );

  if (!hasRichContent) return {};

  return {
    content: {
      explanation,
      applications,
      norms
    },
    technical_data: {
      constraints
    },
    representation: {
      abbreviation_plan: null,
      drawing_note: drawingNote
    },
    editorial_profile: {
      kind: defaults.kind,
      label: defaults.label,
      headline: defaults.headline,
      note: defaults.note
    },
    detail_sections: detailSections
  };
}

function fillRichInputs(richPayload) {
  const payload = richPayload && typeof richPayload === "object" ? richPayload : {};
  const detailSections = Array.isArray(payload.detail_sections) ? payload.detail_sections : [];
  const sectionByTitle = new Map(detailSections.map((section) => [String(section?.title || "").trim(), section]));
  const identification = sectionByTitle.get("Identification") || {};

  if (richExplanationInput) richExplanationInput.value = payload?.content?.explanation || "";
  if (richApplicationsInput) richApplicationsInput.value = formatLineList(payload?.content?.applications);
  if (richNormsInput) richNormsInput.value = formatLineList(payload?.content?.norms);
  if (richConstraintsInput) richConstraintsInput.value = formatLineList(payload?.technical_data?.constraints);
  if (richDrawingNoteInput) richDrawingNoteInput.value = payload?.representation?.drawing_note || "";
  if (richIdentificationInput) richIdentificationInput.value = formatFactLines(identification?.facts);
  if (richPropertiesInput) richPropertiesInput.value = formatLineList(sectionByTitle.get("Propriétés")?.items);
  if (richUsesInput) richUsesInput.value = formatLineList(sectionByTitle.get("Usages courants")?.items);
  if (richImplementationInput) richImplementationInput.value = formatLineList(sectionByTitle.get("Mise en œuvre")?.items);
  if (richVigilanceInput) richVigilanceInput.value = formatLineList(sectionByTitle.get("Vigilance")?.items);
  if (richAdvantagesInput) richAdvantagesInput.value = formatLineList(sectionByTitle.get("Avantages")?.items);
  if (richDrawbacksInput) richDrawbacksInput.value = formatLineList(sectionByTitle.get("Inconvénients")?.items);
  if (richReferencesInput) richReferencesInput.value = formatLineList(sectionByTitle.get("Références")?.items);
  if (richConfusionsInput) richConfusionsInput.value = formatLineList(sectionByTitle.get("À ne pas confondre")?.items);
}

function isMissingRichPayloadSupport(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return message.includes("rich_payload") && (
    message.includes("does not exist")
    || message.includes("not exist")
    || message.includes("could not find the")
    || message.includes("column")
  );
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
  if (status === "resubmitted") return "Resoumise";
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

function hasRichPayloadContent(payload) {
  if (!payload || typeof payload !== "object") return false;
  const explanation = String(payload?.content?.explanation || "").trim();
  const applications = Array.isArray(payload?.content?.applications) ? payload.content.applications : [];
  const norms = Array.isArray(payload?.content?.norms) ? payload.content.norms : [];
  const constraints = Array.isArray(payload?.technical_data?.constraints) ? payload.technical_data.constraints : [];
  const drawingNote = String(payload?.representation?.drawing_note || "").trim();
  const detailSections = Array.isArray(payload?.detail_sections) ? payload.detail_sections : [];
  return Boolean(explanation || applications.length || norms.length || constraints.length || drawingNote || detailSections.length);
}

function isKnownTestSubmission(item) {
  const id = String(item?.id || "").trim().toLowerCase();
  const term = String(item?.term || "").trim().toLowerCase();
  return id === "cba9eb0c-24cf-4cf6-b493-5c3e0491c507" || term === "terme test contribution image";
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

function getSubmissionPriority(item) {
  const status = String(item?.status || "").toLowerCase();
  if (status === "resubmitted") return 0;
  if (status === "validated") return 1;
  if (status === "submitted") return 2;
  return 3;
}

function updateWorkflowStats(list) {
  const draft = list.filter((item) => getTermStatus(item) === "draft").length;
  const review = list.filter((item) => getTermStatus(item) === "validated").length;
  const published = list.filter((item) => getTermStatus(item) === "published").length;
  if (statDraft) statDraft.textContent = String(draft);
  if (statReview) statReview.textContent = String(review);
  if (statPublished) statPublished.textContent = String(published);
  updateAdminFocusPanel();
}

function setMetricsStatus(text, isError = false) {
  if (!metricsStatus) return;
  metricsStatus.textContent = text;
  metricsStatus.style.color = isError ? "#d94e2b" : "";
}

function setMetricsUpdatedAt(value = "") {
  lastMetricsLoadedAt = value || "";
  if (!metricsUpdatedAt) return;
  if (!lastMetricsLoadedAt) {
    metricsUpdatedAt.textContent = "";
    return;
  }
  metricsUpdatedAt.textContent = `Dernière actualisation : ${lastMetricsLoadedAt}`;
}

function clearMetricsDisplay() {
  if (metricsSummary) metricsSummary.innerHTML = "";
  if (metricsTopPages) metricsTopPages.innerHTML = "";
  if (metricsTopGames) metricsTopGames.innerHTML = "";
  if (metricsRecent) metricsRecent.innerHTML = "";
}

function appendMetricCard(container, label, value) {
  const item = document.createElement("div");
  item.className = "dashboard__item";

  const itemLabel = document.createElement("span");
  itemLabel.className = "dashboard__label";
  itemLabel.textContent = label;

  const itemValue = document.createElement("strong");
  itemValue.textContent = String(value);

  item.append(itemLabel, itemValue);
  container.appendChild(item);
}

function appendMetricRow(container, title, info, meta) {
  const row = document.createElement("div");
  row.className = "admin__row";

  const titleNode = document.createElement("div");
  titleNode.className = "admin__row-title";
  titleNode.textContent = title;

  const infoNode = document.createElement("div");
  infoNode.className = "admin__row-info";
  infoNode.textContent = info;

  const metaNode = document.createElement("div");
  metaNode.className = "admin__row-meta";
  metaNode.textContent = meta;

  row.append(titleNode, infoNode, metaNode);
  container.appendChild(row);
}

function isMissingMetricsTableError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    message.includes("page_views")
    || message.includes("game_scores")
  ) && (
    message.includes("does not exist")
    || message.includes("not exist")
    || message.includes("could not find the table")
    || message.includes("relation")
  );
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
    info.textContent = item.id
      ? `${getCategoryName(item)} · ${getWorkflowLabel(status)} · ${item.definition}`
      : `${getCategoryName(item)} · Contenu canonique · ${item.definition}`;

    const actions = document.createElement("div");
    actions.className = "admin__row-actions";

    const editButton = document.createElement("button");
    editButton.className = "ghost";
    editButton.textContent = item.id ? "Modifier" : "Importer";
    editButton.addEventListener("click", () => loadTerm(item));

    actions.appendChild(editButton);
    if (item.id) {
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Supprimer";
      deleteButton.addEventListener("click", () => removeTerm(item, deleteButton));
      actions.appendChild(deleteButton);
    }

    row.appendChild(title);
    row.appendChild(info);
    row.appendChild(actions);

    termsTable.appendChild(row);
  }
}

function renderSubmissions(list) {
  const container = document.getElementById("submissions");
  const empty = document.getElementById("submissions-empty");
  const orderedList = list.slice().sort((a, b) => {
    const priority = getSubmissionPriority(a) - getSubmissionPriority(b);
    if (priority !== 0) return priority;
    return parseDateOrZero(b.updated_at || b.created_at) - parseDateOrZero(a.updated_at || a.created_at);
  });

  container.innerHTML = "";

  if (!orderedList.length) {
    empty.style.display = "block";
    updateAdminFocusPanel();
    return;
  }

  empty.style.display = "none";

  for (const item of orderedList) {
    const row = document.createElement("div");
    row.className = "admin__row";
    if (highlightedSubmissionId && item.id === highlightedSubmissionId) {
      row.classList.add("highlight");
    }
    const mediaCount = Array.isArray(item.media_urls) ? item.media_urls.length : 0;
    const richCount = hasRichPayloadContent(item.rich_payload);
    if (mediaCount) {
      row.classList.add("admin__row--has-media");
    }

    const kicker = document.createElement("div");
    kicker.className = "admin__row-kicker";
    kicker.textContent = `Proposition ${String(item.id || "").slice(0, 8) || "sans id"}`;
    if (isKnownTestSubmission(item)) {
      const testBadge = document.createElement("span");
      testBadge.className = "admin__badge admin__badge--test";
      testBadge.textContent = "Test reprise";
      kicker.appendChild(testBadge);
    }
    if (item.status === "resubmitted") {
      const resubBadge = document.createElement("span");
      resubBadge.className = "admin__badge";
      resubBadge.textContent = "Retour apprenti";
      kicker.appendChild(resubBadge);
    }
    if (richCount) {
      const richBadge = document.createElement("span");
      richBadge.className = "admin__badge";
      richBadge.textContent = "Fiche complete";
      kicker.appendChild(richBadge);
    }

    const title = document.createElement("div");
    title.className = "admin__row-title";
    title.textContent = item.term;

    const info = document.createElement("div");
    info.className = "admin__row-info";
    info.textContent = `${getCategoryName(item)} · ${item.definition}${richCount ? " · contenu riche" : ""}`;

    const meta = document.createElement("div");
    meta.className = "admin__row-meta";
    const mediaLabel = mediaCount ? ` · ${mediaCount} média proposé${mediaCount > 1 ? "s" : ""}` : "";
    const when = formatShortDate(item.created_at);
    const statusMeta = item.status === "resubmitted" ? " · corrigée puis renvoyée" : "";
    meta.textContent = `Par : ${item.submitter_email || "anonyme"}${mediaLabel}${when ? ` · ${when}` : ""}${statusMeta}`;

    const status = document.createElement("div");
    status.className = `admin__row-status ${item.status || "pending"}`;
    status.textContent = getWorkflowLabel(item.status || "submitted");

    row.appendChild(kicker);

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
    loadButton.textContent = "Ouvrir";
    loadButton.dataset.submissionAction = "1";
    loadButton.disabled = isProcessingSubmission;
    loadButton.addEventListener("click", () => loadSubmission(item, row));

    const dossierButton = document.createElement("button");
    dossierButton.className = "ghost";
    dossierButton.textContent = "Dossier";
    dossierButton.disabled = isProcessingSubmission;
    dossierButton.addEventListener("click", () => openSubmissionDossier(item, row));

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
    actions.appendChild(dossierButton);
    actions.appendChild(approveButton);
    actions.appendChild(rejectButton);

    row.appendChild(title);
    row.appendChild(info);
    row.appendChild(meta);
    row.appendChild(status);
    row.appendChild(actions);

    container.appendChild(row);
  }
  updateAdminFocusPanel();
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

function getDecisionKind(item) {
  const status = String(item.status || "").toLowerCase();
  if (status === "accepted") return item.reviewer_comment ? "accepted" : "accepted";
  if (status === "resubmitted") return "feedback";
  if (status === "rejected") return item.reviewer_comment ? "feedback" : "rejected";
  return "other";
}

function getDecisionLabel(kind) {
  if (kind === "accepted") return "Validation";
  if (kind === "feedback") return "À corriger";
  if (kind === "rejected") return "Refus";
  return "Décision";
}

function renderDecisionHistory(list) {
  if (!decisionList || !decisionEmpty) return;
  decisionList.innerHTML = "";

  if (!list.length) {
    decisionEmpty.style.display = "block";
    return;
  }

  decisionEmpty.style.display = "none";

  for (const item of list) {
    const row = document.createElement("div");
    row.className = "admin__row";

    const title = document.createElement("div");
    title.className = "admin__row-title";
    title.textContent = item.term || "Proposition";

    const info = document.createElement("div");
    info.className = "admin__row-info";
    info.textContent = `${item.category || "Sans catégorie"} · ${item.submitter_email || "Compte inconnu"}`;

    const meta = document.createElement("div");
    meta.className = "admin__row-meta";
    const actor = item.reviewer_email || "Décision non attribuée";
    const when = formatShortDate(item.updated_at || item.created_at);
    meta.textContent = `Décidé par ${actor}${when ? ` · ${when}` : ""}`;

    const badges = document.createElement("div");
    badges.className = "account-inbox__badges";

    const kindBadge = document.createElement("span");
    kindBadge.className = "account-inbox__badge";
    kindBadge.textContent = getDecisionLabel(getDecisionKind(item));
    badges.appendChild(kindBadge);

    if (item.rich_payload && hasRichPayloadContent(item.rich_payload)) {
      const richBadge = document.createElement("span");
      richBadge.className = "account-inbox__badge";
      richBadge.textContent = "Fiche complète";
      badges.appendChild(richBadge);
    }

    if (Array.isArray(item.media_urls) && item.media_urls.length) {
      const mediaBadge = document.createElement("span");
      mediaBadge.className = "account-inbox__badge";
      mediaBadge.textContent = `${item.media_urls.length} média${item.media_urls.length > 1 ? "s" : ""}`;
      badges.appendChild(mediaBadge);
    }

    row.appendChild(title);
    row.appendChild(info);
    row.appendChild(meta);
    row.appendChild(badges);

    if (item.reviewer_comment) {
      const note = document.createElement("div");
      note.className = "account-inbox__note";
      note.textContent = `Commentaire: ${item.reviewer_comment}`;
      row.appendChild(note);
    }

    const actions = document.createElement("div");
    actions.className = "admin__row-actions";

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "ghost";
    openButton.textContent = "Dossier";
    openButton.addEventListener("click", () => openSubmissionDossier(item));
    actions.appendChild(openButton);

    row.appendChild(actions);
    decisionList.appendChild(row);
  }
}

function appendTimelineItem(container, title, copy, meta) {
  if (!container) return;
  const item = document.createElement("div");
  item.className = "admin__timeline-item";

  const heading = document.createElement("strong");
  heading.textContent = title;
  item.appendChild(heading);

  if (copy) {
    const body = document.createElement("div");
    body.className = "section-copy";
    body.textContent = copy;
    item.appendChild(body);
  }

  if (meta) {
    const details = document.createElement("div");
    details.className = "meta meta--subtle";
    details.textContent = meta;
    item.appendChild(details);
  }

  container.appendChild(item);
}

function renderSubmissionDossier(item) {
  activeSubmissionRecord = item || null;
  updateSubmissionTabVisibility();
  updateSubmissionMessageAvailability();
  if (!item) return;

  const mediaUrls = Array.isArray(item.media_urls) ? item.media_urls : [];
  const richLabel = hasRichPayloadContent(item.rich_payload) ? "Fiche complète" : "Fiche simple";
  const reviewerLabel = item.reviewer_email || (item.reviewed_by ? "Compte staff" : "Pas encore relu");
  const submitterLabel = item.submitter_email || "Compte non identifié";

  if (submissionDossierKicker) {
    submissionDossierKicker.textContent = `Proposition ${String(item.id || "").slice(0, 8)} · ${getWorkflowLabel(item.status || "submitted")}`;
  }
  if (submissionDossierTerm) submissionDossierTerm.textContent = item.term || "-";
  if (submissionDossierStatus) submissionDossierStatus.textContent = getWorkflowLabel(item.status || "submitted");
  if (submissionDossierSubmitter) submissionDossierSubmitter.textContent = submitterLabel;
  if (submissionDossierReviewer) submissionDossierReviewer.textContent = reviewerLabel;
  if (submissionDossierCategory) submissionDossierCategory.textContent = item.category || "Sans catégorie";
  if (submissionDossierCreated) submissionDossierCreated.textContent = item.created_at ? `Créée le ${formatShortDate(item.created_at)}` : "-";
  if (submissionDossierMediaCount) submissionDossierMediaCount.textContent = String(mediaUrls.length);
  if (submissionDossierRich) submissionDossierRich.textContent = richLabel;
  if (submissionDossierCommentState) submissionDossierCommentState.textContent = item.reviewer_comment ? "Présent" : "Aucun";
  if (submissionDossierUpdated) submissionDossierUpdated.textContent = item.updated_at ? `Dernière mise à jour: ${formatShortDate(item.updated_at)}` : "-";
  if (submissionDossierDefinition) submissionDossierDefinition.textContent = item.definition || "-";
  if (submissionDossierExample) submissionDossierExample.textContent = item.example || "Aucun exemple fourni.";

  if (submissionDossierMedia) {
    submissionDossierMedia.innerHTML = "";
    if (!mediaUrls.length) {
      const empty = document.createElement("div");
      empty.className = "meta meta--subtle";
      empty.textContent = "Aucun média joint.";
      submissionDossierMedia.appendChild(empty);
    } else {
      for (const url of mediaUrls) {
        const link = document.createElement("a");
        link.className = "admin__media-chip";
        link.href = url;
        link.target = "_blank";
        link.rel = "noreferrer noopener";
        link.textContent = inferMediaType(url) === "pdf" ? "PDF" : (getMediaTitle(url) || "Image");
        submissionDossierMedia.appendChild(link);
      }
    }
  }

  if (submissionDossierTimeline) {
    submissionDossierTimeline.innerHTML = "";
    appendTimelineItem(
      submissionDossierTimeline,
      "Soumission reçue",
      `La proposition a été envoyée par ${submitterLabel}.`,
      item.created_at ? formatShortDate(item.created_at) : ""
    );
    if (mediaUrls.length) {
      appendTimelineItem(
        submissionDossierTimeline,
        "Médias joints",
        `${mediaUrls.length} média${mediaUrls.length > 1 ? "s" : ""} proposé${mediaUrls.length > 1 ? "s" : ""}.`,
        richLabel
      );
    }
    if (item.reviewer_comment) {
      appendTimelineItem(
        submissionDossierTimeline,
        getDecisionLabel(getDecisionKind(item)),
        item.reviewer_comment,
        reviewerLabel
      );
    } else if (item.status === "accepted" || item.status === "rejected") {
      appendTimelineItem(
        submissionDossierTimeline,
        getDecisionLabel(getDecisionKind(item)),
        "Décision enregistrée sans commentaire détaillé.",
        reviewerLabel
      );
    } else {
      appendTimelineItem(
        submissionDossierTimeline,
        "En attente de relecture",
        "La proposition est encore dans la file éditoriale.",
        getWorkflowLabel(item.status || "submitted")
      );
    }
  }

  refreshActiveSubmissionMessages();
}

function openSubmissionDossier(item, row) {
  if (!item) return;
  renderSubmissionDossier(item);
  if (row) {
    document.querySelectorAll(".admin__row.highlight").forEach((node) => node.classList.remove("highlight"));
    row.classList.add("highlight");
  }
  highlightedSubmissionId = item.id || "";
  if (adminPermissionsReady) setAdminSection("submission");
  syncAdminUrl({ section: "submission", submissionId: item.id || "" });
  setMessage(`Propositions : dossier ouvert pour « ${item.term || "sans titre"} ».`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyDecisionView() {
  if (!decisionList || !decisionEmpty) return;
  const query = String(decisionSearch?.value || "").trim().toLowerCase();
  const filter = String(decisionFilter?.value || "all");

  let filtered = recentDecisions.slice();
  if (filter !== "all") {
    filtered = filtered.filter((item) => getDecisionKind(item) === filter);
  }
  if (query) {
    filtered = filtered.filter((item) => (
      [
        item.term,
        item.category,
        item.definition,
        item.reviewer_comment,
        item.submitter_email,
        item.reviewer_email
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    ));
  }

  renderDecisionHistory(filtered);
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
    clearMessage();
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
  if (adminPermissionsReady) setAdminSection("corpus");
  editingId = item.id || null;
  editingSubmission = null;
  termInput.value = item.term || "";
  categoryInput.value = getCategoryName(item);
  if (statusInput) statusInput.value = getTermStatus(item);
  definitionInput.value = item.definition || "";
  exampleInput.value = item.example || "";
  fillRichInputs(item.rich_payload || {});
  relatedInput.value = (item.related || []).join(" | ");
  imageUrlInput.value = formatMediaUrlsForInput(item.media_urls || []);
  renderMediaReviewPreview(item.media_urls || []);
  reviewerCommentInput.value = item.reviewer_comment || "";
  if (submissionBanner) submissionBanner.textContent = "";
  updateAdminCorpusSummary();
  setMessage(
    item.id
      ? `Corpus : fiche chargée pour modification (${item.term || "terme"}).`
      : `Corpus : fiche canonique chargée. Enregistrer pour l’ajouter dans la base avant d’y lier des médias.`
  );
  syncAdminUrl({ section: "corpus", termId: item.id || "" });
  termInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function loadSubmission(item, row) {
  activeSubmissionRecord = item;
  renderSubmissionDossier(item);
  if (adminPermissionsReady) setAdminSection("corpus");
  document.querySelectorAll(".admin__row.highlight").forEach((node) => node.classList.remove("highlight"));
  highlightedSubmissionId = item.id || "";
  editingSubmission = item;
  editingId = null;
  termInput.value = item.term || "";
  categoryInput.value = getCategoryName(item);
  if (statusInput) statusInput.value = "validated";
  definitionInput.value = item.definition || "";
  exampleInput.value = item.example || "";
  fillRichInputs(item.rich_payload || {});
  relatedInput.value = (item.related || []).join(" | ");
  imageUrlInput.value = formatMediaUrlsForInput(item.media_urls || []);
  renderMediaReviewPreview(item.media_urls || []);
  reviewerCommentInput.value = item.reviewer_comment || "";
  if (submissionBanner) {
    const mediaCount = Array.isArray(item.media_urls) ? item.media_urls.length : 0;
    const mediaLabel = mediaCount ? ` · ${mediaCount} média proposé${mediaCount > 1 ? "s" : ""}` : "";
    const richLabel = hasRichPayloadContent(item.rich_payload) ? " · fiche complète" : "";
    const idLabel = item.id ? ` · id ${item.id}` : "";
    submissionBanner.textContent = `Proposition chargée : ${item.term}${mediaLabel}${richLabel}${idLabel}`;
  }
  updateAdminCorpusSummary();
  setMessage(`Propositions : la proposition « ${item.term || "sans titre"} » est ouverte dans le panneau Corpus.`);
  syncAdminUrl({ section: "corpus", submissionId: item.id || "" });
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

async function createInboxNotification(recipientId, payload) {
  if (!recipientId || !payload?.title || !payload?.body) return;

  const notificationPayload = {
    recipient_id: recipientId,
    kind: payload.kind || "info",
    severity: payload.severity || "info",
    title: payload.title,
    body: payload.body,
    actor_id: payload.actorId || currentUser?.id || null,
    actor_label: payload.actorLabel || currentUser?.email || "",
    related_table: payload.relatedTable || null,
    related_id: payload.relatedId || null,
    metadata: payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {}
  };

  if (dicoApi?.createNotification) {
    try {
      await dicoApi.createNotification(notificationPayload);
    } catch (error) {
      if (isMissingNotificationsSupport(error)) return;
      throw error;
    }
    return;
  }

  const result = await supabaseClient
    .from("notifications")
    .insert(notificationPayload);

  if (result.error) {
    const message = String(result.error.message || "").toLowerCase();
    const isLegacySchema = ["severity", "actor_id", "actor_label", "metadata"].some((field) => message.includes(field));
    if (isLegacySchema) {
      const legacyResult = await supabaseClient
        .from("notifications")
        .insert({
          recipient_id: notificationPayload.recipient_id,
          kind: notificationPayload.kind,
          title: notificationPayload.title,
          body: notificationPayload.body,
          related_table: notificationPayload.related_table,
          related_id: notificationPayload.related_id
        });
      if (!legacyResult.error) return;
      if (isMissingNotificationsSupport(legacyResult.error)) return;
      throw legacyResult.error;
    }
    if (isMissingNotificationsSupport(result.error)) return;
    throw result.error;
  }
}

async function fetchSubmissionMessages(submissionId) {
  if (!submissionId || !supabaseClient) return [];
  const query = await supabaseClient
    .from("submission_messages")
    .select(`
      id,
      submission_id,
      audience,
      body,
      created_at,
      author:author_id (
        email,
        display_name
      )
    `)
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true });

  if (query.error) {
    const message = String(query.error.message || "").toLowerCase();
    if (message.includes("submission_messages") && (message.includes("does not exist") || message.includes("relation"))) {
      return [];
    }
    throw query.error;
  }

  return Array.isArray(query.data)
    ? query.data.map((item) => ({
        ...item,
        author_label: item.author?.display_name || item.author?.email || "Compte inconnu"
      }))
    : [];
}

function renderSubmissionMessages(messages) {
  if (!submissionDossierMessages) return;
  submissionDossierMessages.innerHTML = "";

  if (!messages.length) {
    const empty = document.createElement("div");
    empty.className = "meta meta--subtle";
    empty.textContent = "Aucun échange enregistré pour cette proposition.";
    submissionDossierMessages.appendChild(empty);
    return;
  }

  for (const item of messages) {
    const row = document.createElement("div");
    row.className = "admin__timeline-item";

    const title = document.createElement("strong");
    title.textContent = item.author_label || "Compte inconnu";

    const meta = document.createElement("div");
    meta.className = "meta meta--subtle";
    meta.textContent = `${item.audience === "submitter" ? "Visible contributeur" : "Interne"} · ${formatShortDate(item.created_at)}`;

    const body = document.createElement("div");
    body.className = "section-copy";
    body.textContent = item.body || "";

    row.appendChild(title);
    row.appendChild(meta);
    row.appendChild(body);
    submissionDossierMessages.appendChild(row);
  }
}

async function refreshActiveSubmissionMessages() {
  if (!activeSubmissionRecord?.id) {
    activeSubmissionMessages = [];
    renderSubmissionMessages([]);
    updateSubmissionMessageAvailability();
    return;
  }

  try {
    activeSubmissionMessages = await fetchSubmissionMessages(activeSubmissionRecord.id);
    renderSubmissionMessages(activeSubmissionMessages);
  } catch (error) {
    setMessage(`Dossier : ${getErrorMessage(error)}`, true);
  }
}

async function sendSubmissionMessage() {
  if (!submissionMessageBody || !submissionSendMessage) return;
  if (!activeSubmissionRecord?.id) {
    setMessage("Dossier : charge d’abord une proposition avant d’envoyer un message.", true);
    updateSubmissionMessageAvailability();
    return;
  }
  const body = submissionMessageBody.value.trim();
  if (!body) {
    setMessage("Dossier : écris un message avant l’envoi.", true);
    return;
  }

  setButtonBusy(submissionSendMessage, true, "Envoi...", "Envoyer au contributeur");
  try {
    const payload = {
      submission_id: activeSubmissionRecord.id,
      author_id: currentUser?.id || null,
      audience: "submitter",
      body
    };

    if (dicoApi?.createSubmissionMessage) {
      await dicoApi.createSubmissionMessage(payload);
    } else {
      const result = await supabaseClient.from("submission_messages").insert(payload);
      if (result.error) throw result.error;
    }

    await createInboxNotification(activeSubmissionRecord.submitted_by, {
      kind: "submission_feedback",
      severity: "warning",
      title: `Nouveau message éditorial : ${activeSubmissionRecord.term}`,
      body: "Un nouveau message de relecture est disponible sur votre proposition.",
      relatedTable: "term_submissions",
      relatedId: activeSubmissionRecord.id,
      metadata: {
        term: activeSubmissionRecord.term,
        category: activeSubmissionRecord.category || "",
        reviewer_comment: body,
        decision: "message",
        decided_at: new Date().toISOString()
      }
    });

    await logAction("submission_message_sent", "term_submissions", activeSubmissionRecord.id, {
      term: activeSubmissionRecord.term
    });

    submissionMessageBody.value = "";
    await refreshActiveSubmissionMessages();
    setMessage("Dossier : message envoyé au contributeur.");
  } catch (error) {
    setMessage(`Dossier : ${getErrorMessage(error)}`, true);
  } finally {
    setButtonBusy(submissionSendMessage, false, "Envoi...", "Envoyer au contributeur");
  }
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
    const richPayload = buildRichPayloadFromInputs();
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

    if (Object.keys(richPayload).length) {
      payload.rich_payload = richPayload;
    }

    const query = editingId
      ? supabaseClient.from("terms").update(payload).eq("id", editingId)
      : supabaseClient.from("terms").insert(payload).select("id").single();

    let { data, error } = await query;
    if (error) {
      if (isMissingRichPayloadSupport(error)) {
        setMessage("Termes : applique d’abord la migration SQL 019 pour enregistrer une fiche complète.", true);
        return;
      }
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
  let [termsQuery, mediaQuery, relationsQuery, canonicalTerms] = await Promise.all([
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
        rich_payload,
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
      .eq("relation_type", "related"),
    fetchCanonicalPublishedTerms()
  ]);

  if (termsQuery.error && isMissingRichPayloadSupport(termsQuery.error)) {
    termsQuery = await supabaseClient
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
      .order("term", { ascending: true });

    if (!termsQuery.error && Array.isArray(termsQuery.data)) {
      termsQuery.data = termsQuery.data.map((item) => ({ ...item, rich_payload: {} }));
    }
  }

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

  const dbTerms = baseTerms.map((item) => {
    const itemMedia = mediaByTermId.get(item.id) || [];
    return {
      ...item,
      category: item.categories?.name || "",
      related: relatedNamesByTermId.get(item.id) || [],
      media: itemMedia,
      media_urls: itemMedia.map((media) => media.url)
    };
  });
  const mergedBySlug = new Map();
  for (const item of dbTerms) mergedBySlug.set(String(item.slug || "").trim().toLowerCase(), item);
  for (const item of canonicalTerms) {
    const slug = String(item?.slug || "").trim().toLowerCase();
    if (!slug || mergedBySlug.has(slug)) continue;
    mergedBySlug.set(slug, {
      ...item,
      id: null,
      category: item.categories?.name || item.category || "",
      related: Array.isArray(item.related) ? item.related : [],
      media: [],
      media_urls: []
    });
  }
  terms = Array.from(mergedBySlug.values());
  applyTermsView();

  if (requestedTermId) {
    const target = terms.find((item) => item.id === requestedTermId);
    if (target) {
      requestedTermId = "";
      loadTerm(target);
    }
  }
}

async function fetchSubmissions() {
  let { data, error } = await supabaseClient
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
      rich_payload,
      status,
      reviewer_comment,
      submitted_by,
      reviewed_by,
      created_at
      ,
      updated_at,
      submitter:submitted_by (
        email,
        display_name
      ),
      reviewer:reviewed_by (
        email,
        display_name
      )
      `
    )
    .in("status", ["submitted", "validated", "resubmitted"])
    .order("created_at", { ascending: false });

  if (error && isMissingRichPayloadSupport(error)) {
    const legacyQuery = await supabaseClient
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
        reviewed_by,
        created_at,
        updated_at,
        submitter:submitted_by (
          email,
          display_name
        ),
        reviewer:reviewed_by (
          email,
          display_name
        )
        `
      )
      .in("status", ["submitted", "validated", "resubmitted"])
      .order("created_at", { ascending: false });

    data = Array.isArray(legacyQuery.data)
      ? legacyQuery.data.map((item) => ({ ...item, rich_payload: {} }))
      : [];
    error = legacyQuery.error;
  }

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
    submitter_email: item.submitter?.display_name || item.submitter?.email || "",
    reviewer_email: item.reviewer?.display_name || item.reviewer?.email || ""
  }));

  submissions = items;
  renderSubmissions(items);

  if (requestedSubmissionId) {
    const target = submissions.find((item) => item.id === requestedSubmissionId);
    if (target) {
      requestedSubmissionId = "";
      if (currentAdminSection === "submission") openSubmissionDossier(target);
      else loadSubmission(target);
    }
  }
}

async function fetchRecentDecisions() {
  if (!decisionList || !supabaseClient) return;

  let { data, error } = await supabaseClient
    .from("term_submissions")
    .select(`
      id,
      term,
      slug,
      category_id,
      definition,
      example,
      media_urls,
      rich_payload,
      status,
      reviewer_comment,
      submitted_by,
      reviewed_by,
      created_at,
      updated_at,
      submitter:submitted_by (
        email,
        display_name
      ),
      reviewer:reviewed_by (
        email,
        display_name
      )
    `)
    .in("status", ["accepted", "rejected", "resubmitted"])
    .order("updated_at", { ascending: false })
    .limit(40);

  if (error && isMissingRichPayloadSupport(error)) {
    const legacyQuery = await supabaseClient
      .from("term_submissions")
      .select(`
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
        reviewed_by,
        created_at,
        updated_at,
        submitter:submitted_by (
          email,
          display_name
        ),
        reviewer:reviewed_by (
          email,
          display_name
        )
      `)
      .in("status", ["accepted", "rejected", "resubmitted"])
      .order("updated_at", { ascending: false })
      .limit(40);

    data = Array.isArray(legacyQuery.data)
      ? legacyQuery.data.map((item) => ({ ...item, rich_payload: {} }))
      : [];
    error = legacyQuery.error;
  }

  if (error) {
    if (await handleAuthError(error, "Décisions")) return;
    setMessage(`Décisions : ${getErrorMessage(error)}`, true);
    return;
  }

  recentDecisions = (Array.isArray(data) ? data : []).map((item) => ({
    ...item,
    category: categories.find((category) => category.id === item.category_id)?.name || "",
    media_urls: Array.isArray(item.media_urls) ? item.media_urls : [],
    submitter_email: item.submitter?.display_name || item.submitter?.email || "",
    reviewer_email: item.reviewer?.display_name || item.reviewer?.email || ""
  }));
  applyDecisionView();

  if (requestedSubmissionId && currentAdminSection === "submission") {
    const target = recentDecisions.find((item) => item.id === requestedSubmissionId);
    if (target) {
      requestedSubmissionId = "";
      openSubmissionDossier(target);
    }
  }
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
  clearMetricsDisplay();
  setMetricsStatus("Suivi actif. Les métriques affichées couvrent les dernières 24 heures et les 30 derniers jours.");
  setMetricsUpdatedAt(new Date().toLocaleString("fr-CH"));

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
      appendMetricCard(metricsSummary, label, value);
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
        appendMetricRow(
          metricsTopPages,
          item.pageTitle || formatPathLabel(item.pagePath),
          `${item.views} vues · ${item.uniqueSessions} sessions`,
          formatPathLabel(item.pagePath)
        );
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
        const metaParts = [];
        if (item.bestCombo) metaParts.push(`combo ${item.bestCombo}`);
        if (item.bestStreak) metaParts.push(`série ${item.bestStreak}`);
        if (item.bestSeconds) metaParts.push(`${item.bestSeconds}s`);
        appendMetricRow(
          metricsTopGames,
          getGameLabel(item.gameKey),
          `${item.plays} parties · meilleur score ${item.bestScore}/${item.bestTotal || 0}`,
          metaParts.join(" · ") || "Score serveur"
        );
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
        const extras = [];
        if (item.modeLabel) extras.push(item.modeLabel);
        if (item.categoryLabel) extras.push(item.categoryLabel);
        if (item.bestCombo) extras.push(`combo ${item.bestCombo}`);
        if (item.bestStreak) extras.push(`série ${item.bestStreak}`);
        if (item.seconds) extras.push(`${item.seconds}s`);
        appendMetricRow(
          metricsRecent,
          getGameLabel(item.gameKey),
          `${item.score}/${item.total || 0}`,
          `${extras.join(" · ") || "Score enregistré"} · ${new Date(item.createdAt).toLocaleString("fr-CH")}`
        );
      }
    }
  }
}

async function fetchAdminMetrics() {
  if (!canViewStats || !metricsSummary || isLoadingMetrics) return;
  isLoadingMetrics = true;
  if (metricsRefresh) metricsRefresh.disabled = true;
  setMetricsStatus("Chargement des métriques en cours...");
  setMetricsUpdatedAt("");

  try {
    let payload = null;
    if (dicoApi?.fetchAdminMetrics) {
      payload = await dicoApi.fetchAdminMetrics();
    }
    renderAdminMetrics(payload || {});
  } catch (error) {
    if (await handleAuthError(error, "Suivi")) return;
    if (isMissingMetricsTableError(error)) {
      clearMetricsDisplay();
      setMetricsUpdatedAt("");
      setMetricsStatus(
        "Suivi inactif: appliquez d’abord `supabase/migrations/017_metrics_and_game_scores.sql` dans Supabase pour créer `page_views` et `game_scores`.",
        true
      );
      setMessage("Suivi : migration SQL 017 manquante côté Supabase.", true);
      return;
    }
    setMessage(`Suivi : ${getErrorMessage(error)}`, true);
    setMetricsUpdatedAt("");
    setMetricsStatus("Suivi indisponible pour le moment. Vérifiez l’API métriques et la base Supabase.", true);
  } finally {
    isLoadingMetrics = false;
    if (metricsRefresh) metricsRefresh.disabled = false;
  }
}

function refreshAdminSectionData(section) {
  const target = section || currentAdminSection;
  if (target === "accounts" && isSuperAdmin) {
    fetchProfiles();
    return;
  }
  if (target === "overview") {
    fetchSubmissions();
    fetchRecentDecisions();
    return;
  }
  if (target === "stats" && canViewStats) {
    fetchAdminMetrics();
    if (isSuperAdmin) fetchChatFeedback();
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
    const sourceRichPayload = source.rich_payload && typeof source.rich_payload === "object" ? source.rich_payload : {};
    const builtRichPayload = buildRichPayloadFromInputs();
    const richPayload = Object.keys(builtRichPayload).length ? builtRichPayload : sourceRichPayload;
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

    if (Object.keys(richPayload).length) {
      payload.rich_payload = richPayload;
    }
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
      if (isMissingRichPayloadSupport(insertError)) {
        setMessage("Propositions : applique d’abord la migration SQL 019 pour publier une fiche complète.", true);
        return;
      }
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

    await createInboxNotification(item.submitted_by, {
      kind: "submission_accepted",
      severity: "success",
      title: `Proposition validée : ${payload.term}`,
      body: reviewerComment
        ? `Votre proposition a été acceptée puis publiée. Retour éditorial disponible ci-dessous.`
        : "Votre proposition a été acceptée puis publiée.",
      relatedTable: "term_submissions",
      relatedId: item.id,
      metadata: {
        term: payload.term,
        category: category?.name || source.category || "",
        reviewer_comment: reviewerComment,
        decision: "accepted",
        decided_at: new Date().toISOString()
      }
    });

    await logAction("submission_accepted", "term_submissions", item.id, { term: payload.term });
    setMessage("Propositions : proposition acceptée.");
    clearForm();
    await fetchTerms();
    await fetchSubmissions();
    await fetchRecentDecisions();
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
    const reviewerComment = reviewerCommentInput.value.trim() || null;
    const { error } = await supabaseClient
      .from("term_submissions")
      .update({
        status: "rejected",
        reviewer_comment: reviewerComment,
        reviewed_by: currentUser ? currentUser.id : null
      })
      .eq("id", item.id);

    if (error) {
      if (await handleAuthError(error, "Propositions")) return;
      setMessage(`Propositions: ${getErrorMessage(error)}`, true);
      return;
    }

    await createInboxNotification(item.submitted_by, {
      kind: reviewerComment ? "submission_feedback" : "submission_rejected",
      severity: reviewerComment ? "warning" : "danger",
      title: reviewerComment
        ? `Proposition à corriger : ${item.term}`
        : `Proposition refusée : ${item.term}`,
      body: reviewerComment
        ? "La proposition doit être améliorée avant une nouvelle soumission. Le retour éditorial est détaillé ci-dessous."
        : "La proposition a été refusée sans commentaire détaillé.",
      relatedTable: "term_submissions",
      relatedId: item.id,
      metadata: {
        term: item.term,
        category: item.category || "",
        reviewer_comment: reviewerComment,
        decision: reviewerComment ? "feedback" : "rejected",
        decided_at: new Date().toISOString()
      }
    });

    await logAction("submission_rejected", "term_submissions", item.id, { term: item.term });

    setMessage("Propositions : proposition refusée.");
    clearForm();
    await fetchSubmissions();
    await fetchRecentDecisions();
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
  clearMessage();
}

async function updateProfile(profileId, role, active, controls) {
  if (!isSuperAdmin) return;
  if (updatingProfileId) return;
  const previousProfile = profiles.find((item) => item.id === profileId) || null;
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
    if (previousProfile && (previousProfile.role !== role || previousProfile.active !== active)) {
      const roleLabel = ROLE_LABELS[role] || role;
      const previousRoleLabel = ROLE_LABELS[previousProfile.role] || previousProfile.role || "inconnu";
      const stateLabel = active ? "actif" : "inactif";
      await createInboxNotification(profileId, {
        kind: "role_updated",
        severity: "info",
        title: "Votre accès a été mis à jour",
        body: "Votre rôle ou l’état de votre compte a été modifié par l’administration.",
        relatedTable: "profiles",
        relatedId: profileId,
        metadata: {
          previous_role: previousRoleLabel,
          next_role: roleLabel,
          previous_active: previousProfile.active !== false,
          next_active: active,
          state_label: stateLabel
        }
      });
    }
    setMessage("Gestion des rôles : profil utilisateur mis à jour.");
    await fetchProfiles();
    await fetchRecentDecisions();
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

function scheduleDecisionFilter() {
  if (decisionFilterRafId) cancelAnimationFrame(decisionFilterRafId);
  decisionFilterRafId = requestAnimationFrame(() => {
    decisionFilterRafId = 0;
    applyDecisionView();
  });
}

async function loadUser() {
  if (!supabaseHelpers || !supabaseHelpers.hasConfig()) {
    setMessage("Configuration Supabase manquante.", true);
    return;
  }

  setMessage("Chargement de la session staff...");
  adminPermissionsReady = false;
  adminRole.textContent = "Rôle : chargement...";
  updateAdminContextCopy();

  try {
    supabaseClient = supabaseHelpers.getClient();
    await supabaseHelpers.waitForInitialSession?.();
    currentUser = await supabaseHelpers.getCurrentUser();

    if (!currentUser) {
      window.location.href = "auth.html";
      return;
    }

    adminUser.textContent = `Utilisateur : ${currentUser.email}`;
    userProfile = normalizeProfile(await supabaseHelpers.getProfile(currentUser.id));
    canManageTerms = canManageFromProfile(userProfile);
    isSuperAdmin = isSuperAdminProfile(userProfile);
    canViewStats = canManageTerms;
    const roleLabel = ROLE_LABELS[userProfile?.role] || "Lecture seule";
    const activeLabel = userProfile?.active === false ? " (inactif)" : "";
    adminRole.textContent = `Rôle : ${roleLabel}${activeLabel}`;

    if (!canManageTerms) {
      window.location.href = "index.html";
      return;
    }

    if (usersPanel && !canAccessAdminFeature(usersPanel.dataset.adminAccess || "") && currentAdminSection === "accounts") {
      currentAdminSection = "overview";
    }
    if (chatFeedbackPanel && currentAdminSection === "stats" && !isSuperAdmin) {
      // Formateurs voient les métriques et l'historique, mais pas le feedback assistant.
      chatFeedbackPanel.hidden = true;
    }
    if (!canViewStats && currentAdminSection === "stats") {
      currentAdminSection = "overview";
    }
    adminPermissionsReady = true;
    updateAdminContextCopy();
    setAdminSection(currentAdminSection);

    await fetchCategories();
    await fetchTerms();
    await fetchSubmissions();
    await fetchRecentDecisions();
    await fetchAudit();
    if (canViewStats) {
      await fetchAdminMetrics();
    }
    if (isSuperAdmin) {
      await fetchProfiles();
      await fetchChatFeedback();
    }
  } catch (error) {
    canManageTerms = false;
    isSuperAdmin = false;
    canViewStats = false;
    adminPermissionsReady = false;
    adminRole.textContent = "Rôle : indisponible";
    updateAdminContextCopy();
    for (const button of adminSectionButtons) {
      button.hidden = Boolean(button.dataset.adminAccess);
    }
    setAdminSection("overview");
    setMessage(`Chargement admin : ${getErrorMessage(error, "profil introuvable ou inaccessible.")}`, true);
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
if (decisionSearch) decisionSearch.addEventListener("input", scheduleDecisionFilter);
if (decisionFilter) decisionFilter.addEventListener("change", applyDecisionView);
if (submissionOpenCorpus) {
  submissionOpenCorpus.addEventListener("click", () => {
    if (!activeSubmissionRecord) return;
    loadSubmission(activeSubmissionRecord);
  });
}
if (submissionBackOverview) {
  submissionBackOverview.addEventListener("click", () => {
    if (!adminPermissionsReady) return;
    setAdminSection("overview");
    syncAdminUrl({ section: "overview" });
  });
}
if (submissionSendMessage) submissionSendMessage.addEventListener("click", sendSubmissionMessage);
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
    if (!adminPermissionsReady) return;
    if (button.hidden) return;
    if (!canAccessAdminFeature(button.dataset.adminAccess || "")) return;
    setAdminSection(target);
    syncAdminUrl({ section: target });
    refreshAdminSectionData(target);
  });
  button.addEventListener("keydown", (event) => {
    if (!adminPermissionsReady || button.hidden) return;
    if (!canAccessAdminFeature(button.dataset.adminAccess || "")) return;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusAdminSectionButton(1);
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusAdminSectionButton(-1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusAdminSectionButton("first");
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      focusAdminSectionButton("last");
      return;
    }
    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      button.click();
    }
  });
}
for (const btn of workflowButtons) {
  btn.addEventListener("click", () => {
    currentStatusFilter = btn.dataset.termFilter || "all";
    if (adminPermissionsReady) setAdminSection("corpus");
    syncAdminUrl({ section: "corpus" });
    applyTermsView();
  });
}

updateSubmissionMessageAvailability();
loadUser();
