const { createServerSupabaseClient } = require("./_supabase");

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function computeScore(item, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;

  const term = normalizeText(item.term);
  const slug = normalizeText(item.slug);
  const category = normalizeText(item.category);
  const definition = normalizeText(item.definition);
  const example = normalizeText(item.example);

  let score = 0;

  if (term === normalizedQuery) score += 200;
  if (slug === normalizedQuery) score += 180;
  if (term.startsWith(normalizedQuery)) score += 120;
  if (slug.startsWith(normalizedQuery)) score += 100;
  if (term.includes(normalizedQuery)) score += 80;
  if (slug.includes(normalizedQuery)) score += 70;
  if (category.startsWith(normalizedQuery)) score += 40;
  if (category.includes(normalizedQuery)) score += 25;
  if (definition.includes(normalizedQuery)) score += 20;
  if (example.includes(normalizedQuery)) score += 10;

  return score;
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  const supabaseConfig = createServerSupabaseClient({ publicOnly: true });
  if (supabaseConfig.error) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: supabaseConfig.error }));
    return;
  }

  const query = String(req.query?.q || "").trim();
  if (!query) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "missing_query" }));
    return;
  }

  const supabase = supabaseConfig.client;

  try {
    const searchQuery = await supabase
      .from("terms")
      .select(`
        id,
        term,
        slug,
        definition,
        example,
        categories:category_id (
          name
        )
      `)
      .eq("status", "published")
      .order("term", { ascending: true })
      .limit(300);

    if (searchQuery.error) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: searchQuery.error.message || "search_failed" }));
      return;
    }

    const results = (searchQuery.data || [])
      .map((item) => ({
        id: item.id,
        term: item.term,
        slug: item.slug,
        definition: item.definition,
        example: item.example,
        category: item.categories?.name || null
      }))
      .map((item) => ({
        ...item,
        score: computeScore(item, query)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return String(a.term || "").localeCompare(String(b.term || ""), "fr");
      })
      .slice(0, 20)
      .map(({ score, ...item }) => item);

    res.statusCode = 200;
    res.end(JSON.stringify({ results }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error?.message || "internal_error" }));
  }
};
