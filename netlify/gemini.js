const GROQ_API_KEY = process.env.GROQ_API_KEY;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" }, body: "" };
  }
  try {
    const body = JSON.parse(event.body || "{}");
    const prompt = body.prompt || "";

    // Try models in order of preference
    const models = ["llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768", "gemma2-9b-it"];
    
    let lastError = null;
    for (const model of models) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "Sei un esperto analista finanziario. Rispondi sempre in italiano, in modo conciso e diretto (max 280 parole). Usa emoji per chiarezza. Non sei un consulente finanziario ufficiale." },
            { role: "user", content: prompt }
          ],
          max_tokens: 1000, temperature: 0.7
        })
      });
      const data = await res.json();
      console.log(`Model ${model} status:`, res.status);
      if (res.ok) {
        const text = data?.choices?.[0]?.message?.content || "Nessuna risposta.";
        return { statusCode: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ text, model }) };
      }
      lastError = data?.error?.message || res.status;
    }
    return { statusCode: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ text: `Errore: ${lastError}` }) };
  } catch (err) {
    return { statusCode: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ text: `Errore: ${err.message}` }) };
  }
};
