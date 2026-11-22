// Verified Quran text, from the public AlQuran Cloud API (https://alquran.cloud/api).
// Used to (1) look up a verse by reference and (2) check AI-read Arabic against
// the real verse before the app calls it "verified".

const API = "https://api.alquran.cloud/v1";
const ARABIC_EDITION = "quran-uthmani";
const ENGLISH_EDITION = "en.sahih"; // Saheeh International
const MAX_AYAHS = 10;

let surahCache = null;

/** The 114 surahs: [{ number, englishName, numberOfAyahs }]. Cached after the first call. */
export async function surahList() {
  if (surahCache) return surahCache;
  const res = await fetch(`${API}/surah`);
  if (!res.ok) throw new Error("Could not reach the Quran service. Check your internet.");
  const json = await res.json();
  surahCache = json.data.map((s) => ({ number: s.number, englishName: s.englishName, numberOfAyahs: s.numberOfAyahs }));
  return surahCache;
}

// Surah names are spelled many ways ("Ta-Ha" / "Taa-Haa" / "Taha", "Al-Baqarah" / "Al-Baqara").
// Compare loosely: no "al", no punctuation, doubled vowels collapsed, no trailing "h".
const simplify = (s) =>
  s
    .toLowerCase()
    .replace(/^(surah|surat|sura|soorah)\s+/, "")
    .replace(/[^a-z]/g, "")
    .replace(/^(al|an|ar|as|at|ad|ash|az)(?=[a-z]{3})/, "")
    .replace(/([aeiou])\1+/g, "$1")
    .replace(/ee/g, "i")
    .replace(/h$/, "");
// Consonants only: "yasin" and "yaseen" both become "ysn".
const consonants = (s) => simplify(s).replace(/[aeiouy](?!$)/g, (c, i) => (i === 0 ? c : "")).replace(/[aeiou]/g, "");

/**
 * Parses "20:114", "20:114-115", "Ta-Ha 114", "Surah Al-Baqarah 201", "baqarah 2:201".
 * Returns { surah, from, to } with surah as a number.
 */
export async function parseReference(input) {
  const text = input.trim();
  let m = text.match(/(\d{1,3})\s*[:.]\s*(\d{1,3})(?:\s*-\s*(\d{1,3}))?/);
  if (m) return { surah: +m[1], from: +m[2], to: m[3] ? +m[3] : +m[2] };

  m = text.match(/^(.*?)[\s,]+(\d{1,3})(?:\s*-\s*(\d{1,3}))?$/);
  if (!m) throw new Error("Type a reference like “Ta-Ha 20:114”, “2:201” or “Al-Baqarah 201”.");
  const wanted = simplify(m[1]);
  const list = await surahList();
  const skeleton = consonants(m[1]);
  const found =
    list.find((s) => simplify(s.englishName) === wanted) ||
    list.find((s) => consonants(s.englishName) === skeleton) ||
    list.find((s) => simplify(s.englishName).startsWith(wanted)) ||
    (wanted.length >= 4 && list.find((s) => simplify(s.englishName).includes(wanted)));
  if (!found) throw new Error(`Couldn't find a surah called “${m[1]}”. Try its number, e.g. 20:114.`);
  return { surah: found.number, from: +m[2], to: m[3] ? +m[3] : +m[2] };
}

// The API puts "Bismillah…" in front of verse 1 of most surahs; it isn't part of the verse.
const BISMILLAH = /^بِسْمِ\s*[ٱا]للَّهِ\s*[ٱا]لرَّحْمَٰنِ\s*[ٱا]لرَّحِيمِ\s*/;

/**
 * Fetches verses { surah, from, to } →
 * { arabic, english, ref: "20:114", label: "Surah Ta-Ha 20:114" }.
 */
export async function fetchVerses({ surah, from, to }) {
  if (surah < 1 || surah > 114) throw new Error("Surah numbers go from 1 to 114.");
  if (to < from) [from, to] = [to, from];
  if (to - from + 1 > MAX_AYAHS) throw new Error(`Pick up to ${MAX_AYAHS} verses at a time.`);

  const arabic = [];
  const english = [];
  let surahName = "";
  for (let ayah = from; ayah <= to; ayah++) {
    const res = await fetch(`${API}/ayah/${surah}:${ayah}/editions/${ARABIC_EDITION},${ENGLISH_EDITION}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !Array.isArray(json.data)) {
      throw new Error(res.status === 404 || json.code === 404 ? `Verse ${surah}:${ayah} doesn't exist.` : "Could not reach the Quran service. Check your internet.");
    }
    const [ar, en] = json.data;
    let text = ar.text.trim();
    if (ayah === 1 && surah !== 1 && surah !== 9) text = text.replace(BISMILLAH, "").trim();
    arabic.push(text);
    english.push(en.text.trim());
    surahName = ar.surah.englishName;
  }
  const ref = from === to ? `${surah}:${from}` : `${surah}:${from}-${to}`;
  return { arabic: arabic.join("\n"), english: english.join("\n"), ref, label: `Surah ${surahName} ${ref}` };
}

/** Lookup by typed reference, e.g. "Ta-Ha 20:114". */
export async function lookupVerse(input) {
  return fetchVerses(await parseReference(input));
}

/** Letters only: drops harakat, Quran marks and spacing, and unifies letter variants. */
export function arabicSkeleton(text = "") {
  return text
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, "")
    .replace(/[ٱأإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^ء-ي]/g, "");
}

function lcs(x, y) {
  const prev = new Array(y.length + 1).fill(0);
  for (let i = 1; i <= x.length; i++) {
    let diag = 0;
    for (let j = 1; j <= y.length; j++) {
      const up = prev[j];
      prev[j] = x[i - 1] === y[j - 1] ? diag + 1 : Math.max(prev[j], prev[j - 1]);
      diag = up;
    }
  }
  return prev[y.length];
}

/**
 * Compares a dua's Arabic with a verse's Arabic by letters.
 * contained: how much of the dua is found in the verse (1 = all of it, e.g. a dua that is part of a verse)
 * full: how similar the two are overall (1 = same text)
 */
export function compareToVerse(arabic, verseArabic) {
  const x = arabicSkeleton(arabic);
  const y = arabicSkeleton(verseArabic);
  if (!x.length || !y.length) return { contained: 0, full: 0 };
  const common = lcs(x, y);
  return { contained: common / x.length, full: (2 * common) / (x.length + y.length) };
}

/** 0…1 overall similarity of two Arabic texts. */
export const arabicSimilarity = (a, b) => compareToVerse(a, b).full;

/** True when the dua's words are found in the verse (Uthmani spelling differs slightly, hence 0.9). */
export const matchesVerse = (arabic, verseArabic) => compareToVerse(arabic, verseArabic).contained >= 0.9;

/**
 * Checks AI-read Arabic against the verse the AI says it is (quranRef like "20:114").
 * Returns null for a bad reference, else
 * { verified, whole, verse }: verified = the dua is found in that verse,
 * whole = it is the entire verse (so the verified Quran text can replace the AI's reading).
 */
export async function verifyQuranRef(arabic, quranRef) {
  const m = String(quranRef || "").match(/^(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/);
  if (!m) return null;
  const verse = await fetchVerses({ surah: +m[1], from: +m[2], to: m[3] ? +m[3] : +m[2] });
  const { contained, full } = compareToVerse(arabic, verse.arabic);
  return { verified: contained >= 0.9, whole: full >= 0.9, verse };
}
