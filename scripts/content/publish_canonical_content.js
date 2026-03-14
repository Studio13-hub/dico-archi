#!/usr/bin/env node
/* eslint-disable no-console */
const { loadCanonicalContent } = require("./content_loader");

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildHeaders(key, extras = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extras
  };
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} ${response.statusText}`);
    error.payload = data;
    throw error;
  }
  return data;
}

async function resetEditorialTables(baseUrl, key) {
  const tables = ["term_relations", "media", "terms", "categories"];

  for (const table of tables) {
    await requestJson(
      `${baseUrl}/rest/v1/${table}?id=neq.00000000-0000-0000-0000-000000000000`,
      {
        method: "DELETE",
        headers: buildHeaders(key, { Prefer: "return=minimal" })
      }
    );
  }
}

async function insertCategories(baseUrl, key, categories) {
  const payload = categories.map((item) => ({
    name: item.name,
    slug: item.slug,
    description: item.description
  }));

  await requestJson(`${baseUrl}/rest/v1/categories`, {
    method: "POST",
    headers: buildHeaders(key, { Prefer: "return=minimal" }),
    body: JSON.stringify(payload)
  });
}

async function fetchCategoryMap(baseUrl, key) {
  const data = await requestJson(`${baseUrl}/rest/v1/categories?select=id,slug`, {
    method: "GET",
    headers: buildHeaders(key)
  });
  return new Map((data || []).map((item) => [item.slug, item.id]));
}

async function insertTerms(baseUrl, key, terms, categoryMap) {
  const nowIso = new Date().toISOString();
  const payload = terms.map((item) => ({
    term: item.term,
    slug: item.slug,
    definition: item.definition,
    example: item.example || null,
    category_id: categoryMap.get(item.category_slug),
    status: item.status,
    published_at: item.status === "published" ? nowIso : null
  }));

  await requestJson(`${baseUrl}/rest/v1/terms`, {
    method: "POST",
    headers: buildHeaders(key, { Prefer: "return=minimal" }),
    body: JSON.stringify(payload)
  });
}

async function fetchTermMap(baseUrl, key) {
  const data = await requestJson(`${baseUrl}/rest/v1/terms?select=id,slug`, {
    method: "GET",
    headers: buildHeaders(key)
  });
  return new Map((data || []).map((item) => [item.slug, item.id]));
}

async function insertRelations(baseUrl, key, relations, termMap) {
  if (!relations.length) return;
  const payload = relations.map((item) => ({
    source_term_id: termMap.get(item.source_slug),
    target_term_id: termMap.get(item.target_slug),
    relation_type: item.relation_type
  }));
  await requestJson(`${baseUrl}/rest/v1/term_relations`, {
    method: "POST",
    headers: buildHeaders(key, { Prefer: "return=minimal" }),
    body: JSON.stringify(payload)
  });
}

async function insertMedia(baseUrl, key, media, termMap) {
  if (!media.length) return;
  const payload = media.map((item) => ({
    term_id: termMap.get(item.term_slug),
    media_type: item.media_type,
    url: item.url,
    title: item.title || null,
    alt_text: item.alt_text || null,
    position: Number.isInteger(item.position) ? item.position : 0
  }));
  await requestJson(`${baseUrl}/rest/v1/media`, {
    method: "POST",
    headers: buildHeaders(key, { Prefer: "return=minimal" }),
    body: JSON.stringify(payload)
  });
}

async function main() {
  const url = requiredEnv("SUPABASE_URL");
  const key = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const dataset = loadCanonicalContent();
  const baseUrl = url.replace(/\/$/, "");

  await resetEditorialTables(baseUrl, key);
  await insertCategories(baseUrl, key, dataset.categories);
  const categoryMap = await fetchCategoryMap(baseUrl, key);
  await insertTerms(baseUrl, key, dataset.terms, categoryMap);
  const termMap = await fetchTermMap(baseUrl, key);
  await insertRelations(baseUrl, key, dataset.relations, termMap);
  await insertMedia(baseUrl, key, dataset.media, termMap);

  console.log("Canonical content published.");
  console.log(
    JSON.stringify(
      {
        version: dataset.version,
        categories: dataset.categories.length,
        terms: dataset.terms.length,
        relations: dataset.relations.length,
        media: dataset.media.length
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Publish failed:");
  console.error(error);
  process.exit(1);
});
