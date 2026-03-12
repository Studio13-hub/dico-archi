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

  const slug = String(req.query?.slug || "").trim().toLowerCase();
  if (!slug) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "missing_slug" }));
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  try {
    const termQuery = await supabase
      .from("terms")
      .select(`
        id,
        term,
        slug,
        definition,
        example,
        status,
        reviewer_comment,
        created_at,
        updated_at,
        published_at,
        categories:category_id (
          id,
          name,
          slug
        )
      `)
      .eq("slug", slug)
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

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        term,
        related_terms: relatedTerms,
        media: mediaQuery.data || []
      })
    );
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error?.message || "internal_error" }));
  }
};
