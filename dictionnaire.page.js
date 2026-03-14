const termsStatus = document.getElementById("terms-status");
const termsList = document.getElementById("terms-list");

function clearDictionaryChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function createTermCard(item) {
  const card = document.createElement("article");
  card.className = "card";

  const title = document.createElement("h3");
  title.textContent = item.term;

  const category = document.createElement("p");
  category.className = "meta meta--subtle";
  category.textContent = item.categories?.name || "Sans categorie";

  const definition = document.createElement("p");
  definition.textContent = item.definition || "Definition indisponible.";

  const link = document.createElement("a");
  link.className = "link-button";
  link.href = `term.html?slug=${encodeURIComponent(item.slug)}`;
  link.textContent = "Ouvrir la fiche";

  card.appendChild(title);
  card.appendChild(category);
  card.appendChild(definition);
  card.appendChild(link);
  return card;
}

async function loadDictionaryTerms() {
  if (!window.DicoArchiApi) {
    termsStatus.textContent = "Configuration Supabase manquante.";
    return;
  }

  try {
    const items = await window.DicoArchiApi.fetchPublishedTermsBasic();
    clearDictionaryChildren(termsList);

    if (!items.length) {
      termsStatus.textContent = "Aucun terme publie.";
      return;
    }

    termsStatus.textContent = `${items.length} terme(s) charge(s).`;
    for (const item of items) {
      termsList.appendChild(createTermCard(item));
    }
  } catch (error) {
    termsStatus.textContent = `Erreur: ${error.message}`;
  }
}

loadDictionaryTerms();
