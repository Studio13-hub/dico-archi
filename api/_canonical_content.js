const { loadCanonicalContent } = require("../scripts/content/content_loader");

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildCanonicalMaps() {
  const dataset = loadCanonicalContent();
  const categories = Array.isArray(dataset.categories) ? dataset.categories : [];
  const terms = Array.isArray(dataset.terms) ? dataset.terms : [];
  const relations = Array.isArray(dataset.relations) ? dataset.relations : [];
  const media = Array.isArray(dataset.media) ? dataset.media : [];

  const categoryBySlug = new Map(categories.map((item) => [item.slug, item]));

  const publishedTerms = terms
    .filter((item) => item.status === "published")
    .map((item) => {
      const category = categoryBySlug.get(item.category_slug) || null;
      return {
        id: null,
        term: item.term,
        slug: item.slug,
        definition: item.definition || "",
        example: item.example || "",
        status: item.status,
        category_id: category?.slug || null,
        categories: category
          ? {
              id: null,
              name: category.name,
              slug: category.slug,
              description: category.description || ""
            }
          : null
      };
    })
    .sort((a, b) => String(a.term || "").localeCompare(String(b.term || ""), "fr"));

  return {
    dataset,
    categories,
    categoryBySlug,
    publishedTerms,
    termBySlug: new Map(publishedTerms.map((item) => [item.slug, item])),
    relations,
    media
  };
}

function buildCanonicalTermPayload(slug) {
  const { categoryBySlug, publishedTerms, termBySlug, relations, media } = buildCanonicalMaps();
  const term = termBySlug.get(String(slug || "").trim().toLowerCase());
  if (!term) return null;

  const relatedSlugs = relations
    .filter((item) => item.source_slug === term.slug || item.target_slug === term.slug)
    .map((item) => (item.source_slug === term.slug ? item.target_slug : item.source_slug));

  const relatedTerms = Array.from(new Set(relatedSlugs))
    .map((relatedSlug) => publishedTerms.find((item) => item.slug === relatedSlug))
    .filter(Boolean)
    .map((item) => ({
      id: null,
      term: item.term,
      slug: item.slug,
      definition: item.definition,
      status: item.status,
      relation_type: "related"
    }));

  const canonicalMedia = media
    .filter((item) => item.term_slug === term.slug)
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map((item, index) => ({
      id: null,
      media_type: item.media_type,
      url: item.url,
      title: item.title || null,
      alt_text: item.alt_text || null,
      position: Number.isInteger(item.position) ? item.position : index,
      created_at: null
    }));

  const category = term.categories?.slug ? categoryBySlug.get(term.categories.slug) : null;

  return {
    term: {
      ...term,
      categories: category
        ? {
            id: null,
            name: category.name,
            slug: category.slug
          }
        : term.categories
    },
    related_terms: relatedTerms,
    media: canonicalMedia
  };
}

module.exports = {
  buildCanonicalMaps,
  buildCanonicalTermPayload,
  normalizeText
};
