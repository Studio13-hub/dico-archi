const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 12;
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
  const rateState = isRateLimited(`chat:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (rateState.limited) {
    res.setHeader("Retry-After", String(rateState.retryAfter));
    res.statusCode = 429;
    res.end(JSON.stringify({ error: "rate_limited" }));
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  if (!apiKey) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: "missing_gemini_api_key" }));
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    if (body.length > 30000) {
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

  const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
  const context = String(body?.context || "").slice(0, 400);

  const messages = rawMessages
    .filter((entry) => entry && (entry.role === "user" || entry.role === "assistant"))
    .map((entry) => ({
      role: entry.role === "assistant" ? "model" : "user",
      content: String(entry.content || "").slice(0, 2000)
    }))
    .slice(-10);

  if (!messages.length) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "missing_messages" }));
    return;
  }

  const totalChars = messages.reduce((sum, entry) => sum + entry.content.length, 0);
  if (totalChars > 12000) {
    res.statusCode = 413;
    res.end(JSON.stringify({ error: "messages_too_large" }));
    return;
  }

  const systemMessage = [
    "Tu es l'assistant du site DicoArchi.",
    "Tu reponds en francais simple, clair et utile, avec des phrases courtes.",
    "Priorite absolue: vocabulaire architecture et usage du site (categories, quiz, contribution, connexion, admin).",
    "Si la question est hors sujet, explique poliment que tu ne traites que l'architecture et le site DicoArchi.",
    "Quand c'est pertinent, ajoute une piste concrete vers la fiche du terme.",
    "N'invente pas de regles admin ou juridiques non presentes.",
    "Si une information manque, dis-le et propose l'etape suivante.",
    context ? `Contexte page: ${context}` : ""
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemMessage }]
        },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 380
        },
        contents: messages.map((entry) => ({
          role: entry.role,
          parts: [{ text: entry.content }]
        }))
      })
    }
    );

    const payload = await response.json();

    if (!response.ok) {
      const message = payload?.error?.message || "gemini_request_failed";
      res.statusCode = 502;
      res.end(JSON.stringify({ error: message }));
      return;
    }

    const answer = (payload?.candidates?.[0]?.content?.parts || [])
      .map((part) => String(part?.text || ""))
      .join("\n")
      .trim();
    if (!answer) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: "empty_model_response" }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ answer, model }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error?.message || "internal_error" }));
  }
};
