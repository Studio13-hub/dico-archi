const accountMessage = document.getElementById("account-message");
const accountEmail = document.getElementById("account-email");
const accountRole = document.getElementById("account-role");
const accountActive = document.getElementById("account-active");
const accountLoginLink = document.getElementById("account-login-link");
const accountAdminLink = document.getElementById("account-admin-link");
const accountLogout = document.getElementById("account-logout");
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

function renderGuestState() {
  accountEmail.textContent = "-";
  accountRole.textContent = "Public";
  accountActive.textContent = "Consultation";
  accountLoginLink.hidden = false;
  accountLoginLink.textContent = "Se connecter";
  accountLoginLink.href = "auth.html";
  accountAdminLink.hidden = true;
  accountLogout.hidden = true;
  setMessage("Tu es en mode Public: consultation libre des definitions.");
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

  accountEmail.textContent = user.email || "-";
  accountRole.textContent = roleLabel(normalized.role);
  accountActive.textContent = normalized.active ? "Actif" : "Inactif";
  accountLoginLink.hidden = false;
  accountLoginLink.textContent = "Changer de compte";
  accountLoginLink.href = "auth.html";
  accountAdminLink.hidden = !isStaff;
  accountLogout.hidden = false;

  if (normalized.active) {
    setMessage("Compte charge. Utilise les liens selon ton role.");
  } else {
    setMessage("Compte inactif. Contacte un super admin.", true);
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
