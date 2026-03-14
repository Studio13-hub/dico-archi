const homeSearchInput = document.getElementById("home-search");
const homeSearchButton = document.getElementById("home-search-button");
const homeSearchResults = document.getElementById("home-search-results");
const featuredTermTitle = document.getElementById("featured-term-title");
const featuredTermDefinition = document.getElementById("featured-term-definition");
const featuredTermLink = document.getElementById("featured-term-link");

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
  } catch (error) {
    featuredTermTitle.textContent = "Erreur";
    featuredTermDefinition.textContent = error.message || "Impossible de charger le terme du jour.";
    featuredTermLink.href = "dictionnaire.html";
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
