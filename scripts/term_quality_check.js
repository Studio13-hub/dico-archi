#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const vm = require("node:vm");

function loadTerms() {
  const code = fs.readFileSync("data.js", "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.window.TERMS || sandbox.TERMS || [];
}

const terms = loadTerms();
const warnings = [];
const errors = [];
const termKeys = new Map();

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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
  if (text.includes("\n")) return text.split("\n").map((item) => item.trim()).filter(Boolean);
  if (text.includes("|")) return text.split("|").map((item) => item.trim()).filter(Boolean);
  return [text];
}

function isSafeMediaUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return true;
  if (raw.startsWith("/")) return true;
  try {
    const parsed = new URL(raw, "https://dico-archi.vercel.app");
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch (_error) {
    return false;
  }
}

for (const t of terms) {
  const term = (t.term || "").trim();
  const definition = (t.definition || "").trim();
  const example = (t.example || "").trim();
  const related = Array.isArray(t.related) ? t.related.filter(Boolean) : [];
  const media = parseMediaUrls(t.image_url);
  const termKey = normalizeKey(term);

  if (!term) {
    errors.push("Terme vide");
    continue;
  }

  const existing = termKeys.get(termKey);
  if (existing) {
    errors.push(`Doublon de terme (insensible casse/accents): "${term}" / "${existing}"`);
  } else {
    termKeys.set(termKey, term);
  }

  if (definition.length < 20) warnings.push(`${term}: definition trop courte`);
  if (example.length < 10) warnings.push(`${term}: exemple trop court`);
  if (related.length === 0) warnings.push(`${term}: aucun terme lie`);
  if (related.length > 5) warnings.push(`${term}: trop de termes lies (>5)`);
  if (media.some((url) => !isSafeMediaUrl(url))) {
    errors.push(`${term}: URL media invalide (schema non autorise ou URL mal formee)`);
  }
}

for (const t of terms) {
  const term = (t.term || "").trim();
  if (!term) continue;
  const related = Array.isArray(t.related) ? t.related.filter(Boolean) : [];
  for (const rel of related) {
    const relKey = normalizeKey(rel);
    if (!termKeys.has(relKey)) {
      warnings.push(`${term}: terme lie introuvable -> "${rel}"`);
    }
  }
}

if (errors.length) {
  console.log(`Quality check FAILED (${errors.length} erreurs, ${warnings.length} warnings)`);
  for (const issue of errors) console.log(`ERROR: ${issue}`);
  for (const issue of warnings) console.log(`WARN: ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Quality check WARN (${warnings.length} warnings)`);
  for (const issue of warnings) console.log(`WARN: ${issue}`);
  process.exit(0);
}

console.log(`Quality check OK (${terms.length} termes)`);
