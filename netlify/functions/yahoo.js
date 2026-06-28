const https = require("https");

exports.handler = async function(event) {
  const ticker = event.queryStringParameters?.ticker || "AAPL";
  const range = event.queryStringParameters?.range || "max";
  const interval = event.queryStringParameters?.interval || "1d";

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=${interval}`;

  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json"
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        resolve({
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          body: data
        });
      });
    });
    req.on("error", (e) => {
      resolve({
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: e.message })
      });
    });
    req.end();
  });
};
