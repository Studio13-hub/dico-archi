const adminMessage = document.getElementById("admin-message");
const adminUser = document.getElementById("admin-user");
const adminRole = document.getElementById("admin-role");
const adminLogout = document.getElementById("admin-logout");

const termInput = document.getElementById("term");
const categoryInput = document.getElementById("category");
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
const auditList = document.getElementById("audit-list");
const auditEmpty = document.getElementById("audit-empty");

let supabaseClient = null;
let currentUser = null;
let isEditor = false;
let terms = [];
let editingId = null;
let editingSubmission = null;

function setMessage(text, isError = false) {
  adminMessage.textContent = text;
  adminMessage.style.color = isError ? "#d94e2b" : "#1f7a70";
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
    info.textContent = `${item.category} · ${item.definition}`;

    const actions = document.createElement("div");
    actions.className = "admin__row-actions";

    const editButton = document.createElement("button");
    editButton.className = "ghost";
    editButton.textContent = "Modifier";
    editButton.addEventListener("click", () => loadTerm(item));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Supprimer";
    deleteButton.addEventListener("click", () => removeTerm(item));

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
    loadButton.textContent = "Charger";
    loadButton.addEventListener("click", () => loadSubmission(item, row));

    const approveButton = document.createElement("button");
    approveButton.textContent = "Accepter";
    approveButton.addEventListener("click", () => approveSubmission(item));

    const rejectButton = document.createElement("button");
    rejectButton.className = "ghost";
    rejectButton.textContent = "Refuser";
    rejectButton.addEventListener("click", () => rejectSubmission(item));

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

function loadTerm(item) {
  editingId = item.id;
  editingSubmission = null;
  termInput.value = item.term || "";
  categoryInput.value = item.category || "";
  definitionInput.value = item.definition || "";
  exampleInput.value = item.example || "";
  relatedInput.value = (item.related || []).join(" | ");
  imageUrlInput.value = item.image_url || "";
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
  definitionInput.value = item.definition || "";
  exampleInput.value = item.example || "";
  relatedInput.value = (item.related || []).join(" | ");
  imageUrlInput.value = item.image_url || "";
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

async function removeTerm(item) {
  if (!isEditor) return;
  const confirmed = confirm(`Supprimer le terme "${item.term}" ?`);
  if (!confirmed) return;

  const { error } = await supabaseClient.from("terms").delete().eq("id", item.id);
  if (error) {
    setMessage(error.message, true);
    return;
  }

  await logAction("term_deleted", "terms", item.id, { term: item.term });
  setMessage("Terme supprime.");
  await fetchTerms();
  await fetchAudit();
}

async function uploadImage(file) {
  if (!file) return "";
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
  if (!isEditor) return;

  const term = termInput.value.trim();
  const category = categoryInput.value.trim();
  const definition = definitionInput.value.trim();
  const example = exampleInput.value.trim();
  const related = normalizeRelated(relatedInput.value || "");

  if (!term || !category || !definition) {
    setMessage("Terme, categorie et definition sont requis.", true);
    return;
  }

  let imageUrl = imageUrlInput.value.trim();
  if (imageFileInput.files && imageFileInput.files[0]) {
    try {
      imageUrl = await uploadImage(imageFileInput.files[0]);
      imageUrlInput.value = imageUrl;
    } catch (error) {
      setMessage(error.message, true);
      return;
    }
  }

  const payload = {
    term,
    category,
    definition,
    example,
    related,
    image_url: imageUrl || null
  };

  const query = editingId
    ? supabaseClient.from("terms").update(payload).eq("id", editingId)
    : supabaseClient.from("terms").insert(payload).select("id").single();

  const { data, error } = await query;
  if (error) {
    setMessage(error.message, true);
    return;
  }

  const action = editingId ? "term_updated" : "term_created";
  const entityId = editingId || data?.id;
  await logAction(action, "terms", entityId, { term });

  setMessage(editingId ? "Terme mis a jour." : "Terme ajoute.");
  clearForm();
  await fetchTerms();
  await fetchAudit();
}

async function fetchTerms() {
  const { data, error } = await supabaseClient
    .from("terms")
    .select("id, term, category, definition, example, related, image_url")
    .order("term", { ascending: true });

  if (error) {
    setMessage(error.message, true);
    return;
  }

  terms = data || [];
  renderTable(terms);
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
    setMessage(error.message, true);
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
    setMessage(error.message, true);
    return;
  }

  renderAudit(data || []);
}

async function approveSubmission(item) {
  const source = editingSubmission && editingSubmission.id === item.id ? editingSubmission : item;
  const payload = {
    term: termInput.value.trim() || source.term,
    category: categoryInput.value.trim() || source.category,
    definition: definitionInput.value.trim() || source.definition,
    example: exampleInput.value.trim() || source.example,
    related: normalizeRelated(relatedInput.value || source.related?.join(" | ") || ""),
    image_url: imageUrlInput.value.trim() || source.image_url
  };

  const { error: insertError } = await supabaseClient.from("terms").insert(payload).select("id").single();
  if (insertError) {
    setMessage(insertError.message, true);
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
      reviewer_comment: reviewerCommentInput.value.trim() || null,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", item.id);

  if (updateError) {
    setMessage(updateError.message, true);
    return;
  }

  await logAction("submission_accepted", "term_submissions", item.id, { term: payload.term });

  setMessage("Proposition acceptee.");
  clearForm();
  await fetchTerms();
  await fetchSubmissions();
  await fetchAudit();
}

async function rejectSubmission(item) {
  const confirmed = confirm(`Refuser la proposition "${item.term}" ?`);
  if (!confirmed) return;

  const { error } = await supabaseClient
    .from("term_submissions")
    .update({
      status: "rejected",
      reviewer_comment: reviewerCommentInput.value.trim() || null,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", item.id);

  if (error) {
    setMessage(error.message, true);
    return;
  }

  await logAction("submission_rejected", "term_submissions", item.id, { term: item.term });

  setMessage("Proposition refusee.");
  clearForm();
  await fetchSubmissions();
  await fetchAudit();
}

function filterTerms() {
  const query = adminSearch.value.trim().toLowerCase();
  if (!query) {
    renderTable(terms);
    return;
  }
  const filtered = terms.filter((item) =>
    [item.term, item.category, item.definition, item.example, ...(item.related || [])]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
  renderTable(filtered);
}

async function loadUser() {
  if (!hasSupabaseConfig()) {
    setMessage("Configuration Supabase manquante.", true);
    return;
  }

  supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  const { data } = await supabaseClient.auth.getUser();
  currentUser = data?.user || null;

  if (!currentUser) {
    setMessage("Connecte-toi dans la page Compte.", true);
    return;
  }

  adminUser.textContent = `Utilisateur: ${currentUser.email}`;

  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("is_editor")
    .eq("id", currentUser.id)
    .single();

  if (error) {
    setMessage(error.message, true);
    return;
  }

  isEditor = Boolean(profile?.is_editor);
  adminRole.textContent = `Role: ${isEditor ? "Editeur" : "Lecture seule"}`;

  if (!isEditor) {
    setMessage("Tu n'as pas les droits pour modifier.", true);
  }

  await fetchTerms();
  await fetchSubmissions();
  await fetchAudit();
}

async function logout() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  setMessage("Deconnecte.");
}

saveButton.addEventListener("click", saveTerm);
resetButton.addEventListener("click", clearForm);
adminSearch.addEventListener("input", filterTerms);
adminLogout.addEventListener("click", logout);

loadUser();
