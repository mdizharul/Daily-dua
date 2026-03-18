// Tajweed coloring — subtle approach
// Only highlight the most important tajweed rules with UNDERLINES, not full text recoloring
// This preserves readability while marking key pronunciation rules

const TAJWEED_RULES = {
  ghunna:   { color: "#27ae60", label: "Ghunna" },    // nasalization — most important to mark
  qalqalah: { color: "#9b59b6", label: "Qalqalah" },  // echo/bounce
  madd:     { color: "#2980b9", label: "Madd" },       // prolongation
};

const QALQALAH  = new Set([...'قطبجد']);
const GHUNNA_LETTERS = new Set([...'نم']);
const MADD      = new Set(['\u0627','\u0648','\u064a','\u0649']); // ا و ي ى

// Split Arabic string into {seg, base} objects
function segmentArabic(text) {
  const DIACRITIC = /[\u064b-\u065f\u0610-\u061a\u0670]/;
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

function tajweedRule(segments, idx) {
  const { seg, base } = segments[idx];
  const hasShadda = seg.includes('\u0651'); // ّ

  // Only color letters with shadda for ghunna (نّ مّ) — most audible rule
  if (GHUNNA_LETTERS.has(base) && hasShadda) return "ghunna";
  // Qalqalah only when letter has sukoon (no vowel after it) — the echo only happens at stops
  if (QALQALAH.has(base)) {
    const hasVowel = /[\u064b-\u0650]/.test(seg.slice(1));
    if (!hasVowel && !hasShadda) return "qalqalah";
  }
  // Madd — only alif (always madd) and waw/ya without vowel
  if (MADD.has(base)) {
    const hasVowel = /[\u064b-\u0650]/.test(seg.slice(1));
    if (base === '\u0627' || base === '\u0649' || !hasVowel) return "madd";
  }
  return null;
}

export const TAJWEED_LEGEND = [
  { label: "Ghunna",    color: TAJWEED_RULES.ghunna.color,   desc: "نّ مّ" },
  { label: "Qalqalah",  color: TAJWEED_RULES.qalqalah.color, desc: "ق ط ب ج د" },
  { label: "Madd",      color: TAJWEED_RULES.madd.color,      desc: "ا و ي" },
];

export const TajweedText = ({ text, defaultColor }) => {
  const segments = segmentArabic(text);
  return (
    <span>
      {segments.map(({ seg }, i) => {
        const rule = tajweedRule(segments, i);
        if (rule) {
          const c = TAJWEED_RULES[rule].color;
          return (
            <span key={i} style={{
              color: defaultColor,
              textDecoration: "underline",
              textDecorationColor: c,
              textDecorationThickness: "2px",
              textUnderlineOffset: "4px",
            }}>
              {seg}
            </span>
          );
        }
        return <span key={i} style={{ color: defaultColor }}>{seg}</span>;
      })}
    </span>
  );
};
