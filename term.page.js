const titleNode = document.getElementById("term-title");
const subtitleNode = document.getElementById("term-subtitle");
const categoryNode = document.getElementById("term-category");
const definitionNode = document.getElementById("term-definition");
const exampleNode = document.getElementById("term-example");
const exampleInlineNode = document.getElementById("term-example-inline");
const exampleInlineTextNode = document.getElementById("term-example-inline-text");
const mediaNode = document.getElementById("term-media");
const visualBlockNode = document.getElementById("term-visual-block");
const visualImageNode = document.getElementById("term-visual-image");
const visualSchemaNode = document.getElementById("term-visual-schema");
const relatedNode = document.getElementById("term-related");
const explanationBlock = document.getElementById("term-explanation-block");
const explanationNode = document.getElementById("term-explanation");
const applicationsBlock = document.getElementById("term-applications-block");
const applicationsNode = document.getElementById("term-applications");
const normsBlock = document.getElementById("term-norms-block");
const normsNode = document.getElementById("term-norms");
const constraintsBlock = document.getElementById("term-constraints-block");
const constraintsNode = document.getElementById("term-constraints");
const representationBlock = document.getElementById("term-representation-block");
const abbreviationNode = document.getElementById("term-abbreviation");
const drawingNoteNode = document.getElementById("term-drawing-note");
const detailsBlock = document.getElementById("term-details-block");
const detailSectionsNode = document.getElementById("term-detail-sections");
const detailTabsNode = document.getElementById("term-detail-tabs");
const profileLabelNode = document.getElementById("term-profile-label");
const profileHeadlineNode = document.getElementById("term-profile-headline");
const profileNoteNode = document.getElementById("term-profile-note");
const readingCardNode = document.getElementById("term-reading-card");
const detailsHeadingNode = document.getElementById("term-details-heading");
const leadBlockNode = document.getElementById("term-lead-block");
const relatedBlockNode = document.getElementById("term-related-block");
const mediaBlockNode = document.getElementById("term-media-block");
const quicklinksNode = document.getElementById("term-quicklinks");
const assistBlockNode = document.getElementById("term-assist-block");
const translationLanguageNode = document.getElementById("term-translation-language");
const translationButtonNode = document.getElementById("term-translate-button");
const pronounceButtonNode = document.getElementById("term-pronounce-button");
const pronounceTranslationButtonNode = document.getElementById("term-pronounce-translation-button");
const translationStatusNode = document.getElementById("term-translation-status");
const translationOutputNode = document.getElementById("term-translation-output");
const translationLabelNode = document.getElementById("term-translation-label");
const translationTermNode = document.getElementById("term-translation-term");
const translationDefinitionNode = document.getElementById("term-translation-definition");
const translationExampleCardNode = document.getElementById("term-translation-example-card");
const translationExampleNode = document.getElementById("term-translation-example");
const pronunciationGuideNode = document.getElementById("term-pronunciation-guide");
const summaryBlockNode = document.getElementById("term-summary-block");
const summaryChipsNode = document.getElementById("term-summary-chips");
const summaryNoteNode = document.getElementById("term-summary-note");
const orientationBlockNode = document.getElementById("term-orientation-block");
const orientationIdentityTitleNode = document.getElementById("term-orientation-identity-title");
const orientationIdentityTextNode = document.getElementById("term-orientation-identity-text");
const orientationUsesNode = document.getElementById("term-orientation-uses");
const orientationContrastNode = document.getElementById("term-orientation-contrast");
const orientationWatchNode = document.getElementById("term-orientation-watch");
const nextCategoryTitleNode = document.getElementById("term-next-category-title");
const nextCategoryNoteNode = document.getElementById("term-next-category-note");
const nextCategoryLinkNode = document.getElementById("term-next-category-link");
const nextRelatedCardNode = document.getElementById("term-next-related-card");
const nextRelatedTitleNode = document.getElementById("term-next-related-title");
const nextRelatedNoteNode = document.getElementById("term-next-related-note");
const nextRelatedLinkNode = document.getElementById("term-next-related-link");
let activeDetailSectionIndex = 0;
let currentTermAssistPayload = null;
let currentRenderedTranslation = null;
const translationCache = new Map();

function setTermPageReadyState(state) {
  const safeState = normalizeText(state) || "idle";
  document.body?.setAttribute("data-term-ready", safeState);
  document.documentElement?.setAttribute("data-term-ready", safeState);
}

const ASSIST_LANGUAGE_CONFIG = {
  fr: { label: "Français", speechLang: "fr-FR" },
  en: { label: "Anglais", speechLang: "en-US" },
  de: { label: "Allemand", speechLang: "de-DE" },
  it: { label: "Italien", speechLang: "it-IT" },
  es: { label: "Espagnol", speechLang: "es-ES" },
  pt: { label: "Portugais", speechLang: "pt-PT" },
  sq: { label: "Albanais", speechLang: "sq" },
  ar: { label: "Arabe", speechLang: "ar" }
};

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("slug") || "").trim();
}

function clearTermChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function setTermText(node, value, fallback = "-") {
  node.textContent = value || fallback;
}

function clearList(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function renderList(blockNode, listNode, values, emptyLabel = "") {
  if (!blockNode || !listNode) return;
  clearList(listNode);
  if (!Array.isArray(values) || !values.length) {
    blockNode.hidden = true;
    return;
  }

  for (const value of values) {
    const item = document.createElement("li");
    item.textContent = value;
    listNode.appendChild(item);
  }

  if (!listNode.childElementCount && emptyLabel) {
    const item = document.createElement("li");
    item.textContent = emptyLabel;
    listNode.appendChild(item);
  }

  blockNode.hidden = false;
}

function replaceListItems(node, values) {
  if (!node) return 0;
  clearList(node);
  const items = toStringList(values).slice(0, 4);
  for (const value of items) {
    const item = document.createElement("li");
    item.textContent = value;
    node.appendChild(item);
  }
  return node.childElementCount;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function setTranslationStatus(text, isError = false) {
  if (!translationStatusNode) return;
  translationStatusNode.textContent = text || "";
  translationStatusNode.style.color = isError ? "#d94e2b" : "";
}

function getStoredTranslation(payload, language) {
  const translations = payload && typeof payload.translations === "object" ? payload.translations : null;
  if (!translations) return null;

  const entry = translations[language];
  if (!entry) return null;

  if (typeof entry === "string") {
    return {
      language,
      languageLabel: ASSIST_LANGUAGE_CONFIG[language]?.label || language.toUpperCase(),
      translatedTerm: entry,
      translatedDefinition: "",
      translatedExample: "",
      pronunciationGuide: ""
    };
  }

  return {
    language,
    languageLabel: normalizeText(entry.languageLabel) || ASSIST_LANGUAGE_CONFIG[language]?.label || language.toUpperCase(),
    translatedTerm: normalizeText(entry.term || entry.translatedTerm),
    translatedDefinition: normalizeText(entry.definition || entry.translatedDefinition),
    translatedExample: normalizeText(entry.example || entry.translatedExample),
    pronunciationGuide: normalizeText(entry.pronunciationGuide)
  };
}

function renderTranslationResult(result) {
  currentRenderedTranslation = result || null;

  if (
    !translationOutputNode
    || !translationLabelNode
    || !translationTermNode
    || !translationDefinitionNode
    || !translationExampleCardNode
    || !translationExampleNode
    || !pronunciationGuideNode
  ) {
    return;
  }

  if (!result) {
    translationOutputNode.hidden = true;
    translationTermNode.textContent = "";
    translationDefinitionNode.textContent = "";
    translationExampleNode.textContent = "";
    translationExampleCardNode.hidden = true;
    pronunciationGuideNode.hidden = true;
    pronunciationGuideNode.textContent = "";
    if (pronounceTranslationButtonNode) pronounceTranslationButtonNode.hidden = true;
    return;
  }

  translationLabelNode.textContent = `Version ${result.languageLabel || ""}`.trim();
  translationTermNode.textContent = result.translatedTerm || "-";
  translationDefinitionNode.textContent = result.translatedDefinition || "Aucune définition traduite disponible.";
  translationExampleNode.textContent = result.translatedExample || "";
  translationExampleCardNode.hidden = !result.translatedExample;
  translationOutputNode.hidden = false;

  const guide = normalizeText(result.pronunciationGuide);
  pronunciationGuideNode.textContent = guide ? `Prononciation guidée: ${guide}` : "";
  pronunciationGuideNode.hidden = !guide;
  if (pronounceTranslationButtonNode) {
    pronounceTranslationButtonNode.hidden = !normalizeText(result.translatedTerm);
  }
}

function canUseSpeechSynthesis() {
  return typeof window !== "undefined"
    && "speechSynthesis" in window
    && typeof window.SpeechSynthesisUtterance === "function";
}

function speakText(text, lang) {
  const spokenText = normalizeText(text);
  if (!spokenText) {
    setTranslationStatus("Aucun texte à prononcer.", true);
    return;
  }

  if (!canUseSpeechSynthesis()) {
    setTranslationStatus("La prononciation vocale n’est pas disponible sur ce navigateur.", true);
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new window.SpeechSynthesisUtterance(spokenText);
  utterance.lang = lang || "fr-FR";
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
  setTranslationStatus("Lecture audio lancée.");
}

async function requestTranslation() {
  const language = normalizeText(translationLanguageNode?.value || "en").toLowerCase();
  const languageConfig = ASSIST_LANGUAGE_CONFIG[language];
  if (!currentTermAssistPayload || !languageConfig) return;

  if (language === "fr") {
    const result = {
      language,
      languageLabel: languageConfig.label,
      translatedTerm: normalizeText(currentTermAssistPayload.term.term),
      translatedDefinition: normalizeText(currentTermAssistPayload.term.definition),
      translatedExample: normalizeText(currentTermAssistPayload.term.example),
      pronunciationGuide: ""
    };
    renderTranslationResult(result);
    setTranslationStatus("Version française affichée.");
    return;
  }

  const stored = getStoredTranslation(currentTermAssistPayload.richPayload, language);
  if (stored) {
    renderTranslationResult(stored);
    setTranslationStatus(`Traduction ${languageConfig.label.toLowerCase()} chargée.`);
    return;
  }

  const cacheKey = `${currentTermAssistPayload.slug}:${language}`;
  if (translationCache.has(cacheKey)) {
    renderTranslationResult(translationCache.get(cacheKey));
    setTranslationStatus(`Traduction ${languageConfig.label.toLowerCase()} chargée.`);
    return;
  }

  if (!translationButtonNode) return;
  translationButtonNode.disabled = true;
  setTranslationStatus(`Traduction ${languageConfig.label.toLowerCase()} en cours...`);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mode: "term_assist",
        language,
        term: currentTermAssistPayload.term.term,
        definition: currentTermAssistPayload.term.definition,
        example: currentTermAssistPayload.term.example
      })
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(errorPayload?.error || "translation_failed");
    }

    const payload = await response.json();
    const result = payload?.translation || null;
    if (!result) {
      throw new Error("translation_failed");
    }

    translationCache.set(cacheKey, result);
    renderTranslationResult(result);
    setTranslationStatus(`Traduction ${languageConfig.label.toLowerCase()} prête.`);
  } catch (_error) {
    renderTranslationResult(null);
    setTranslationStatus("La traduction assistée n’est pas disponible pour le moment.", true);
  } finally {
    translationButtonNode.disabled = false;
  }
}

function humanizeSlug(value) {
  const text = normalizeText(value);
  if (!text) return "";
  const withSpaces = text.replace(/-/g, " ");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function titleCase(value) {
  return normalizeText(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function findDetailSection(payload, titles) {
  const expectedTitles = Array.isArray(titles)
    ? titles.map((title) => normalizeText(title).toLowerCase()).filter(Boolean)
    : [];
  const sections = Array.isArray(payload?.detail_sections) ? payload.detail_sections : [];
  return sections.find((section) => expectedTitles.includes(normalizeText(section?.title).toLowerCase())) || null;
}

function getDetailSectionItems(payload, titles) {
  const section = findDetailSection(payload, titles);
  return toStringList(section?.items);
}

function toParagraphs(value) {
  if (Array.isArray(value)) return value.map((item) => normalizeText(item)).filter(Boolean);
  const text = normalizeText(value);
  return text ? [text] : [];
}

function toStringList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeText(item)).filter(Boolean);
}

function toFactList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const label = normalizeText(item?.label);
      const text = normalizeText(item?.value);
      if (!label || !text) return null;
      return { label, value: text };
    })
    .filter(Boolean);
}

function renderParagraphGroup(values) {
  const paragraphs = toParagraphs(values);
  if (!paragraphs.length) return null;

  const wrapper = document.createElement("div");
  wrapper.className = "term-detail-copy";

  for (const paragraphText of paragraphs) {
    const paragraph = document.createElement("p");
    paragraph.textContent = paragraphText;
    wrapper.appendChild(paragraph);
  }

  return wrapper;
}

function renderStringList(values, className = "term-list") {
  const listValues = toStringList(values);
  if (!listValues.length) return null;

  const list = document.createElement("ul");
  list.className = className;

  for (const value of listValues) {
    const item = document.createElement("li");
    item.textContent = value;
    list.appendChild(item);
  }

  return list;
}

function renderFacts(values) {
  const facts = toFactList(values);
  if (!facts.length) return null;

  const wrapper = document.createElement("dl");
  wrapper.className = "term-detail-facts";

  for (const fact of facts) {
    const row = document.createElement("div");
    row.className = "term-detail-fact";

    const term = document.createElement("dt");
    term.textContent = fact.label;

    const description = document.createElement("dd");
    description.textContent = fact.value;

    row.append(term, description);
    wrapper.appendChild(row);
  }

  return wrapper;
}

function renderColumns(columns) {
  if (!Array.isArray(columns) || !columns.length) return null;

  const validColumns = columns
    .map((column) => ({
      title: normalizeText(column?.title),
      items: toStringList(column?.items)
    }))
    .filter((column) => column.title || column.items.length);

  if (!validColumns.length) return null;

  const wrapper = document.createElement("div");
  wrapper.className = "term-detail-columns";

  for (const column of validColumns) {
    const article = document.createElement("article");
    article.className = "term-detail-column";

    if (column.title) {
      const heading = document.createElement("h3");
      heading.textContent = column.title;
      article.appendChild(heading);
    }

    const list = renderStringList(column.items, "term-list term-list--compact");
    if (list) article.appendChild(list);

    wrapper.appendChild(article);
  }

  return wrapper;
}

function renderDetailSections(sections) {
  if (!detailsBlock || !detailSectionsNode) return;

  clearTermChildren(detailSectionsNode);
  if (detailTabsNode) clearTermChildren(detailTabsNode);

  if (!Array.isArray(sections) || !sections.length) {
    detailsBlock.hidden = true;
    if (detailTabsNode) detailTabsNode.hidden = true;
    return;
  }

  const useTabs = sections.length > 4;
  const safeIndex = Math.min(Math.max(activeDetailSectionIndex, 0), sections.length - 1);
  activeDetailSectionIndex = safeIndex;

  let visibleSections = sections;
  if (useTabs) {
    visibleSections = [sections[safeIndex]];
    if (detailTabsNode) {
      detailTabsNode.hidden = false;
      sections.forEach((section, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `term-detail-tab${index === safeIndex ? " is-active" : ""}`;
        button.textContent = normalizeText(section?.title) || `Bloc ${index + 1}`;
        button.setAttribute("aria-pressed", index === safeIndex ? "true" : "false");
        button.addEventListener("click", () => {
          activeDetailSectionIndex = index;
          renderDetailSections(sections);
        });
        detailTabsNode.appendChild(button);
      });
    }
  } else if (detailTabsNode) {
    detailTabsNode.hidden = true;
  }

  for (const section of visibleSections) {
    const title = normalizeText(section?.title);
    const paragraphs = renderParagraphGroup(section?.body || section?.paragraphs);
    const facts = renderFacts(section?.facts);
    const items = renderStringList(section?.items);
    const columns = renderColumns(section?.columns);

    if (!title && !paragraphs && !facts && !items && !columns) continue;

    const article = document.createElement("article");
    article.className = "term-detail-card";

    if (title) {
      const heading = document.createElement("h3");
      heading.textContent = title;
      article.appendChild(heading);
    }

    if (paragraphs) article.appendChild(paragraphs);
    if (facts) article.appendChild(facts);
    if (items) article.appendChild(items);
    if (columns) article.appendChild(columns);

    detailSectionsNode.appendChild(article);
  }

  detailsBlock.hidden = !detailSectionsNode.childElementCount;
}

function applyEditorialProfile(payload) {
  const profile = payload?.editorial_profile || {};
  if (!profileLabelNode || !profileHeadlineNode || !profileNoteNode) return;

  profileLabelNode.textContent = normalizeText(profile.label) || "Usage";
  profileHeadlineNode.textContent = normalizeText(profile.headline) || "Comprendre le terme avant de le réutiliser";
  profileNoteNode.textContent = normalizeText(profile.note)
    || "L’objectif de cette fiche est de rendre le vocabulaire immédiatement exploitable dans le bureau, sur un plan ou dans une discussion de chantier.";
}

function setBlockVisibility(blockNode, isVisible) {
  if (!blockNode) return;
  blockNode.hidden = !isVisible;
}

function applyRichLayout(payload) {
  const detailSections = Array.isArray(payload?.detail_sections) ? payload.detail_sections : [];
  const hasRichDetails = detailSections.length > 0;
  const profileKind = normalizeText(payload?.editorial_profile?.kind);

  if (readingCardNode) {
    readingCardNode.hidden = hasRichDetails;
  }

  if (detailsHeadingNode) {
    detailsHeadingNode.textContent = profileKind === "material"
      ? "Lecture matériau"
      : profileKind === "construction"
        ? "Lecture construction"
        : "Détails métier";
  }

  if (!hasRichDetails) return;

  setBlockVisibility(explanationBlock, false);
  setBlockVisibility(applicationsBlock, false);
  setBlockVisibility(normsBlock, false);
  setBlockVisibility(constraintsBlock, false);
  setBlockVisibility(representationBlock, false);
  setBlockVisibility(leadBlockNode, false);
  setBlockVisibility(exampleNode?.parentElement, false);
  if (profileLabelNode?.parentElement?.parentElement) {
    profileLabelNode.parentElement.parentElement.hidden = true;
  }
}

async function fetchV2TermDetails(slug) {
  try {
    const response = await fetch(`content/v2/terms/${encodeURIComponent(slug)}.json`, { cache: "no-store" });
    if (!response.ok) return null;
    return await response.json();
  } catch (_error) {
    return null;
  }
}

function applyV2Details(payload) {
  applyEditorialProfile(payload);

  const explanation = payload?.content?.explanation || "";
  if (explanationBlock && explanationNode) {
    explanationBlock.hidden = !explanation;
    explanationNode.textContent = explanation || "";
  }

  renderList(applicationsBlock, applicationsNode, payload?.content?.applications || []);
  renderList(normsBlock, normsNode, payload?.content?.norms || []);
  renderList(constraintsBlock, constraintsNode, payload?.technical_data?.constraints || []);

  const abbreviation = payload?.representation?.abbreviation_plan || "";
  const drawingNote = payload?.representation?.drawing_note || "";
  if (representationBlock && abbreviationNode && drawingNoteNode) {
    const hasRepresentation = Boolean(abbreviation || drawingNote);
    representationBlock.hidden = !hasRepresentation;
    abbreviationNode.textContent = abbreviation ? `Abréviation : ${abbreviation}` : "";
    drawingNoteNode.textContent = drawingNote || "";
  }

  renderDetailSections(payload?.detail_sections || []);
  applyRichLayout(payload);
}

function renderQuickLinks(term, payload) {
  if (!quicklinksNode) return;
  clearTermChildren(quicklinksNode);

  const categorySlug = normalizeText(payload?.category_slug);
  const categoryLabel = payload?.category_slug === "materiaux"
    ? "Matériaux"
    : titleCase(humanizeSlug(payload?.category_slug));

  const items = [
    { label: "Accueil", href: "index.html" },
    { label: "Dictionnaire", href: "dictionnaire.html" }
  ];

  if (categorySlug) {
    items.push({
      label: categoryLabel,
      href: `category.html?slug=${encodeURIComponent(categorySlug)}`
    });
  }

  items.push({
    label: term?.term || "Fiche terme",
    current: true
  });

  items.forEach((item, index) => {
    const node = item.current ? document.createElement("span") : document.createElement("a");
    node.className = `term-quicklink${item.current ? " is-current" : ""}`;
    node.textContent = item.label;
    if (!item.current) node.href = item.href;
    quicklinksNode.appendChild(node);

    if (index < items.length - 1) {
      const separator = document.createElement("span");
      separator.className = "term-quicklink-separator";
      separator.textContent = "/";
      quicklinksNode.appendChild(separator);
    }
  });

  quicklinksNode.hidden = !quicklinksNode.childElementCount;
}

function renderTermSummary(term, payload, richPayload) {
  if (!summaryBlockNode || !summaryChipsNode || !summaryNoteNode) return;

  clearTermChildren(summaryChipsNode);

  const chips = [];
  const categoryName = normalizeText(term?.categories?.name);
  const mediaCount = Array.isArray(payload?.media) ? payload.media.length : 0;
  const relatedCount = Array.isArray(payload?.related_terms) ? payload.related_terms.length : 0;
  const normsCount = Array.isArray(richPayload?.content?.norms) ? richPayload.content.norms.length : 0;
  const applicationsCount = Array.isArray(richPayload?.content?.applications) ? richPayload.content.applications.length : 0;

  if (categoryName) chips.push({ label: categoryName, soft: false });
  if (mediaCount) chips.push({ label: `${mediaCount} média${mediaCount > 1 ? "s" : ""}`, soft: true });
  if (relatedCount) chips.push({ label: `${relatedCount} terme${relatedCount > 1 ? "s" : ""} lié${relatedCount > 1 ? "s" : ""}`, soft: true });
  if (normsCount) chips.push({ label: `${normsCount} norme${normsCount > 1 ? "s" : ""}`, soft: true });
  if (applicationsCount) chips.push({ label: `${applicationsCount} application${applicationsCount > 1 ? "s" : ""}`, soft: true });

  for (const chip of chips) {
    const node = document.createElement("span");
    node.className = `term-chip${chip.soft ? " term-chip--soft" : ""}`;
    node.textContent = chip.label;
    summaryChipsNode.appendChild(node);
  }

  const noteParts = [];
  if (normalizeText(term?.definition)) noteParts.push("commencer par la définition");
  if (normalizeText(term?.example)) noteParts.push("vérifier l’exemple");
  if (relatedCount) noteParts.push("ouvrir ensuite les termes liés");
  else if (categoryName) noteParts.push("revenir ensuite à la catégorie");

  summaryNoteNode.textContent = noteParts.length
    ? `À retenir : ${noteParts.join(", ")}.`
    : "À retenir : ouvrir la fiche, lire le repère, puis élargir la lecture depuis le dictionnaire.";

  summaryBlockNode.hidden = !summaryChipsNode.childElementCount && !normalizeText(summaryNoteNode.textContent);
}

function renderTermOrientation(term, payload, richPayload) {
  if (
    !orientationBlockNode
    || !orientationIdentityTitleNode
    || !orientationIdentityTextNode
    || !orientationUsesNode
    || !orientationContrastNode
    || !orientationWatchNode
  ) {
    return;
  }

  const categoryName = normalizeText(term?.categories?.name) || "Repère métier";
  const uses = [
    ...toStringList(richPayload?.content?.applications),
    ...getDetailSectionItems(richPayload, ["Usages courants", "Applications"])
  ];
  const watchpoints = [
    ...toStringList(richPayload?.technical_data?.constraints),
    ...getDetailSectionItems(richPayload, ["Vigilance", "Points de vigilance", "Inconvénients"])
  ];
  const contrasts = getDetailSectionItems(richPayload, ["À ne pas confondre", "A ne pas confondre"]);
  const identityText = normalizeText(richPayload?.content?.explanation)
    || normalizeText(term?.definition)
    || "Cette fiche aide à comprendre la notion avant de la réemployer sur plan, en réunion ou sur chantier.";

  orientationIdentityTitleNode.textContent = categoryName || "Repère essentiel";
  orientationIdentityTextNode.textContent = identityText;

  const usesCount = replaceListItems(orientationUsesNode, [...new Set(uses)]);
  const contrastCount = replaceListItems(orientationContrastNode, [...new Set(contrasts)]);
  const watchCount = replaceListItems(orientationWatchNode, [...new Set(watchpoints)]);

  orientationBlockNode.hidden = !normalizeText(identityText) && !usesCount && !contrastCount && !watchCount;
}

function renderTermNextSteps(term, payload, richPayload) {
  const categorySlug = normalizeText(richPayload?.category_slug || payload?.term?.categories?.slug);
  const categoryName = normalizeText(term?.categories?.name) || titleCase(humanizeSlug(categorySlug)) || "la catégorie";
  const related = Array.isArray(payload?.related_terms) ? payload.related_terms : [];
  const firstRelated = related.find((item) => normalizeText(item?.slug) && normalizeText(item?.term));

  if (nextCategoryTitleNode) nextCategoryTitleNode.textContent = `Revenir à ${categoryName}`;
  if (nextCategoryNoteNode) {
    nextCategoryNoteNode.textContent = `Comparer ${term?.term || "ce terme"} avec d’autres notions proches du même domaine.`;
  }
  if (nextCategoryLinkNode && categorySlug) {
    nextCategoryLinkNode.href = `category.html?slug=${encodeURIComponent(categorySlug)}`;
    nextCategoryLinkNode.textContent = `Ouvrir ${categoryName}`;
  } else if (nextCategoryLinkNode) {
    nextCategoryLinkNode.href = "category.html";
    nextCategoryLinkNode.textContent = "Ouvrir les catégories";
  }

  if (!nextRelatedCardNode || !nextRelatedTitleNode || !nextRelatedNoteNode || !nextRelatedLinkNode) return;

  if (firstRelated) {
    nextRelatedCardNode.hidden = false;
    nextRelatedTitleNode.textContent = `Ouvrir ${firstRelated.term}`;
    nextRelatedNoteNode.textContent = "Continuer la lecture avec une notion voisine déjà liée à cette fiche.";
    nextRelatedLinkNode.href = `term.html?slug=${encodeURIComponent(firstRelated.slug)}`;
    nextRelatedLinkNode.textContent = "Lire le terme lié";
    return;
  }

  nextRelatedCardNode.hidden = false;
  nextRelatedTitleNode.textContent = "Revenir au dictionnaire";
  nextRelatedNoteNode.textContent = "Retrouver rapidement un autre terme ou un autre point d’entrée.";
  nextRelatedLinkNode.href = "dictionnaire.html";
  nextRelatedLinkNode.textContent = "Ouvrir l’index";
}

function renderInlineExample(value, richMode = false) {
  if (!exampleInlineNode || !exampleInlineTextNode) return;
  const text = normalizeText(value);
  exampleInlineNode.hidden = !text || !richMode;
  exampleInlineTextNode.textContent = text;
}

function resetTermPageState() {
  if (summaryBlockNode) summaryBlockNode.hidden = true;
  if (summaryChipsNode) clearTermChildren(summaryChipsNode);
  if (summaryNoteNode) summaryNoteNode.textContent = "";
  if (orientationBlockNode) orientationBlockNode.hidden = true;
  replaceListItems(orientationUsesNode, []);
  replaceListItems(orientationContrastNode, []);
  replaceListItems(orientationWatchNode, []);
  if (orientationIdentityTitleNode) orientationIdentityTitleNode.textContent = "Repère essentiel";
  if (orientationIdentityTextNode) orientationIdentityTextNode.textContent = "";
  renderInlineExample("", false);
  if (quicklinksNode) quicklinksNode.hidden = true;
  if (detailsBlock) detailsBlock.hidden = true;
  if (detailTabsNode) detailTabsNode.hidden = true;
  if (explanationBlock) explanationBlock.hidden = true;
  if (applicationsBlock) applicationsBlock.hidden = true;
  if (normsBlock) normsBlock.hidden = true;
  if (constraintsBlock) constraintsBlock.hidden = true;
  if (representationBlock) representationBlock.hidden = true;
  if (relatedBlockNode) relatedBlockNode.hidden = true;
  if (mediaBlockNode) mediaBlockNode.hidden = true;
  if (visualBlockNode) visualBlockNode.hidden = true;
  if (assistBlockNode) assistBlockNode.hidden = true;
  if (pronounceButtonNode) pronounceButtonNode.disabled = true;
  if (translationButtonNode) translationButtonNode.disabled = false;
  currentTermAssistPayload = null;
  renderTranslationResult(null);
  setTranslationStatus("");
  if (nextCategoryTitleNode) nextCategoryTitleNode.textContent = "Revenir à la catégorie";
  if (nextCategoryNoteNode) nextCategoryNoteNode.textContent = "Comparer ce terme avec d’autres notions proches du même domaine.";
  if (nextCategoryLinkNode) {
    nextCategoryLinkNode.href = "category.html";
    nextCategoryLinkNode.textContent = "Ouvrir les catégories";
  }
  if (nextRelatedCardNode) nextRelatedCardNode.hidden = false;
  if (nextRelatedTitleNode) nextRelatedTitleNode.textContent = "Revenir au dictionnaire";
  if (nextRelatedNoteNode) nextRelatedNoteNode.textContent = "Retrouver rapidement un autre terme ou un autre point d’entrée.";
  if (nextRelatedLinkNode) {
    nextRelatedLinkNode.href = "dictionnaire.html";
    nextRelatedLinkNode.textContent = "Ouvrir l’index";
  }
}

function renderMedia(items) {
  clearTermChildren(mediaNode);
  if (!Array.isArray(items) || !items.length) {
    if (mediaBlockNode) mediaBlockNode.hidden = true;
    return;
  }

  if (mediaBlockNode) mediaBlockNode.hidden = false;

  const grid = document.createElement("div");
  grid.className = "term-media-grid";

  for (const item of items) {
    const wrapper = document.createElement(item.media_type === "image" || item.media_type === "schema" ? "figure" : "a");
    wrapper.className = "term-media-card";

    if (item.media_type === "image" || item.media_type === "schema") {
      const image = document.createElement("img");
      image.src = item.url;
      image.alt = item.alt_text || item.title || "Média du terme";
      image.className = "term-media-card__image";
      image.addEventListener("error", () => {
        wrapper.replaceChildren();
        const fallback = document.createElement("div");
        fallback.className = "term-empty";
        fallback.textContent = "Illustration indisponible pour le moment.";
        wrapper.appendChild(fallback);
      });
      wrapper.appendChild(image);
    } else {
      wrapper.href = item.url;
      wrapper.target = "_blank";
      wrapper.rel = "noreferrer";
      wrapper.classList.add("term-media-card--pdf");
    }

    const body = document.createElement("figcaption");
    body.className = "term-media-card__body";

    const title = document.createElement("strong");
    title.textContent = item.title || (item.media_type === "pdf" ? "Document PDF" : "Illustration");
    body.appendChild(title);

    const caption = document.createElement("div");
    caption.className = "meta meta--subtle";
    caption.textContent = item.alt_text || item.title || "";
    body.appendChild(caption);

    wrapper.appendChild(body);
    grid.appendChild(wrapper);
  }

  mediaNode.appendChild(grid);
}

function renderVisualSlot(node, item, emptyLabel) {
  if (!node) return;
  clearTermChildren(node);

  if (!item?.url) {
    const empty = document.createElement("div");
    empty.className = "term-visual-empty";
    empty.textContent = emptyLabel;
    node.appendChild(empty);
    return;
  }

  const figure = document.createElement("figure");
  figure.className = "term-visual-figure";

  const image = document.createElement("img");
  image.src = item.url;
  image.alt = item.alt_text || item.title || emptyLabel;
  image.className = "term-visual-image";
  figure.appendChild(image);

  if (item.title || item.alt_text) {
    const caption = document.createElement("figcaption");
    caption.className = "term-visual-caption";
    caption.textContent = item.title || item.alt_text || "";
    figure.appendChild(caption);
  }

  node.appendChild(figure);
}

function renderVisuals(items) {
  if (!visualBlockNode || !visualImageNode || !visualSchemaNode) return;

  const list = Array.isArray(items) ? items : [];
  const imageItem = list.find((item) => item.media_type === "image") || null;
  const schemaItem = list.find((item) => item.media_type === "schema") || null;

  renderVisualSlot(visualImageNode, imageItem, "Image matériau à ajouter");
  renderVisualSlot(visualSchemaNode, schemaItem, "Dessin technique à ajouter");

  visualBlockNode.hidden = false;
}

function renderRelated(items) {
  clearTermChildren(relatedNode);
  if (!Array.isArray(items) || !items.length) {
    if (relatedBlockNode) relatedBlockNode.hidden = true;
    return;
  }

  if (relatedBlockNode) relatedBlockNode.hidden = false;

  const list = document.createElement("div");
  list.className = "chips";

  for (const item of items) {
    const link = document.createElement("a");
    link.className = "chip";
    link.href = `term.html?slug=${encodeURIComponent(item.slug)}`;
    link.textContent = item.term;
    list.appendChild(link);
  }

  relatedNode.appendChild(list);
}

function setupTermAssist(payload) {
  currentTermAssistPayload = payload;
  renderTranslationResult(null);
  setTranslationStatus("Choisis une langue puis lance la traduction ou la prononciation.");

  if (assistBlockNode) {
    assistBlockNode.hidden = !payload?.term?.term;
  }

  if (pronounceButtonNode) {
    pronounceButtonNode.disabled = !payload?.term?.term;
  }
}

async function loadTermPage() {
  setTermPageReadyState("loading");
  const slug = getSlug();
  if (!slug) {
    titleNode.textContent = "TERME";
    subtitleNode.textContent = "Fiche détaillée du dictionnaire Dico-Archi.";
    categoryNode.textContent = "-";
    definitionNode.textContent = "Choisis un terme depuis le dictionnaire pour afficher sa fiche détaillée.";
    exampleNode.textContent = "Exemple affiché ici une fois un terme sélectionné.";
    resetTermPageState();
    document.title = "Fiche terme - Dico-Archi";
    setTermPageReadyState("idle");
    return;
  }

  try {
    const v2Payload = await fetchV2TermDetails(slug);
    let payload = null;

    try {
      payload = await window.DicoArchiApi.fetchTermBySlug(slug);
    } catch (_error) {
      payload = null;
    }

    if (!payload && !v2Payload) {
      throw new Error("term_not_found");
    }

    const term = payload?.term || {
      term: v2Payload?.term || "TERME",
      definition: v2Payload?.content?.definition || "",
      example: v2Payload?.content?.example || "",
      status: v2Payload?.status || "draft",
      categories: {
        name: humanizeSlug(v2Payload?.category_slug)
      }
    };

    const richPayload = v2Payload || payload?.rich_payload || null;

    const effectiveSubtitle = normalizeText(richPayload?.editorial_profile?.label)
      || (payload ? "Fiche détaillée du dictionnaire Dico-Archi." : "Fiche locale en préparation.");

    titleNode.textContent = term.term || "TERME";
    subtitleNode.textContent = effectiveSubtitle;
    setTermText(categoryNode, term.categories?.name);
    setTermText(definitionNode, term.definition, "Définition indisponible.");
    setTermText(exampleNode, term.example, "Aucun exemple disponible.");
    renderInlineExample(term.example, Boolean(richPayload?.detail_sections?.length));
    renderTermSummary(term, payload || {}, richPayload || {});
    renderTermOrientation(term, payload || {}, richPayload || {});
    renderMedia(payload?.media || []);
    renderVisuals(payload?.media || []);
    renderRelated(payload?.related_terms || []);
    applyV2Details(richPayload);
    renderQuickLinks(term, v2Payload || { category_slug: payload?.term?.categories?.slug || "" });
    renderTermNextSteps(term, payload || {}, richPayload || {});
    setupTermAssist({
      slug,
      term,
      richPayload
    });
    document.title = `${term.term || "Fiche terme"} - Dico-Archi`;
    setTermPageReadyState("ready");
  } catch (error) {
    titleNode.textContent = "TERME";
    subtitleNode.textContent = error?.message === "term_not_found"
      ? "Aucune fiche correspondante n'a été trouvée."
      : "Impossible de charger cette fiche pour le moment.";
    categoryNode.textContent = "-";
    definitionNode.textContent = "La fiche n'a pas pu être chargée.";
    exampleNode.textContent = "-";
    resetTermPageState();
    clearTermChildren(mediaNode);
    clearTermChildren(relatedNode);
    document.title = "Fiche terme - Dico-Archi";
    setTermPageReadyState(error?.message === "term_not_found" ? "empty" : "error");
  }
}

if (translationButtonNode) {
  translationButtonNode.addEventListener("click", requestTranslation);
}

if (pronounceButtonNode) {
  pronounceButtonNode.addEventListener("click", () => {
    speakText(currentTermAssistPayload?.term?.term || "", "fr-FR");
  });
}

if (pronounceTranslationButtonNode) {
  pronounceTranslationButtonNode.addEventListener("click", () => {
    const language = normalizeText(currentRenderedTranslation?.language).toLowerCase();
    const languageConfig = ASSIST_LANGUAGE_CONFIG[language];
    speakText(currentRenderedTranslation?.translatedTerm || "", languageConfig?.speechLang || "en-US");
  });
}

loadTermPage();
