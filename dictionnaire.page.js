const termsStatus = document.getElementById("terms-status");
const termsList = document.getElementById("terms-list");
const dictionaryLetterNav = document.getElementById("dictionary-letter-nav");
const dictionarySearch = document.getElementById("dictionary-search");
const dictionaryFeaturedLinks = document.getElementById("dictionary-featured-links");
const dictionaryReadingNote = document.getElementById("dictionary-reading-note");
let dictionaryTerms = [];

const DICTIONARY_FEATURED_SLUGS = [
  "bois-lamelle-colle",
  "acrotere",
  "coupe",
  "facade-ventilee",
  "sia-181",
  "dalle"
];

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

function pickDictionaryFeaturedTerms(items, limit = 3) {
  const list = Array.isArray(items) ? items : [];
  const bySlug = new Map(list.map((item) => [String(item.slug || "").trim(), item]));
  const selected = [];

  for (const slug of DICTIONARY_FEATURED_SLUGS) {
    const item = bySlug.get(slug);
    if (item && !selected.includes(item)) selected.push(item);
    if (selected.length >= limit) return selected;
  }

  for (const item of list) {
    if (!item || selected.includes(item)) continue;
    selected.push(item);
    if (selected.length >= limit) break;
  }

  return selected;
}

function renderDictionaryFeaturedTerms(items) {
  if (!dictionaryFeaturedLinks) return;

  const featured = pickDictionaryFeaturedTerms(items, 3);
  dictionaryFeaturedLinks.textContent = "";

  if (!featured.length) {
    dictionaryFeaturedLinks.textContent = "Aucun repère disponible pour le moment.";
    return;
  }

  for (const item of featured) {
    const anchor = document.createElement("a");
    anchor.className = "dictionary-evidence-link";
    anchor.href = `term.html?slug=${encodeURIComponent(item.slug)}`;

    const title = document.createElement("strong");
    title.textContent = item.term;

    const meta = document.createElement("span");
    meta.textContent = item.categories?.name || "Fiche du corpus";

    anchor.append(title, meta);
    dictionaryFeaturedLinks.appendChild(anchor);
  }
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

  if (dictionaryReadingNote) {
    dictionaryReadingNote.textContent = query
      ? "La recherche réduit l’index sans casser le parcours alphabétique."
      : "Commence par un terme repère, puis ouvre la catégorie liée pour élargir la lecture.";
  }

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

    renderDictionaryFeaturedTerms(dictionaryTerms);
    applyDictionaryView();
  } catch (error) {
    termsStatus.textContent = `Erreur: ${error.message}`;
    if (dictionaryReadingNote) {
      dictionaryReadingNote.textContent = "Impossible de charger les repères de lecture pour le moment.";
    }
  }
}

if (dictionarySearch) {
  dictionarySearch.addEventListener("input", applyDictionaryView);
}

loadDictionaryTerms();
