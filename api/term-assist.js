const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 10;
const rateBuckets = new Map();
const { GoogleGenAI } = require("@google/genai");

const LANGUAGE_LABELS = {
  en: "Anglais",
  de: "Allemand",
  it: "Italien",
  es: "Espagnol",
  pt: "Portugais",
  sq: "Albanais",
  ar: "Arabe"
};

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

function parseBody(req) {
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_error) {
      body = {};
    }
  }
  return body && typeof body === "object" ? body : {};
}

function asText(value, maxLength = 1200) {
  return String(value || "").trim().slice(0, maxLength);
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
  const rateState = isRateLimited(`term-assist:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (rateState.limited) {
    res.setHeader("Retry-After", String(rateState.retryAfter));
    res.statusCode = 429;
    res.end(JSON.stringify({ error: "rate_limited" }));
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  if (!apiKey) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: "missing_gemini_api_key" }));
    return;
  }

  const body = parseBody(req);
  const language = asText(body.language, 8).toLowerCase();
  const languageLabel = LANGUAGE_LABELS[language];
  const term = asText(body.term, 160);
  const definition = asText(body.definition, 1400);
  const example = asText(body.example, 1000);

  if (!languageLabel) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "unsupported_language" }));
    return;
  }

  if (!term || !definition) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "missing_term_payload" }));
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = [
    `Traduis ce contenu du français vers ${languageLabel}.`,
    "Le public est allophone dans un bureau d'architecture.",
    "Garde un vocabulaire simple, précis et professionnel.",
    "Ne rajoute aucune information nouvelle.",
    "Reponds uniquement avec un JSON valide.",
    'Format exact: {"translatedTerm":"...","translatedDefinition":"...","translatedExample":"...","pronunciationGuide":"..."}',
    "Le champ pronunciationGuide doit rester en alphabet latin simple, pensé pour aider un débutant à prononcer le terme français original.",
    `Terme français: ${JSON.stringify(term)}`,
    `Définition française: ${JSON.stringify(definition)}`,
    `Exemple français: ${JSON.stringify(example)}`
  ].join("\n");

  try {
    const response = await ai.models.generateContent({
      model,
      config: {
        temperature: 0.2,
        maxOutputTokens: 350,
        responseMimeType: "application/json"
      },
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }]
    });

    const rawText = String(response?.text || "").trim();
    if (!rawText) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: "empty_model_response" }));
      return;
    }

    let parsed = {};
    try {
      parsed = JSON.parse(rawText);
    } catch (_error) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: "invalid_model_json" }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({
      translation: {
        language,
        languageLabel,
        translatedTerm: asText(parsed.translatedTerm, 240),
        translatedDefinition: asText(parsed.translatedDefinition, 1600),
        translatedExample: asText(parsed.translatedExample, 1200),
        pronunciationGuide: asText(parsed.pronunciationGuide, 240)
      },
      model
    }));
  } catch (error) {
    const message = String(error?.message || "internal_error");
    res.statusCode = message.includes("API key") || message.includes("api key") ? 503 : 500;
    res.end(JSON.stringify({ error: message }));
  }
};
