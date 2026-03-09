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
const issues = [];

for (const t of terms) {
  const term = (t.term || "").trim();
  const definition = (t.definition || "").trim();
  const example = (t.example || "").trim();
  const related = Array.isArray(t.related) ? t.related.filter(Boolean) : [];

  if (!term) issues.push("Terme vide");
  if (definition.length < 20) issues.push(`${term}: definition trop courte`);
  if (example.length < 10) issues.push(`${term}: exemple trop court`);
  if (related.length === 0) issues.push(`${term}: aucun terme lie`);
  if (related.length > 5) issues.push(`${term}: trop de termes lies (>5)`);
}

if (!issues.length) {
  console.log(`Quality check OK (${terms.length} termes)`);
  process.exit(0);
}

console.log(`Quality check warnings (${issues.length})`);
for (const issue of issues) console.log(`- ${issue}`);
