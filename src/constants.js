export const CATEGORIES = [
  { id: "daily", label: "Daily Life", icon: "🕌" },
  { id: "protection", label: "Protection", icon: "🛡️" },
  { id: "health", label: "Health", icon: "💚" },
  { id: "rizq", label: "Rizq", icon: "🤲" },
  { id: "sleep", label: "Sleep", icon: "🌙" },
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "meals", label: "Meals", icon: "🍽️" },
  { id: "morning", label: "Morning", icon: "🌅" },
  { id: "evening", label: "Evening", icon: "🌇" },
  { id: "general", label: "General", icon: "📿" },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// "How is your heart today?" — what the user is feeling or about to do.
// A dua can have several. AI suggests them; the user can edit.
export const MOODS = [
  { id: "anxious", label: "Anxious" },
  { id: "sad", label: "Sad" },
  { id: "grateful", label: "Grateful" },
  { id: "forgive", label: "Seeking forgiveness" },
  { id: "unwell", label: "Unwell" },
  { id: "need", label: "In need" },
  { id: "sleep", label: "Sleep" },
  { id: "travel", label: "Travel" },
  { id: "morning", label: "Morning" },
  { id: "evening", label: "Evening" },
];
export const MOOD_IDS = MOODS.map((m) => m.id);

// Older duas have no moods yet; derive one from their category.
export const CATEGORY_MOODS = {
  protection: ["anxious"],
  health: ["unwell"],
  rizq: ["need"],
  sleep: ["sleep"],
  travel: ["travel"],
  morning: ["morning"],
  evening: ["evening"],
  meals: ["grateful"],
};

export const SAMPLE_DUAS = [
  { id: 1, title: "Dua Before Sleeping", arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", transliteration: "Bismika Allahumma amootu wa ahyaa", translation: "Aye Allah tere naam se marta hoon aur jeeta hoon", status: "learning", dateAdded: "2025-03-10", category: "sleep", tags: ["Sleep"], moods: ["sleep"], routine: true, reciteCount: 0 },
  { id: 2, title: "Sayyidul Istighfar", arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ\nوَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ\nأَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ\nأَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي\nفَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", transliteration: "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana abduka\nwa ana ala ahdika wa wa'dika mastata'tu\na'udhu bika min sharri ma sana'tu\nabu'u laka bi ni'matika alayya wa abu'u laka bi dhanbi\nfaghfir li fa innahu la yaghfirudh dhunuba illa anta", translation: "Aye Allah tu mera Rab hai, tere siwa koi mabood nahi, tune mujhe paida kiya aur mai tera banda hoon\nAur mai tere ahad aur wa'de par hoon jitna mujhse ho sake\nMai teri panah chahta hoon apne bure a'maal ke shar se\nMai tere saamne tera ehsaan manta hoon aur apne gunaahon ka iqraar karta hoon\nPas mujhe maaf farma de, beshak tere siwa koi gunaah maaf karne wala nahi", status: "new", dateAdded: "2025-03-14", category: "daily", tags: ["Morning", "Evening"], moods: ["forgive", "morning", "evening"], routine: true, reciteCount: 0 },
];


// Arabic script styles (Settings → Arabic Script). `scale` evens out the
// different visual sizes of the fonts so the font-size slider feels the same.
export const ARABIC_SCRIPTS = {
  indopak: { label: "Indo-Pak", font: "'Lateef', 'Amiri', serif", scale: 1.3 },
  uthmani: { label: "Uthmani", font: "'Amiri Quran', 'Amiri', serif", scale: 1 },
};
