const { createServerSupabaseClient } = require("./_supabase");

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
        categories:category_id (
          name
        )
      `)
      .eq("status", "published")
      .or(`term.ilike.%${query}%,definition.ilike.%${query}%`)
      .order("term", { ascending: true })
      .limit(20);

    if (searchQuery.error) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: searchQuery.error.message || "search_failed" }));
      return;
    }

    const results = (searchQuery.data || []).map((item) => ({
      id: item.id,
      term: item.term,
      slug: item.slug,
      definition: item.definition,
      category: item.categories?.name || null
    }));

    res.statusCode = 200;
    res.end(JSON.stringify({ results }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error?.message || "internal_error" }));
  }
};
