module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: "missing_openai_api_key" }));
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
      role: entry.role,
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
    "Tu reponds en francais simple, clair et utile.",
    "Priorite: vocabulaire architecture, usage du site, categories, quiz, contribution.",
    "N'invente pas de regles admin ou juridiques non presentes.",
    "Si une information manque, dis-le et propose l'etape suivante.",
    context ? `Contexte page: ${context}` : ""
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 380,
        messages: [{ role: "system", content: systemMessage }, ...messages]
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      const message = payload?.error?.message || "openai_request_failed";
      res.statusCode = 502;
      res.end(JSON.stringify({ error: message }));
      return;
    }

    const answer = payload?.choices?.[0]?.message?.content;
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
