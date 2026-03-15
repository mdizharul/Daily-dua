export const STATUS_MAP = {
  new:       { bg: "rgba(100,160,255,0.15)", border: "rgba(100,160,255,0.3)",  text: "#7ab4ff", label: "New" },
  learning:  { bg: "rgba(255,190,60,0.15)",  border: "rgba(255,190,60,0.3)",   text: "#ffbe3c", label: "Learning" },
  memorized: { bg: "rgba(100,210,120,0.15)", border: "rgba(100,210,120,0.3)",  text: "#7ec97e", label: "Memorized" },
};

export const SAMPLE_DUAS = [
  { id: 1, title: "Dua Before Sleeping", arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", transliteration: "Bismika Allahumma amootu wa ahyaa", translation: "Aye Allah tere naam se marta hoon aur jeeta hoon", status: "learning", dateAdded: "2025-03-10", tags: ["Sleep"], reciteCount: 0 },
  { id: 2, title: "Sayyidul Istighfar", arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ\nوَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ\nأَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ\nأَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي\nفَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", transliteration: "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana abduka\nwa ana ala ahdika wa wa'dika mastata'tu\na'udhu bika min sharri ma sana'tu\nabu'u laka bi ni'matika alayya wa abu'u laka bi dhanbi\nfaghfir li fa innahu la yaghfirudh dhunuba illa anta", translation: "Aye Allah tu mera Rab hai, tere siwa koi mabood nahi, tune mujhe paida kiya aur mai tera banda hoon\nAur mai tere ahad aur wa'de par hoon jitna mujhse ho sake\nMai teri panah chahta hoon apne bure a'maal ke shar se\nMai tere saamne tera ehsaan manta hoon aur apne gunaahon ka iqraar karta hoon\nPas mujhe maaf farma de, beshak tere siwa koi gunaah maaf karne wala nahi", status: "new", dateAdded: "2025-03-14", tags: ["Morning", "Evening"], reciteCount: 0 },
];

export const PRESET_TAGS = ["Morning", "Evening", "Travel", "Meals", "Sleep", "Protection", "Illness", "General"];
