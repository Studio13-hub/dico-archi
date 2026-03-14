#!/usr/bin/env node
/* eslint-disable no-console */
const { loadCanonicalContent } = require("./content_loader");

function sqlString(value) {
  if (value == null) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlInt(value, fallback = 0) {
  const n = Number.isInteger(value) ? value : fallback;
  return String(n);
}

function buildCategoriesSql(categories) {
  const rows = categories
    .map((item) => `  (${sqlString(item.name)}, ${sqlString(item.slug)}, ${sqlString(item.description)})`)
    .join(",\n");

  return [
    "-- Categories",
    "insert into public.categories (name, slug, description)",
    "values",
    rows,
    "on conflict (slug) do update",
    "set",
    "  name = excluded.name,",
    "  description = excluded.description;",
    ""
  ].join("\n");
}

function buildTermsSql(terms) {
  const rows = terms
    .map((item) => {
      const example = item.example ? sqlString(item.example) : "null";
      return `    (${sqlString(item.term)}, ${sqlString(item.slug)}, ${sqlString(item.definition)}, ${example}, ${sqlString(item.category_slug)}, ${sqlString(item.status)})`;
    })
    .join(",\n");

  return [
    "-- Terms",
    "insert into public.terms (term, slug, definition, example, category_id, status)",
    "select",
    "  src.term,",
    "  src.slug,",
    "  src.definition,",
    "  src.example,",
    "  c.id,",
    "  src.status",
    "from (",
    "  values",
    rows,
    ") as src(term, slug, definition, example, category_slug, status)",
    "join public.categories c on c.slug = src.category_slug",
    "on conflict (slug) do update",
    "set",
    "  term = excluded.term,",
    "  definition = excluded.definition,",
    "  example = excluded.example,",
    "  category_id = excluded.category_id,",
    "  status = excluded.status,",
    "  updated_at = now(),",
    "  published_at = case",
    "    when excluded.status = 'published' then coalesce(public.terms.published_at, now())",
    "    else public.terms.published_at",
    "  end;",
    ""
  ].join("\n");
}

function buildRelationsSql(relations) {
  const relationSlugs = Array.from(
    new Set(
      relations.flatMap((item) => [item.source_slug, item.target_slug]).filter(Boolean)
    )
  );

  const deleteSql = relationSlugs.length
    ? [
        "-- Reset owned relations",
        "delete from public.term_relations",
        "where source_term_id in (select id from public.terms where slug in (" + relationSlugs.map(sqlString).join(", ") + "))",
        "   or target_term_id in (select id from public.terms where slug in (" + relationSlugs.map(sqlString).join(", ") + "));",
        ""
      ].join("\n")
    : "-- No relations to reset\n";

  if (!relations.length) {
    return deleteSql;
  }

  const rows = relations
    .map((item) => `    (${sqlString(item.source_slug)}, ${sqlString(item.target_slug)}, ${sqlString(item.relation_type)})`)
    .join(",\n");

  const insertSql = [
    "-- Relations",
    "insert into public.term_relations (source_term_id, target_term_id, relation_type)",
    "select",
    "  src_term.id,",
    "  dst_term.id,",
    "  src.relation_type",
    "from (",
    "  values",
    rows,
    ") as src(source_slug, target_slug, relation_type)",
    "join public.terms src_term on src_term.slug = src.source_slug",
    "join public.terms dst_term on dst_term.slug = src.target_slug",
    "on conflict (source_term_id, target_term_id, relation_type) do nothing;",
    ""
  ].join("\n");

  return deleteSql + insertSql;
}

function buildMediaSql(media) {
  const mediaSlugs = Array.from(new Set(media.map((item) => item.term_slug).filter(Boolean)));
  const deleteSql = mediaSlugs.length
    ? [
        "-- Reset owned media",
        "delete from public.media",
        "where term_id in (select id from public.terms where slug in (" + mediaSlugs.map(sqlString).join(", ") + "));",
        ""
      ].join("\n")
    : "-- No media to reset\n";

  if (!media.length) {
    return deleteSql;
  }

  const rows = media
    .map((item) => {
      const title = item.title ? sqlString(item.title) : "null";
      const altText = item.alt_text ? sqlString(item.alt_text) : "null";
      return `    (${sqlString(item.term_slug)}, ${sqlString(item.media_type)}, ${sqlString(item.url)}, ${title}, ${altText}, ${sqlInt(item.position, 0)})`;
    })
    .join(",\n");

  const insertSql = [
    "-- Media",
    "insert into public.media (term_id, media_type, url, title, alt_text, position)",
    "select",
    "  t.id,",
    "  src.media_type,",
    "  src.url,",
    "  src.title,",
    "  src.alt_text,",
    "  src.position",
    "from (",
    "  values",
    rows,
    ") as src(term_slug, media_type, url, title, alt_text, position)",
    "join public.terms t on t.slug = src.term_slug;",
    ""
  ].join("\n");

  return deleteSql + insertSql;
}

function buildSql() {
  const dataset = loadCanonicalContent();
  const categories = dataset.categories;
  const terms = dataset.terms;
  const relations = dataset.relations;
  const media = dataset.media;

  return [
    `-- Generated from content ${dataset.version.toUpperCase()} canonical source`,
    "-- Do not edit manually; update the canonical content files instead.",
    "begin;",
    "",
    buildCategoriesSql(categories),
    buildTermsSql(terms),
    buildRelationsSql(relations),
    buildMediaSql(media),
    "commit;",
    ""
  ].join("\n");
}

process.stdout.write(buildSql());
