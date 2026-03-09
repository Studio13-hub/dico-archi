module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "method_not_allowed" }));
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
    res.end(JSON.stringify({ answer }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error?.message || "internal_error" }));
  }
};
