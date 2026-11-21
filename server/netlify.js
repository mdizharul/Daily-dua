// Wraps a shared Gemini handler (server/gemini.js) as a Netlify function.
const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export function netlifyHandler(extract) {
  return async (event) => {
    if (event.httpMethod !== "POST") {
      return json(405, { error: "method_not_allowed", message: "Method Not Allowed" });
    }
    let payload;
    try {
      payload = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { error: "bad_request", message: "Invalid request body." });
    }
    const { status, body } = await extract(payload, process.env.GEMINI_API_KEY);
    return json(status, body);
  };
}
