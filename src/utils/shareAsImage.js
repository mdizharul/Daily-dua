// Draws a dua as a shareable image card. Themes: emerald, midnight, ivory, plum.
// Sizes: "fit" (height follows the text), "square" (1080×1080 post),
// "tall" (1080×1920 status/story). For fixed sizes the text is scaled to fit.
//   renderDuaImage(dua, { theme, size }) → Promise<Blob>
//   shareImage(blob, title) / saveImage(blob, title)

export const CARD_THEMES = {
  emerald: { label: "Emerald", top: "#1E5A47", bottom: "#12332A", text: "#F4F8F6", muted: "#B7CEC4", gold: "#E8C97E", frame: "rgba(232,201,126,0.42)" },
  midnight: { label: "Midnight", top: "#1F2A4D", bottom: "#0C1222", text: "#F3F1EA", muted: "#B9BDCB", gold: "#D9B45E", frame: "rgba(217,180,94,0.45)" },
  ivory: { label: "Ivory", top: "#FBF7EE", bottom: "#EFE6D2", text: "#14211D", muted: "#4E5D57", gold: "#8A6420", frame: "rgba(138,100,32,0.35)" },
  plum: { label: "Plum", top: "#4A2340", bottom: "#220F1D", text: "#F7EEF3", muted: "#D6BFCB", gold: "#E9C27E", frame: "rgba(233,194,126,0.42)" },
};

export const CARD_SIZES = {
  fit: { label: "Fit", w: 600, h: null },
  square: { label: "Square · post", w: 540, h: 540 },
  tall: { label: "Tall · status", w: 540, h: 960 },
};

import { duaMeaning, duaTitle } from "../library/duaUtils";

const PAD = 44;
const FOOTER = 44;

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

export const fileNameFor = (title) => `${(title || "dua").replace(/[^\w؀-ۿ]+/g, "-")}.png`;

/** Lays out every line at text scale `s`; returns rows and their total height. */
function layout(dua, W, s, arabicFont, arabicScale, theme, show) {
  const measure = document.createElement("canvas").getContext("2d");
  const maxW = W - PAD * 2;
  const rows = [];
  const add = (lines, font, color, lineH, dir = "ltr") => {
    measure.font = font;
    lines.flatMap((l) => wrap(measure, l, maxW)).forEach((text) => rows.push({ text, font, color, h: lineH, dir }));
  };
  const gap = (h) => rows.push({ gap: true, h });
  const label = (text) => rows.push({ text: text.toUpperCase().split("").join(String.fromCharCode(8202)), font: `600 ${10 * s}px 'Inter', sans-serif`, color: theme.gold, h: 22 * s });

  add([duaTitle(dua, show.lang)], `600 ${15 * s}px 'Inter', sans-serif`, theme.gold, 22 * s);
  gap(18 * s);
  add(split(dua.arabic), `700 ${28 * s * arabicScale}px ${arabicFont}`, theme.text, 50 * s * arabicScale, "rtl");
  const translit = show.translit === false ? [] : split(dua.transliteration);
  if (translit.length) {
    gap(16 * s);
    label("Transliteration");
    add(translit, `italic ${14 * s}px 'Inter', sans-serif`, theme.text, 22 * s);
  }
  const m = duaMeaning(dua, show.lang);
  const meaning = show.meaning === false ? "" : split(m.text).join(" ");
  if (meaning) {
    gap(16 * s);
    label(m.label);
    add([meaning], `500 ${14 * s}px 'Inter', sans-serif`, theme.muted, 22 * s);
  }
  if (dua.source) {
    gap(14 * s);
    add([dua.source + (dua.verified ? "  ✓" : "")], `600 ${12 * s}px 'Inter', sans-serif`, theme.gold, 20 * s);
  }
  return { rows, height: rows.reduce((sum, r) => sum + r.h, 0) };
}

export async function renderDuaImage(dua, { theme: themeId = "emerald", size: sizeId = "fit", show = {} } = {}) {
  await document.fonts.ready;
  const theme = CARD_THEMES[themeId] || CARD_THEMES.emerald;
  const size = CARD_SIZES[sizeId] || CARD_SIZES.fit;
  const root = getComputedStyle(document.documentElement);
  const arabicFont = root.getPropertyValue("--arabic-font").trim() || "'Amiri', serif";
  const arabicScale = parseFloat(root.getPropertyValue("--arabic-scale")) || 1;

  const W = size.w;
  let lay = layout(dua, W, 1, arabicFont, arabicScale, theme, show);
  let H;
  if (size.h) {
    H = size.h;
    const room = H - PAD * 2 - FOOTER;
    // Shrink long duas to fit; let short duas grow a little to fill the card.
    for (let next = 1.35; next >= 0.45; next -= 0.05) {
      const l = layout(dua, W, next, arabicFont, arabicScale, theme, show);
      lay = l;
      if (l.height <= room) break;
    }
  } else {
    H = PAD + lay.height + PAD + FOOTER;
  }

  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);

  const bg = ctx.createLinearGradient(0, 0, W * 0.6, H);
  bg.addColorStop(0, theme.top);
  bg.addColorStop(1, theme.bottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = theme.frame;
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(14, 14, W - 28, H - 28, 22);
  else ctx.rect(14, 14, W - 28, H - 28);
  ctx.stroke();

  // Centre the content vertically in the space above the footer.
  let y = Math.max(PAD, (H - FOOTER - lay.height) / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const r of lay.rows) {
    if (!r.gap) {
      ctx.font = r.font;
      ctx.fillStyle = r.color;
      ctx.direction = r.dir || "ltr";
      ctx.fillText(r.text, W / 2, y + r.h / 2);
    }
    y += r.h;
  }

  ctx.direction = "ltr";
  ctx.font = "500 11px 'Inter', sans-serif";
  ctx.fillStyle = theme.muted;
  ctx.fillText("Daily Dua · daily-dua-kappa.vercel.app", W / 2, H - 32);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export function saveImage(blob, title) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileNameFor(title);
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Opens the phone's share sheet; falls back to saving the image. Returns "shared" | "saved" | "cancelled". */
export async function shareImage(blob, title) {
  const file = new File([blob], fileNameFor(title), { type: "image/png" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return "shared";
    } catch (err) {
      if (err?.name === "AbortError") return "cancelled"; // user closed the share sheet
      // any other share failure: fall back to saving
    }
  }
  saveImage(blob, title);
  return "saved";
}
