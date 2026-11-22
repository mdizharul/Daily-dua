// Shared Gemini logic used by every backend:
//   - api/*.js              → Vercel serverless functions
//   - netlify/functions/*.js → Netlify functions
//   - vite.config.js         → local `npm run dev` (dev-only middleware)
// Each handler takes the parsed JSON request body plus the API key and returns
// { status, body } so each platform only has to translate it into its own response.

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const CATEGORY_IDS = "daily, protection, health, rizq, sleep, travel, meals, morning, evening, general";
const MOOD_IDS = "anxious, sad, grateful, forgive, unwell, need, sleep, travel, morning, evening";

const OUTPUT_FIELDS = `- "title": short descriptive title in English (e.g. "Dua Before Sleeping")
- "category": classify the dua into ONE of these categories: ${CATEGORY_IDS}
- "moods": array of 1 to 3 situations or feelings this dua is for, chosen ONLY from: ${MOOD_IDS} (e.g. ["anxious"] for a dua against worry, ["forgive"] for istighfar)
- "arabic": the dua in Arabic with COMPLETE, correct tashkeel on every letter — fatha, kasra, damma, sukoon, shadda, tanween, maddah (آ / ~), dagger alif (ٰ) and hamza. Keep the same words and word order as the source. If the source text has missing or partial diacritics, ADD the correct full tashkeel — never return bare, undiacritized Arabic. For Quran verses and well-known duas, use the standard authentic wording with full diacritics. Use \\n to separate lines.
- "transliteration": COMPLETE Roman Urdu transliteration of EVERY Arabic word. Same number of \\n breaks as arabic. Never skip or truncate any word. Use phonetics like aa, ee, oo, kh, gh.
- "translation": Roman Urdu meaning. Same number of \\n breaks as arabic.`;

const STRICT_RULES = `STRICT RULES:
- Return ONLY valid JSON — no markdown, no backticks, no explanation
- Include ONLY the dua itself. Leave out everything around it: headings, captions, labels, watermarks, page or channel names, hashtags, and add-on phrases such as "صدقة جارية" / "Sadqa Jariya", "share", "Ameen", "Subhan Allah" stickers or "copy" notes
- Every Arabic letter must carry its vowel mark (tashkeel); a letter with shadda carries both shadda and its vowel
- transliteration must cover every single Arabic word — NEVER cut short
- Translation MUST be in Roman Urdu (not English, not Urdu script)
- category MUST be one of: ${CATEGORY_IDS}`;

const IMAGE_PROMPT = `You are an Islamic scholar and Arabic linguist. Analyze this image carefully.

STEP 1 — VALIDATION: Does this image contain an Islamic dua, Quranic verse, or supplication text in Arabic?
- If NO (e.g. it is a selfie, landscape, food photo, meme, screenshot of a chat, or any image without Arabic dua text): return ONLY this JSON: {"error": "not_a_dua", "message": "This image does not contain a dua or Arabic supplication. Please upload a screenshot of an Islamic dua."}
- If YES: proceed to Step 2.

STEP 2 — EXTRACTION: Read the dua's Arabic words exactly as shown in the image (same words, same order), then return ONLY a JSON object with these exact fields:
${OUTPUT_FIELDS}

${STRICT_RULES}
- If screenshot already has transliteration/translation, verify and correct it`;

const textPrompt = (text) => `You are an Islamic scholar and Arabic linguist. The user has provided the following text which is an Islamic dua or supplication:

"""
${text}
"""

Analyze this text carefully and return ONLY a JSON object with these exact fields (if the input is already Arabic, keep its words, fix mistakes, and add full tashkeel where it is missing):
${OUTPUT_FIELDS}

${STRICT_RULES}
- If the text is not Arabic or not a dua, return: {"error": "not_a_dua", "message": "This text does not appear to be an Islamic dua or Arabic supplication."}`;

const fail = (status, error, message) => ({ status, body: { error, message } });

async function callGemini(apiKey, parts) {
  if (!apiKey) {
    return fail(500, "server_error", "Gemini API key is not configured on the server. Contact the app owner.");
  }

  let res;
  try {
    res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    });
  } catch {
    return fail(502, "network_error", "Could not reach Gemini API. Try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return fail(res.status, "api_error", data?.error?.message || `Gemini error ${res.status}`);
  }

  const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  const clean = raw.replace(/```json|```/g, "").trim();
  try {
    return { status: 200, body: JSON.parse(clean) };
  } catch {
    return fail(500, "parse_error", "AI returned unexpected response. Try again.");
  }
}

/** POST /api/extract — body: { base64, mediaType } */
export async function extractFromImage(body, apiKey) {
  const { base64, mediaType } = body || {};
  if (!base64) return fail(400, "bad_request", "Missing base64 image data.");
  return callGemini(apiKey, [
    { inline_data: { mime_type: mediaType || "image/jpeg", data: base64 } },
    { text: IMAGE_PROMPT },
  ]);
}

/** POST /api/extract-text — body: { text } */
export async function extractFromText(body, apiKey) {
  const text = body?.text?.trim();
  if (!text) return fail(400, "bad_request", "Missing dua text.");
  return callGemini(apiKey, [{ text: textPrompt(text) }]);
}

/** Route table shared by all backends. */
export const ROUTES = {
  extract: extractFromImage,
  "extract-text": extractFromText,
};
