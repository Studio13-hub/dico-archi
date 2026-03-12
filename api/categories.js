const { createClient } = require("@supabase/supabase-js");

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: "missing_supabase_server_env" }));
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  try {
    const query = await supabase
      .from("categories")
      .select("id, name, slug, description, parent_id")
      .order("name", { ascending: true });

    if (query.error) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: query.error.message || "categories_fetch_failed" }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ categories: query.data || [] }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error?.message || "internal_error" }));
  }
};
