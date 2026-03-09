const contribMessage = document.getElementById("contrib-message");
const contribUser = document.getElementById("contrib-user");
const contribList = document.getElementById("contrib-list");

const termInput = document.getElementById("term");
const categoryInput = document.getElementById("category");
const definitionInput = document.getElementById("definition");
const exampleInput = document.getElementById("example");
const relatedInput = document.getElementById("related");
const imageUrlInput = document.getElementById("image-url");
const submitButton = document.getElementById("submit");
const resetButton = document.getElementById("reset");

let supabaseClient = null;
let currentUser = null;
let currentProfile = null;
let isSubmitting = false;

function setMessage(text, isError = false) {
  contribMessage.textContent = text;
  contribMessage.style.color = isError ? "#d94e2b" : "#1f7a70";
}

function hasSupabaseConfig() {
  return Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
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

async function handleAuthError(error) {
  if (!isAuthError(error)) return false;
  setMessage("Session expiree. Reconnecte-toi pour contribuer.", true);
  setFormDisabled(true);
  try {
    if (supabaseClient) await supabaseClient.auth.signOut();
  } catch (_err) {
    // Ignore sign out errors.
  }
  return true;
}

function clearForm() {
  termInput.value = "";
  categoryInput.value = "";
  definitionInput.value = "";
  exampleInput.value = "";
  relatedInput.value = "";
  imageUrlInput.value = "";
}

function setFormDisabled(disabled) {
  termInput.disabled = disabled;
  categoryInput.disabled = disabled;
  definitionInput.disabled = disabled;
  exampleInput.disabled = disabled;
  relatedInput.disabled = disabled;
  imageUrlInput.disabled = disabled;
  submitButton.disabled = disabled;
  resetButton.disabled = disabled;
}

function setSubmitBusy(busy) {
  if (!submitButton) return;
  if (busy) {
    submitButton.dataset.idleLabel = submitButton.textContent || "Envoyer";
    submitButton.textContent = "Envoi...";
    submitButton.disabled = true;
    return;
  }
  submitButton.textContent = submitButton.dataset.idleLabel || "Envoyer";
  submitButton.disabled = false;
}

function normalizeRelated(raw) {
  return raw
    .split("|")
    .map((value) => value.trim())
    .filter(Boolean);
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
  if (!url) return true;
  if (!isSafeImageUrl(url)) return false;
  if (isPdfUrl(url)) return true;
  return isLikelyImageUrl(url);
}

function renderList(list) {
  contribList.innerHTML = "";

  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.textContent = "Aucune proposition pour le moment.";
    contribList.appendChild(empty);
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

    const status = document.createElement("div");
    status.className = `admin__row-status ${item.status || "pending"}`;
    status.textContent = item.status || "pending";

    const comment = document.createElement("div");
    comment.className = "admin__row-meta";
    comment.textContent = item.reviewer_comment
      ? `Commentaire: ${item.reviewer_comment}`
      : "Aucun commentaire";

    row.appendChild(title);
    row.appendChild(info);
    row.appendChild(status);
    row.appendChild(comment);

    contribList.appendChild(row);
  }
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
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    if (!currentUser) {
      currentProfile = null;
      setFormDisabled(true);
      setMessage("Session terminee. Reconnecte-toi pour contribuer.", true);
      return;
    }
  });

  if (!currentUser) {
    setMessage("Connecte-toi dans la page Compte pour contribuer.", true);
    setFormDisabled(true);
    return;
  }

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
    profile = fallback.error ? null : fallback.data;
  }

  currentProfile = {
    role: profile?.role || (profile?.is_editor ? "maitre_apprentissage" : "apprenti"),
    active: profile?.active !== false
  };

  if (!currentProfile.active) {
    setMessage("Ton compte est inactif. Contacte un super admin.", true);
    setFormDisabled(true);
    return;
  }

  setFormDisabled(false);
  contribUser.textContent = `Utilisateur: ${currentUser.email} · Role: ${currentProfile.role}`;
  await fetchMySubmissions();
}

async function fetchMySubmissions() {
  const { data, error } = await supabaseClient
    .from("term_submissions")
    .select("id, term, category, definition, status, reviewer_comment, created_at")
    .eq("submitted_by", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (await handleAuthError(error)) return;
    setMessage(error.message, true);
    return;
  }

  renderList(data || []);
}

async function submitProposal() {
  if (!currentUser || (currentProfile && currentProfile.active === false)) return;
  if (isSubmitting) return;
  isSubmitting = true;
  setSubmitBusy(true);

  try {
    const term = termInput.value.trim();
    const category = categoryInput.value.trim();
    const definition = definitionInput.value.trim();
    const example = exampleInput.value.trim();
    const related = normalizeRelated(relatedInput.value || "");
    const imageUrl = imageUrlInput.value.trim();
    if (!isSupportedMediaUrl(imageUrl)) {
      setMessage("Media URL invalide (http/https + extension image ou .pdf).", true);
      return;
    }

    if (!term || !category || !definition) {
      setMessage("Terme, categorie et definition sont requis.", true);
      return;
    }

    const payload = {
      term,
      category,
      definition,
      example,
      related,
      image_url: imageUrl || null,
      submitted_by: currentUser.id,
      submitter_email: currentUser.email
    };

    const { error } = await supabaseClient.from("term_submissions").insert(payload);
    if (error) {
      if (await handleAuthError(error)) return;
      setMessage(error.message, true);
      return;
    }

    setMessage("Proposition envoyee. Merci !");
    clearForm();
    await fetchMySubmissions();
  } finally {
    isSubmitting = false;
    setSubmitBusy(false);
  }
}

submitButton.addEventListener("click", submitProposal);
resetButton.addEventListener("click", clearForm);

loadUser();
