const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login");
const signupButton = document.getElementById("signup");
const message = document.getElementById("auth-message");

function setMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#d94e2b" : "#1f7a70";
}

function hasSupabaseConfig() {
  return Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
}

if (!hasSupabaseConfig()) {
  setMessage("Configuration Supabase manquante. Ajoute tes cles dans config.js.", true);
}

const supabaseClient = hasSupabaseConfig()
  ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    })
  : null;

function redirectAfterLogin() {
  window.location.href = "index.html";
}

async function signIn() {
  if (!supabaseClient) return;
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    setMessage("Email et mot de passe requis.", true);
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    setMessage(error.message, true);
    return;
  }

  localStorage.setItem("post_login_redirect", "1");
  setMessage("Connecte avec succes. Redirection...");
  setTimeout(redirectAfterLogin, 800);
}

async function signUp() {
  if (!supabaseClient) return;
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    setMessage("Email et mot de passe requis.", true);
    return;
  }

  const { error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) {
    setMessage(error.message, true);
    return;
  }

  setMessage("Compte cree. Verifie ton email pour confirmer.");
}

loginButton.addEventListener("click", signIn);
signupButton.addEventListener("click", signUp);
