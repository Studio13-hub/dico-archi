const { createServerSupabaseClient } = require("./_supabase");

function normalizeMediaUrl(supabaseUrl, rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return value;

  if (!supabaseUrl) return value;

  const baseUrl = supabaseUrl.replace(/\/$/, "");
  const publicPrefix = `${baseUrl}/storage/v1/object/public/term-images/`;

  if (value.startsWith("term-images/")) {
    return `${baseUrl}/storage/v1/object/public/${value}`;
  }

  try {
    const parsed = new URL(value);
    const marker = "/storage/v1/object/";
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex === -1) return value;

    const storagePath = parsed.pathname.slice(markerIndex + marker.length);
    if (!storagePath.startsWith("sign/term-images/") && !storagePath.startsWith("public/term-images/")) {
      return value;
    }

    const objectPath = storagePath
      .replace(/^sign\/term-images\//, "")
      .replace(/^public\/term-images\//, "");

    return `${publicPrefix}${objectPath}`;
  } catch (_error) {
    return value;
  }
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

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

  const supabase = supabaseConfig.client;

  try {
    const termsQuery = await supabase
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
      .order("term", { ascending: true });

    if (termsQuery.error) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: termsQuery.error.message || "terms_fetch_failed" }));
      return;
    }

    const terms = Array.isArray(termsQuery.data) ? termsQuery.data : [];
    const termIds = terms.map((item) => item.id).filter(Boolean);

    let mediaByTermId = new Map();
    if (termIds.length) {
      const mediaQuery = await supabase
        .from("media")
        .select("term_id, media_type, url, title, alt_text, position, created_at")
        .in("term_id", termIds)
        .in("media_type", ["image", "schema"])
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });

      if (mediaQuery.error) {
        res.statusCode = 502;
        res.end(JSON.stringify({ error: mediaQuery.error.message || "media_fetch_failed" }));
        return;
      }

      mediaByTermId = (mediaQuery.data || []).reduce((map, item) => {
        if (!map.has(item.term_id)) {
          map.set(item.term_id, {
            media_type: item.media_type,
            media_url: normalizeMediaUrl(supabaseConfig.supabaseUrl, item.url),
            media_title: item.title || "",
            media_alt_text: item.alt_text || ""
          });
        }
        return map;
      }, new Map());
    }

    const items = terms.map((item) => ({
      term: item.term,
      slug: item.slug,
      definition: item.definition,
      category: item.categories?.name || "",
      ...mediaByTermId.get(item.id)
    }));

    res.statusCode = 200;
    res.end(JSON.stringify({ items }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error?.message || "internal_error" }));
  }
};
