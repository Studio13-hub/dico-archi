const form = document.getElementById("contrib-form");
const message = document.getElementById("contrib-message");
const termInput = document.getElementById("term");
const categoryInput = document.getElementById("category");
const definitionInput = document.getElementById("definition");
const exampleInput = document.getElementById("example");
const supabaseHelpers = window.DicoArchiSupabase;
const dicoApi = window.DicoArchiApi;

function setContributionMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#d94e2b" : "#1f7a70";
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function loadContributionCategories() {
  try {
    const data = await dicoApi.fetchCategories();
    for (const item of data || []) {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      categoryInput.appendChild(option);
    }
  } catch (error) {
    setContributionMessage(`Impossible de charger les categories: ${error.message}`, true);
  }
}

async function submitContribution(event) {
  event.preventDefault();

  if (!supabaseHelpers || !dicoApi) {
    setContributionMessage("Configuration Supabase manquante.", true);
    return;
  }

  const term = termInput.value.trim();
  const categoryId = categoryInput.value.trim();
  const definition = definitionInput.value.trim();
  const example = exampleInput.value.trim();

  if (!term || !categoryId || !definition) {
    setContributionMessage("Terme, categorie et definition sont obligatoires.", true);
    return;
  }

  const user = await supabaseHelpers.getCurrentUser();
  if (!user) {
    setContributionMessage("Connecte-toi avant d'envoyer une proposition.", true);
    return;
  }

  const payload = {
    term,
    slug: slugify(term) || null,
    category_id: categoryId,
    definition,
    example: example || null,
    status: "submitted",
    submitted_by: user.id
  };

  try {
    await dicoApi.createSubmission(payload);
  } catch (error) {
    setContributionMessage(error.message, true);
    return;
  }

  form.reset();
  setContributionMessage("Proposition envoyee avec succes.");
}

if (supabaseHelpers && dicoApi) {
  loadContributionCategories();
} else {
  setContributionMessage("Configuration Supabase manquante.", true);
}

if (form) {
  form.addEventListener("submit", submitContribution);
}
