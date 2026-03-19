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
let activeDetailSectionIndex = 0;

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

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
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

function renderInlineExample(value, richMode = false) {
  if (!exampleInlineNode || !exampleInlineTextNode) return;
  const text = normalizeText(value);
  exampleInlineNode.hidden = !text || !richMode;
  exampleInlineTextNode.textContent = text;
}

function resetTermPageState() {
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

async function loadTermPage() {
  const slug = getSlug();
  if (!slug) {
    titleNode.textContent = "TERME";
    subtitleNode.textContent = "Fiche détaillée du dictionnaire Dico-Archi.";
    categoryNode.textContent = "-";
    definitionNode.textContent = "Choisis un terme depuis le dictionnaire pour afficher sa fiche détaillée.";
    exampleNode.textContent = "Exemple affiché ici une fois un terme sélectionné.";
    resetTermPageState();
    document.title = "Fiche terme - Dico-Archi";
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
    renderMedia(payload?.media || []);
    renderVisuals(payload?.media || []);
    renderRelated(payload?.related_terms || []);
    applyV2Details(richPayload);
    renderQuickLinks(term, v2Payload || { category_slug: payload?.term?.categories?.slug || "" });
    document.title = `${term.term || "Fiche terme"} - Dico-Archi`;
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
  }
}

loadTermPage();
