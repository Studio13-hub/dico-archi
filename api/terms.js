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

  const slug = String(req.query?.slug || "").trim().toLowerCase();
  if (!slug) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "missing_slug" }));
    return;
  }

  const supabase = supabaseConfig.client;

  try {
    const termQuery = await supabase
      .from("terms")
      .select(`
        id,
        term,
        slug,
        status,
        definition,
        example,
        updated_at,
        published_at,
        categories:category_id (
          id,
          name,
          slug
        )
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (termQuery.error) {
      res.statusCode = termQuery.error.code === "PGRST116" ? 404 : 502;
      res.end(JSON.stringify({ error: termQuery.error.message || "term_fetch_failed" }));
      return;
    }

    const term = termQuery.data;
    const termId = term?.id;

    const [relationsQuery, mediaQuery] = await Promise.all([
      supabase
        .from("term_relations")
        .select("source_term_id, target_term_id, relation_type")
        .or(`source_term_id.eq.${termId},target_term_id.eq.${termId}`),
      supabase
        .from("media")
        .select("id, media_type, url, title, alt_text, position, created_at")
        .eq("term_id", termId)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true })
    ]);

    if (relationsQuery.error) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: relationsQuery.error.message || "term_relations_fetch_failed" }));
      return;
    }

    if (mediaQuery.error) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: mediaQuery.error.message || "term_media_fetch_failed" }));
      return;
    }

    const relations = Array.isArray(relationsQuery.data) ? relationsQuery.data : [];
    const relatedIds = Array.from(
      new Set(
        relations
          .map((item) => (item.source_term_id === termId ? item.target_term_id : item.source_term_id))
          .filter(Boolean)
      )
    );

    let relatedTerms = [];
    if (relatedIds.length) {
      const relatedTermsQuery = await supabase
        .from("terms")
        .select("id, term, slug, definition, status")
        .in("id", relatedIds)
        .eq("status", "published")
        .order("term", { ascending: true });

      if (relatedTermsQuery.error) {
        res.statusCode = 502;
        res.end(JSON.stringify({ error: relatedTermsQuery.error.message || "related_terms_fetch_failed" }));
        return;
      }

      const termById = new Map((relatedTermsQuery.data || []).map((item) => [item.id, item]));
      relatedTerms = relations
        .map((relation) => {
          const relatedId = relation.source_term_id === termId ? relation.target_term_id : relation.source_term_id;
          const relatedTerm = termById.get(relatedId);
          if (!relatedTerm) return null;
          return {
            relation_type: relation.relation_type,
            ...relatedTerm
          };
        })
        .filter(Boolean);
    }

    const media = (mediaQuery.data || []).map((item) => ({
      ...item,
      url: normalizeMediaUrl(supabaseConfig.supabaseUrl, item.url)
    }));

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        term,
        related_terms: relatedTerms,
        media
      })
    );
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error?.message || "internal_error" }));
  }
};
