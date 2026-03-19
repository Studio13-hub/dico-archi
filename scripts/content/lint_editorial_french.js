#!/usr/bin/env node
/* eslint-disable no-console */
const { loadCanonicalContent } = require("./content_loader");

const suspiciousReplacements = [
  ["Etancheite", "Étanchéité"],
  ["Facade", "Façade"],
  ["Echelle", "Échelle"],
  ["Acrotere", "Acrotère"],
  ["Detail", "Détail"],
  ["Representation", "Représentation"],
  ["interieur", "intérieur"],
  ["exterieure", "extérieure"],
  ["batiment", "bâtiment"],
  ["precis", "précis"],
  ["precisement", "précisément"],
  ["reelles", "réelles"],
  ["generale", "générale"],
  ["phenomene", "phénomène"],
  ["proprietes", "propriétés"],
  ["energetiques", "énergétiques"],
  ["a travers", "à travers"],
  ["a l ", "à l’"],
  ["a la ", "à la "],
  ["cote ", "côté "]
];

const preferredTermLabels = new Map([
  ["bois-lamelle-colle", "Bois lamellé-collé"],
  ["joint-detancheite", "Joint d’étanchéité"],
  ["plan-d-etage", "Plan d’étage"],
  ["toitures-duo", "Toitures duo"],
  ["sites-internet-techniques", "Sites internet techniques"]
]);

function hasStrongPunctuation(value) {
  return /[.!?]\s*$/.test(String(value || ""));
}

function hasDoubleSpaces(value) {
  return /\s{2,}/.test(String(value || ""));
}

function isNfc(value) {
  return String(value || "") === String(value || "").normalize("NFC");
}

function collectWarnings() {
  const warnings = [];
  const dataset = loadCanonicalContent();
  const terms = dataset.terms;
  const media = dataset.media;

  function pushWarning(message) {
    warnings.push(message);
  }

  for (const term of terms) {
    const label = term.slug || term.term || "unknown";
    const fields = [
      ["term", term.term],
      ["definition", term.definition],
      ["example", term.example]
    ];

    for (const [field, value] of fields) {
      if (!value) continue;
      if (!isNfc(value)) {
        pushWarning(`${label}: ${field} should be normalized to NFC Unicode.`);
      }
      if (hasDoubleSpaces(value)) {
        pushWarning(`${label}: ${field} contains double spaces.`);
      }
      if ((field === "definition" || field === "example") && !hasStrongPunctuation(value)) {
        pushWarning(`${label}: ${field} should end with strong punctuation.`);
      }
      for (const [raw, suggested] of suspiciousReplacements) {
        if (String(value).includes(raw)) {
          pushWarning(`${label}: ${field} contains "${raw}" — consider "${suggested}".`);
        }
      }
    }

    const preferredLabel = preferredTermLabels.get(term.slug);
    if (preferredLabel && term.term !== preferredLabel) {
      pushWarning(`${label}: term should be "${preferredLabel}".`);
    }
  }

  for (const item of media) {
    const label = item.term_slug || "unknown-media";
    if (item.title && hasDoubleSpaces(item.title)) {
      pushWarning(`${label}: media.title contains double spaces.`);
    }
    if (item.alt_text && !hasStrongPunctuation(item.alt_text)) {
      pushWarning(`${label}: media.alt_text should end with strong punctuation.`);
    }
  }

  return warnings;
}

const warnings = collectWarnings();

if (!warnings.length) {
  console.log("French editorial lint OK.");
  process.exit(0);
}

console.log("French editorial lint warnings:");
for (const warning of warnings) {
  console.log(`- ${warning}`);
}

if (process.env.STRICT_EDITORIAL_LINT === "1") {
  process.exit(1);
}
