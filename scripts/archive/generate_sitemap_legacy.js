#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const vm = require("node:vm");

const SITE_URL = "https://dico-archi.vercel.app";
const root = process.cwd();
const dataJsPath = `${root}/data.js`;
const sitemapPath = `${root}/sitemap.xml`;

function loadTerms() {
  const code = fs.readFileSync(dataJsPath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.window.TERMS || sandbox.TERMS || [];
}

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function build() {
  const terms = loadTerms();
  const categories = [...new Set(terms.map((t) => (t.category || "").trim()).filter(Boolean))].sort();

  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/auth.html`,
    `${SITE_URL}/contribuer.html`,
    `${SITE_URL}/admin.html`,
    `${SITE_URL}/category.html`
  ];

  for (const cat of categories) {
    urls.push(`${SITE_URL}/category.html?name=${encodeURIComponent(cat)}`);
  }

  for (const term of terms) {
    if (!term.term) continue;
    urls.push(`${SITE_URL}/term.html?term=${encodeURIComponent(term.term)}`);
  }

  const uniq = [...new Set(urls)];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...uniq.map((u) => `  <url><loc>${xmlEscape(u)}</loc></url>`),
    "</urlset>",
    ""
  ].join("\n");

  fs.writeFileSync(sitemapPath, xml, "utf8");
  console.log(`Sitemap generated with ${uniq.length} URLs.`);
}

build();
