(function initContributionPage() {
  const form = document.getElementById("contrib-form");
  const message = document.getElementById("contrib-message");
  const termInput = document.getElementById("term");
  const categoryInput = document.getElementById("category");
  const definitionInput = document.getElementById("definition");
  const exampleInput = document.getElementById("example");
  const mediaUrlsInput = document.getElementById("media-urls");
  const mediaFilesInput = document.getElementById("media-files");
  const uploadMediaButton = document.getElementById("upload-media");
  const uploadMediaStatus = document.getElementById("upload-media-status");
  const uploadMediaList = document.getElementById("upload-media-list");
  const qualityTitle = document.getElementById("contrib-quality-title");
  const qualityCopy = document.getElementById("contrib-quality-copy");
  const stats = document.getElementById("contrib-stats");
  const contributionSupabaseHelpers = window.DicoArchiSupabase;
  const contributionApi = window.DicoArchiApi;
  let isUploadingMedia = false;

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

  function formatUploadName(url) {
    const lastSegment = String(url || "").split("/").pop() || "";
    return decodeURIComponent(lastSegment.split("?")[0] || "media-temporaire");
  }

  function setUploadStatus(text, isError = false) {
    if (!uploadMediaStatus) return;
    uploadMediaStatus.textContent = text;
    uploadMediaStatus.style.color = isError ? "#d94e2b" : "rgba(18, 18, 18, 0.6)";
  }

  function getUploadErrorMessage(error) {
    const rawMessage = String(error?.message || error || "");
    if (rawMessage.toLowerCase().includes("row-level security policy")) {
      return "Téléversement refusé par Supabase. La policy d’upload apprenti n’est pas encore activée dans Storage.";
    }
    return rawMessage || "Téléversement impossible.";
  }

  function setUploadButtonBusy(isBusy) {
    if (!uploadMediaButton) return;
    uploadMediaButton.disabled = isBusy;
    uploadMediaButton.textContent = isBusy ? "Téléversement..." : "Téléverser";
  }

  function renderUploadedMediaList() {
    if (!uploadMediaList) return;
    const urls = parseMediaUrls(mediaUrlsInput?.value);
    uploadMediaList.innerHTML = "";

    if (!urls.length) {
      const empty = document.createElement("div");
      empty.className = "contrib-upload-item contrib-upload-item--empty";
      empty.textContent = "Aucun média temporaire ajouté pour l’instant.";
      uploadMediaList.appendChild(empty);
      return;
    }

    urls.forEach((url) => {
      const row = document.createElement("div");
      row.className = "contrib-upload-item";

      const label = document.createElement("a");
      label.href = url;
      label.target = "_blank";
      label.rel = "noreferrer";
      label.textContent = formatUploadName(url);

      const action = document.createElement("button");
      action.type = "button";
      action.className = "link-button";
      action.textContent = "Retirer";
      action.addEventListener("click", () => {
        const remaining = parseMediaUrls(mediaUrlsInput?.value).filter((item) => item !== url);
        if (mediaUrlsInput) {
          mediaUrlsInput.value = remaining.join("\n");
        }
        renderUploadedMediaList();
        updateContributionHints();
      });

      row.append(label, action);
      uploadMediaList.appendChild(row);
    });
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
      qualityCopy.textContent = "Ajoutez un lien public en http/https. Les chemins locaux file:/// et les textes libres ne sont pas encore acceptés.";
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

  async function uploadContributionMedia() {
    if (!contributionSupabaseHelpers || !contributionApi) {
      setContributionMessage("Configuration Supabase manquante.", true);
      return;
    }
    if (isUploadingMedia) return;

    const files = Array.from(mediaFilesInput?.files || []);
    if (!files.length) {
      setUploadStatus("Choisissez au moins un fichier avant de téléverser.", true);
      return;
    }

    const user = await contributionSupabaseHelpers.getCurrentUser();
    if (!user) {
      setContributionMessage("Connecte-toi avant de téléverser un média.", true);
      return;
    }

    isUploadingMedia = true;
    setUploadButtonBusy(true);
    setUploadStatus("Téléversement en cours...");
    setContributionMessage("");

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const url = await contributionApi.uploadSubmissionMedia(file, user.id);
        uploadedUrls.push(url);
      }

      const merged = Array.from(new Set([
        ...parseMediaUrls(mediaUrlsInput?.value),
        ...uploadedUrls
      ]));

      if (mediaUrlsInput) {
        mediaUrlsInput.value = merged.join("\n");
      }
      if (mediaFilesInput) {
        mediaFilesInput.value = "";
      }

      renderUploadedMediaList();
      updateContributionHints();
      setUploadStatus(`${uploadedUrls.length} média${uploadedUrls.length > 1 ? "s" : ""} chargé${uploadedUrls.length > 1 ? "s" : ""} et ajouté${uploadedUrls.length > 1 ? "s" : ""} à la proposition.`);
    } catch (error) {
      setUploadStatus(getUploadErrorMessage(error), true);
    } finally {
      isUploadingMedia = false;
      setUploadButtonBusy(false);
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
      setContributionMessage("Les médias proposés doivent être des liens publics en http/https. Les chemins locaux file:/// ne sont pas encore acceptés.", true);
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
    renderUploadedMediaList();
    updateContributionHints();
    setUploadStatus("Images et PDF jusqu’à 10 MB.");
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

  if (uploadMediaButton) {
    uploadMediaButton.addEventListener("click", uploadContributionMedia);
  }

  if (mediaFilesInput) {
    mediaFilesInput.addEventListener("change", () => {
      if (mediaFilesInput.files?.length) {
        uploadContributionMedia();
      }
    });
  }

  [termInput, categoryInput, definitionInput, exampleInput, mediaUrlsInput].forEach((field) => {
    if (!field) return;
    field.addEventListener("input", updateContributionHints);
    field.addEventListener("change", updateContributionHints);
  });

  renderUploadedMediaList();
  updateContributionHints();
})();
