import { useSyncExternalStore } from "react";

// Language for dua titles and meanings: "hi" = Roman Hindi (default), "en" = English.
// App buttons and labels stay in English. Set in Settings → Language.
// A tiny shared store: any screen can read it with useLang(), and setLang()
// updates every screen at once (and remembers the choice).
export const LANGS = [
  ["hi", "Roman Hindi"],
  ["en", "English"],
];

const KEY = "meaning-lang";

function read() {
  try {
    return localStorage.getItem(KEY) === "en" ? "en" : "hi";
  } catch {
    return "hi";
  }
}

let current = read();
const listeners = new Set();

export function setLang(lang) {
  current = lang === "en" ? "en" : "hi";
  try {
    localStorage.setItem(KEY, current);
  } catch {
    // storage blocked
  }
  listeners.forEach((l) => l());
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useLang = () => useSyncExternalStore(subscribe, () => current);
