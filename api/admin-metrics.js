const { createServerSupabaseClient } = require("./_supabase");

const METRICS_LOOKBACK_DAYS = 30;
const METRICS_MAX_PAGE_VIEWS = 3000;
const METRICS_MAX_GAME_SCORES = 3000;
const METRICS_MAX_TOP_ITEMS = 8;
const METRICS_MAX_RECENT_SCORES = 12;

function getBearerToken(req) {
  const authHeader = String(req.headers.authorization || "").trim();
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.slice(7).trim();
}

function bucketBy(list, keyFn) {
  const map = new Map();
  for (const item of list) {
    const key = keyFn(item);
    const current = map.get(key) || [];
    current.push(item);
    map.set(key, current);
  }
  return map;
}

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
    "admin.html": "Admin - Dico-Archi",
    "/auth.html": "Connexion - Dico-Archi",
    "auth.html": "Connexion - Dico-Archi",
    "/compte.html": "Mon compte - Dico-Archi",
    "compte.html": "Mon compte - Dico-Archi",
    "/contribuer.html": "Contribuer - Dico-Archi",
    "contribuer.html": "Contribuer - Dico-Archi",
    "/dictionnaire.html": "Dico-Archi - Dictionnaire simple d'architecture",
    "dictionnaire.html": "Dico-Archi - Dictionnaire simple d'architecture",
    "/category.html": "Catégorie - Dico-Archi",
    "category.html": "Catégorie - Dico-Archi",
    "/games.html": "Jeux - Dico-Archi",
    "games.html": "Jeux - Dico-Archi",
    "/quiz.html": "Quiz - Dico-Archi",
    "quiz.html": "Quiz - Dico-Archi",
    "/flashcards.html": "Flashcards - Dico-Archi",
    "flashcards.html": "Flashcards - Dico-Archi",
    "/match.html": "Match - Dico-Archi",
    "match.html": "Match - Dico-Archi",
    "/daily.html": "Défi du jour - Dico-Archi",
    "daily.html": "Défi du jour - Dico-Archi",
    "/memory.html": "Mémoire - Dico-Archi",
    "memory.html": "Mémoire - Dico-Archi"
  };

  return canonicalTitles[normalizedPath] || String(fallbackTitle || "").trim() || normalizedPath;
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
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

  const token = getBearerToken(req);
  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "missing_bearer_token" }));
    return;
  }

  const authResult = await serverSupabase.client.auth.getUser(token);
  if (authResult.error || !authResult.data?.user?.id) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "invalid_token" }));
    return;
  }

  const profileResult = await serverSupabase.client
    .from("profiles")
    .select("role, active")
    .eq("id", authResult.data.user.id)
    .single();

  const role = profileResult.data?.role || "";
  if (
    profileResult.error
    || !profileResult.data
    || profileResult.data.active === false
    || !["super_admin", "formateur"].includes(role)
  ) {
    res.statusCode = 403;
    res.end(JSON.stringify({ error: "forbidden" }));
    return;
  }

  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const since30d = new Date(now.getTime() - METRICS_LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [pageViewsResult, scoresResult, submissionsResult] = await Promise.all([
    serverSupabase.client
      .from("page_views")
      .select("page_path, page_title, session_id, created_at")
      .gte("created_at", since30d)
      .order("created_at", { ascending: false })
      .limit(METRICS_MAX_PAGE_VIEWS),
    serverSupabase.client
      .from("game_scores")
      .select("game_key, score, total, elapsed_seconds, best_combo, best_streak, moves, known, review, mode_label, category_label, created_at, user_id")
      .gte("created_at", since30d)
      .order("created_at", { ascending: false })
      .limit(METRICS_MAX_GAME_SCORES),
    serverSupabase.client
      .from("term_submissions")
      .select("id, status", { count: "exact" })
      .in("status", ["submitted", "validated"])
  ]);

  if (pageViewsResult.error || scoresResult.error || submissionsResult.error) {
    res.statusCode = 502;
    res.end(JSON.stringify({
      error: pageViewsResult.error?.message
        || scoresResult.error?.message
        || submissionsResult.error?.message
        || "admin_metrics_query_failed"
    }));
    return;
  }

  const pageViews = Array.isArray(pageViewsResult.data) ? pageViewsResult.data : [];
  const scores = Array.isArray(scoresResult.data) ? scoresResult.data : [];
  const pageViews24h = pageViews.filter((item) => item.created_at >= since24h);
  const uniqueSessions24h = new Set(pageViews24h.map((item) => item.session_id).filter(Boolean)).size;

  const normalizedPageViews = pageViews.map((item) => ({
    ...item,
    page_path: normalizeTrackedPagePath(item.page_path)
  }));

  const pagesByPath = bucketBy(normalizedPageViews, (item) => item.page_path || "/");
  const topPages = Array.from(pagesByPath.entries())
    .map(([pagePath, items]) => ({
      pagePath,
      pageTitle: getCanonicalTrackedPageTitle(pagePath, items.find((entry) => entry.page_title)?.page_title),
      views: items.length,
      uniqueSessions: new Set(items.map((entry) => entry.session_id).filter(Boolean)).size
    }))
    .sort((a, b) => b.views - a.views || b.uniqueSessions - a.uniqueSessions)
    .slice(0, METRICS_MAX_TOP_ITEMS);

  const scoresByGame = bucketBy(scores, (item) => item.game_key || "unknown");
  const topGames = Array.from(scoresByGame.entries())
    .map(([gameKey, items]) => {
      const bestByScore = [...items].sort(
        (a, b) => (b.score || 0) - (a.score || 0)
          || (b.best_combo || 0) - (a.best_combo || 0)
          || (a.elapsed_seconds || 999999) - (b.elapsed_seconds || 999999)
      )[0] || null;

      return {
        gameKey,
        plays: items.length,
        bestScore: bestByScore?.score || 0,
        bestTotal: bestByScore?.total || 0,
        bestSeconds: bestByScore?.elapsed_seconds || 0,
        bestCombo: bestByScore?.best_combo || 0,
        bestStreak: bestByScore?.best_streak || 0
      };
    })
    .sort((a, b) => b.plays - a.plays || b.bestScore - a.bestScore)
    .slice(0, METRICS_MAX_TOP_ITEMS);

  const recentScores = scores
    .slice(0, METRICS_MAX_RECENT_SCORES)
    .map((item) => ({
      gameKey: item.game_key,
      score: item.score || 0,
      total: item.total || 0,
      seconds: item.elapsed_seconds || 0,
      bestCombo: item.best_combo || 0,
      bestStreak: item.best_streak || 0,
      modeLabel: item.mode_label || "",
      categoryLabel: item.category_label || "",
      createdAt: item.created_at
    }));

  res.statusCode = 200;
  res.end(JSON.stringify({
    generatedAt: now.toISOString(),
    windows: {
      summaryHours: 24,
      leaderboardDays: METRICS_LOOKBACK_DAYS,
      sampledPageViews: pageViews.length,
      sampledGameScores: scores.length
    },
    summary: {
      pageViews24h: pageViews24h.length,
      uniqueSessions24h,
      totalViews30d: pageViews.length,
      scoreSubmissions30d: scores.length,
      trackedGames30d: scoresByGame.size,
      pendingSubmissions: submissionsResult.count || 0
    },
    topPages,
    topGames,
    recentScores
  }));
};
