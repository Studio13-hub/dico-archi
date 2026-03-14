const { createServerSupabaseClient } = require("./_supabase");

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  const serverSupabase = createServerSupabaseClient();
  if (serverSupabase.error) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: serverSupabase.error }));
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_error) {
      body = {};
    }
  }

  const pagePath = String(body?.pagePath || "").trim().slice(0, 300);
  const pageTitle = String(body?.pageTitle || "").trim().slice(0, 160);
  const sessionId = String(body?.sessionId || "").trim().slice(0, 120);
  const visitorId = String(body?.visitorId || "").trim().slice(0, 120);
  const meta = body?.meta && typeof body.meta === "object" ? body.meta : {};

  if (!pagePath || !sessionId) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "missing_page_path_or_session" }));
    return;
  }

  const insert = await serverSupabase.client
    .from("page_views")
    .insert({
      page_path: pagePath,
      page_title: pageTitle || null,
      session_id: sessionId,
      visitor_id: visitorId || null,
      meta
    });

  if (insert.error) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: insert.error.message || "page_view_insert_failed" }));
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true }));
};
