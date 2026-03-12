const titleEl = document.getElementById("category-title");
const subtitleEl = document.getElementById("category-subtitle");
const breadcrumbEl = document.getElementById("category-breadcrumb");
const cardsEl = document.getElementById("category-cards");

function getLocalTermsRaw() {
  if (Array.isArray(window.TERMS)) return window.TERMS;
  if (typeof TERMS !== "undefined" && Array.isArray(TERMS)) return TERMS;
  return [];
}

function hasSupabaseConfig() {
  return Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
}

function normalizeTerm(item) {
  const related = Array.isArray(item.related)
    ? item.related
    : item.related
      ? String(item.related).split("|").map((v) => v.trim()).filter(Boolean)
      : [];
  return {
    term: item.term || "",
    category: item.category || "Non classe",
    definition: item.definition || "",
    example: item.example || "",
    related,
    image_url: item.image_url || ""
  };
}

function mergeTerms(primary, secondary) {
  const byTerm = new Map();
  for (const item of secondary) byTerm.set((item.term || "").toLowerCase(), item);
  for (const item of primary) byTerm.set((item.term || "").toLowerCase(), item);
  return Array.from(byTerm.values());
}

function isVisibleTerm(item) {
  const t = (item.term || "").toLowerCase();
  return t && !t.startsWith("test") && !t.includes("e2e") && !t.includes("__audit");
}

function renderCards(list) {
  cardsEl.textContent = "";
  for (const item of list) {
    const card = document.createElement("article");
    card.className = "card";
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item.category;
    const title = document.createElement("h3");
    title.textContent = item.term;
    const def = document.createElement("div");
    def.textContent = item.definition;
    const link = document.createElement("a");
    link.className = "card__link";
    link.href = `term.html?term=${encodeURIComponent(item.term)}`;
    link.textContent = "Voir fiche";
    const actions = document.createElement("div");
    actions.className = "card__actions";
    actions.appendChild(link);
    card.appendChild(tag);
    card.appendChild(title);
    card.appendChild(def);
    card.appendChild(actions);
    cardsEl.appendChild(card);
  }
}

async function loadCategoryPage() {
  const params = new URLSearchParams(window.location.search);
  const category = (params.get("name") || "").trim();
  if (!category) {
    titleEl.textContent = "Categorie introuvable";
    subtitleEl.textContent = "Nom de categorie manquant.";
    return;
  }

  let terms = getLocalTermsRaw().map(normalizeTerm);
  if (hasSupabaseConfig()) {
    try {
      const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      const { data, error } = await client
        .from("terms")
        .select("term, category, definition, example, related, image_url");
      if (!error) terms = mergeTerms((data || []).map(normalizeTerm), terms);
    } catch (_err) {
      // Keep local list as fallback.
    }
  }

  const list = terms
    .filter(isVisibleTerm)
    .filter((item) => item.category.toLowerCase() === category.toLowerCase())
    .sort((a, b) => a.term.localeCompare(b.term, "fr"));

  titleEl.textContent = category;
  subtitleEl.textContent = `${list.length} terme${list.length > 1 ? "s" : ""}`;
  breadcrumbEl.textContent = "";
  breadcrumbEl.append("Accueil / ");
  const current = document.createElement("strong");
  current.textContent = category;
  breadcrumbEl.appendChild(current);
  renderCards(list);
}

loadCategoryPage();
