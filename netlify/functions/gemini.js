const GROQ_API_KEY = process.env.GROQ_API_KEY;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" }, body: "" };
  }
  try {
    const body = JSON.parse(event.body || "{}");
    const prompt = body.prompt || "";

    // Models active in 2025/2026 on Groq
    const models = [
      "meta-llama/llama-4-scout-17b-16e-instruct",
      "meta-llama/llama-4-maverick-17b-128e-instruct",
      "llama-3.3-70b-versatile",
      "llama-3.3-70b-specdec",
      "llama3-groq-70b-8192-tool-use-preview"
    ];
    
    let lastError = null;
    for (const model of models) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: "Sei un esperto analista finanziario. Rispondi in italiano, conciso (max 280 parole). Usa emoji. Non sei consulente ufficiale." },
              { role: "user", content: prompt }
            ],
            max_tokens: 1000, temperature: 0.7
          })
        });
        const data = await res.json();
        console.log(`${model}: ${res.status} ${data?.error?.message||"OK"}`);
        if (res.ok) {
          const text = data?.choices?.[0]?.message?.content || "Nessuna risposta.";
          return { statusCode: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ text }) };
        }
        lastError = data?.error?.message || res.status;
      } catch(e) { lastError = e.message; }
    }
    return { statusCode: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ text: `Errore: ${lastError}` }) };
  } catch (err) {
    return { statusCode: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ text: `Errore: ${err.message}` }) };
  }
};
