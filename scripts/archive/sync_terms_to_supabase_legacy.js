#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const vm = require("node:vm");

const projectRoot = process.cwd();
const dataJsPath = `${projectRoot}/data.js`;
const configJsPath = `${projectRoot}/config.js`;

function loadTerms() {
  const code = fs.readFileSync(dataJsPath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.window.TERMS || sandbox.TERMS || [];
}

function loadConfig() {
  const code = fs.readFileSync(configJsPath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return {
    url: sandbox.window.SUPABASE_URL,
    anon: sandbox.window.SUPABASE_ANON_KEY
  };
}

async function main() {
  const { url } = loadConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing SUPABASE_URL (config.js) or SUPABASE_SERVICE_ROLE_KEY (env).");
    process.exit(1);
  }

  const terms = loadTerms()
    .map((t) => ({
      term: (t.term || "").trim(),
      category: (t.category || "Non classe").trim(),
      definition: (t.definition || "").trim(),
      example: (t.example || "").trim(),
      related: Array.isArray(t.related) ? t.related.slice(0, 5) : [],
      image_url: (t.image_url || "").trim() || null,
      status: "published"
    }))
    .filter((t) => t.term && t.category && t.definition);

  const endpoint = `${url}/rest/v1/terms?on_conflict=term`;
  let response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(terms)
  });

  const text = await response.text();
  if (!response.ok && text.includes("status")) {
    const fallback = terms.map((t) => ({
      term: t.term,
      category: t.category,
      definition: t.definition,
      example: t.example,
      related: t.related,
      image_url: t.image_url
    }));
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify(fallback)
    });
    const text2 = await response.text();
    if (!response.ok) {
      console.error("Sync failed:", response.status, text2);
      process.exit(2);
    }
    const out2 = JSON.parse(text2 || "[]");
    console.log(`Synced ${out2.length} terms to Supabase (fallback without status).`);
    return;
  }
  if (!response.ok) {
    console.error("Sync failed:", response.status, text);
    process.exit(2);
  }
  const out = JSON.parse(text || "[]");
  console.log(`Synced ${out.length} terms to Supabase.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
