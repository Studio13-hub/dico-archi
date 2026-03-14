const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const contentDir = path.join(root, "content");
const v2Dir = path.join(contentDir, "v2");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function listJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => path.join(directory, name));
}

function loadLegacyContent() {
  return {
    version: "legacy",
    categories: readJson(path.join(contentDir, "categories.json")),
    subcategories: [],
    terms: readJson(path.join(contentDir, "terms.json")),
    relations: readJson(path.join(contentDir, "relations.json")),
    media: readJson(path.join(contentDir, "media.json"))
  };
}

function projectTermV2ToCore(term) {
  return {
    term: term.term,
    slug: term.slug,
    definition: term.content?.definition || "",
    example: term.content?.example || null,
    category_slug: term.category_slug,
    subcategory_slug: term.subcategory_slug || null,
    status: term.status
  };
}

function loadV2Content() {
  const categories = readJson(path.join(v2Dir, "taxonomy", "categories.json"));
  const subcategories = readJson(path.join(v2Dir, "taxonomy", "subcategories.json"));
  const richTerms = listJsonFiles(path.join(v2Dir, "terms")).map((filePath) => readJson(filePath));
  const relations = readJson(path.join(v2Dir, "relations", "relations.json"));
  const media = readJson(path.join(v2Dir, "media", "media.json"));

  return {
    version: "v2",
    categories,
    subcategories,
    richTerms,
    terms: richTerms.map(projectTermV2ToCore),
    relations,
    media
  };
}

function hasV2Content() {
  return fs.existsSync(path.join(v2Dir, "taxonomy", "categories.json"));
}

function loadCanonicalContent() {
  return hasV2Content() ? loadV2Content() : loadLegacyContent();
}

module.exports = {
  contentDir,
  v2Dir,
  hasV2Content,
  listJsonFiles,
  loadCanonicalContent,
  loadLegacyContent,
  loadV2Content,
  readJson
};
