#!/usr/bin/env node
/* eslint-disable no-console */
const { loadCanonicalContent } = require("./content_loader");

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function pushError(errors, message) {
  errors.push(message);
}

function validate() {
  const errors = [];

  const dataset = loadCanonicalContent();
  const categories = dataset.categories;
  const subcategories = dataset.subcategories || [];
  const terms = dataset.terms;
  const relations = dataset.relations;
  const media = dataset.media;

  if (!Array.isArray(categories)) pushError(errors, "categories.json must be an array");
  if (!Array.isArray(terms)) pushError(errors, "terms.json must be an array");
  if (!Array.isArray(relations)) pushError(errors, "relations.json must be an array");
  if (!Array.isArray(media)) pushError(errors, "media.json must be an array");

  if (errors.length) {
    return { errors, summary: null };
  }

  const categorySlugs = new Set();
  const subcategorySlugs = new Set();
  const termSlugs = new Set();

  for (const category of categories) {
    if (!isNonEmptyString(category.name)) pushError(errors, "category.name is required");
    if (!isNonEmptyString(category.slug)) pushError(errors, `category.slug missing for ${category.name || "unknown"}`);
    if (!isNonEmptyString(category.description)) pushError(errors, `category.description missing for ${category.slug || category.name || "unknown"}`);
    if (isNonEmptyString(category.slug)) {
      if (categorySlugs.has(category.slug)) pushError(errors, `duplicate category slug: ${category.slug}`);
      categorySlugs.add(category.slug);
    }
  }

  for (const subcategory of subcategories) {
    if (!isNonEmptyString(subcategory.name)) pushError(errors, "subcategory.name is required");
    if (!isNonEmptyString(subcategory.slug)) pushError(errors, `subcategory.slug missing for ${subcategory.name || "unknown"}`);
    if (!isNonEmptyString(subcategory.category_slug)) pushError(errors, `subcategory.category_slug missing for ${subcategory.slug || subcategory.name || "unknown"}`);
    if (!isNonEmptyString(subcategory.description)) pushError(errors, `subcategory.description missing for ${subcategory.slug || subcategory.name || "unknown"}`);

    if (isNonEmptyString(subcategory.slug)) {
      if (subcategorySlugs.has(subcategory.slug)) pushError(errors, `duplicate subcategory slug: ${subcategory.slug}`);
      subcategorySlugs.add(subcategory.slug);
    }

    if (isNonEmptyString(subcategory.category_slug) && !categorySlugs.has(subcategory.category_slug)) {
      pushError(errors, `unknown subcategory.category_slug "${subcategory.category_slug}" for ${subcategory.slug || subcategory.name || "unknown"}`);
    }
  }

  for (const term of terms) {
    if (!isNonEmptyString(term.term)) pushError(errors, "term.term is required");
    if (!isNonEmptyString(term.slug)) pushError(errors, `term.slug missing for ${term.term || "unknown"}`);
    if (!isNonEmptyString(term.definition)) pushError(errors, `term.definition missing for ${term.slug || term.term || "unknown"}`);
    if (!isNonEmptyString(term.category_slug)) pushError(errors, `term.category_slug missing for ${term.slug || term.term || "unknown"}`);
    if (!isNonEmptyString(term.status)) pushError(errors, `term.status missing for ${term.slug || term.term || "unknown"}`);

    if (isNonEmptyString(term.slug)) {
      if (termSlugs.has(term.slug)) pushError(errors, `duplicate term slug: ${term.slug}`);
      termSlugs.add(term.slug);
    }

    if (isNonEmptyString(term.category_slug) && !categorySlugs.has(term.category_slug)) {
      pushError(errors, `unknown category_slug "${term.category_slug}" for term ${term.slug || term.term || "unknown"}`);
    }

    if (isNonEmptyString(term.subcategory_slug) && !subcategorySlugs.has(term.subcategory_slug)) {
      pushError(errors, `unknown subcategory_slug "${term.subcategory_slug}" for term ${term.slug || term.term || "unknown"}`);
    }

    if (isNonEmptyString(term.status) && !["draft", "submitted", "validated", "published"].includes(term.status)) {
      pushError(errors, `invalid term.status "${term.status}" for ${term.slug || term.term || "unknown"}`);
    }
  }

  for (const relation of relations) {
    if (!isNonEmptyString(relation.source_slug)) pushError(errors, "relation.source_slug is required");
    if (!isNonEmptyString(relation.target_slug)) pushError(errors, "relation.target_slug is required");
    if (!isNonEmptyString(relation.relation_type)) pushError(errors, "relation.relation_type is required");

    if (isNonEmptyString(relation.source_slug) && !termSlugs.has(relation.source_slug)) {
      pushError(errors, `unknown relation.source_slug "${relation.source_slug}"`);
    }
    if (isNonEmptyString(relation.target_slug) && !termSlugs.has(relation.target_slug)) {
      pushError(errors, `unknown relation.target_slug "${relation.target_slug}"`);
    }
  }

  for (const item of media) {
    if (!isNonEmptyString(item.term_slug)) pushError(errors, "media.term_slug is required");
    if (!isNonEmptyString(item.media_type)) pushError(errors, "media.media_type is required");
    if (!isNonEmptyString(item.url)) pushError(errors, "media.url is required");

    if (isNonEmptyString(item.term_slug) && !termSlugs.has(item.term_slug)) {
      pushError(errors, `unknown media.term_slug "${item.term_slug}"`);
    }

    if (isNonEmptyString(item.media_type) && !["image", "pdf", "schema"].includes(item.media_type)) {
      pushError(errors, `invalid media.media_type "${item.media_type}"`);
    }
  }

  return {
    errors,
    summary: {
      version: dataset.version,
      categories: categories.length,
      subcategories: subcategories.length,
      terms: terms.length,
      relations: relations.length,
      media: media.length
    }
  };
}

const result = validate();

if (result.errors.length) {
  console.error("Content validation failed:");
  for (const message of result.errors) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log("Content validation OK.");
console.log(JSON.stringify(result.summary, null, 2));
