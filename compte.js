const accountMessage = document.getElementById("account-message");
const accountEmail = document.getElementById("account-email");
const accountRole = document.getElementById("account-role");
const accountActive = document.getElementById("account-active");
const accountLoginLink = document.getElementById("account-login-link");
const accountContribLink = document.getElementById("account-contrib-link");
const accountGamesLink = document.getElementById("account-games-link");
const accountAdminLink = document.getElementById("account-admin-link");
const accountLogout = document.getElementById("account-logout");
const accountAccessLabel = document.getElementById("account-access-label");
const accountAccessCopy = document.getElementById("account-access-copy");
const accountNextStepTitle = document.getElementById("account-next-step-title");
const accountNextStepCopy = document.getElementById("account-next-step-copy");
const accountSubmissionCount = document.getElementById("account-submission-count");
const accountSubmissionCopy = document.getElementById("account-submission-copy");
const accountSubmissionsPanel = document.getElementById("account-submissions-panel");
const accountSubmissionsEmpty = document.getElementById("account-submissions-empty");
const accountSubmissionsList = document.getElementById("account-submissions-list");
const supabaseHelpers = window.DicoArchiSupabase;

function setMessage(text, isError = false) {
  accountMessage.textContent = text;
  accountMessage.style.color = isError ? "#d94e2b" : "#1f7a70";
}

function normalizeProfile(profile) {
  return supabaseHelpers?.normalizeProfile(profile) || { role: "apprenti", active: true };
}

function roleLabel(role) {
  return supabaseHelpers?.getRoleLabel(role) || "Apprenti";
}

function getSubmissionLabel(status) {
  if (status === "accepted") return "Acceptée";
  if (status === "rejected") return "Refusée";
  if (status === "validated") return "À relire";
  if (status === "submitted") return "Envoyée";
  return "Brouillon";
}

function renderSubmissions(items, isGuest = false) {
  if (!accountSubmissionsPanel || !accountSubmissionsEmpty || !accountSubmissionsList) return;

  accountSubmissionsList.innerHTML = "";

  if (isGuest) {
    accountSubmissionsEmpty.style.display = "block";
    accountSubmissionsEmpty.textContent =
      "Connectez-vous pour suivre vos propositions et leur état de validation.";
    return;
  }

  if (!items.length) {
    accountSubmissionsEmpty.style.display = "block";
    accountSubmissionsEmpty.textContent = "Aucune proposition enregistrée pour l’instant.";
    return;
  }

  accountSubmissionsEmpty.style.display = "none";

  for (const item of items.slice(0, 5)) {
    const row = document.createElement("div");
    row.className = "admin__row";

    const title = document.createElement("div");
    title.className = "admin__row-title";
    title.textContent = item.term || "Proposition";

    const info = document.createElement("div");
    info.className = "admin__row-info";
    info.textContent = `${item.category || "Sans catégorie"} · ${getSubmissionLabel(item.status)}`;

    const meta = document.createElement("div");
    meta.className = "admin__row-meta";
    const createdAt = item.created_at ? new Date(item.created_at).toLocaleDateString("fr-CH") : "-";
    const reviewerComment = item.reviewer_comment ? ` · Note : ${item.reviewer_comment}` : "";
    const mediaCount = Array.isArray(item.media_urls) ? item.media_urls.length : 0;
    const mediaLabel = mediaCount ? ` · ${mediaCount} média proposé${mediaCount > 1 ? "s" : ""}` : "";
    meta.textContent = `Envoyée le ${createdAt}${mediaLabel}${reviewerComment}`;

    row.appendChild(title);
    row.appendChild(info);
    row.appendChild(meta);
    accountSubmissionsList.appendChild(row);
  }
}

function renderGuestState() {
  accountEmail.textContent = "-";
  accountRole.textContent = "Public";
  accountActive.textContent = "Consultation";
  accountAccessLabel.textContent = "Consultation publique";
  accountAccessCopy.textContent =
    "Lecture libre du dictionnaire, des catégories, des fiches et des jeux pédagogiques.";
  accountNextStepTitle.textContent = "Se connecter";
  accountNextStepCopy.textContent =
    "Connectez-vous pour proposer des termes ou accéder aux espaces internes selon votre rôle.";
  accountSubmissionCount.textContent = "0";
  accountSubmissionCopy.textContent = "Aucun suivi disponible sans session ouverte.";
  accountLoginLink.hidden = false;
  accountLoginLink.textContent = "Se connecter";
  accountLoginLink.href = "auth.html";
  accountContribLink.hidden = false;
  accountGamesLink.hidden = false;
  accountAdminLink.hidden = true;
  accountLogout.hidden = true;
  renderSubmissions([], true);
  setMessage("Tu es en mode Public: consultation libre des définitions.");
}

async function loadAccount() {
  if (!supabaseHelpers || !supabaseHelpers.hasConfig()) {
    setMessage("Configuration Supabase manquante.", true);
    return;
  }

  const client = supabaseHelpers.getClient();
  const user = await supabaseHelpers.getCurrentUser();
  if (!user) {
    renderGuestState();
    return;
  }

  const normalized = normalizeProfile(await supabaseHelpers.getProfile(user.id));
  const isStaff = supabaseHelpers.isStaffProfile(normalized);
  const submissions = await supabaseHelpers.fetchMySubmissions(user.id).catch(() => []);

  accountEmail.textContent = user.email || "-";
  accountRole.textContent = roleLabel(normalized.role);
  accountActive.textContent = normalized.active ? "Actif" : "Inactif";
  accountSubmissionCount.textContent = String(submissions.length);
  accountLoginLink.hidden = false;
  accountLoginLink.textContent = "Changer de compte";
  accountLoginLink.href = "auth.html";
  accountContribLink.hidden = false;
  accountGamesLink.hidden = false;
  accountAdminLink.hidden = !isStaff;
  accountLogout.hidden = false;

  if (normalized.role === "super_admin") {
    accountAccessLabel.textContent = "Pilotage complet";
    accountAccessCopy.textContent =
      "Gestion des contenus, des utilisateurs, des validations et du feedback chatbot.";
    accountNextStepTitle.textContent = "Ouvrir l’admin";
    accountNextStepCopy.textContent =
      "Contrôlez les termes publiés, les propositions et les comptes depuis l’espace d’administration.";
    accountSubmissionCopy.textContent =
      "Vos propositions personnelles restent visibles ici, mais votre rôle principal est le pilotage.";
  } else if (normalized.role === "formateur") {
    accountAccessLabel.textContent = "Validation éditoriale";
    accountAccessCopy.textContent =
      "Correction, validation et relecture des contenus en attente avant publication.";
    accountNextStepTitle.textContent = "Relire ou corriger";
    accountNextStepCopy.textContent =
      "Passez par l’admin pour valider les propositions ou améliorer le corpus publié.";
    accountSubmissionCopy.textContent =
      submissions.length
        ? `${submissions.length} proposition(s) personnelle(s) enregistrée(s).`
        : "Aucune proposition personnelle enregistrée pour l’instant.";
  } else {
    accountAccessLabel.textContent = "Contribution encadrée";
    accountAccessCopy.textContent =
      "Proposez des termes et suivez leur validation avant publication dans le dictionnaire.";
    accountNextStepTitle.textContent = "Envoyer une proposition";
    accountNextStepCopy.textContent =
      "Ajoutez un terme avec une définition claire et un exemple pour alimenter le dictionnaire.";
    accountSubmissionCopy.textContent =
      submissions.length
        ? `${submissions.length} proposition(s) en suivi sur votre compte.`
        : "Aucune proposition envoyée pour l’instant.";
  }

  renderSubmissions(submissions);

  if (normalized.active) {
    setMessage("Compte chargé. Utilisez les actions adaptées à votre rôle.");
  } else {
    setMessage("Compte inactif. Contactez un super admin.", true);
  }

  accountLogout.addEventListener("click", async () => {
    await client.auth.signOut();
    window.location.href = "index.html";
  });

  supabaseHelpers.onAuthStateChange((_event, _session, nextUser) => {
    if (!nextUser) renderGuestState();
  });
}

loadAccount();
