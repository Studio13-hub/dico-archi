const accountMessage = document.getElementById("account-message");
const accountEmail = document.getElementById("account-email");
const accountRole = document.getElementById("account-role");
const accountActive = document.getElementById("account-active");
const accountLoginLink = document.getElementById("account-login-link");
const accountAdminLink = document.getElementById("account-admin-link");
const accountLogout = document.getElementById("account-logout");

function setMessage(text, isError = false) {
  accountMessage.textContent = text;
  accountMessage.style.color = isError ? "#d94e2b" : "#1f7a70";
}

function hasSupabaseConfig() {
  return Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
}

function normalizeProfile(profile) {
  if (!profile) return { role: "apprenti", active: true, is_editor: false };
  return {
    role: profile.role || (profile.is_editor ? "maitre_apprentissage" : "apprenti"),
    active: profile.active !== false,
    is_editor: Boolean(profile.is_editor)
  };
}

function isStaffProfile(profile) {
  if (!profile || profile.active === false) return false;
  return profile.role === "super_admin" || profile.role === "maitre_apprentissage" || profile.is_editor;
}

function roleLabel(role) {
  if (role === "super_admin") return "Super admin";
  if (role === "maitre_apprentissage") return "Maitre apprentissage";
  return "Apprenti";
}

function renderGuestState() {
  accountEmail.textContent = "-";
  accountRole.textContent = "Visiteur";
  accountActive.textContent = "Non connecte";
  accountLoginLink.hidden = false;
  accountLoginLink.textContent = "Se connecter";
  accountLoginLink.href = "auth.html";
  accountAdminLink.hidden = true;
  accountLogout.hidden = true;
  setMessage("Connecte-toi pour voir ton role et tes acces.");
}

async function loadAccount() {
  if (!hasSupabaseConfig()) {
    setMessage("Configuration Supabase manquante.", true);
    return;
  }

  const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  });

  const { data } = await client.auth.getUser();
  const user = data?.user || null;
  if (!user) {
    renderGuestState();
    return;
  }

  let profile = null;
  const withRoles = await client.from("profiles").select("role, active, is_editor").eq("id", user.id).single();
  if (!withRoles.error) {
    profile = withRoles.data;
  } else {
    const fallback = await client.from("profiles").select("is_editor").eq("id", user.id).single();
    if (!fallback.error) profile = fallback.data;
  }

  const normalized = normalizeProfile(profile);
  const isStaff = isStaffProfile(normalized);

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

  client.auth.onAuthStateChange((_event, session) => {
    const nextUser = session?.user || null;
    if (!nextUser) {
      renderGuestState();
    }
  });
}

loadAccount();
