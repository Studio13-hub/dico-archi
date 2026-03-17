#!/usr/bin/env node
/* eslint-disable no-console */
const { loadCanonicalContent } = require("./content_loader");

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function sortByScore(items, pickScore) {
  return [...items].sort((a, b) => {
    const scoreA = pickScore(a);
    const scoreB = pickScore(b);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return String(a.slug || a.term || "").localeCompare(String(b.slug || b.term || ""), "fr");
  });
}

function main() {
  const dataset = loadCanonicalContent();
  const categories = Array.isArray(dataset.categories) ? dataset.categories : [];
  const terms = Array.isArray(dataset.richTerms) ? dataset.richTerms : [];
  const media = Array.isArray(dataset.media) ? dataset.media : [];
  const relations = Array.isArray(dataset.relations) ? dataset.relations : [];

  const mediaByTerm = new Map();
  const outgoingRelationsByTerm = new Map();
  const categoryCounts = new Map();
  const categoryMediaCounts = new Map();

  for (const item of media) {
    if (item.term_slug) increment(mediaByTerm, item.term_slug);
  }

  for (const relation of relations) {
    if (relation.source_slug) increment(outgoingRelationsByTerm, relation.source_slug);
  }

  for (const term of terms) {
    if (term.category_slug) increment(categoryCounts, term.category_slug);
    const mediaCount = mediaByTerm.get(term.slug) || 0;
    if (term.category_slug && mediaCount) {
      categoryMediaCounts.set(term.category_slug, (categoryMediaCounts.get(term.category_slug) || 0) + mediaCount);
    }
  }

  const weakTerms = sortByScore(
    terms.map((term) => {
      const definition = String(term.content?.definition || "");
      const example = String(term.content?.example || "");
      const applications = Array.isArray(term.content?.applications) ? term.content.applications.length : 0;
      const norms = Array.isArray(term.content?.norms) ? term.content.norms.length : 0;
      const constraints = Array.isArray(term.technical_data?.constraints) ? term.technical_data.constraints.length : 0;
      const mediaCount = mediaByTerm.get(term.slug) || 0;
      const relationCount = outgoingRelationsByTerm.get(term.slug) || 0;

      let score = 0;
      if (definition.length < 90) score += 2;
      if (example.length < 60) score += 2;
      if (!mediaCount) score += 2;
      if (!relationCount) score += 1;
      if (!applications) score += 1;
      if (!norms) score += 1;
      if (!constraints) score += 1;

      return {
        slug: term.slug,
        term: term.term,
        category: term.category_slug,
        score,
        definitionLength: definition.length,
        exampleLength: example.length,
        mediaCount,
        relationCount,
        applications,
        norms,
        constraints
      };
    }),
    (item) => item.score
  ).filter((item) => item.score > 0);

  const weakCategories = categories
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      terms: categoryCounts.get(category.slug) || 0,
      media: categoryMediaCounts.get(category.slug) || 0
    }))
    .filter((item) => item.terms > 0)
    .sort((a, b) => a.media - b.media || a.terms - b.terms || a.name.localeCompare(b.name, "fr"));

  console.log("Content audit");
  console.log("");
  console.log("Categories needing media/editorial attention");
  for (const item of weakCategories.slice(0, 10)) {
    console.log(`- ${item.name} (${item.slug}): ${item.media} media for ${item.terms} terms`);
  }

  console.log("");
  console.log("Terms needing enrichment");
  for (const item of weakTerms.slice(0, 20)) {
    console.log(
      `- ${item.term} (${item.slug}) [score ${item.score}]`
      + ` | def ${item.definitionLength}`
      + ` | ex ${item.exampleLength}`
      + ` | media ${item.mediaCount}`
      + ` | rel ${item.relationCount}`
      + ` | apps ${item.applications}`
      + ` | norms ${item.norms}`
      + ` | constraints ${item.constraints}`
    );
  }
}

main();
