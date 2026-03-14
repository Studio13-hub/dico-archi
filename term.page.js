const titleNode = document.getElementById("term-title");
const subtitleNode = document.getElementById("term-subtitle");
const categoryNode = document.getElementById("term-category");
const definitionNode = document.getElementById("term-definition");
const exampleNode = document.getElementById("term-example");
const mediaNode = document.getElementById("term-media");
const relatedNode = document.getElementById("term-related");
const statusNode = document.getElementById("term-status");

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

function renderMedia(items) {
  clearTermChildren(mediaNode);
  if (!Array.isArray(items) || !items.length) {
    mediaNode.textContent = "Aucun média disponible.";
    return;
  }

  for (const item of items) {
    const wrapper = document.createElement("div");
    wrapper.className = "meta";

    if (item.media_type === "image" || item.media_type === "schema") {
      const image = document.createElement("img");
      image.src = item.url;
      image.alt = item.alt_text || item.title || "Média du terme";
      image.style.maxWidth = "100%";
      image.style.borderRadius = "12px";
      image.addEventListener("error", () => {
        image.remove();
        if (!wrapper.querySelector(".meta--subtle")) {
          const fallback = document.createElement("div");
          fallback.className = "meta meta--subtle";
          fallback.textContent = "Illustration indisponible pour le moment.";
          wrapper.appendChild(fallback);
        }
      });
      wrapper.appendChild(image);
    } else {
      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = item.title || item.url;
      wrapper.appendChild(link);
    }

    if (item.title) {
      const caption = document.createElement("div");
      caption.className = "meta meta--subtle";
      caption.textContent = item.title;
      wrapper.appendChild(caption);
    }

    mediaNode.appendChild(wrapper);
  }
}

function renderRelated(items) {
  clearTermChildren(relatedNode);
  if (!Array.isArray(items) || !items.length) {
    relatedNode.textContent = "Aucun terme lié.";
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

    titleNode.textContent = term.term || "TERME";
    subtitleNode.textContent = "Fiche détaillée du dictionnaire DicoArchi.";
    setTermText(categoryNode, term.categories?.name);
    setTermText(definitionNode, term.definition, "Définition indisponible.");
    setTermText(exampleNode, term.example, "Aucun exemple disponible.");
    statusNode.textContent = `Statut: ${term.status || "-"}`;
    renderMedia(payload.media || []);
    renderRelated(payload.related_terms || []);
    document.title = `${term.term || "Fiche terme"} - DicoArchi`;
  } catch (error) {
    titleNode.textContent = "TERME";
    subtitleNode.textContent = "Impossible de charger cette fiche pour le moment.";
    categoryNode.textContent = "-";
    definitionNode.textContent = "La fiche n'a pas pu être chargée.";
    exampleNode.textContent = "-";
    statusNode.textContent = `Erreur: ${error.message || "internal_error"}`;
    mediaNode.textContent = "Aucun média disponible.";
    relatedNode.textContent = "Aucun terme lié.";
  }
}

loadTermPage();
