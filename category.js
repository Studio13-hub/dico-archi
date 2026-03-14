const titleEl = document.getElementById("category-title");
const subtitleEl = document.getElementById("category-subtitle");
const breadcrumbEl = document.getElementById("category-breadcrumb");
const cardsEl = document.getElementById("category-cards");
const dicoApi = window.DicoArchiApi;

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function parseQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    categoryId: (params.get("id") || params.get("category_id") || "").trim(),
    categoryName: (params.get("name") || "").trim()
  };
}

function renderMessage(title, subtitle) {
  titleEl.textContent = title;
  subtitleEl.textContent = subtitle;
  cardsEl.textContent = "";
  breadcrumbEl.textContent = "";
}

function renderCards(list) {
  cardsEl.textContent = "";

  if (!list.length) {
    const empty = document.createElement("article");
    empty.className = "card";

    const heading = document.createElement("h3");
    heading.textContent = "Aucun terme publie";

    const body = document.createElement("div");
    body.textContent = "Aucune fiche publiee ne correspond a cette categorie.";

    empty.appendChild(heading);
    empty.appendChild(body);
    cardsEl.appendChild(empty);
    return;
  }

  for (const item of list) {
    const card = document.createElement("article");
    card.className = "card";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item.categoryName || "Sans categorie";

    const title = document.createElement("h3");
    title.textContent = item.term;

    const definition = document.createElement("div");
    definition.textContent = item.definition || "Definition indisponible.";

    const link = document.createElement("a");
    link.className = "card__link";
    link.href = `term.html?slug=${encodeURIComponent(item.slug)}`;
    link.textContent = "Voir fiche";

    const actions = document.createElement("div");
    actions.className = "card__actions";
    actions.appendChild(link);

    card.appendChild(tag);
    card.appendChild(title);
    card.appendChild(definition);
    card.appendChild(actions);
    cardsEl.appendChild(card);
  }
}

function buildBreadcrumb(label) {
  breadcrumbEl.textContent = "";
  breadcrumbEl.append("Accueil / ");
  const current = document.createElement("strong");
  current.textContent = label;
  breadcrumbEl.appendChild(current);
}

async function loadCategoryPage() {
  const { categoryId, categoryName } = parseQueryParams();
  if (!categoryId && !categoryName) {
    renderMessage("Categorie introuvable", "Nom ou identifiant de categorie manquant.");
    return;
  }

  if (!dicoApi) {
    renderMessage("Configuration Supabase manquante", "Impossible de charger les categories.");
    return;
  }

  try {
    const items = await dicoApi.fetchPublishedTermsBasic();
    const normalizedName = normalizeText(categoryName);

    const normalizedTerms = items.map((item) => ({
      id: item.id,
      term: item.term || "",
      slug: item.slug || "",
      definition: item.definition || "",
      categoryId: item.category_id || item.categories?.id || "",
      categoryName: item.categories?.name || "Sans categorie"
    }));

    const filtered = normalizedTerms
      .filter((item) => {
        if (categoryId) return item.categoryId === categoryId;
        return normalizeText(item.categoryName) === normalizedName;
      })
      .sort((a, b) => a.term.localeCompare(b.term, "fr"));

    const resolvedLabel = filtered[0]?.categoryName || categoryName || "Categorie";
    titleEl.textContent = resolvedLabel;
    subtitleEl.textContent = `${filtered.length} terme${filtered.length > 1 ? "s" : ""}`;
    buildBreadcrumb(resolvedLabel);
    renderCards(filtered);
  } catch (error) {
    renderMessage("Erreur de chargement", error.message || "Impossible de charger les termes.");
  }
}

loadCategoryPage();
