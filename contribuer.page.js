(function initContributionPage() {
  const form = document.getElementById("contrib-form");
  const message = document.getElementById("contrib-message");
  const termInput = document.getElementById("term");
  const categoryInput = document.getElementById("category");
  const definitionInput = document.getElementById("definition");
  const exampleInput = document.getElementById("example");
  const mediaUrlsInput = document.getElementById("media-urls");
  const qualityTitle = document.getElementById("contrib-quality-title");
  const qualityCopy = document.getElementById("contrib-quality-copy");
  const stats = document.getElementById("contrib-stats");
  const contributionSupabaseHelpers = window.DicoArchiSupabase;
  const contributionApi = window.DicoArchiApi;

  function setContributionMessage(text, isError = false) {
    if (!message) return;
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

  function parseMediaUrls(value) {
    return String(value || "")
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item, index, list) => list.indexOf(item) === index);
  }

  function isSupportedMediaUrl(url) {
    return /^https?:\/\/.+\.(png|jpe?g|webp|gif|svg|pdf)(\?.*)?$/i.test(url);
  }

  function updateContributionHints() {
    const term = termInput?.value.trim() || "";
    const categoryId = categoryInput?.value.trim() || "";
    const definition = definitionInput?.value.trim() || "";
    const example = exampleInput?.value.trim() || "";
    const mediaUrls = parseMediaUrls(mediaUrlsInput?.value);
    const invalidMedia = mediaUrls.find((url) => !isSupportedMediaUrl(url));
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

    if (invalidMedia) {
      qualityTitle.textContent = "Média à corriger";
      qualityCopy.textContent = "Les liens médias doivent être en http/https et finir par une extension image ou .pdf.";
      return;
    }

    if (mediaUrls.length) {
      qualityTitle.textContent = "Proposition enrichie";
      qualityCopy.textContent = "Le texte est solide et des médias sont prêts pour la relecture formateur.";
      return;
    }

    qualityTitle.textContent = "Proposition solide";
    qualityCopy.textContent = "La base éditoriale est correcte. Vous pouvez envoyer la proposition.";
  }

  async function loadContributionCategories() {
    try {
      const data = await contributionApi.fetchCategories();
      for (const item of data || []) {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        categoryInput?.appendChild(option);
      }
    } catch (error) {
      setContributionMessage(`Impossible de charger les catégories : ${error.message}`, true);
    }
  }

  async function submitContribution(event) {
    event.preventDefault();

    if (!contributionSupabaseHelpers || !contributionApi) {
      setContributionMessage("Configuration Supabase manquante.", true);
      return;
    }

    const term = termInput?.value.trim() || "";
    const categoryId = categoryInput?.value.trim() || "";
    const definition = definitionInput?.value.trim() || "";
    const example = exampleInput?.value.trim() || "";
    const mediaUrls = parseMediaUrls(mediaUrlsInput?.value);

    if (!term || !categoryId || !definition) {
      setContributionMessage("Terme, catégorie et définition sont obligatoires.", true);
      return;
    }

    if (mediaUrls.some((url) => !isSupportedMediaUrl(url))) {
      setContributionMessage("Les médias proposés doivent être en http/https et finir par une extension image ou .pdf.", true);
      return;
    }

    const user = await contributionSupabaseHelpers.getCurrentUser();
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
      media_urls: mediaUrls,
      status: "submitted",
      submitted_by: user.id
    };

    try {
      await contributionApi.createSubmission(payload);
    } catch (error) {
      setContributionMessage(error.message, true);
      return;
    }

    form?.reset();
    updateContributionHints();
    setContributionMessage("Proposition envoyée avec succès.");
  }

  if (contributionSupabaseHelpers && contributionApi) {
    loadContributionCategories();
  } else {
    setContributionMessage("Configuration Supabase manquante.", true);
  }

  if (form) {
    form.addEventListener("submit", submitContribution);
  }

  [termInput, categoryInput, definitionInput, exampleInput, mediaUrlsInput].forEach((field) => {
    if (!field) return;
    field.addEventListener("input", updateContributionHints);
    field.addEventListener("change", updateContributionHints);
  });

  updateContributionHints();
})();
