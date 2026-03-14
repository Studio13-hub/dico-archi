const { createServerSupabaseClient } = require("./_supabase");

function getBearerToken(req) {
  const authHeader = String(req.headers.authorization || "").trim();
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.slice(7).trim();
}

function clampInt(value, { min = 0, max = 100000 } = {}) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(max, Math.max(min, parsed));
}

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

  const gameKey = String(body?.gameKey || "").trim().slice(0, 40);
  const sessionId = String(body?.sessionId || "").trim().slice(0, 120);
  const modeLabel = String(body?.modeLabel || "").trim().slice(0, 80);
  const categoryLabel = String(body?.categoryLabel || "").trim().slice(0, 80);
  const meta = body?.meta && typeof body.meta === "object" ? body.meta : {};

  if (!gameKey || !sessionId) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "missing_game_key_or_session" }));
    return;
  }

  let userId = null;
  const token = getBearerToken(req);
  if (token) {
    const authResult = await serverSupabase.client.auth.getUser(token);
    if (!authResult.error && authResult.data?.user?.id) {
      userId = authResult.data.user.id;
    }
  }

  const insert = await serverSupabase.client
    .from("game_scores")
    .insert({
      game_key: gameKey,
      session_id: sessionId,
      user_id: userId,
      score: clampInt(body?.score),
      total: clampInt(body?.total),
      elapsed_seconds: clampInt(body?.seconds),
      best_combo: clampInt(body?.bestCombo),
      best_streak: clampInt(body?.bestStreak),
      moves: clampInt(body?.moves),
      known: clampInt(body?.known),
      review: clampInt(body?.review),
      mode_label: modeLabel || null,
      category_label: categoryLabel || null,
      meta
    });

  if (insert.error) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: insert.error.message || "game_score_insert_failed" }));
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true }));
};
