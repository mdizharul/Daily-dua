// Indo-Pak standard color scheme used in Tajweed Quran prints & Muslim Pro
const TAJWEED_COLORS = {
  qalqalah: "#9b59b6", // Purple  — ق ط ب ج د  (echo/bounce letters)
  ghunna:   "#27ae60", // Green   — نّ مّ       (nasalization with shadda)
  tafkheem: "#e67e22", // Orange  — ص ض ظ خ غ  (heavy/emphatic letters)
  ra:       "#c0392b", // Red     — ر            (ra, mostly heavy)
  madd:     "#2980b9", // Blue    — ا و ي ى      (long vowel / prolongation)
};
const QALQALAH  = new Set([...'قطبجد']);
const GHUNNA    = new Set([...'نم']);
const TAFKHEEM  = new Set([...'صضظخغ']);
const MADD      = new Set(['\u0627','\u0648','\u064a','\u0649']); // ا و ي ى

// Split Arabic string into {seg, base} objects — base letter + its diacritics as one unit
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

function tajweedColor(segments, idx) {
  const { seg, base } = segments[idx];
  const hasShadda = seg.includes('\u0651'); // ّ
  const hasVowel  = /[\u064b-\u0650]/.test(seg.slice(1)); // short vowel on base letter

  if (QALQALAH.has(base))                        return TAJWEED_COLORS.qalqalah;
  if (GHUNNA.has(base) && hasShadda)              return TAJWEED_COLORS.ghunna;
  if (TAFKHEEM.has(base))                         return TAJWEED_COLORS.tafkheem;
  if (base === 'ر')                               return TAJWEED_COLORS.ra;
  // Madd: ا ى always; و ي only when acting as long vowel (no short-vowel diacritic on them)
  if (MADD.has(base) && (base === '\u0627' || base === '\u0649' || !hasVowel))
                                                  return TAJWEED_COLORS.madd;
  return null;
}

export const TAJWEED_LEGEND = [
  { label: "Qalqalah",  color: TAJWEED_COLORS.qalqalah, desc: "ق ط ب ج د" },
  { label: "Ghunna",    color: TAJWEED_COLORS.ghunna,   desc: "نّ مّ" },
  { label: "Tafkheem",  color: TAJWEED_COLORS.tafkheem, desc: "ص ض ظ خ غ" },
  { label: "Ra",        color: TAJWEED_COLORS.ra,        desc: "ر" },
  { label: "Madd",      color: TAJWEED_COLORS.madd,      desc: "ا و ي" },
];

export const TajweedText = ({ text, defaultColor }) => {
  const segments = segmentArabic(text);
  return (
    <span>
      {segments.map(({ seg, base }, i) => {
        const color = tajweedColor(segments, i);
        return <span key={i} style={{ color: color || defaultColor }}>{seg}</span>;
      })}
    </span>
  );
};
