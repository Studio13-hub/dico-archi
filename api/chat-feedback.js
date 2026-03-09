module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
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

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_error) {
      body = {};
    }
  }

  const rating = body?.rating === "up" || body?.rating === "down" ? body.rating : "";
  const assistantMessage = String(body?.assistantMessage || "").trim().slice(0, 4000);
  const userMessage = String(body?.userMessage || "").trim().slice(0, 1000);
  const pagePath = String(body?.pagePath || "").trim().slice(0, 300);
  const pageTitle = String(body?.pageTitle || "").trim().slice(0, 300);
  const sessionId = String(body?.sessionId || "").trim().slice(0, 120);
  const source = body?.source === "ai" ? "ai" : "fallback";
  const model = String(body?.model || "").trim().slice(0, 120);

  if (!rating || !assistantMessage) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "invalid_payload" }));
    return;
  }

  const payload = {
    rating,
    assistant_message: assistantMessage,
    user_message: userMessage || null,
    page_path: pagePath || null,
    page_title: pageTitle || null,
    source,
    session_id: sessionId || null,
    meta: {
      model: model || null,
      user_agent: String(req.headers["user-agent"] || "").slice(0, 300)
    }
  };

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/chatbot_feedback`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      res.statusCode = 502;
      res.end(JSON.stringify({ error: text || "supabase_insert_failed" }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error?.message || "internal_error" }));
  }
};
