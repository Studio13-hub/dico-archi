(function initContributionPage() {
  const form = document.getElementById("contrib-form");
  const message = document.getElementById("contrib-message");
  const termInput = document.getElementById("term");
  const categoryInput = document.getElementById("category");
  const definitionInput = document.getElementById("definition");
  const exampleInput = document.getElementById("example");
  const mediaUrlsInput = document.getElementById("media-urls");
  const mediaFilesInput = document.getElementById("media-files");
  const richExplanationInput = document.getElementById("rich-explanation");
  const richApplicationsInput = document.getElementById("rich-applications");
  const richNormsInput = document.getElementById("rich-norms");
  const richConstraintsInput = document.getElementById("rich-constraints");
  const richDrawingNoteInput = document.getElementById("rich-drawing-note");
  const richIdentificationInput = document.getElementById("rich-identification");
  const richPropertiesInput = document.getElementById("rich-properties");
  const richUsesInput = document.getElementById("rich-uses");
  const richImplementationInput = document.getElementById("rich-implementation");
  const richVigilanceInput = document.getElementById("rich-vigilance");
  const richAdvantagesInput = document.getElementById("rich-advantages");
  const richDrawbacksInput = document.getElementById("rich-drawbacks");
  const richReferencesInput = document.getElementById("rich-references");
  const richConfusionsInput = document.getElementById("rich-confusions");
  const uploadMediaButton = document.getElementById("upload-media");
  const uploadMediaStatus = document.getElementById("upload-media-status");
  const uploadMediaList = document.getElementById("upload-media-list");
  const slugPreview = document.getElementById("contrib-slug-preview");
  const contribResumeBox = document.getElementById("contrib-resume-box");
  const contribResumeCopy = document.getElementById("contrib-resume-copy");
  const contributionSupabaseHelpers = window.DicoArchiSupabase;
  const contributionApi = window.DicoArchiApi;
  let isUploadingMedia = false;
  let editingSubmissionId = "";
  let currentContributionUserId = "";
  let pendingCategoryId = "";

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

  function parseLineList(value) {
    return String(value || "")
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function parseFactLines(value) {
    return parseLineList(value)
      .map((line) => {
        const separatorIndex = line.indexOf(":");
        if (separatorIndex === -1) return null;
        const label = line.slice(0, separatorIndex).trim();
        const factValue = line.slice(separatorIndex + 1).trim();
        if (!label || !factValue) return null;
        return { label, value: factValue };
      })
      .filter(Boolean);
  }

  function makeSection(title, items) {
    const cleanItems = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!cleanItems.length) return null;
    return { title, items: cleanItems };
  }

  function getRichDefaults() {
    return {
      kind: "complete",
      label: "Fiche complète",
      headline: "Comprendre le terme, son rôle et sa mise en œuvre",
      note: "Cette fiche rassemble dans un même format la définition, les usages, les points de vigilance et les repères utiles au bureau."
    };
  }

  function fillTextArea(field, value) {
    if (!field) return;
    field.value = value || "";
  }

  function fillLineList(field, items) {
    if (!field) return;
    field.value = Array.isArray(items) ? items.filter(Boolean).join("\n") : "";
  }

  function fillFactList(field, facts) {
    if (!field) return;
    field.value = Array.isArray(facts)
      ? facts
          .map((item) => {
            const label = String(item?.label || "").trim();
            const value = String(item?.value || "").trim();
            return label && value ? `${label}: ${value}` : "";
          })
          .filter(Boolean)
          .join("\n")
      : "";
  }

  function fillRichPayloadForm(payload) {
    const richPayload = payload && typeof payload === "object" ? payload : {};
    fillTextArea(richExplanationInput, richPayload.content?.explanation || "");
    fillLineList(richApplicationsInput, richPayload.content?.applications || []);
    fillLineList(richNormsInput, richPayload.content?.norms || []);
    fillLineList(richConstraintsInput, richPayload.technical_data?.constraints || []);
    fillTextArea(richDrawingNoteInput, richPayload.representation?.drawing_note || "");

    const detailSections = Array.isArray(richPayload.detail_sections) ? richPayload.detail_sections : [];
    fillFactList(richIdentificationInput, detailSections.find((item) => item?.title === "Identification")?.facts || []);
    fillLineList(richPropertiesInput, detailSections.find((item) => item?.title === "Propriétés")?.items || []);
    fillLineList(richUsesInput, detailSections.find((item) => item?.title === "Usages courants")?.items || []);
    fillLineList(richImplementationInput, detailSections.find((item) => item?.title === "Mise en œuvre")?.items || []);
    fillLineList(richVigilanceInput, detailSections.find((item) => item?.title === "Vigilance")?.items || []);
    fillLineList(richAdvantagesInput, detailSections.find((item) => item?.title === "Avantages")?.items || []);
    fillLineList(richDrawbacksInput, detailSections.find((item) => item?.title === "Inconvénients")?.items || []);
    fillLineList(richReferencesInput, detailSections.find((item) => item?.title === "Références")?.items || []);
    fillLineList(richConfusionsInput, detailSections.find((item) => item?.title === "À ne pas confondre")?.items || []);
  }

  function applyPendingCategorySelection() {
    if (!categoryInput || !pendingCategoryId) return;
    const hasOption = Array.from(categoryInput.options || []).some((option) => option.value === pendingCategoryId);
    if (!hasOption) return;
    categoryInput.value = pendingCategoryId;
    pendingCategoryId = "";
  }

  async function tryLoadSubmissionForCorrection() {
    if (!contributionApi || !contributionSupabaseHelpers) return;

    const params = new URLSearchParams(window.location.search);
    const submissionId = String(params.get("submission") || "").trim();
    if (!submissionId) return;

    const user = await contributionSupabaseHelpers.getCurrentUser();
    if (!user) {
      setContributionMessage("Connecte-toi pour reprendre une proposition à corriger.", true);
      return;
    }

    currentContributionUserId = user.id;

    try {
      const submission = await contributionApi.fetchSubmissionById(submissionId);
      if (!submission) return;
      if (submission.status !== "rejected") {
        setContributionMessage("Cette proposition n’est pas en mode correction.", true);
        return;
      }

      editingSubmissionId = submission.id;
      if (termInput) termInput.value = submission.term || "";
      pendingCategoryId = submission.category_id || "";
      applyPendingCategorySelection();
      if (definitionInput) definitionInput.value = submission.definition || "";
      if (exampleInput) exampleInput.value = submission.example || "";
      if (mediaUrlsInput) mediaUrlsInput.value = Array.isArray(submission.media_urls) ? submission.media_urls.join("\n") : "";
      fillRichPayloadForm(submission.rich_payload || {});
      renderUploadedMediaList();
      updateContributionHints();

      if (contribResumeBox) contribResumeBox.hidden = false;
      if (contribResumeCopy) {
        contribResumeCopy.textContent = submission.reviewer_comment
          ? `Mode correction actif pour « ${submission.term} ». Dernier retour éditorial: ${submission.reviewer_comment}`
          : `Mode correction actif pour « ${submission.term} ». Tu peux corriger puis renvoyer la proposition.`;
      }
      setContributionMessage("Proposition chargée en mode correction.");
    } catch (error) {
      setContributionMessage(`Impossible de charger la proposition à corriger : ${error.message}`, true);
    }
  }

  function buildRichPayload() {
    const defaults = getRichDefaults();
    const explanation = richExplanationInput?.value.trim() || "";
    const applications = parseLineList(richApplicationsInput?.value);
    const norms = parseLineList(richNormsInput?.value);
    const constraints = parseLineList(richConstraintsInput?.value);
    const drawingNote = richDrawingNoteInput?.value.trim() || "";
    const identificationFacts = parseFactLines(richIdentificationInput?.value);
    const detailSections = [
      identificationFacts.length ? { title: "Identification", facts: identificationFacts } : null,
      makeSection("Propriétés", parseLineList(richPropertiesInput?.value)),
      makeSection("Usages courants", parseLineList(richUsesInput?.value)),
      makeSection("Mise en œuvre", parseLineList(richImplementationInput?.value)),
      makeSection("Vigilance", parseLineList(richVigilanceInput?.value)),
      makeSection("Avantages", parseLineList(richAdvantagesInput?.value)),
      makeSection("Inconvénients", parseLineList(richDrawbacksInput?.value)),
      makeSection("Références", parseLineList(richReferencesInput?.value)),
      makeSection("À ne pas confondre", parseLineList(richConfusionsInput?.value))
    ].filter(Boolean);

    const hasRichContent = Boolean(
      explanation
      || applications.length
      || norms.length
      || constraints.length
      || drawingNote
      || detailSections.length
    );

    if (!hasRichContent) return {};

    return {
      content: {
        explanation,
        applications,
        norms
      },
      technical_data: {
        constraints
      },
      representation: {
        abbreviation_plan: null,
        drawing_note: drawingNote
      },
      editorial_profile: {
        kind: defaults.kind,
        label: defaults.label,
        headline: defaults.headline,
        note: defaults.note
      },
      detail_sections: detailSections
    };
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
    const slug = slugify(term);

    if (slugPreview) {
      slugPreview.textContent = slug ? `${term || "terme"} -> ${slug}` : "Le slug sera généré automatiquement à partir du terme.";
    }
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
      applyPendingCategorySelection();
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
    const richPayload = buildRichPayload();

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

    if (Object.keys(richPayload).length) {
      payload.rich_payload = richPayload;
    }

    const isResubmission = Boolean(editingSubmissionId);

    try {
      if (editingSubmissionId) {
        await contributionApi.updateOwnSubmission(editingSubmissionId, {
          ...payload,
          status: "resubmitted",
          reviewer_comment: null
        });
      } else {
        await contributionApi.createSubmission(payload);
      }
    } catch (error) {
      setContributionMessage(error.message, true);
      return;
    }

    form?.reset();
    editingSubmissionId = "";
    renderUploadedMediaList();
    updateContributionHints();
    setUploadStatus("Images et PDF jusqu’à 10 MB.");
    if (contribResumeBox) contribResumeBox.hidden = true;
    setContributionMessage(isResubmission ? "Proposition corrigée et renvoyée avec succès." : "Proposition envoyée avec succès.");
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
  tryLoadSubmissionForCorrection();
})();
