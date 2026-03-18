export default async function extractDuaFromText(text) {
  const response = await fetch("/api/extract-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Server error ${response.status}`);
  }
  if (data.error) throw new Error(data.message || "Extraction failed. Try again.");
  return data;
}
