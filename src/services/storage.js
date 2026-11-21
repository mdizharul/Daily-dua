// All app data lives in the browser's localStorage. Keep these keys stable —
// changing one would make existing users lose that data.
const KEYS = {
  duas: "daily-dua-collection",
  tajweed: "tajweed-mode",
  streak: "daily-dua-streak",
  fontSize: "arabic-font-size",
  theme: "theme-mode",
  script: "script-mode",
};

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // storage blocked (e.g. private mode)
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage full or blocked — nothing useful to do
  }
}

function readJson(key, fallback) {
  const s = read(key);
  if (!s) return fallback;
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

export const loadDuas = () => readJson(KEYS.duas, null);
export const saveDuas = (duas) => write(KEYS.duas, JSON.stringify(duas));

export const loadTajweedMode = () => read(KEYS.tajweed) === "true";
export const saveTajweedMode = (on) => write(KEYS.tajweed, on ? "true" : "false");

export const loadStreak = () => readJson(KEYS.streak, { count: 0, lastDate: "" });
export const saveStreak = (streak) => write(KEYS.streak, JSON.stringify(streak));

export const loadFontSize = () => parseFloat(read(KEYS.fontSize)) || 1.2;
export const saveFontSize = (size) => write(KEYS.fontSize, String(size));

export function loadThemeMode() {
  const s = read(KEYS.theme);
  if (["dark", "light", "paper"].includes(s)) return s;
  // The older (Netlify) version stored Paper Mode as a separate on/off flag.
  return read("paper-mode") === "true" ? "paper" : "dark";
}
export const saveThemeMode = (mode) => write(KEYS.theme, mode);

export function loadScriptMode() {
  const s = read(KEYS.script);
  return ["indopak", "uthmani"].includes(s) ? s : "indopak";
}
export const saveScriptMode = (mode) => write(KEYS.script, mode);
