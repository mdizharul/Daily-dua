// Client side of the AI extraction. Calls our own backend (/api/*), which holds
// the Gemini key — see server/gemini.js.

async function postJson(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || `Server error ${response.status}`);
  }
  if (data.error) throw new Error(data.message || "Extraction failed. Try again.");
  return data;
}

/** Screenshot (base64) → { title, category, arabic, transliteration, translation } */
export const extractDuaFromImage = (base64, mediaType) => postJson("/api/extract", { base64, mediaType });

/** Pasted Arabic text → { title, category, arabic, transliteration, translation } */
export const extractDuaFromText = (text) => postJson("/api/extract-text", { text });
