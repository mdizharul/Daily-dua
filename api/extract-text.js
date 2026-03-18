export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed", message: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "server_error", message: "Gemini API key is not configured on the server. Contact the app owner." });
  }

  const { text } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "bad_request", message: "Missing dua text." });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are an Islamic scholar and Arabic linguist. The user has provided the following text which is an Islamic dua or supplication:

"""
${text.trim()}
"""

Analyze this text carefully and return ONLY a JSON object with these exact fields:
- "title": short descriptive title in English (e.g. "Dua Before Sleeping")
- "category": classify the dua into ONE of these categories: "daily", "protection", "health", "rizq", "sleep", "travel", "meals", "morning", "evening", "general"
- "arabic": the Arabic text cleaned up with all diacritics (tashkeel) preserved. Use \\n to separate lines. If the input is already Arabic, use it as-is with corrections if needed.
- "transliteration": COMPLETE Roman Urdu transliteration of EVERY Arabic word. Same number of \\n breaks as arabic. Never skip or truncate any word. Use phonetics like aa, ee, oo, kh, gh.
- "translation": Roman Urdu meaning. Same number of \\n breaks as arabic.

STRICT RULES:
- Return ONLY valid JSON — no markdown, no backticks, no explanation
- transliteration must cover every single Arabic word — NEVER cut short
- Translation MUST be in Roman Urdu (not English, not Urdu script)
- category MUST be one of: daily, protection, health, rizq, sleep, travel, meals, morning, evening, general
- If the text is not Arabic or not a dua, return: {"error": "not_a_dua", "message": "This text does not appear to be an Islamic dua or Arabic supplication."}`;

  let geminiRes;
  try {
    geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
      }),
    });
  } catch (e) {
    return res.status(502).json({ error: "network_error", message: "Could not reach Gemini API. Try again." });
  }

  const data = await geminiRes.json();

  if (!geminiRes.ok) {
    return res.status(geminiRes.status).json({ error: "api_error", message: data?.error?.message || `Gemini error ${geminiRes.status}` });
  }

  const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  const clean = raw.replace(/\`\`\`json|\`\`\`/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);
  } catch {
    return res.status(500).json({ error: "parse_error", message: "AI returned unexpected response. Try again." });
  }
}
