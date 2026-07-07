const https = require("https");

const BOT_TOKEN = "8789392072:AAGvs_OVUD5M5wxzFqoN-isNCmkql2S1c1E";
const CHAT_IDS = {
  fabrizio: "1142041415",
  jonathan: "2072895073"
};

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  try {
    const { user, message } = JSON.parse(event.body);
    const chatId = CHAT_IDS[user];
    if (!chatId) return { statusCode: 400, body: "User not found" };
    const payload = JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" });
    return new Promise((resolve) => {
      const req = https.request({
        hostname: "api.telegram.org",
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
      }, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve({ statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: data }));
      });
      req.on("error", e => resolve({ statusCode: 500, body: JSON.stringify({ error: e.message }) }));
      req.write(payload);
      req.end();
    });
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
