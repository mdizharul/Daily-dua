// Lightweight hash of first 3000 chars of base64 — fast and collision-resistant enough for this use case
export default function hashImage(base64) {
  const sample = base64.slice(0, 3000);
  let h = 0x811c9dc5;
  for (let i = 0; i < sample.length; i++) {
    h ^= sample.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16);
}
