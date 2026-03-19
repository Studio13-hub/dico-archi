const { createServerSupabaseClient } = require("./_supabase");
const { buildCanonicalMaps } = require("./_canonical_content");

async function loadPublishedTermsFromDb() {
  const supabaseConfig = createServerSupabaseClient({ publicOnly: true });
  if (supabaseConfig.error) return [];

  const query = await supabaseConfig.client
    .from("terms")
    .select(`
      id,
      term,
      slug,
      definition,
      example,
      status,
      categories:category_id (
        id,
        name,
        slug,
        description
      )
    `)
    .eq("status", "published")
    .order("term", { ascending: true });

  if (query.error) return [];
  return Array.isArray(query.data) ? query.data : [];
}

async function loadCategoriesFromDb() {
  const supabaseConfig = createServerSupabaseClient({ publicOnly: true });
  if (supabaseConfig.error) return [];

  const query = await supabaseConfig.client
    .from("categories")
    .select("id, name, slug, description")
    .order("name", { ascending: true });

  if (query.error) return [];
  return Array.isArray(query.data) ? query.data : [];
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  const resource = String(req.query?.resource || "categories").trim().toLowerCase();

  try {
    const { categories, publishedTerms } = buildCanonicalMaps();

    if (resource === "terms") {
      const dbTerms = await loadPublishedTermsFromDb();
      const merged = new Map();
      for (const item of publishedTerms) merged.set(item.slug, item);
      for (const item of dbTerms) {
        if (!item?.slug) continue;
        merged.set(item.slug, item);
      }
      res.statusCode = 200;
      res.end(JSON.stringify({
        terms: Array.from(merged.values()).sort((a, b) => String(a.term || "").localeCompare(String(b.term || ""), "fr"))
      }));
      return;
    }

    const dbCategories = await loadCategoriesFromDb();
    const mergedCategories = new Map();
    for (const item of categories) {
      if (!item?.slug) continue;
      mergedCategories.set(item.slug, item);
    }
    for (const item of dbCategories) {
      if (!item?.slug) continue;
      mergedCategories.set(item.slug, item);
    }

    res.statusCode = 200;
    res.end(JSON.stringify({
      categories: Array.from(mergedCategories.values()).sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), "fr")
      )
    }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error?.message || "internal_error" }));
  }
};
