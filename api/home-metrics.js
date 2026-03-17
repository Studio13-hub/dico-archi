const { createServerSupabaseClient } = require("./_supabase");

function getTimeZoneParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
}

function getTimeZoneOffsetMs(date, timeZone) {
  const parts = getTimeZoneParts(date, timeZone);
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return asUtc - date.getTime();
}

function getStartOfTodayIso(timeZone) {
  const now = new Date();
  const nowParts = getTimeZoneParts(now, timeZone);
  const utcGuess = new Date(Date.UTC(
    Number(nowParts.year),
    Number(nowParts.month) - 1,
    Number(nowParts.day),
    0,
    0,
    0
  ));
  const offset = getTimeZoneOffsetMs(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offset).toISOString();
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

  const sinceToday = getStartOfTodayIso("Europe/Zurich");

  const [
    publishedTermsResult,
    categoriesResult,
    pageViewsTodayResult,
    uniqueVisitorsTodayResult,
    uniqueVisitorsTotalResult
  ] = await Promise.all([
    serverSupabase.client
      .from("terms")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    serverSupabase.client
      .from("categories")
      .select("id", { count: "exact", head: true }),
    serverSupabase.client
      .from("page_views")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sinceToday),
    serverSupabase.client
      .from("site_visitors")
      .select("visitor_id", { count: "exact", head: true })
      .gte("last_seen_at", sinceToday),
    serverSupabase.client
      .from("site_visitors")
      .select("visitor_id", { count: "exact", head: true })
  ]);

  const missingVisitorsTable = [uniqueVisitorsTodayResult, uniqueVisitorsTotalResult]
    .some((result) => result.error && String(result.error.message || "").includes("site_visitors"));

  if (
    publishedTermsResult.error
    || categoriesResult.error
    || pageViewsTodayResult.error
    || (!missingVisitorsTable && (uniqueVisitorsTodayResult.error || uniqueVisitorsTotalResult.error))
  ) {
    res.statusCode = 502;
    res.end(JSON.stringify({
      error: publishedTermsResult.error?.message
        || categoriesResult.error?.message
        || pageViewsTodayResult.error?.message
        || uniqueVisitorsTodayResult.error?.message
        || uniqueVisitorsTotalResult.error?.message
        || "home_metrics_query_failed"
    }));
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify({
    summary: {
      publishedTerms: publishedTermsResult.count || 0,
      categories: categoriesResult.count || 0,
      pageViewsToday: pageViewsTodayResult.count || 0,
      uniqueVisitorsToday: missingVisitorsTable ? null : (uniqueVisitorsTodayResult.count || 0),
      uniqueVisitorsTotal: missingVisitorsTable ? null : (uniqueVisitorsTotalResult.count || 0)
    }
  }));
};
