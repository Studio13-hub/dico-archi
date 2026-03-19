const termsStatus = document.getElementById("terms-status");
const termsList = document.getElementById("terms-list");
const dictionaryLetterNav = document.getElementById("dictionary-letter-nav");
const dictionarySearch = document.getElementById("dictionary-search");
let dictionaryTerms = [];

function clearDictionaryChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function createTermCard(item) {
  const card = document.createElement("article");
  card.className = "card dictionary-card";

  const eyebrow = document.createElement("span");
  eyebrow.className = "tag";
  eyebrow.textContent = item.categories?.name || "Sans catégorie";

  const title = document.createElement("h3");
  title.textContent = item.term;

  const definition = document.createElement("p");
  definition.textContent = item.definition || "Définition indisponible.";

  const link = document.createElement("a");
  link.className = "link-button";
  link.href = `term.html?slug=${encodeURIComponent(item.slug)}`;
  link.textContent = "Ouvrir la fiche";

  card.append(eyebrow, title, definition, link);
  return card;
}

function getLetterKey(value) {
  const letter = String(value || "")
    .trim()
    .charAt(0)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  return /[A-Z]/.test(letter) ? letter : "#";
}

function renderLetterNav(letterKeys) {
  if (!dictionaryLetterNav) return;
  clearDictionaryChildren(dictionaryLetterNav);

  for (const letter of letterKeys) {
    const link = document.createElement("a");
    link.className = "chip";
    link.href = `#dictionary-letter-${letter}`;
    link.textContent = letter;
    dictionaryLetterNav.appendChild(link);
  }
}

function renderDictionaryIndex(items) {
  clearDictionaryChildren(termsList);

  const grouped = new Map();
  for (const item of items) {
    const key = getLetterKey(item.term);
    const list = grouped.get(key) || [];
    list.push(item);
    grouped.set(key, list);
  }

  const letterKeys = [...grouped.keys()].sort((a, b) => a.localeCompare(b, "fr"));
  renderLetterNav(letterKeys);

  for (const letter of letterKeys) {
    const section = document.createElement("section");
    section.className = "dictionary-letter-section";
    section.id = `dictionary-letter-${letter}`;

    const header = document.createElement("div");
    header.className = "dictionary-letter-header";

    const title = document.createElement("h3");
    title.className = "dictionary-letter-title";
    title.textContent = letter;

    const meta = document.createElement("div");
    meta.className = "dictionary-letter-meta";
    const count = grouped.get(letter)?.length || 0;
    meta.textContent = `${count} terme${count > 1 ? "s" : ""}`;

    header.append(title, meta);

    const grid = document.createElement("div");
    grid.className = "cards cards--dictionary";

    for (const item of grouped.get(letter) || []) {
      grid.appendChild(createTermCard(item));
    }

    section.append(header, grid);
    termsList.appendChild(section);
  }
}

function applyDictionaryView() {
  const query = String(dictionarySearch?.value || "").trim().toLowerCase();
  const filtered = query
    ? dictionaryTerms.filter((item) =>
        [item.term, item.definition, item.categories?.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : dictionaryTerms.slice();

  if (!filtered.length) {
    clearDictionaryChildren(termsList);
    clearDictionaryChildren(dictionaryLetterNav);
    termsStatus.textContent = query
      ? "Aucun terme ne correspond à cette recherche."
      : "Aucun terme publié.";
    return;
  }

  termsStatus.textContent = query
    ? `${filtered.length} terme${filtered.length > 1 ? "s" : ""} trouvé${filtered.length > 1 ? "s" : ""} pour cette recherche.`
    : `${filtered.length} termes publiés, classés par initiale pour une lecture plus stable.`;

  renderDictionaryIndex(filtered);
}

async function loadDictionaryTerms() {
  if (!window.DicoArchiApi) {
    termsStatus.textContent = "Configuration Supabase manquante.";
    return;
  }

  try {
    const items = await window.DicoArchiApi.fetchPublishedTermsBasic();
    dictionaryTerms = Array.isArray(items) ? items : [];
    clearDictionaryChildren(termsList);

    if (!dictionaryTerms.length) {
      termsStatus.textContent = "Aucun terme publié.";
      return;
    }

    applyDictionaryView();
  } catch (error) {
    termsStatus.textContent = `Erreur: ${error.message}`;
  }
}

if (dictionarySearch) {
  dictionarySearch.addEventListener("input", applyDictionaryView);
}

loadDictionaryTerms();
