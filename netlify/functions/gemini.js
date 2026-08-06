const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const prompt = body.prompt || "";
    
    if (!GEMINI_API_KEY) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ text: "API key non configurata", error: "GEMINI_API_KEY missing" })
      };
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
        })
      }
    );

    const data = await res.json();
    
    // Log full response for debugging
    console.log("Gemini status:", res.status);
    console.log("Gemini response:", JSON.stringify(data).slice(0, 500));
    
    if (!res.ok) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ text: `Errore Gemini: ${data?.error?.message || res.status}` })
      };
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text 
      || data?.candidates?.[0]?.content?.text
      || "Risposta non disponibile.";
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ text })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ text: `Errore: ${err.message}`, error: err.message })
    };
  }
};
