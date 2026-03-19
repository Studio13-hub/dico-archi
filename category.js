const titleEl = document.getElementById("category-title");
const subtitleEl = document.getElementById("category-subtitle");
const breadcrumbEl = document.getElementById("category-breadcrumb");
const cardsEl = document.getElementById("category-cards");
const categoryCountEl = document.getElementById("category-count");
const categoryModeEl = document.getElementById("category-mode");
const categorySearchEl = document.getElementById("category-search");
const categoryEvidenceTitleEl = document.getElementById("category-evidence-title");
const categoryEvidenceCopyEl = document.getElementById("category-evidence-copy");
const categoryFeaturedLinksEl = document.getElementById("category-featured-links");
const categoryReadingNoteEl = document.getElementById("category-reading-note");
const dicoApi = window.DicoArchiApi;
let currentCategoryTerms = [];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function parseQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const rawCategoryId = params.get("id") || params.get("category_id") || "";
  const rawCategoryName = params.get("name") || params.get("slug") || "";
  return {
    categoryId: String(rawCategoryId).trim(),
    categoryName: String(rawCategoryName).trim(),
    hadEmptyCategoryId:
      (params.has("id") && !String(params.get("id") || "").trim())
      || (params.has("category_id") && !String(params.get("category_id") || "").trim())
  };
}

function renderMessage(title, subtitle) {
  titleEl.textContent = title;
  subtitleEl.textContent = subtitle;
  cardsEl.textContent = "";
  breadcrumbEl.textContent = "";
  if (categoryCountEl) categoryCountEl.textContent = "-";
}

function renderCategoryIndex(list) {
  cardsEl.textContent = "";

  if (!list.length) {
    renderMessage("Catégories indisponibles", "Aucune catégorie n'est disponible pour le moment.");
    return;
  }

  for (const item of list) {
    const card = document.createElement("article");
    card.className = "card";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = `${item.count} terme${item.count > 1 ? "s" : ""}`;

    const title = document.createElement("h3");
    title.textContent = item.name;

    const description = document.createElement("div");
    description.textContent = item.description || "Catégorie du dictionnaire Dico-Archi.";

    const meta = document.createElement("p");
    meta.className = "meta meta--subtle";
    meta.textContent = item.count
      ? "Entrée utile pour comparer plusieurs fiches proches."
      : "Aucune fiche publiée pour le moment dans ce domaine.";

    const link = document.createElement("a");
    link.className = "card__link";
    link.href = `category.html?category_id=${encodeURIComponent(item.id)}`;
    link.textContent = "Explorer la catégorie";

    const actions = document.createElement("div");
    actions.className = "card__actions";
    actions.appendChild(link);

    card.appendChild(tag);
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(meta);
    card.appendChild(actions);
    cardsEl.appendChild(card);
  }
}

function renderCards(list) {
  cardsEl.textContent = "";

  if (!list.length) {
    const empty = document.createElement("article");
    empty.className = "card";

    const heading = document.createElement("h3");
    heading.textContent = "Aucun terme publié";

    const body = document.createElement("div");
    body.textContent = "Aucune fiche publiée ne correspond à cette catégorie.";

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
    tag.textContent = item.categoryName || "Sans catégorie";

    const title = document.createElement("h3");
    title.textContent = item.term;

    const definition = document.createElement("div");
    definition.textContent = item.definition || "Définition indisponible.";

    const meta = document.createElement("p");
    meta.className = "meta meta--subtle";
    meta.textContent = "Ouvrir la fiche pour les détails, médias et termes liés.";

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
    card.appendChild(meta);
    card.appendChild(actions);
    cardsEl.appendChild(card);
  }
}

function renderCategoryFeaturedLinks(list) {
  if (!categoryFeaturedLinksEl) return;
  categoryFeaturedLinksEl.textContent = "";

  if (!Array.isArray(list) || !list.length) {
    categoryFeaturedLinksEl.textContent = "Aucune fiche repère pour le moment.";
    return;
  }

  for (const item of list.slice(0, 3)) {
    const anchor = document.createElement("a");
    anchor.className = "dictionary-evidence-link";
    anchor.href = `term.html?slug=${encodeURIComponent(item.slug)}`;

    const title = document.createElement("strong");
    title.textContent = item.term;

    const meta = document.createElement("span");
    meta.textContent = "Ouvrir la fiche détaillée";

    anchor.append(title, meta);
    categoryFeaturedLinksEl.appendChild(anchor);
  }
}

function applyCategoryTermsView() {
  const query = String(categorySearchEl?.value || "").trim().toLowerCase();
  const filtered = query
    ? currentCategoryTerms.filter((item) =>
        [item.term, item.definition, item.categoryName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : currentCategoryTerms.slice();

  if (categoryCountEl) {
    categoryCountEl.textContent = `${filtered.length} fiche${filtered.length > 1 ? "s" : ""}`;
  }
  if (subtitleEl) {
    subtitleEl.textContent = query
      ? `${filtered.length} terme${filtered.length > 1 ? "s" : ""} trouvé${filtered.length > 1 ? "s" : ""}`
      : `${currentCategoryTerms.length} terme${currentCategoryTerms.length > 1 ? "s" : ""}`;
  }

  if (categoryReadingNoteEl) {
    categoryReadingNoteEl.textContent = query
      ? "Le filtre garde la catégorie active, mais resserre la lecture sur les fiches utiles."
      : "Ouvrez d’abord les trois premières fiches utiles, puis élargissez la comparaison si nécessaire.";
  }

  renderCards(filtered);
}

function buildBreadcrumb(label) {
  breadcrumbEl.textContent = "";
  const homeLink = document.createElement("a");
  homeLink.href = "index.html";
  homeLink.textContent = "Accueil";
  breadcrumbEl.appendChild(homeLink);

  const firstSeparator = document.createElement("span");
  firstSeparator.textContent = " / ";
  breadcrumbEl.appendChild(firstSeparator);

  const categoriesLink = document.createElement("a");
  categoriesLink.href = "category.html";
  categoriesLink.textContent = "Catégories";
  breadcrumbEl.appendChild(categoriesLink);

  const secondSeparator = document.createElement("span");
  secondSeparator.textContent = " / ";
  breadcrumbEl.appendChild(secondSeparator);

  const current = document.createElement("strong");
  current.textContent = label;
  breadcrumbEl.appendChild(current);
}

async function loadCategoryPage() {
  const { categoryId, categoryName, hadEmptyCategoryId } = parseQueryParams();
  if (!dicoApi) {
    renderMessage("Configuration Supabase manquante", "Impossible de charger les catégories.");
    return;
  }

  if (hadEmptyCategoryId && !categoryName) {
    window.history.replaceState({}, "", "category.html");
  }

  try {
    const [items, categories] = await Promise.all([
      dicoApi.fetchPublishedTermsBasic(),
      dicoApi.fetchCategories()
    ]);

    const normalizedName = normalizeText(categoryName);

    const normalizedTerms = items.map((item) => ({
      id: item.id,
      term: item.term || "",
      slug: item.slug || "",
      definition: item.definition || "",
      categoryId: item.category_id || item.categories?.id || "",
      categoryName: item.categories?.name || "Sans catégorie"
    }));

    if (!categoryId && !categoryName) {
      const countByCategoryId = new Map();
      for (const item of normalizedTerms) {
        if (!item.categoryId) continue;
        countByCategoryId.set(item.categoryId, (countByCategoryId.get(item.categoryId) || 0) + 1);
      }

      const sortedCategories = categories
        .map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          count: countByCategoryId.get(category.id) || 0
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "fr"));

      titleEl.textContent = "Catégories";
      subtitleEl.textContent = `${sortedCategories.length} domaine${sortedCategories.length > 1 ? "s" : ""} disponible${sortedCategories.length > 1 ? "s" : ""}`;
      breadcrumbEl.textContent = "";
      const homeLink = document.createElement("a");
      homeLink.href = "index.html";
      homeLink.textContent = "Accueil";
      breadcrumbEl.appendChild(homeLink);
      const separator = document.createElement("span");
      separator.textContent = " / ";
      breadcrumbEl.appendChild(separator);
      const current = document.createElement("strong");
      current.textContent = "Catégories";
      breadcrumbEl.appendChild(current);
      if (categoryCountEl) categoryCountEl.textContent = `${sortedCategories.length} domaine${sortedCategories.length > 1 ? "s" : ""}`;
      if (categoryModeEl) categoryModeEl.textContent = "Index des domaines";
      if (categoryEvidenceTitleEl) categoryEvidenceTitleEl.textContent = "Explorer les domaines";
      if (categoryEvidenceCopyEl) categoryEvidenceCopyEl.textContent = "Commencez par une famille métier, puis ouvrez les fiches les plus utiles dans ce domaine.";
      if (categorySearchEl) categorySearchEl.disabled = true;
      renderCategoryFeaturedLinks([]);
      renderCategoryIndex(sortedCategories);
      return;
    }

    const filtered = normalizedTerms
      .filter((item) => {
        if (categoryId) return item.categoryId === categoryId;
        return normalizeText(item.categoryName) === normalizedName;
      })
      .sort((a, b) => a.term.localeCompare(b.term, "fr"));

    const resolvedLabel = filtered[0]?.categoryName || categoryName || "Catégorie";
    currentCategoryTerms = filtered;
    titleEl.textContent = resolvedLabel;
    subtitleEl.textContent = `${filtered.length} terme${filtered.length > 1 ? "s" : ""}`;
    buildBreadcrumb(resolvedLabel);
    if (categoryCountEl) categoryCountEl.textContent = `${filtered.length} fiche${filtered.length > 1 ? "s" : ""}`;
    if (categoryModeEl) categoryModeEl.textContent = "Fiches publiées";
    if (categoryEvidenceTitleEl) categoryEvidenceTitleEl.textContent = `${resolvedLabel}: par où commencer`;
    if (categoryEvidenceCopyEl) {
      categoryEvidenceCopyEl.textContent = filtered.length
        ? "Les premières fiches ci-dessous servent de point d’entrée rapide avant une lecture plus large."
        : "Cette catégorie n’a pas encore assez de fiches publiées pour proposer un vrai parcours.";
    }
    if (categorySearchEl) categorySearchEl.disabled = false;
    renderCategoryFeaturedLinks(filtered);
    applyCategoryTermsView();
  } catch (error) {
    renderMessage("Erreur de chargement", error.message || "Impossible de charger les termes.");
  }
}

if (categorySearchEl) {
  categorySearchEl.addEventListener("input", applyCategoryTermsView);
}

loadCategoryPage();
