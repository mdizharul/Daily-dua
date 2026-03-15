export function loadDuas()        { try { const s = localStorage.getItem("daily-dua-collection"); return s ? JSON.parse(s) : null; } catch { return null; } }
export function saveDuas(d)       { try { localStorage.setItem("daily-dua-collection", JSON.stringify(d)); } catch {} }
export function loadPaperMode()   { try { return localStorage.getItem("paper-mode") === "true"; } catch { return false; } }
export function savePaperMode(v)  { try { localStorage.setItem("paper-mode", v ? "true" : "false"); } catch {} }
export function loadTajweedMode() { try { return localStorage.getItem("tajweed-mode") === "true"; } catch { return false; } }
export function saveTajweedMode(v){ try { localStorage.setItem("tajweed-mode", v ? "true" : "false"); } catch {} }
export function loadStreak() {
  try {
    const s = localStorage.getItem("daily-dua-streak");
    return s ? JSON.parse(s) : { count: 0, lastDate: "" };
  } catch { return { count: 0, lastDate: "" }; }
}
export function saveStreak(v) { try { localStorage.setItem("daily-dua-streak", JSON.stringify(v)); } catch {} }
export function loadFontSize() { try { const s = localStorage.getItem("arabic-font-size"); return s ? parseFloat(s) : 1.2; } catch { return 1.2; } }
export function saveFontSize(v) { try { localStorage.setItem("arabic-font-size", String(v)); } catch {} }
