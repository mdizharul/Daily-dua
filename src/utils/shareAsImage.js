// Draws a dua as a shareable image in the app's card style (green card, gold
// labels) and opens the phone's share sheet, or downloads it on desktop.
// Long lines are wrapped so nothing runs off the edge.

const W = 600;
const PAD = 44;
const MAX_W = W - PAD * 2;

const COLORS = {
  day: { top: "#1E5A47", bottom: "#12332A" },
  night: { top: "#173F33", bottom: "#0C1D17" },
};
const TEXT = "#F4F8F6";
const MUTED = "#B7CEC4";
const GOLD = "#E8C97E";
const FRAME = "rgba(232,201,126,0.42)";

function wrap(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

const split = (t = "") => t.split("\n").map((l) => l.trim()).filter(Boolean);

export default async function shareAsImage(dua, night = false) {
  await document.fonts.ready;
  const root = getComputedStyle(document.documentElement);
  const arabicFont = root.getPropertyValue("--arabic-font").trim() || "'Amiri', serif";
  const arabicScale = parseFloat(root.getPropertyValue("--arabic-scale")) || 1;

  const fonts = {
    title: "600 15px 'Inter', sans-serif",
    arabic: `700 ${Math.round(28 * arabicScale)}px ${arabicFont}`,
    label: "600 10px 'Inter', sans-serif",
    translit: "italic 15px 'Inter', sans-serif",
    meaning: "500 16px 'Inter', sans-serif",
    footer: "500 11px 'Inter', sans-serif",
  };

  // Measure and wrap everything first, so the canvas height fits the content.
  const measure = document.createElement("canvas").getContext("2d");
  const wrapAll = (lines, font) => {
    measure.font = font;
    return lines.flatMap((l) => wrap(measure, l, MAX_W));
  };
  const arabic = wrapAll(split(dua.arabic), fonts.arabic);
  const translit = wrapAll(split(dua.transliteration), fonts.translit);
  const meaning = wrapAll([split(dua.translation).join(" ")].filter(Boolean), fonts.meaning);

  const ARABIC_LH = Math.round(50 * arabicScale);
  let H = 96 + arabic.length * ARABIC_LH + 20;
  if (translit.length) H += 22 + translit.length * 24 + 16;
  if (meaning.length) H += 22 + meaning.length * 24 + 16;
  H += 56;

  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);

  const c = night ? COLORS.night : COLORS.day;
  const bg = ctx.createLinearGradient(0, 0, W * 0.6, H);
  bg.addColorStop(0, c.top);
  bg.addColorStop(1, c.bottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Inner gold frame, like the dua card in the app
  ctx.strokeStyle = FRAME;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect?.(14, 14, W - 28, H - 28, 22);
  if (!ctx.roundRect) ctx.rect(14, 14, W - 28, H - 28);
  ctx.stroke();

  ctx.textAlign = "center";
  let y = 58;
  ctx.font = fonts.title;
  ctx.fillStyle = GOLD;
  ctx.direction = "ltr";
  ctx.fillText(dua.title, W / 2, y);

  y = 96 + ARABIC_LH * 0.55;
  ctx.font = fonts.arabic;
  ctx.fillStyle = TEXT;
  ctx.direction = "rtl";
  arabic.forEach((line) => {
    ctx.fillText(line, W / 2, y);
    y += ARABIC_LH;
  });
  y += 8;
  ctx.direction = "ltr";

  const section = (title, lines, font, color) => {
    if (!lines.length) return;
    ctx.font = fonts.label;
    ctx.fillStyle = GOLD;
    ctx.fillText(title.toUpperCase().split("").join(String.fromCharCode(8202)), W / 2, y);
    y += 24;
    ctx.font = font;
    ctx.fillStyle = color;
    lines.forEach((line) => {
      ctx.fillText(line, W / 2, y);
      y += 24;
    });
    y += 16;
  };
  section("Transliteration", translit, fonts.translit, TEXT);
  section("Matlab", meaning, fonts.meaning, MUTED);

  ctx.font = fonts.footer;
  ctx.fillStyle = MUTED;
  ctx.fillText("Daily Dua · daily-dua-kappa.vercel.app", W / 2, H - 30);

  canvas.toBlob(async (blob) => {
    const file = new File([blob], `${dua.title.replace(/\s+/g, "-")}.png`, { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: dua.title });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return; // user closed the share sheet — don't download
        // any other share failure: fall through to a plain download
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
