const contribMessage = document.getElementById("contrib-message");
const contribUser = document.getElementById("contrib-user");

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

function setMessage(text, isError = false) {
  contribMessage.textContent = text;
  contribMessage.style.color = isError ? "#d94e2b" : "#1f7a70";
}

function hasSupabaseConfig() {
  return Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
}

function clearForm() {
  termInput.value = "";
  categoryInput.value = "";
  definitionInput.value = "";
  exampleInput.value = "";
  relatedInput.value = "";
  imageUrlInput.value = "";
}

function normalizeRelated(raw) {
  return raw
    .split("|")
    .map((value) => value.trim())
    .filter(Boolean);
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
    setMessage("Connecte-toi dans la page Compte pour contribuer.", true);
    return;
  }

  contribUser.textContent = `Utilisateur: ${currentUser.email}`;
}

async function submitProposal() {
  if (!currentUser) return;

  const term = termInput.value.trim();
  const category = categoryInput.value.trim();
  const definition = definitionInput.value.trim();
  const example = exampleInput.value.trim();
  const related = normalizeRelated(relatedInput.value || "");
  const imageUrl = imageUrlInput.value.trim();

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
    submitted_by: currentUser.id
  };

  const { error } = await supabaseClient.from("term_submissions").insert(payload);
  if (error) {
    setMessage(error.message, true);
    return;
  }

  setMessage("Proposition envoyee. Merci !");
  clearForm();
}

submitButton.addEventListener("click", submitProposal);
resetButton.addEventListener("click", clearForm);

loadUser();
