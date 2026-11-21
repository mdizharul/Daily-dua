// Phone camera photos are often 3–8 MB. Vercel/Netlify functions reject request
// bodies over ~4.5 MB, and Gemini doesn't need full resolution to read text, so
// large images are scaled down (longest side MAX_SIDE) and re-encoded as JPEG.
const MAX_SIDE = 1600;
const SMALL_ENOUGH = 1.5 * 1024 * 1024; // bytes — smaller files are sent as-is

const readAsDataURL = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not open this image. Try a different photo."));
    img.src = src;
  });

/** Returns { dataUrl, base64, mimeType } ready for preview and upload. */
export default async function prepareImage(file) {
  const original = await readAsDataURL(file);
  const img = await loadImage(original);
  const longest = Math.max(img.naturalWidth, img.naturalHeight);

  if (file.size <= SMALL_ENOUGH && longest <= MAX_SIDE) {
    return { dataUrl: original, base64: original.split(",")[1], mimeType: file.type || "image/jpeg" };
  }

  const scale = Math.min(1, MAX_SIDE / longest);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; // transparent PNGs → white, not black, behind the text
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { dataUrl, base64: dataUrl.split(",")[1], mimeType: "image/jpeg" };
}
