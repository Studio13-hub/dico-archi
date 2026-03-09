function hasSupabaseConfig() {
  return Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
}

function isStaffProfile(profile) {
  if (!profile) return false;
  if (profile.active === false) return false;
  if (profile.role === "super_admin" || profile.role === "maitre_apprentissage") return true;
  return Boolean(profile.is_editor);
}

function getRoleLabel(profile) {
  if (!profile) return "Visiteur";
  const role = profile.role || (profile.is_editor ? "maitre_apprentissage" : "apprenti");
  if (role === "super_admin") return "Super admin";
  if (role === "maitre_apprentissage") return "Maitre apprentissage";
  return "Apprenti";
}

function setStatusText(text) {
  const nodes = document.querySelectorAll("[data-nav-status]");
  for (const node of nodes) node.textContent = text;
}

function setAuthLinks({ user }) {
  const nodes = document.querySelectorAll("[data-nav-auth]");
  for (const node of nodes) {
    node.href = user ? "compte.html" : "auth.html";
    node.textContent = user ? "Mon compte" : "Connexion";
    node.hidden = false;
  }
}

function setAdminVisibility(isStaff) {
  const nodes = document.querySelectorAll("[data-nav-admin]");
  for (const node of nodes) node.hidden = !isStaff;
}

function setLogoutVisibility(visible) {
  const nodes = document.querySelectorAll("[data-nav-logout]");
  for (const node of nodes) node.hidden = !visible;
}

function applyLoggedOutState() {
  setStatusText("Non connecte");
  setAuthLinks({ user: null });
  setAdminVisibility(false);
  setLogoutVisibility(false);
}

async function initNav() {
  applyLoggedOutState();

  if (!hasSupabaseConfig()) return;

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
  if (!user) return;

  let profile = null;
  const withRoles = await client.from("profiles").select("role, active, is_editor").eq("id", user.id).single();
  if (!withRoles.error) {
    profile = withRoles.data;
  } else {
    const fallback = await client.from("profiles").select("is_editor").eq("id", user.id).single();
    if (!fallback.error) profile = fallback.data;
  }

  const isStaff = isStaffProfile(profile);
  const roleLabel = getRoleLabel(profile);

  setStatusText(`Connecte: ${user.email} · ${roleLabel}`);
  setAuthLinks({ user });
  setAdminVisibility(isStaff);
  setLogoutVisibility(true);

  const logoutButtons = document.querySelectorAll("[data-nav-logout]");
  for (const button of logoutButtons) {
    button.addEventListener("click", async () => {
      await client.auth.signOut();
      window.location.href = "index.html";
    });
  }

  client.auth.onAuthStateChange(async (_event, session) => {
    const nextUser = session?.user || null;
    if (!nextUser) {
      applyLoggedOutState();
      return;
    }

    let nextProfile = null;
    const withRolesState = await client
      .from("profiles")
      .select("role, active, is_editor")
      .eq("id", nextUser.id)
      .single();
    if (!withRolesState.error) {
      nextProfile = withRolesState.data;
    } else {
      const fallbackState = await client.from("profiles").select("is_editor").eq("id", nextUser.id).single();
      if (!fallbackState.error) nextProfile = fallbackState.data;
    }

    setStatusText(`Connecte: ${nextUser.email} · ${getRoleLabel(nextProfile)}`);
    setAuthLinks({ user: nextUser });
    setAdminVisibility(isStaffProfile(nextProfile));
    setLogoutVisibility(true);
  });
}

initNav();
