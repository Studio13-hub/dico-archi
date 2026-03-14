const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 20;
const rateBuckets = new Map();

function getClientIp(req) {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "").trim();
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return String(req.headers["x-real-ip"] || "unknown").trim();
}

function isRateLimited(key, limit, windowMs) {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      limited: true,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    };
  }

  return { limited: false, retryAfter: 0 };
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  const ip = getClientIp(req);
  const rateState = isRateLimited(`chat-feedback:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (rateState.limited) {
    res.setHeader("Retry-After", String(rateState.retryAfter));
    res.statusCode = 429;
    res.end(JSON.stringify({ error: "rate_limited" }));
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
    if (body.length > 15000) {
      res.statusCode = 413;
      res.end(JSON.stringify({ error: "payload_too_large" }));
      return;
    }
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

  if (assistantMessage.length < 3) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "assistant_message_too_short" }));
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
    if (sessionId) {
      const duplicateParams = new URLSearchParams();
      duplicateParams.set("select", "id,created_at");
      duplicateParams.set("session_id", `eq.${sessionId}`);
      duplicateParams.set("rating", `eq.${rating}`);
      duplicateParams.set("assistant_message", `eq.${assistantMessage}`);
      duplicateParams.set("order", "created_at.desc");
      duplicateParams.set("limit", "1");

      const duplicateResponse = await fetch(`${supabaseUrl}/rest/v1/chatbot_feedback?${duplicateParams.toString()}`, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`
        }
      });

      if (duplicateResponse.ok) {
        const duplicateRows = await duplicateResponse.json().catch(() => []);
        if (Array.isArray(duplicateRows) && duplicateRows.length) {
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, deduped: true }));
          return;
        }
      }

    }

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
