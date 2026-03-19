const homeSearchInput = document.getElementById("home-search");
const homeSearchButton = document.getElementById("home-search-button");
const homeSearchResults = document.getElementById("home-search-results");
const featuredTermTitle = document.getElementById("featured-term-title");
const featuredTermMeta = document.getElementById("featured-term-meta");
const featuredTermDefinition = document.getElementById("featured-term-definition");
const featuredTermLink = document.getElementById("featured-term-link");
const homeTermCount = document.getElementById("home-term-count");
const homeCategoryCount = document.getElementById("home-category-count");
const homeCategoriesToggle = document.querySelector("[data-home-categories-toggle]");
const homeHeroCategories = document.getElementById("home-hero-categories");
const homeHeroCategoriesList = document.getElementById("home-hero-categories-list");
const homeCategoryCloudList = document.getElementById("home-category-cloud-list");
const homeHeroPaths = document.getElementById("home-hero-paths");
const homeReadingSamples = document.getElementById("home-reading-samples");
const homeCategoryFocus = document.getElementById("home-category-focus");
let homeTermsCache = [];

const HOME_PREFERRED_TERM_SLUGS = [
  "bois-lamelle-colle",
  "acrotere",
  "coupe",
  "sia-181",
  "facade-ventilee",
  "dalle",
  "bardage"
];

function pickPreferredTerms(terms, limit = 3) {
  const items = Array.isArray(terms) ? terms : [];
  const bySlug = new Map(items.map((item) => [String(item.slug || "").trim(), item]));
  const selected = [];

  for (const slug of HOME_PREFERRED_TERM_SLUGS) {
    const item = bySlug.get(slug);
    if (item && !selected.includes(item)) selected.push(item);
    if (selected.length >= limit) return selected;
  }

  for (const item of items) {
    if (!item || selected.includes(item)) continue;
    selected.push(item);
    if (selected.length >= limit) break;
  }

  return selected;
}

function renderLinkList(container, items, buildHref, buildMetaText) {
  if (!container) return;

  if (!Array.isArray(items) || !items.length) {
    container.innerHTML = '<span class="meta meta--subtle">Aucun repère disponible pour le moment.</span>';
    return;
  }

  container.innerHTML = "";

  for (const item of items) {
    const anchor = document.createElement("a");
    anchor.className = "home-evidence-link";
    anchor.href = buildHref(item);

    const title = document.createElement("strong");
    title.textContent = item.term || item.name || "Repère";

    const meta = document.createElement("span");
    meta.textContent = buildMetaText(item);

    anchor.append(title, meta);
    container.appendChild(anchor);
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setupContactLinks() {
  const email = String(window.DICO_ARCHI_CONTACT_EMAIL || "").trim();
  const links = document.querySelectorAll("[data-contact-link]");

  for (const link of links) {
    if (!(link instanceof HTMLAnchorElement)) continue;

    if (!email) {
      link.href = "contribuer.html";
      link.textContent = "Contribuer";
      continue;
    }

    link.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Contact Dico-Archi")}`;
  }
}

function renderSearchResults(items) {
  if (!Array.isArray(items) || !items.length) {
    homeSearchResults.textContent = "Aucun résultat.";
    homeSearchResults.classList.add("home-search-results--active");
    return;
  }

  const links = items.slice(0, 6).map((item) => {
    const categoryName = item.categories?.name || item.category || "";
    const label = categoryName
      ? `${escapeHtml(item.term)} <span>${escapeHtml(categoryName)}</span>`
      : escapeHtml(item.term);

    return `<a href="term.html?slug=${encodeURIComponent(item.slug)}">${label}</a>`;
  });

  homeSearchResults.innerHTML = links.join("");
  homeSearchResults.classList.add("home-search-results--active");
}

async function runHomeSearch() {
  const query = homeSearchInput.value.trim();
  if (!query) {
    homeSearchResults.textContent = "Saisissez un terme à rechercher.";
    homeSearchResults.classList.add("home-search-results--active");
    return;
  }

  try {
    const payload = await window.DicoArchiApi.searchTerms(query);
    renderSearchResults(payload.results || []);
  } catch (error) {
    homeSearchResults.textContent = `Erreur: ${error.message || "search_failed"}`;
    homeSearchResults.classList.add("home-search-results--active");
  }
}

function runInstantHomeSearch() {
  const query = String(homeSearchInput?.value || "").trim().toLowerCase();

  if (!query) {
    homeSearchResults.textContent = "";
    homeSearchResults.classList.remove("home-search-results--active");
    return;
  }

  const matches = homeTermsCache
    .filter((item) => {
      const term = String(item.term || "").toLowerCase();
      return term.startsWith(query) || term.includes(query);
    })
    .slice(0, 6);

  renderSearchResults(matches);
}

async function loadFeaturedTerm() {
  if (!window.DicoArchiApi) {
    featuredTermTitle.textContent = "Configuration Supabase manquante";
    featuredTermDefinition.textContent = "Impossible de charger le terme du jour.";
    return;
  }

  try {
    const items = await window.DicoArchiApi.fetchPublishedTermsBasic();
    if (!Array.isArray(items) || !items.length) {
      featuredTermTitle.textContent = "Aucun terme publié";
      featuredTermDefinition.textContent = "Le dictionnaire ne contient pas encore de fiche publiée.";
      featuredTermLink.href = "dictionnaire.html";
      return;
    }

    const dayIndex = Math.floor(Date.now() / 86400000) % items.length;
    const item = items[dayIndex];

    featuredTermTitle.textContent = item.term;
    if (featuredTermMeta) {
      const categoryName = item.categories?.name || item.category || "";
      if (categoryName) {
        featuredTermMeta.hidden = false;
        featuredTermMeta.textContent = categoryName;
      } else {
        featuredTermMeta.hidden = true;
        featuredTermMeta.textContent = "";
      }
    }
    featuredTermDefinition.textContent = item.definition || "Définition indisponible.";
    featuredTermLink.href = `term.html?slug=${encodeURIComponent(item.slug)}`;
  } catch (error) {
    featuredTermTitle.textContent = "Erreur";
    if (featuredTermMeta) {
      featuredTermMeta.hidden = true;
      featuredTermMeta.textContent = "";
    }
    featuredTermDefinition.textContent = error.message || "Impossible de charger le terme du jour.";
    featuredTermLink.href = "dictionnaire.html";
  }
}

function renderHeroCategories(categories) {
  if (!homeHeroCategoriesList) return;

  if (!Array.isArray(categories) || !categories.length) {
    homeHeroCategoriesList.innerHTML = '<span class="meta meta--subtle">Aucune catégorie disponible.</span>';
    return;
  }

  homeHeroCategoriesList.innerHTML = "";

  categories.slice(0, 10).forEach((category) => {
    const anchor = document.createElement("a");
    anchor.className = "home-category-pill";
    anchor.href = `category.html?slug=${encodeURIComponent(category.slug)}`;
    anchor.textContent = category.name;
    homeHeroCategoriesList.appendChild(anchor);
  });
}

function renderCategoryCloud(categories) {
  if (!homeCategoryCloudList) return;

  if (!Array.isArray(categories) || !categories.length) {
    homeCategoryCloudList.innerHTML = '<span class="meta meta--subtle">Aucune catégorie disponible.</span>';
    return;
  }

  homeCategoryCloudList.innerHTML = "";

  categories.slice(0, 12).forEach((category) => {
    const anchor = document.createElement("a");
    anchor.className = "home-category-pill";
    anchor.href = `category.html?slug=${encodeURIComponent(category.slug)}`;
    anchor.textContent = category.name;
    homeCategoryCloudList.appendChild(anchor);
  });
}

function renderHeroPaths(terms, categories) {
  if (!homeHeroPaths) return;

  const chosenTerms = pickPreferredTerms(terms, 2);
  const chosenCategories = Array.isArray(categories) ? categories.slice(0, 1) : [];
  const cards = [];

  if (chosenTerms[0]) {
    cards.push({
      label: "Lire un détail",
      title: chosenTerms[0].term,
      href: `term.html?slug=${encodeURIComponent(chosenTerms[0].slug)}`,
      meta: chosenTerms[0].categories?.name || chosenTerms[0].category || "Fiche terme"
    });
  }

  if (chosenCategories[0]) {
    cards.push({
      label: "Explorer un domaine",
      title: chosenCategories[0].name,
      href: `category.html?slug=${encodeURIComponent(chosenCategories[0].slug)}`,
      meta: "Accéder à une famille de fiches liées"
    });
  }

  if (chosenTerms[1]) {
    cards.push({
      label: "Réviser un repère",
      title: chosenTerms[1].term,
      href: `term.html?slug=${encodeURIComponent(chosenTerms[1].slug)}`,
      meta: "Ouvrir une autre fiche modèle"
    });
  }

  if (!cards.length) {
    homeHeroPaths.innerHTML = '<span class="meta meta--subtle">Aucun parcours disponible pour le moment.</span>';
    return;
  }

  homeHeroPaths.innerHTML = "";

  for (const item of cards) {
    const anchor = document.createElement("a");
    anchor.className = "home-path-card";
    anchor.href = item.href;

    const label = document.createElement("span");
    label.className = "dashboard__label";
    label.textContent = item.label;

    const title = document.createElement("strong");
    title.textContent = item.title;

    const meta = document.createElement("span");
    meta.className = "meta meta--subtle";
    meta.textContent = item.meta;

    anchor.append(label, title, meta);
    homeHeroPaths.appendChild(anchor);
  }
}

function toggleHeroCategories(forceExpanded) {
  if (!homeCategoriesToggle || !homeHeroCategories) return;

  const current = homeCategoriesToggle.getAttribute("aria-expanded") === "true";
  const next = typeof forceExpanded === "boolean" ? forceExpanded : !current;

  homeCategoriesToggle.setAttribute("aria-expanded", String(next));
  homeHeroCategories.hidden = !next;
}

async function loadHomeProofs() {
  if (!window.DicoArchiApi) {
    if (homeTermCount) homeTermCount.textContent = "Indisponible";
    if (homeCategoryCount) homeCategoryCount.textContent = "Indisponible";
    return;
  }

  try {
    const [terms, categories] = await Promise.all([
      window.DicoArchiApi.fetchPublishedTermsBasic(),
      window.DicoArchiApi.fetchCategories()
    ]);

    if (homeTermCount) {
      const totalTerms = Array.isArray(terms) ? terms.length : 0;
      homeTermCount.textContent = `${totalTerms} terme${totalTerms > 1 ? "s" : ""}`;
    }

    if (homeCategoryCount) {
      const totalCategories = Array.isArray(categories) ? categories.length : 0;
      homeCategoryCount.textContent = `${totalCategories} catégorie${totalCategories > 1 ? "s" : ""}`;
    }

    homeTermsCache = Array.isArray(terms) ? terms : [];
    renderHeroCategories(categories);
    renderCategoryCloud(categories);
    renderHeroPaths(terms, categories);
    renderLinkList(
      homeReadingSamples,
      pickPreferredTerms(terms, 3),
      (item) => `term.html?slug=${encodeURIComponent(item.slug)}`,
      (item) => item.categories?.name || item.category || "Fiche du corpus"
    );
    renderLinkList(
      homeCategoryFocus,
      Array.isArray(categories) ? categories.slice(0, 4) : [],
      (item) => `category.html?slug=${encodeURIComponent(item.slug)}`,
      (item) => "Ouvrir la catégorie"
    );
  } catch (_error) {
    if (homeTermCount) homeTermCount.textContent = "Indisponible";
    if (homeCategoryCount) homeCategoryCount.textContent = "Indisponible";
    homeTermsCache = [];
    renderHeroCategories([]);
    renderCategoryCloud([]);
    renderHeroPaths([], []);
    renderLinkList(homeReadingSamples, [], () => "dictionnaire.html", () => "");
    renderLinkList(homeCategoryFocus, [], () => "category.html", () => "");
  }
}

if (homeSearchButton) {
  homeSearchButton.addEventListener("click", runHomeSearch);
}

if (homeSearchInput) {
  homeSearchInput.addEventListener("input", runInstantHomeSearch);
  homeSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") runHomeSearch();
  });
}

if (homeCategoriesToggle) {
  homeCategoriesToggle.addEventListener("click", () => {
    toggleHeroCategories();
  });
}

loadFeaturedTerm();
loadHomeProofs();
setupContactLinks();
