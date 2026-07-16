const SUPA_URL = "https://bvzgudqbirlqnotaqame.supabase.co";
const SUPA_KEY = "sb_publishable_6JQK_8MZHBiEBVnq0ei3cQ_qbiuc5RO";

exports.handler = async (event) => {
  const path = event.queryStringParameters?.path || "";
  const method = event.httpMethod;
  const body = event.body || null;
  const prefer = event.headers?.prefer || "";

  const url = `${SUPA_URL}/rest/v1/${path}`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "apikey": SUPA_KEY,
        "Authorization": "Bearer " + SUPA_KEY,
        "Content-Type": "application/json",
        "Prefer": prefer || (method === "POST" ? "resolution=merge-duplicates,return=minimal" : "return=representation")
      },
      body: method !== "GET" && method !== "DELETE" ? body : undefined
    });

    const text = await res.text();
    return {
      statusCode: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, Prefer",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS"
      },
      body: text || "{}"
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
