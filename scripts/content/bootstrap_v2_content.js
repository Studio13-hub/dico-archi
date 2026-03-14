#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

const { contentDir, v2Dir, loadLegacyContent } = require("./content_loader");

const subcategoryDefinitions = [
  {
    category_slug: "toitures",
    name: "Bases des toitures plates",
    slug: "bases-des-toitures-plates",
    description: "Notions d’introduction sur les toitures plates et leur logique constructive."
  },
  {
    category_slug: "toitures",
    name: "Typologies de toitures",
    slug: "typologies-de-toitures",
    description: "Familles de toitures plates et variantes de composition."
  },
  {
    category_slug: "toitures",
    name: "Composition et couches",
    slug: "composition-et-couches",
    description: "Couches, pentes et organisation technique des toitures plates."
  },
  {
    category_slug: "toitures",
    name: "Exécution et entretien",
    slug: "execution-et-entretien-des-toitures",
    description: "Mise en œuvre, entretien et indications pratiques de chantier pour les toitures."
  },
  {
    category_slug: "toitures",
    name: "Sécurité en toiture",
    slug: "securite-en-toiture",
    description: "Dispositifs de sécurité, accès et mesures de prévention des chutes."
  },
  {
    category_slug: "toitures",
    name: "Ressources toiture",
    slug: "ressources-toiture",
    description: "Glossaires, terminologie et ressources documentaires liées aux toitures."
  },
  {
    category_slug: "materiaux",
    name: "Fondamentaux des matériaux",
    slug: "fondamentaux-des-materiaux",
    description: "Principes de base, définitions et structures des matériaux de construction."
  },
  {
    category_slug: "materiaux",
    name: "Classification des matériaux",
    slug: "classification-des-materiaux",
    description: "Méthodes de classement et usages pratiques des familles de matériaux."
  },
  {
    category_slug: "materiaux",
    name: "Évaluation des matériaux",
    slug: "evaluation-des-materiaux",
    description: "Critères architecturaux, techniques, sanitaires, écologiques et économiques."
  },
  {
    category_slug: "materiaux",
    name: "Ressources matériaux",
    slug: "ressources-materiaux",
    description: "Bibliographies, publications et ressources utiles sur les matériaux."
  },
  {
    category_slug: "dessin-technique",
    name: "Représentations graphiques",
    slug: "representations-graphiques",
    description: "Plans, coupes, façades et détails utilisés pour lire un projet."
  },
  {
    category_slug: "dessin-technique",
    name: "Annotations et lecture",
    slug: "annotations-et-lecture",
    description: "Cotation, échelles et outils de lecture des documents graphiques."
  },
  {
    category_slug: "elements-constructifs",
    name: "Structure porteuse",
    slug: "structure-porteuse",
    description: "Éléments porteurs verticaux et horizontaux, fondations et reprises de charges."
  },
  {
    category_slug: "phases-sia",
    name: "Cycle du projet",
    slug: "cycle-du-projet",
    description: "Phases d’étude, de consultation et de réalisation selon la logique SIA."
  }
];

const subcategoryByTermSlug = {
  etancheite: "composition-et-couches",
  "pare-vapeur": "composition-et-couches",
  acrotere: "composition-et-couches",
  "toitures-plates": "bases-des-toitures-plates",
  "types-de-toitures-plates": "typologies-de-toitures",
  "toitures-chaudes": "typologies-de-toitures",
  "toitures-compactes": "typologies-de-toitures",
  "toitures-duo": "typologies-de-toitures",
  "toitures-froides": "typologies-de-toitures",
  "toitures-nues": "typologies-de-toitures",
  "composition-des-toitures-plates": "composition-et-couches",
  pente: "composition-et-couches",
  "isolation-thermique-et-phonique": "composition-et-couches",
  "travaux-de-ferblanterie": "execution-et-entretien-des-toitures",
  "terminologie-toitures-plates": "ressources-toiture",
  "indications-pour-la-construction": "execution-et-entretien-des-toitures",
  "entretien-des-toitures-plates": "execution-et-entretien-des-toitures",
  "dispositifs-antichutes": "securite-en-toiture",
  "glossaire-toitures-plates": "ressources-toiture",
  "sites-internet-techniques": "ressources-toiture",
  coupe: "representations-graphiques",
  facade: "representations-graphiques",
  "plan-d-etage": "representations-graphiques",
  "detail-constructif": "representations-graphiques",
  echelle: "annotations-et-lecture",
  cotation: "annotations-et-lecture",
  "mur-porteur": "structure-porteuse",
  dalle: "structure-porteuse",
  poteau: "structure-porteuse",
  linteau: "structure-porteuse",
  fondation: "structure-porteuse",
  "isolation-thermique": "structure-porteuse",
  "avant-projet": "cycle-du-projet",
  projet: "cycle-du-projet",
  execution: "cycle-du-projet",
  soumission: "cycle-du-projet",
  "reception-des-travaux": "cycle-du-projet",
  "introduction-aux-materiaux-de-construction": "fondamentaux-des-materiaux",
  "objectifs-de-letude-des-materiaux": "fondamentaux-des-materiaux",
  "structure-des-materiaux": "fondamentaux-des-materiaux",
  "classification-des-materiaux": "classification-des-materiaux",
  "classification-par-composition": "classification-des-materiaux",
  "classification-en-pratique": "classification-des-materiaux",
  "definitions-des-materiaux": "fondamentaux-des-materiaux",
  "evaluation-des-materiaux-de-construction": "evaluation-des-materiaux",
  "criteres-architecturaux": "evaluation-des-materiaux",
  "criteres-techniques": "evaluation-des-materiaux",
  "sante-et-bien-etre": "evaluation-des-materiaux",
  ecologie: "evaluation-des-materiaux",
  "criteres-economiques": "evaluation-des-materiaux",
  "bibliographie-technique": "ressources-materiaux",
  "publications-et-adresses": "ressources-materiaux"
};

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function toRichTerm(term) {
  return {
    id: `term_${term.slug.replaceAll("-", "_")}`,
    term: term.term,
    slug: term.slug,
    category_slug: term.category_slug,
    subcategory_slug: subcategoryByTermSlug[term.slug] || null,
    status: term.status,
    content: {
      definition: term.definition,
      explanation: null,
      example: term.example || null,
      applications: [],
      norms: []
    },
    technical_data: {
      dimensions: [],
      constraints: []
    },
    representation: {
      abbreviation_plan: null,
      drawing_note: null
    },
    translations: {},
    meta: {
      source_refs: [],
      tags: [],
      version: 1
    }
  };
}

function main() {
  const legacy = loadLegacyContent();
  const termsDir = path.join(v2Dir, "terms");
  ensureDirectory(path.join(v2Dir, "taxonomy"));
  ensureDirectory(path.join(v2Dir, "relations"));
  ensureDirectory(path.join(v2Dir, "media"));
  ensureDirectory(path.join(v2Dir, "schemas"));
  ensureDirectory(path.join(v2Dir, "templates"));
  ensureDirectory(termsDir);

  writeJson(path.join(v2Dir, "taxonomy", "categories.json"), legacy.categories);
  writeJson(path.join(v2Dir, "taxonomy", "subcategories.json"), subcategoryDefinitions);
  writeJson(path.join(v2Dir, "relations", "relations.json"), legacy.relations);
  writeJson(path.join(v2Dir, "media", "media.json"), legacy.media);

  for (const term of legacy.terms) {
    writeJson(path.join(termsDir, `${term.slug}.json`), toRichTerm(term));
  }

  console.log(`Bootstrapped V2 content in ${path.relative(contentDir, v2Dir)} from legacy corpus.`);
  console.log(`Terms exported: ${legacy.terms.length}`);
  console.log(`Subcategories created: ${subcategoryDefinitions.length}`);
}

main();
