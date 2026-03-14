const supabaseHelpers = window.DicoArchiSupabase;

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
  setStatusText("Public · consultation");
  setAuthLinks({ user: null });
  setAdminVisibility(false);
  setLogoutVisibility(false);
}

async function initNav() {
  applyLoggedOutState();

  if (!supabaseHelpers || !supabaseHelpers.hasConfig()) return;

  const client = supabaseHelpers.getClient();
  const syncNavState = async (user, profile) => {
    if (!user) {
      applyLoggedOutState();
      return;
    }

    const resolvedProfile = profile || await supabaseHelpers.getProfile(user.id);
    setStatusText(`Connecté : ${user.email} · ${supabaseHelpers.getRoleLabel(resolvedProfile)}`);
    setAuthLinks({ user });
    setAdminVisibility(supabaseHelpers.isStaffProfile(resolvedProfile));
    setLogoutVisibility(true);
  };

  const user = await supabaseHelpers.getCurrentUser();
  await syncNavState(user, user ? await supabaseHelpers.getProfile(user.id) : null);

  const logoutButtons = document.querySelectorAll("[data-nav-logout]");
  for (const button of logoutButtons) {
    button.addEventListener("click", async () => {
      await client.auth.signOut();
      window.location.href = "index.html";
    });
  }

  supabaseHelpers.onAuthStateChange(async (_event, _session, nextUser, nextProfile) => {
    await syncNavState(nextUser, nextProfile);
  });
}

initNav();
