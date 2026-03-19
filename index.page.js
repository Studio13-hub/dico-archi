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
let homeTermsCache = [];

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
  } catch (_error) {
    if (homeTermCount) homeTermCount.textContent = "Indisponible";
    if (homeCategoryCount) homeCategoryCount.textContent = "Indisponible";
    homeTermsCache = [];
    renderHeroCategories([]);
    renderCategoryCloud([]);
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
