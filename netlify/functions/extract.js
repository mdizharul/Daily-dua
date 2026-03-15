exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "server_error", message: "Gemini API key is not configured on the server. Contact the app owner." }),
    };
  }

  let base64, mediaType;
  try {
    ({ base64, mediaType } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are an Islamic scholar and Arabic linguist. Analyze this image carefully.

STEP 1 — VALIDATION: Does this image contain an Islamic dua, Quranic verse, or supplication text in Arabic?
- If NO (e.g. it is a selfie, landscape, food photo, meme, screenshot of a chat, or any image without Arabic dua text): return ONLY this JSON: {"error": "not_a_dua", "message": "This image does not contain a dua or Arabic supplication. Please upload a screenshot of an Islamic dua."}
- If YES: proceed to Step 2.

STEP 2 — EXTRACTION: Return ONLY a JSON object with these exact fields:
- "title": short descriptive title in English (e.g. "Dua Before Sleeping")
- "arabic": full Arabic text exactly as shown, with all diacritics (tashkeel) preserved. Use \\n to separate lines.
- "transliteration": COMPLETE Roman Urdu transliteration of EVERY Arabic word. Same number of \\n breaks as arabic. Never skip or truncate any word. Use phonetics like aa, ee, oo, kh, gh.
- "translation": Roman Urdu meaning. Same number of \\n breaks as arabic.

STRICT RULES:
- Return ONLY valid JSON — no markdown, no backticks, no explanation
- transliteration must cover every single Arabic word — NEVER cut short
- Translation MUST be in Roman Urdu (not English, not Urdu script)
- If screenshot already has transliteration/translation, verify and correct it`;

  let geminiRes;
  try {
    geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mediaType || "image/jpeg", data: base64 } },
            { text: prompt },
          ],
        }],
      }),
    });
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "network_error", message: "Could not reach Gemini API. Try again." }),
    };
  }

  const data = await geminiRes.json();

  if (!geminiRes.ok) {
    return {
      statusCode: geminiRes.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "api_error", message: data?.error?.message || `Gemini error ${geminiRes.status}` }),
    };
  }

  const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  const clean = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    };
  } catch {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "parse_error", message: "AI returned unexpected response. Try again." }),
    };
  }
};
