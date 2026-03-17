#!/usr/bin/env node
/* eslint-disable no-console */
const { loadCanonicalContent } = require("./content_loader");

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function topEntries(map, limit = 12) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "fr"))
    .slice(0, limit);
}

function formatPairs(pairs) {
  return pairs.map(([key, value]) => `- ${key}: ${value}`).join("\n");
}

function bottomEntries(map, limit = 12) {
  return [...map.entries()]
    .sort((a, b) => a[1] - b[1] || String(a[0]).localeCompare(String(b[0]), "fr"))
    .slice(0, limit);
}

function main() {
  const dataset = loadCanonicalContent();
  const terms = Array.isArray(dataset.terms) ? dataset.terms : [];
  const categories = Array.isArray(dataset.categories) ? dataset.categories : [];
  const subcategories = Array.isArray(dataset.subcategories) ? dataset.subcategories : [];
  const relations = Array.isArray(dataset.relations) ? dataset.relations : [];
  const media = Array.isArray(dataset.media) ? dataset.media : [];

  const statusCounts = new Map();
  const categoryCounts = new Map();
  const subcategoryCounts = new Map();
  const mediaCountsByTerm = new Map();
  const mediaCountsByCategory = new Map();

  let termsWithoutExample = 0;
  let termsWithoutSubcategory = 0;
  let draftTerms = 0;

  for (const term of terms) {
    const status = term.status || "unknown";
    const categorySlug = term.category_slug || "sans-categorie";
    const subcategorySlug = term.subcategory_slug || "sans-sous-categorie";

    increment(statusCounts, status);
    increment(categoryCounts, categorySlug);
    increment(subcategoryCounts, subcategorySlug);

    if (!term.example) termsWithoutExample += 1;
    if (!term.subcategory_slug) termsWithoutSubcategory += 1;
    if (status === "draft") draftTerms += 1;
  }

  const mediaByType = new Map();
  for (const item of media) {
    increment(mediaByType, item.media_type || "unknown");
    if (item.term_slug) {
      increment(mediaCountsByTerm, item.term_slug);
    }
  }

  for (const term of terms) {
    const mediaCount = mediaCountsByTerm.get(term.slug) || 0;
    if (term.category_slug) {
      mediaCountsByCategory.set(term.category_slug, (mediaCountsByCategory.get(term.category_slug) || 0) + mediaCount);
    }
  }

  const weakCategories = categories.map((category) => {
    const termCount = categoryCounts.get(category.slug) || 0;
    const mediaCount = mediaCountsByCategory.get(category.slug) || 0;
    return {
      slug: category.slug,
      terms: termCount,
      media: mediaCount
    };
  });

  const categoriesNeedingAttention = weakCategories
    .filter((item) => item.terms > 0)
    .sort((a, b) => a.media - b.media || a.terms - b.terms || a.slug.localeCompare(b.slug, "fr"))
    .slice(0, 8);

  console.log(`Content stats (${dataset.version})`);
  console.log("");
  console.log("Core");
  console.log(`- categories: ${categories.length}`);
  console.log(`- subcategories: ${subcategories.length}`);
  console.log(`- terms: ${terms.length}`);
  console.log(`- relations: ${relations.length}`);
  console.log(`- media: ${media.length}`);
  console.log("");
  console.log("Statuses");
  console.log(formatPairs(topEntries(statusCounts, 10)) || "- none");
  console.log("");
  console.log("Top categories");
  console.log(formatPairs(topEntries(categoryCounts, 12)) || "- none");
  console.log("");
  console.log("Categories with least media coverage");
  console.log(
    categoriesNeedingAttention.length
      ? categoriesNeedingAttention.map((item) => `- ${item.slug}: ${item.media} media for ${item.terms} terms`).join("\n")
      : "- none"
  );
  console.log("");
  console.log("Top subcategories");
  console.log(formatPairs(topEntries(subcategoryCounts, 12)) || "- none");
  console.log("");
  console.log("Least populated subcategories");
  console.log(formatPairs(bottomEntries(subcategoryCounts, 12)) || "- none");
  console.log("");
  console.log("Media types");
  console.log(formatPairs(topEntries(mediaByType, 10)) || "- none");
  console.log("");
  console.log("Editorial signals");
  console.log(`- terms without example: ${termsWithoutExample}`);
  console.log(`- terms without subcategory: ${termsWithoutSubcategory}`);
  console.log(`- draft terms: ${draftTerms}`);
}

main();
