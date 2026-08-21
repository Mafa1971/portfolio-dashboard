const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" }, body: "" };
  }
  try {
    const body = JSON.parse(event.body || "{}");
    const prompt = body.prompt || "";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: "Sei un esperto analista finanziario. Rispondi sempre in italiano, in modo conciso e diretto (max 280 parole). Usa emoji per chiarezza. Non sei un consulente finanziario ufficiale.",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await res.json();
    console.log("Claude status:", res.status);

    if (!res.ok) {
      return { statusCode: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ text: `Errore: ${data?.error?.message || res.status}` }) };
    }

    const text = data?.content?.[0]?.text || "Nessuna risposta.";
    return { statusCode: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ text }) };
  } catch (err) {
    return { statusCode: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ text: `Errore: ${err.message}` }) };
  }
};
