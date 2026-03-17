const { createClient } = require("@supabase/supabase-js");

function normalizeTrackedPagePath(value) {
  const raw = String(value || "").trim();
  if (!raw) return "/";

  const [pathname, search = ""] = raw.split("?");
  const cleanPath = pathname.trim();

  if (!cleanPath || cleanPath === "/" || cleanPath === "/index.html" || cleanPath === "index.html") {
    return search ? `/?${search}` : "/";
  }

  return search ? `${cleanPath}?${search}` : cleanPath;
}

function getCanonicalTrackedPageTitle(pagePath, fallbackTitle) {
  const normalizedPath = normalizeTrackedPagePath(pagePath);
  const canonicalTitles = {
    "/": "Dico-Archi - Bienvenue",
    "/admin.html": "Admin - Dico-Archi",
    "/auth.html": "Connexion - Dico-Archi",
    "/compte.html": "Mon compte - Dico-Archi",
    "/contribuer.html": "Contribuer - Dico-Archi",
    "/dictionnaire.html": "Dico-Archi - Dictionnaire simple d'architecture",
    "/category.html": "Catégorie - Dico-Archi",
    "/games.html": "Jeux - Dico-Archi",
    "/quiz.html": "Quiz - Dico-Archi",
    "/flashcards.html": "Flashcards - Dico-Archi",
    "/match.html": "Match - Dico-Archi",
    "/daily.html": "Défi du jour - Dico-Archi",
    "/memory.html": "Mémoire - Dico-Archi"
  };

  return canonicalTitles[normalizedPath] || String(fallbackTitle || "").trim() || normalizedPath;
}

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

  const authHeader = String(req.headers.authorization || "");
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "missing_bearer_token" }));
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  const userResult = await supabase.auth.getUser(token);
  if (userResult.error || !userResult.data?.user?.id) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "invalid_token" }));
    return;
  }

  const profileResult = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", userResult.data.user.id)
    .single();

  if (
    profileResult.error
    || !profileResult.data
    || profileResult.data.active === false
    || profileResult.data.role !== "super_admin"
  ) {
    res.statusCode = 403;
    res.end(JSON.stringify({ error: "forbidden" }));
    return;
  }

  const rating = String(req.query?.rating || "all").trim();
  const source = String(req.query?.source || "all").trim();
  const limitRaw = Number.parseInt(String(req.query?.limit || "80"), 10);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 200)) : 80;

  const params = new URLSearchParams();
  params.set("select", "id,created_at,rating,user_message,assistant_message,page_path,page_title,source,session_id,meta");
  params.set("order", "created_at.desc");
  params.set("limit", String(limit));
  if (rating === "up" || rating === "down") params.set("rating", `eq.${rating}`);
  if (source === "ai" || source === "fallback") params.set("source", `eq.${source}`);

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/chatbot_feedback?${params.toString()}`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`
      }
    });

    const payload = await response.text();
    if (!response.ok) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: payload || "supabase_select_failed" }));
      return;
    }

    let data = [];
    try {
      data = JSON.parse(payload);
    } catch (_error) {
      data = [];
    }

    const items = Array.isArray(data)
      ? data.map((item) => ({
        ...item,
        page_path: normalizeTrackedPagePath(item?.page_path),
        page_title: getCanonicalTrackedPageTitle(item?.page_path, item?.page_title)
      }))
      : [];

    res.statusCode = 200;
    res.end(JSON.stringify({ items }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error?.message || "internal_error" }));
  }
};
