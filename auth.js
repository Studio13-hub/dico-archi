(function initAuthPage() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const authForm = document.getElementById("auth-form");
  const resetForm = document.getElementById("reset-form");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const loginButton = document.getElementById("login");
  const signupButton = document.getElementById("signup");
  const forgotPasswordButton = document.getElementById("forgot-password");
  const saveNewPasswordButton = document.getElementById("save-new-password");
  const backToLoginButton = document.getElementById("back-to-login");
  const message = document.getElementById("auth-message");

  let mode = "auth";
  let isSubmittingAuth = false;
  let authSubmitAction = "login";
  const authSupabaseHelpers = window.DicoArchiSupabase;

  function setMessage(text, isError = false) {
    if (!message) return;
    message.textContent = text;
    message.style.color = isError ? "#d94e2b" : "#1f7a70";
  }

  if (!authSupabaseHelpers || !authSupabaseHelpers.hasConfig()) {
    setMessage("Configuration Supabase manquante. Ajoute tes clés dans config.js.", true);
  }

  const supabaseClient = authSupabaseHelpers && authSupabaseHelpers.hasConfig()
    ? authSupabaseHelpers.getClient()
    : null;

  function redirectAfterLogin() {
    window.location.href = "compte.html";
  }

  function setMode(nextMode) {
    mode = nextMode === "reset" ? "reset" : "auth";
    const isReset = mode === "reset";
    if (authForm) authForm.hidden = isReset;
    if (resetForm) resetForm.hidden = !isReset;
  }

  function parseHashParams() {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    return {
      type: params.get("type") || "",
      accessToken: params.get("access_token") || ""
    };
  }

  function isRecoveryContext() {
    const queryMode = new URLSearchParams(window.location.search).get("mode");
    if (queryMode === "reset") return true;
    const hashParams = parseHashParams();
    return hashParams.type === "recovery" || Boolean(hashParams.accessToken);
  }

  async function signIn() {
    if (!supabaseClient || isSubmittingAuth) return;
    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value.trim() || "";

    if (!email || !password) {
      setMessage("Email et mot de passe requis.", true);
      return;
    }

    isSubmittingAuth = true;
    if (loginButton) loginButton.disabled = true;
    if (signupButton) signupButton.disabled = true;
    if (forgotPasswordButton) forgotPasswordButton.disabled = true;
    setMessage("Connexion en cours...");

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setMessage(error.message, true);
        return;
      }

      setMessage("Connecté avec succès. Redirection...");
      setTimeout(redirectAfterLogin, 800);
    } catch (error) {
      setMessage(error?.message || "Connexion impossible pour le moment.", true);
    } finally {
      isSubmittingAuth = false;
      if (loginButton) loginButton.disabled = false;
      if (signupButton) signupButton.disabled = false;
      if (forgotPasswordButton) forgotPasswordButton.disabled = false;
    }
  }

  async function signUp() {
    if (!supabaseClient || isSubmittingAuth) return;
    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value.trim() || "";

    if (!email || !password) {
      setMessage("Email et mot de passe requis.", true);
      return;
    }

    isSubmittingAuth = true;
    if (signupButton) signupButton.disabled = true;
    if (loginButton) loginButton.disabled = true;
    if (forgotPasswordButton) forgotPasswordButton.disabled = true;
    setMessage("Création du compte en cours...");

    try {
      const { error } = await supabaseClient.auth.signUp({
        email,
        password
      });

      if (error) {
        setMessage(error.message, true);
        return;
      }

      setMessage("Compte créé. Vérifie ton email pour confirmer.");
    } catch (error) {
      setMessage(error?.message || "Création du compte impossible pour le moment.", true);
    } finally {
      isSubmittingAuth = false;
      if (signupButton) signupButton.disabled = false;
      if (loginButton) loginButton.disabled = false;
      if (forgotPasswordButton) forgotPasswordButton.disabled = false;
    }
  }

  async function sendResetEmail() {
    if (!supabaseClient) return;
    const email = emailInput?.value.trim() || "";
    if (!email) {
      setMessage("Saisis ton email avant de demander la réinitialisation.", true);
      return;
    }

    const redirectTo = `${window.location.origin}/auth.html?mode=reset`;
    setMessage("Envoi de l’email de réinitialisation...");
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        setMessage(error.message, true);
        return;
      }

      setMessage("Email de réinitialisation envoyé. Vérifie ta boîte mail.");
    } catch (error) {
      setMessage(error?.message || "Réinitialisation impossible pour le moment.", true);
    }
  }

  async function updatePassword() {
    if (!supabaseClient) return;
    const newPassword = newPasswordInput?.value.trim() || "";
    const confirmPassword = confirmPasswordInput?.value.trim() || "";

    if (!newPassword || !confirmPassword) {
      setMessage("Saisis et confirme ton nouveau mot de passe.", true);
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères.", true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.", true);
      return;
    }

    if (saveNewPasswordButton) saveNewPasswordButton.disabled = true;
    try {
      setMessage("Mise à jour du mot de passe...");
      const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
      if (error) {
        setMessage(error.message, true);
        return;
      }

      setMessage("Mot de passe mis à jour. Tu peux te connecter.");
      if (newPasswordInput) newPasswordInput.value = "";
      if (confirmPasswordInput) confirmPasswordInput.value = "";
      setMode("auth");
      if (emailInput) emailInput.focus();
    } catch (error) {
      setMessage(error?.message || "Mise à jour impossible pour le moment.", true);
    } finally {
      if (saveNewPasswordButton) saveNewPasswordButton.disabled = false;
    }
  }

  if (authForm) {
    authForm.addEventListener("submit", (event) => {
      event.preventDefault();
      authSubmitAction = "login";
      signIn();
    });
  }

  if (loginButton) {
    loginButton.addEventListener("click", () => {
      authSubmitAction = "login";
      signIn();
    });
  }

  if (signupButton) {
    signupButton.addEventListener("click", () => {
      authSubmitAction = "signup";
      signUp();
    });
  }

  function submitLoginFromKeyboard(event) {
    if (event.key !== "Enter" || mode !== "auth") return;
    event.preventDefault();
    authSubmitAction = "login";
    authForm?.requestSubmit();
  }

  if (emailInput) {
    emailInput.addEventListener("keydown", submitLoginFromKeyboard);
  }

  if (passwordInput) {
    passwordInput.addEventListener("keydown", submitLoginFromKeyboard);
  }

  if (forgotPasswordButton) {
    forgotPasswordButton.addEventListener("click", sendResetEmail);
  }

  if (resetForm) {
    resetForm.addEventListener("submit", (event) => {
      event.preventDefault();
      updatePassword();
    });
  }

  if (saveNewPasswordButton) {
    saveNewPasswordButton.addEventListener("click", updatePassword);
  }

  if (backToLoginButton) {
    backToLoginButton.addEventListener("click", () => {
      setMode("auth");
      setMessage("");
    });
  }

  if (isRecoveryContext()) {
    setMode("reset");
    setMessage("Définis ton nouveau mot de passe.");
  } else {
    setMode("auth");
  }
})();
