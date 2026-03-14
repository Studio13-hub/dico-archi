const form = document.getElementById("contrib-form");
const message = document.getElementById("contrib-message");
const termInput = document.getElementById("term");
const categoryInput = document.getElementById("category");
const definitionInput = document.getElementById("definition");
const exampleInput = document.getElementById("example");
const qualityTitle = document.getElementById("contrib-quality-title");
const qualityCopy = document.getElementById("contrib-quality-copy");
const stats = document.getElementById("contrib-stats");
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

function updateContributionHints() {
  const term = termInput.value.trim();
  const categoryId = categoryInput.value.trim();
  const definition = definitionInput.value.trim();
  const example = exampleInput.value.trim();
  const totalLength = definition.length + example.length;

  if (stats) {
    stats.textContent = `${totalLength} caractère${totalLength > 1 ? "s" : ""}`;
  }

  if (!qualityTitle || !qualityCopy) return;

  if (!term && !categoryId && !definition) {
    qualityTitle.textContent = "Formulaire en cours";
    qualityCopy.textContent = "Commencez par un terme, une catégorie et une définition complète.";
    return;
  }

  if (!term || !categoryId || !definition) {
    qualityTitle.textContent = "Base incomplète";
    qualityCopy.textContent = "Le terme, la catégorie et la définition sont requis avant envoi.";
    return;
  }

  if (definition.length < 40) {
    qualityTitle.textContent = "Définition trop courte";
    qualityCopy.textContent = "Ajoutez un peu plus de contexte pour rendre la fiche utile aux débutants.";
    return;
  }

  if (!/[.?!…]$/.test(definition)) {
    qualityTitle.textContent = "Ponctuation à vérifier";
    qualityCopy.textContent = "Terminez la définition par un point ou une ponctuation claire.";
    return;
  }

  if (!example) {
    qualityTitle.textContent = "Exemple conseillé";
    qualityCopy.textContent = "Le formulaire est valide, mais un exemple concret améliore fortement la compréhension.";
    return;
  }

  qualityTitle.textContent = "Proposition solide";
  qualityCopy.textContent = "La base éditoriale est correcte. Vous pouvez envoyer la proposition.";
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
    setContributionMessage(`Impossible de charger les catégories : ${error.message}`, true);
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
    setContributionMessage("Terme, catégorie et définition sont obligatoires.", true);
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
  updateContributionHints();
  setContributionMessage("Proposition envoyée avec succès.");
}

if (supabaseHelpers && dicoApi) {
  loadContributionCategories();
} else {
  setContributionMessage("Configuration Supabase manquante.", true);
}

if (form) {
  form.addEventListener("submit", submitContribution);
}

[termInput, categoryInput, definitionInput, exampleInput].forEach((field) => {
  if (!field) return;
  field.addEventListener("input", updateContributionHints);
  field.addEventListener("change", updateContributionHints);
});

updateContributionHints();
