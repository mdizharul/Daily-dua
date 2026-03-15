export default async function extractDuaFromImage(base64Data, mediaType) {
  const response = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64: base64Data, mediaType }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Server error ${response.status}`);
  }
  if (data.error === "not_a_dua") throw new Error(data.message);
  if (data.error) throw new Error(data.message || "Extraction failed. Try again.");
  return data;
}
