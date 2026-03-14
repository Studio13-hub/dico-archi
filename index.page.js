const homeSearchInput = document.getElementById("home-search");
const homeSearchButton = document.getElementById("home-search-button");
const homeSearchResults = document.getElementById("home-search-results");
const featuredTermTitle = document.getElementById("featured-term-title");
const featuredTermDefinition = document.getElementById("featured-term-definition");
const featuredTermLink = document.getElementById("featured-term-link");
const homeTermCount = document.getElementById("home-term-count");
const homeCategoryCount = document.getElementById("home-category-count");
const homeStartTermLink = document.getElementById("home-start-term-link");

function renderSearchResults(items) {
  if (!Array.isArray(items) || !items.length) {
    homeSearchResults.textContent = "Aucun résultat.";
    return;
  }

  const links = items.slice(0, 5).map((item) => {
    const anchor = document.createElement("a");
    anchor.href = `term.html?slug=${encodeURIComponent(item.slug)}`;
    anchor.textContent = item.category ? `${item.term} (${item.category})` : item.term;
    return anchor.outerHTML;
  });

  homeSearchResults.innerHTML = `Résultats utiles : ${links.join(" · ")}`;
}

async function runHomeSearch() {
  const query = homeSearchInput.value.trim();
  if (!query) {
    homeSearchResults.textContent = "Saisissez un terme à rechercher.";
    return;
  }

  try {
    const payload = await window.DicoArchiApi.searchTerms(query);
    renderSearchResults(payload.results || []);
  } catch (error) {
    homeSearchResults.textContent = `Erreur: ${error.message || "search_failed"}`;
  }
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
    featuredTermDefinition.textContent = item.definition || "Définition indisponible.";
    featuredTermLink.href = `term.html?slug=${encodeURIComponent(item.slug)}`;
    if (homeStartTermLink) {
      homeStartTermLink.href = `term.html?slug=${encodeURIComponent(item.slug)}`;
    }
  } catch (error) {
    featuredTermTitle.textContent = "Erreur";
    featuredTermDefinition.textContent = error.message || "Impossible de charger le terme du jour.";
    featuredTermLink.href = "dictionnaire.html";
    if (homeStartTermLink) {
      homeStartTermLink.href = "dictionnaire.html";
    }
  }
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
  } catch (_error) {
    if (homeTermCount) homeTermCount.textContent = "Indisponible";
    if (homeCategoryCount) homeCategoryCount.textContent = "Indisponible";
  }
}

if (homeSearchButton) {
  homeSearchButton.addEventListener("click", runHomeSearch);
}

if (homeSearchInput) {
  homeSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") runHomeSearch();
  });
}

loadFeaturedTerm();
loadHomeProofs();
