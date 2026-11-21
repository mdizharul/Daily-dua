import { CATEGORY_MAP } from "../constants";

export const splitLines = (text = "") => text.split("\n").map((l) => l.trim()).filter(Boolean);

const pad = (n) => String(n).padStart(2, "0");
/** Local-time YYYY-MM-DD (not UTC, so "today" flips at the user's midnight). */
export const todayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const recitedToday = (dua) => dua.recites?.[todayKey()] || 0;

export const categoryLabel = (dua) => CATEGORY_MAP[dua.category || "general"]?.label || "General";

export const isLearnt = (dua) => dua.status === "memorized";

/** Recall streak needed in Memorize mode before a dua counts as learnt. */
export const RECALL_TARGET = 5;

// Browsers print some Hijri months as "Jumada I" etc.; use the familiar names.
const HIJRI_NAMES = {
  "Rabi I": "Rabi al-Awwal",
  "Rabi II": "Rabi al-Thani",
  "Jumada I": "Jumada al-Ula",
  "Jumada II": "Jumada al-Akhirah",
  "Shaban": "Shaban",
  "Dhul-Qidah": "Dhul Qadah",
  "Dhul-Hijjah": "Dhul Hijjah",
};

/** "Saturday · 20 Jumada al-Ula" — Gregorian weekday + Hijri date (Umm al-Qura). */
export function headerDate(d = new Date()) {
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
  try {
    const parts = new Intl.DateTimeFormat("en-GB-u-ca-islamic-umalqura", { day: "numeric", month: "long" }).formatToParts(d);
    const day = parts.find((p) => p.type === "day")?.value;
    const raw = parts.find((p) => p.type === "month")?.value;
    const month = HIJRI_NAMES[raw?.replace(/[ʻʼ’']/g, "")] || raw;
    if (day && month) return `${weekday} · ${day} ${month}`;
  } catch {
    // Islamic calendar not supported in this browser
  }
  return `${weekday} · ${d.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
}
