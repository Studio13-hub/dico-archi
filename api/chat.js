const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 12;
const rateBuckets = new Map();
const { GoogleGenAI } = require("@google/genai");
const { loadCanonicalContent } = require("../scripts/content/content_loader");

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

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeForTermMatch(value) {
  return normalize(value)
    .replace(/[^a-z0-9\s-]+/g, " ")
    .replace(/([a-z])\1{2,}/g, "$1")
    .replace(/\b([a-z0-9-]{4,})s\b/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function buildServerTermIndex() {
  try {
    const dataset = loadCanonicalContent();
    const richTerms = Array.isArray(dataset?.richTerms) ? dataset.richTerms : [];
    const coreTerms = Array.isArray(dataset?.terms) ? dataset.terms : [];

    const source = richTerms.length
      ? richTerms
      : coreTerms.map((term) => ({
        term: term.term,
        slug: term.slug,
        status: term.status,
        content: {
          definition: term.definition || "",
          example: term.example || ""
        }
      }));

    return source
      .filter((term) => !term.status || term.status === "published")
      .map((term) => ({
        term: String(term.term || "").trim(),
        slug: String(term.slug || "").trim(),
        key: normalize(term.term || ""),
        matchKey: normalizeForTermMatch(term.term || ""),
        definition: String(term.content?.definition || "").trim(),
        explanation: String(term.content?.explanation || "").trim(),
        example: String(term.content?.example || "").trim(),
        applications: Array.isArray(term.content?.applications) ? term.content.applications.filter(Boolean) : []
      }))
      .filter((term) => term.term && term.slug && (term.definition || term.explanation))
      .sort((a, b) => b.matchKey.length - a.matchKey.length || b.key.length - a.key.length);
  } catch (_error) {
    return [];
  }
}

const SERVER_TERM_INDEX = buildServerTermIndex();
const TERM_STOPWORDS = new Set(["de", "d", "du", "des", "la", "le", "les", "l", "un", "une", "et", "ou"]);
const ASSIST_LANGUAGE_LABELS = {
  en: "Anglais",
  de: "Allemand",
  it: "Italien",
  es: "Espagnol",
  pt: "Portugais",
  sq: "Albanais",
  ar: "Arabe"
};

function makeTermUrl(slug) {
  return `term.html?slug=${encodeURIComponent(String(slug || "").trim())}`;
}

function getSignificantTokens(value) {
  return normalizeForTermMatch(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 4 && !TERM_STOPWORDS.has(token));
}

function findAmbiguousTermCandidates(text) {
  const qMatch = normalizeForTermMatch(text);
  const tokens = getSignificantTokens(text);
  if (!qMatch || !tokens.length) return [];

  const scored = SERVER_TERM_INDEX
    .map((entry) => {
      const entryTokens = getSignificantTokens(entry.term);
      const overlap = tokens.filter((token) => entryTokens.includes(token)).length;
      const containsQuery = entry.matchKey.includes(qMatch);
      const queryContainsEntry = qMatch.includes(entry.matchKey);
      const exact = qMatch === entry.matchKey;
      const score = (exact ? 100 : 0) + (containsQuery ? 20 : 0) + (queryContainsEntry ? 10 : 0) + (overlap * 5);
      return { entry, overlap, containsQuery, queryContainsEntry, exact, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.term.localeCompare(b.entry.term, "fr"));

  if (tokens.length === 1) {
    return scored
      .filter((item) => item.overlap > 0)
      .slice(0, 3)
      .map((item) => item.entry);
  }

  const top = scored[0];
  const second = scored[1];
  if (!top || !second) return [];
  if (top.exact) return [];
  if (top.overlap === second.overlap && top.overlap > 0) {
    return scored.slice(0, 3).map((item) => item.entry);
  }

  return [];
}

function buildAmbiguousTermAnswer(entries) {
  const items = Array.isArray(entries) ? entries.filter(Boolean).slice(0, 3) : [];
  if (items.length < 2) return null;

  const lines = ["Je vois plusieurs termes proches. Tu veux parler de :"];
  for (const entry of items) {
    lines.push(`- ${entry.term} : ${makeTermUrl(entry.slug)}`);
  }
  lines.push("Dis-moi lequel tu vises et je te l’explique plus clairement.");
  return lines.join("\n");
}

function findServerTermInText(text) {
  const q = normalize(text);
  const qMatch = normalizeForTermMatch(text);
  if (!qMatch) return null;

  for (const entry of SERVER_TERM_INDEX) {
    if (
      q === entry.key
      || q.includes(entry.key)
      || qMatch === entry.matchKey
      || qMatch.includes(entry.matchKey)
    ) {
      return entry;
    }
  }

  return null;
}

function buildTermAnswer(entry) {
  if (!entry) return null;

  const lines = [];
  const definition = String(entry.definition || "").trim();
  const startsWithArticle = /^(un|une|des|le|la|les|l['’])\b/i.test(definition);
  const naturalDefinition = startsWithArticle
    ? `${definition.charAt(0).toLowerCase()}${definition.slice(1)}`
    : `un ${definition.charAt(0).toLowerCase()}${definition.slice(1)}`;

  lines.push(`${entry.term}, c’est ${naturalDefinition}`);

  if (entry.explanation) {
    lines.push(entry.explanation);
  }

  if (entry.example) {
    lines.push(`Par exemple: ${entry.example}`);
  }

  if (entry.applications.length) {
    lines.push(`On le rencontre souvent dans: ${entry.applications.slice(0, 3).join(", ")}.`);
  }

  lines.push(`Voir la fiche: ${makeTermUrl(entry.slug)}`);
  return lines.join("\n");
}

function buildDeterministicAnswer(question) {
  const q = normalize(question);
  if (!q) return null;

  const ambiguousCandidates = findAmbiguousTermCandidates(question);
  const ambiguousAnswer = buildAmbiguousTermAnswer(ambiguousCandidates);
  if (ambiguousAnswer) {
    return ambiguousAnswer;
  }

  const matchedTerm = findServerTermInText(question);
  if (matchedTerm) {
    return buildTermAnswer(matchedTerm);
  }

  const ambiguousReplies = new Set([
    "oui",
    "non",
    "ok",
    "daccord",
    "d accord",
    "merci",
    "salut",
    "bonjour",
    "hey"
  ]);

  if (ambiguousReplies.has(q)) {
    return "Je peux t’aider sur un terme d’architecture ou sur l’usage du site. Pose une question plus précise, par exemple sur une facade, le quiz, la connexion ou les contributions.";
  }

  if (q.includes("quiz")) {
    return "Le quiz est disponible depuis quiz.html ou via la page Jeux sur games.html.";
  }

  if (q.includes("flashcard") || q.includes("flash card")) {
    return "Les flashcards sont disponibles sur flashcards.html depuis la page Jeux.";
  }

  if (q.includes("match") || q.includes("memory") || q.includes("memoire") || q.includes("defi du jour") || q.includes("jeu")) {
    return "Les jeux sont regroupés sur games.html. Tu y trouveras aussi quiz.html, flashcards.html, match.html, daily.html et memory.html.";
  }

  if (q.includes("connexion") || q.includes("compte") || q.includes("login")) {
    return "Pour te connecter, ouvre auth.html. Ensuite compte.html te montre ton rôle, ton état et les accès utiles.";
  }

  if (q.includes("contrib") || q.includes("proposition")) {
    return "Pour proposer un terme, ouvre contribuer.html puis remplis le formulaire de contribution.";
  }

  if (q.includes("admin")) {
    return "L’espace admin est disponible sur admin.html pour les rôles Relecture et Administration.";
  }

  if (q.includes("categorie") || q.includes("catégorie")) {
    return "Les catégories sont consultables sur category.html et depuis le dictionnaire principal.";
  }

  const offTopicHints = ["bitcoin", "bourse", "musique", "recette", "voyage", "politique", "football", "foot"];
  if (offTopicHints.some((hint) => q.includes(hint))) {
    return "Je traite surtout le vocabulaire d’architecture et l’usage du site Dico-Archi. Pose-moi une question sur un terme, les catégories, les jeux, la connexion ou les contributions.";
  }

  return null;
}

function asText(value, maxLength = 1200) {
  return String(value || "").trim().slice(0, maxLength);
}

async function buildTermAssistTranslation({ apiKey, model, language, term, definition, example }) {
  const languageLabel = ASSIST_LANGUAGE_LABELS[language];
  if (!languageLabel) {
    const error = new Error("unsupported_language");
    error.statusCode = 400;
    throw error;
  }

  if (!term || !definition) {
    const error = new Error("missing_term_payload");
    error.statusCode = 400;
    throw error;
  }

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

  const ai = new GoogleGenAI({ apiKey });
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
    const error = new Error("empty_model_response");
    error.statusCode = 502;
    throw error;
  }

  let parsed = {};
  try {
    parsed = JSON.parse(rawText);
  } catch (_error) {
    const error = new Error("invalid_model_json");
    error.statusCode = 502;
    throw error;
  }

  return {
    language,
    languageLabel,
    translatedTerm: asText(parsed.translatedTerm, 240),
    translatedDefinition: asText(parsed.translatedDefinition, 1600),
    translatedExample: asText(parsed.translatedExample, 1200),
    pronunciationGuide: asText(parsed.pronunciationGuide, 240)
  };
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
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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

  const mode = String(body?.mode || "").trim();
  if (mode === "term_assist") {
    try {
      const translation = await buildTermAssistTranslation({
        apiKey,
        model,
        language: asText(body?.language, 8).toLowerCase(),
        term: asText(body?.term, 160),
        definition: asText(body?.definition, 1400),
        example: asText(body?.example, 1000)
      });

      res.statusCode = 200;
      res.end(JSON.stringify({ translation, model }));
      return;
    } catch (error) {
      const message = String(error?.message || "internal_error");
      res.statusCode = Number(error?.statusCode) || 500;
      res.end(JSON.stringify({ error: message }));
      return;
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
    "Tu es l'assistant du site Dico-Archi.",
    "Tu reponds en francais simple, clair et utile, avec des phrases courtes.",
    "Priorite absolue: vocabulaire architecture et usage du site (categories, quiz, contribution, connexion, admin).",
    "Si la question est hors sujet, explique poliment que tu ne traites que l'architecture et le site Dico-Archi.",
    "Quand c'est pertinent, ajoute une piste concrete vers la fiche du terme.",
    "N'invente pas de regles admin ou juridiques non presentes.",
    "Si une information manque, dis-le et propose l'etape suivante.",
    context ? `Contexte page: ${context}` : ""
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const latestUserMessage = messages.filter((entry) => entry.role === "user").slice(-1)[0]?.content || "";
    const deterministicAnswer = buildDeterministicAnswer(latestUserMessage);
    if (deterministicAnswer) {
      res.statusCode = 200;
      res.end(JSON.stringify({ answer: deterministicAnswer, model: "deterministic-site-router" }));
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      config: {
        systemInstruction: systemMessage,
        temperature: 0.3,
        maxOutputTokens: 380
      },
      contents: messages.map((entry) => ({
          role: entry.role,
          parts: [{ text: entry.content }]
        }))
    });

    const answer = String(response?.text || "").trim();
    if (!answer) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: "empty_model_response" }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ answer, model }));
  } catch (error) {
    const message = String(error?.message || "internal_error");
    res.statusCode = message.includes("API key") || message.includes("api key") ? 503 : 500;
    res.end(JSON.stringify({ error: message }));
  }
};
