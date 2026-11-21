// Tajweed marking — subtle approach.
// Only the most important rules are marked, with UNDERLINES rather than full
// recolouring, so the text stays readable.

export const TAJWEED_RULES = {
  ghunna:   { color: "#27ae60", label: "Ghunna" },    // nasalization — most important to mark
  qalqalah: { color: "#9b59b6", label: "Qalqalah" },  // echo/bounce
  madd:     { color: "#2980b9", label: "Madd" },      // prolongation
};

export const TAJWEED_LEGEND = [
  { label: "Ghunna",   color: TAJWEED_RULES.ghunna.color,   desc: "نّ مّ" },
  { label: "Qalqalah", color: TAJWEED_RULES.qalqalah.color, desc: "ق ط ب ج د" },
  { label: "Madd",     color: TAJWEED_RULES.madd.color,     desc: "ا و ي" },
];

const QALQALAH       = new Set([..."قطبجد"]);
const GHUNNA_LETTERS = new Set([..."نم"]);
const MADD           = new Set(["ا", "و", "ي", "ى"]); // ا و ي ى
const DIACRITIC      = /[ً-ٟؐ-ؚٰ]/;
const VOWEL          = /[ً-ِ]/;

/** Split an Arabic string into { seg, base } letters (base letter + its diacritics). */
export function segmentArabic(text) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    let seg = text[i];
    let j = i + 1;
    while (j < text.length && DIACRITIC.test(text[j])) seg += text[j++];
    out.push({ seg, base: text[i] });
    i = j;
  }
  return out;
}

/** Returns "ghunna" | "qalqalah" | "madd" | null for one segment. */
export function tajweedRule({ seg, base }) {
  const hasShadda = seg.includes("ّ"); // ّ
  const hasVowel = VOWEL.test(seg.slice(1));

  // Ghunna: only noon/meem with shadda (نّ مّ) — the most audible rule
  if (GHUNNA_LETTERS.has(base) && hasShadda) return "ghunna";
  // Qalqalah: only with sukoon (no vowel) — the echo happens at stops
  if (QALQALAH.has(base) && !hasVowel && !hasShadda) return "qalqalah";
  // Madd: alif always; waw/ya only without a vowel
  if (MADD.has(base) && (base === "ا" || base === "ى" || !hasVowel)) return "madd";
  return null;
}
