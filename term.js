const titleEl = document.getElementById("term-title");
const subtitleEl = document.getElementById("term-subtitle");
const definitionEl = document.getElementById("term-definition");
const exampleEl = document.getElementById("term-example");
const relatedEl = document.getElementById("term-related");
const backlinksEl = document.getElementById("term-backlinks");
const breadcrumbEl = document.getElementById("term-breadcrumb");
const imageEl = document.getElementById("term-image");
const statusEl = document.getElementById("term-status");
const mediaSectionEl = document.getElementById("term-media-section");
const mediaGridEl = document.getElementById("term-media-grid");
const mediaLightboxEl = document.getElementById("media-lightbox");
const mediaLightboxImageEl = document.getElementById("media-lightbox-image");
const mediaLightboxCloseEl = document.getElementById("media-lightbox-close");
const mediaLightboxPrevEl = document.getElementById("media-lightbox-prev");
const mediaLightboxNextEl = document.getElementById("media-lightbox-next");
const termReadingEl = document.getElementById("term-reading");
const termCategoryChipEl = document.getElementById("term-category-chip");
const termVariantsEl = document.getElementById("term-variants");
const dockTermQuizButton = document.getElementById("dock-term-quiz");
const dockTermShareButton = document.getElementById("dock-term-share");
const dockTermTopButton = document.getElementById("dock-term-top");

let currentLightboxImages = [];
let currentLightboxIndex = 0;
const TERM_HISTORY_KEY = "dico_archi_recent_terms_v1";

const FALLBACK_TERMS = [
  {
    term: "SIA 102",
    category: "Normes",
    definition: "Reglement qui decrit les prestations de l'architecte en Suisse.",
    example: "Base pour cadrer les phases du mandat.",
    related: ["Phases SIA 102"],
    image_url: ""
  }
];

const CATEGORY_IMAGE_MAP = {
  normes: "assets/illustrations/normes.svg",
  phases: "assets/illustrations/phases.svg",
  chantier: "assets/illustrations/chantier.svg",
  dessin: "assets/illustrations/dessin.svg",
  administratif: "assets/illustrations/default.svg"
};

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
  const media_urls = parseMediaUrls(item.image_url);
  return {
    term: item.term || "",
    category: item.category || "Non classe",
    definition: item.definition || "",
    example: item.example || "",
    related,
    image_url: item.image_url || "",
    media_urls
  };
}

function mergeTerms(primary, secondary) {
  const byTerm = new Map();
  for (const item of secondary) {
    const key = (item.term || "").trim().toLowerCase();
    if (!key) continue;
    byTerm.set(key, item);
  }
  for (const item of primary) {
    const key = (item.term || "").trim().toLowerCase();
    if (!key) continue;
    byTerm.set(key, item);
  }
  return Array.from(byTerm.values());
}

function resolveCardImage(item) {
  const primaryImage = getPrimaryImageUrl(item);
  if (primaryImage) return primaryImage;
  const key = (item.category || "").trim().toLowerCase();
  return CATEGORY_IMAGE_MAP[key] || "assets/illustrations/default.svg";
}

function parseMediaUrls(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((item) => String(item || "").trim()).filter(Boolean);

  const text = String(raw).trim();
  if (!text) return [];

  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || "").trim()).filter(Boolean);
      }
    } catch (_error) {
      // Fallback below.
    }
  }

  if (text.includes("\n")) {
    return text
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (text.includes("|")) {
    return text
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [text];
}

function isPdfUrl(url) {
  if (!url) return false;
  const raw = String(url).trim().toLowerCase();
  if (!raw) return false;
  try {
    const parsed = new URL(raw, window.location.origin);
    return parsed.pathname.endsWith(".pdf");
  } catch (_error) {
    return raw.endsWith(".pdf");
  }
}

function isLikelyImageUrl(url) {
  if (!url) return false;
  const raw = String(url).trim();
  if (!raw) return false;
  try {
    const parsed = new URL(raw, window.location.origin);
    const path = parsed.pathname.toLowerCase();
    return [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].some((ext) => path.endsWith(ext));
  } catch (_error) {
    const lowered = raw.toLowerCase();
    return [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].some((ext) => lowered.endsWith(ext));
  }
}

function getPrimaryImageUrl(item) {
  const media = Array.isArray(item?.media_urls) ? item.media_urls : parseMediaUrls(item?.image_url);
  for (const url of media) {
    if (!isSafeImageUrl(url)) continue;
    if (isPdfUrl(url)) continue;
    if (!isLikelyImageUrl(url)) continue;
    return url;
  }
  return "";
}

function setLightboxImage(index, altText) {
  if (!mediaLightboxImageEl) return;
  if (!currentLightboxImages.length) return;
  currentLightboxIndex = (index + currentLightboxImages.length) % currentLightboxImages.length;
  mediaLightboxImageEl.src = currentLightboxImages[currentLightboxIndex];
  mediaLightboxImageEl.alt = altText || "Image agrandie";

  if (mediaLightboxPrevEl) mediaLightboxPrevEl.hidden = currentLightboxImages.length < 2;
  if (mediaLightboxNextEl) mediaLightboxNextEl.hidden = currentLightboxImages.length < 2;
}

function openLightbox(url, altText) {
  if (!mediaLightboxEl || !mediaLightboxImageEl) return;
  if (!currentLightboxImages.length) {
    currentLightboxImages = [url];
  }
  const startIndex = currentLightboxImages.findIndex((entry) => entry === url);
  setLightboxImage(startIndex >= 0 ? startIndex : 0, altText);
  mediaLightboxEl.hidden = false;
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  if (!mediaLightboxEl || !mediaLightboxImageEl) return;
  mediaLightboxEl.hidden = true;
  mediaLightboxImageEl.src = "";
  currentLightboxImages = [];
  currentLightboxIndex = 0;
  document.body.classList.remove("lightbox-open");
}

function showPrevLightboxImage() {
  if (!currentLightboxImages.length) return;
  setLightboxImage(currentLightboxIndex - 1, mediaLightboxImageEl?.alt);
}

function showNextLightboxImage() {
  if (!currentLightboxImages.length) return;
  setLightboxImage(currentLightboxIndex + 1, mediaLightboxImageEl?.alt);
}

function renderMediaGallery(item) {
  if (!mediaSectionEl || !mediaGridEl) return;
  mediaGridEl.textContent = "";

  const media = Array.isArray(item.media_urls) ? item.media_urls.filter(isSafeImageUrl) : [];
  const imageMedia = media.filter((url) => !isPdfUrl(url) && isLikelyImageUrl(url));
  currentLightboxImages = Array.from(new Set(imageMedia));
  currentLightboxIndex = 0;
  if (!media.length) {
    mediaSectionEl.hidden = true;
    return;
  }

  mediaSectionEl.hidden = false;

  for (const url of media) {
    if (isPdfUrl(url)) {
      const pdfCard = document.createElement("a");
      pdfCard.className = "term-media-item term-media-item--pdf";
      pdfCard.href = url;
      pdfCard.target = "_blank";
      pdfCard.rel = "noopener noreferrer";
      pdfCard.textContent = "Ouvrir PDF";
      mediaGridEl.appendChild(pdfCard);
      continue;
    }

    if (!isLikelyImageUrl(url)) continue;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "term-media-item";
    button.setAttribute("aria-label", "Agrandir l'image");

    const image = document.createElement("img");
    image.src = url;
    image.alt = `Illustration de ${item.term}`;
    image.loading = "lazy";
    image.decoding = "async";
    button.appendChild(image);
    button.addEventListener("click", () => openLightbox(url, `Illustration de ${item.term}`));
    mediaGridEl.appendChild(button);
  }
}

function isSafeImageUrl(value) {
  if (!value) return false;
  const raw = String(value).trim();
  if (!raw) return false;
  if (raw.startsWith("/")) return true;
  try {
    const parsed = new URL(raw, window.location.origin);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch (_error) {
    return false;
  }
}

function setStatus(text) {
  statusEl.textContent = text;
}

function setSeo(item) {
  const site = "https://dico-archi.vercel.app";
  const url = `${site}/term.html?term=${encodeURIComponent(item.term)}`;
  document.title = `${item.term} - DicoArchi`;

  let desc = document.querySelector('meta[name="description"]');
  if (!desc) {
    desc = document.createElement("meta");
    desc.name = "description";
    document.head.appendChild(desc);
  }
  desc.content = item.definition || "Fiche terme DicoArchi";

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;

  const ld = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: item.term,
    description: item.definition,
    inDefinedTermSet: `${site}/`,
    url
  };
  let script = document.getElementById("term-jsonld");
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "term-jsonld";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(ld);
}

function formatReading(term) {
  const normalized = (term || "")
    .trim()
    .toLowerCase()
    .replaceAll(" ", "-");
  return normalized ? `/${normalized}/` : "";
}

function pushTermHistory(term) {
  if (!term) return;
  try {
    const raw = window.localStorage.getItem(TERM_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    const next = [term, ...list.filter((entry) => String(entry).toLowerCase() !== term.toLowerCase())].slice(0, 20);
    window.localStorage.setItem(TERM_HISTORY_KEY, JSON.stringify(next));
  } catch (_error) {
    // Ignore storage failures.
  }
}

function renderVariants(item, allTerms) {
  if (!termVariantsEl) return;
  termVariantsEl.textContent = "";
  const related = Array.isArray(item.related) ? item.related : [];
  if (!related.length) {
    const empty = document.createElement("span");
    empty.className = "meta meta--subtle";
    empty.textContent = "Pas encore de variantes proposees pour cette fiche.";
    termVariantsEl.appendChild(empty);
    return;
  }

  const byTerm = new Map(allTerms.map((entry) => [(entry.term || "").toLowerCase(), entry]));
  for (const name of related.slice(0, 6)) {
    const linked = byTerm.get(String(name).toLowerCase());
    const card = document.createElement("a");
    card.className = "term-variant-card";
    card.href = `term.html?term=${encodeURIComponent(name)}`;

    const title = document.createElement("strong");
    title.textContent = name;
    const desc = document.createElement("span");
    const sourceDefinition = linked?.definition || "";
    desc.textContent = sourceDefinition ? `${sourceDefinition.slice(0, 90)}${sourceDefinition.length > 90 ? "..." : ""}` : "Voir la fiche associee.";

    card.appendChild(title);
    card.appendChild(desc);
    termVariantsEl.appendChild(card);
  }
}

function renderNotFound(requested) {
  titleEl.textContent = "Terme introuvable";
  subtitleEl.textContent = requested ? `Aucun resultat pour "${requested}".` : "Aucun terme specifie.";
  definitionEl.textContent = "Reviens au dictionnaire pour choisir un terme disponible.";
  exampleEl.textContent = "-";
  relatedEl.textContent = "";
  imageEl.src = "assets/illustrations/default.svg";
  imageEl.onclick = null;
  if (mediaSectionEl) mediaSectionEl.hidden = true;
  if (termReadingEl) termReadingEl.textContent = "";
  if (termCategoryChipEl) termCategoryChipEl.textContent = "";
  if (termVariantsEl) termVariantsEl.textContent = "";
  setStatus("Fiche non trouvee.");
}

function renderTerm(item, allTerms) {
  titleEl.textContent = item.term;
  subtitleEl.textContent = item.category;
  if (termReadingEl) termReadingEl.textContent = formatReading(item.term);
  if (termCategoryChipEl) termCategoryChipEl.textContent = item.category;
  if (breadcrumbEl) {
    breadcrumbEl.textContent = "";
    breadcrumbEl.append("Accueil / ");
    const categoryLink = document.createElement("a");
    categoryLink.href = `category.html?name=${encodeURIComponent(item.category)}`;
    categoryLink.textContent = item.category;
    breadcrumbEl.appendChild(categoryLink);
    breadcrumbEl.append(" / ");
    const current = document.createElement("strong");
    current.textContent = item.term;
    breadcrumbEl.appendChild(current);
  }
  definitionEl.textContent = item.definition || "-";
  exampleEl.textContent = item.example || "-";
  const resolvedImage = resolveCardImage(item);
  imageEl.src = resolvedImage;
  imageEl.alt = item.term;
  renderMediaGallery(item);
  const mainImage = imageEl.src;
  const isDefaultIllustration = mainImage.includes("assets/illustrations/");
  const canZoomMainImage = !isDefaultIllustration && isLikelyImageUrl(mainImage);

  if (canZoomMainImage) {
    imageEl.style.cursor = "zoom-in";
    imageEl.onclick = () => {
      if (!currentLightboxImages.length) currentLightboxImages = [mainImage];
      if (!currentLightboxImages.includes(mainImage)) {
        currentLightboxImages = [mainImage, ...currentLightboxImages];
      }
      openLightbox(mainImage, item.term);
    };
  } else {
    imageEl.style.cursor = "default";
    imageEl.onclick = null;
  }
  renderVariants(item, allTerms);
  relatedEl.textContent = "";
  for (const entry of item.related || []) {
    const link = document.createElement("a");
    link.className = "chip";
    link.href = `term.html?term=${encodeURIComponent(entry)}`;
    link.textContent = entry;
    relatedEl.appendChild(link);
  }
  setSeo(item);
  pushTermHistory(item.term);
}

function renderBacklinks(currentTerm, allTerms) {
  backlinksEl.textContent = "";
  const key = (currentTerm || "").toLowerCase();
  const backlinks = allTerms.filter((item) =>
    (item.related || []).some((entry) => entry.toLowerCase() === key)
  );
  for (const item of backlinks) {
    const link = document.createElement("a");
    link.className = "chip";
    link.href = `term.html?term=${encodeURIComponent(item.term)}`;
    link.textContent = item.term;
    backlinksEl.appendChild(link);
  }
  if (!backlinks.length) {
    const empty = document.createElement("span");
    empty.className = "meta meta--subtle";
    empty.textContent = "Aucun backlink pour ce terme.";
    backlinksEl.appendChild(empty);
  }
}

async function loadTermPage() {
  const params = new URLSearchParams(window.location.search);
  const requestedTerm = (params.get("term") || "").trim();
  if (!requestedTerm) {
    renderNotFound("");
    return;
  }

  const localTerms = getLocalTermsRaw().map(normalizeTerm);
  let terms = [...localTerms];
  let remoteCount = 0;

  if (hasSupabaseConfig()) {
    try {
      const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      const { data, error } = await client
        .from("terms")
        .select("term, category, definition, example, related, image_url")
        .order("term", { ascending: true });
      if (!error) {
        const remoteTerms = (data || []).map(normalizeTerm);
        remoteCount = remoteTerms.length;
        terms = mergeTerms(remoteTerms, localTerms);
      }
    } catch (_err) {
      // Keep local fallback silently; status below will still mention source.
    }
  }

  if (!terms.length) {
    terms = FALLBACK_TERMS.map(normalizeTerm);
  }

  const key = requestedTerm.toLowerCase();
  const item = terms.find((entry) => entry.term.toLowerCase() === key);
  if (!item) {
    renderNotFound(requestedTerm);
    return;
  }

  renderTerm(item, terms);
  renderBacklinks(item.term, terms);
  setStatus(`Source: ${remoteCount > 0 ? "Supabase + local" : "local"} (${terms.length} termes charges)`);
}

loadTermPage();

if (mediaLightboxCloseEl) {
  mediaLightboxCloseEl.addEventListener("click", closeLightbox);
}
if (mediaLightboxPrevEl) {
  mediaLightboxPrevEl.addEventListener("click", showPrevLightboxImage);
}
if (mediaLightboxNextEl) {
  mediaLightboxNextEl.addEventListener("click", showNextLightboxImage);
}
if (mediaLightboxEl) {
  mediaLightboxEl.addEventListener("click", (event) => {
    if (event.target === mediaLightboxEl) closeLightbox();
  });
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
  if (mediaLightboxEl && !mediaLightboxEl.hidden && event.key === "ArrowLeft") showPrevLightboxImage();
  if (mediaLightboxEl && !mediaLightboxEl.hidden && event.key === "ArrowRight") showNextLightboxImage();
});

if (dockTermQuizButton) {
  dockTermQuizButton.addEventListener("click", () => {
    window.location.href = "index.html#quiz";
  });
}

if (dockTermShareButton) {
  dockTermShareButton.addEventListener("click", async () => {
    const link = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        setStatus("Lien copie.");
        return;
      }
    } catch (_error) {
      // Fallback below.
    }
    setStatus(`Lien: ${link}`);
  });
}

if (dockTermTopButton) {
  dockTermTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
