const titleNode = document.getElementById("term-title");
const subtitleNode = document.getElementById("term-subtitle");
const categoryNode = document.getElementById("term-category");
const definitionNode = document.getElementById("term-definition");
const exampleNode = document.getElementById("term-example");
const mediaNode = document.getElementById("term-media");
const relatedNode = document.getElementById("term-related");
const statusNode = document.getElementById("term-status");
const categoryChipNode = document.getElementById("term-category-chip");
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
}

function renderMedia(items) {
  clearTermChildren(mediaNode);
  if (!Array.isArray(items) || !items.length) {
    const fallback = document.createElement("div");
    fallback.className = "term-empty";
    fallback.textContent = "Aucun média disponible pour le moment.";
    mediaNode.appendChild(fallback);
    return;
  }

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

function renderRelated(items) {
  clearTermChildren(relatedNode);
  if (!Array.isArray(items) || !items.length) {
    const fallback = document.createElement("div");
    fallback.className = "term-empty";
    fallback.textContent = "Aucun terme lié pour le moment.";
    relatedNode.appendChild(fallback);
    return;
  }

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
    titleNode.textContent = "Terme introuvable";
    subtitleNode.textContent = "Aucun slug n'a été fourni.";
    statusNode.textContent = "Erreur: slug manquant";
    return;
  }

  try {
    const payload = await window.DicoArchiApi.fetchTermBySlug(slug);
    const term = payload.term || {};
    const v2Payload = await fetchV2TermDetails(slug);

    titleNode.textContent = term.term || "TERME";
    subtitleNode.textContent = "Fiche détaillée du dictionnaire DicoArchi.";
    setTermText(categoryNode, term.categories?.name);
    setTermText(categoryChipNode, term.categories?.name);
    setTermText(definitionNode, term.definition, "Définition indisponible.");
    setTermText(exampleNode, term.example, "Aucun exemple disponible.");
    statusNode.textContent = term.status === "published" ? "Publié" : (term.status || "-");
    renderMedia(payload.media || []);
    renderRelated(payload.related_terms || []);
    applyV2Details(v2Payload);
    document.title = `${term.term || "Fiche terme"} - DicoArchi`;
  } catch (error) {
    titleNode.textContent = "TERME";
    subtitleNode.textContent = "Impossible de charger cette fiche pour le moment.";
    categoryNode.textContent = "-";
    if (categoryChipNode) categoryChipNode.textContent = "-";
    definitionNode.textContent = "La fiche n'a pas pu être chargée.";
    exampleNode.textContent = "-";
    statusNode.textContent = "Erreur";
    mediaNode.textContent = "Aucun média disponible.";
    relatedNode.textContent = "Aucun terme lié.";
    if (explanationBlock) explanationBlock.hidden = true;
    if (applicationsBlock) applicationsBlock.hidden = true;
    if (normsBlock) normsBlock.hidden = true;
    if (constraintsBlock) constraintsBlock.hidden = true;
    if (representationBlock) representationBlock.hidden = true;
  }
}

loadTermPage();
