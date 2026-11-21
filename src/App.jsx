import { useState, useEffect, useRef } from "react";
import { loadDuas, saveDuas, loadTajweedMode, loadFontSize, saveFontSize, loadStreak, saveStreak, loadScriptMode, saveScriptMode } from "./services/storage";
import hashImage from "./utils/hashImage";
import { extractDuaFromImage, extractDuaFromText } from "./services/extractApi";
import { SAMPLE_DUAS, ARABIC_SCRIPTS } from "./constants";
import { Spinner, StarIcon } from "./components/icons";
import useTheme from "./hooks/useTheme";
import SettingsView from "./views/SettingsView";
import AddEditView from "./views/AddEditView";
import BottomNav from "./components/BottomNav";
import IstighfarSection from "./istighfar/IstighfarSection";
import useIstighfar from "./istighfar/useIstighfar";
import LibraryView from "./library/LibraryView";
import DuaDetailView from "./library/DuaDetailView";
import MemorizeView from "./library/MemorizeView";
import { getLibraryTheme } from "./library/theme";
import { RECALL_TARGET, todayKey } from "./library/duaUtils";
import shareAsImage from "./utils/shareAsImage";

const SECTION_KEY = "app-section"; // "library" | "memorize" | "istighfar"
function loadSection() {
  try {
    const s = localStorage.getItem(SECTION_KEY);
    if (s === "duas") return "library"; // older name
    if (s === "history") return "istighfar"; // History now lives inside the tracker
    return ["library", "memorize", "istighfar"].includes(s) ? s : "library";
  } catch {
    return "library";
  }
}

export default function App() {
  const { mode, cycleMode, T, icon: modeIcon, isLight, isDark } = useTheme();
  const istighfar = useIstighfar();
  const [section, setSectionState] = useState(loadSection);
  const setSection = (s) => {
    setSectionState(s);
    window.scrollTo(0, 0);
    try { localStorage.setItem(SECTION_KEY, s); } catch { /* storage blocked */ }
  };

  const [duas, setDuas]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [view, setView]           = useState("home");
  const [editIdx, setEditIdx]     = useState(null);
  const [libFilters, setLibFilters] = useState({ tab: "learn", category: "all", search: "", searchOpen: false });
  const [selectedId, setSelectedId] = useState(null); // dua shown on the dua page
  const [memorize, setMemorize] = useState({ focusId: null, fromDua: false, session: 0 });
  const [scriptMode, setScriptModeState] = useState("indopak");
  const [tajweedMode, setTajweedMode] = useState(false);
  const [streak, setStreak] = useState({ count: 0, lastDate: "" });
  const [arabicFontSize, setArabicFontSize] = useState(1.2);

  const [title, setTitle]         = useState("");
  const [arabic, setArabic]       = useState("");
  const [translit, setTranslit]   = useState("");
  const [translation, setTrans]   = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [addMode, setAddMode] = useState("screenshot");

  const [screenshot, setScreenshot]   = useState(null);
  const [extracting, setExtracting]   = useState(false);
  const [extractError, setExtractError] = useState(null);

  // Session-level set of image hashes already processed this visit
  const processedHashes = useRef(new Set());

  const fileRef = useRef(null);
  const importRef = useRef(null);

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported)) throw new Error();
        const existingIds = new Set(duas.map(d => d.id));
        const newOnes = imported.filter(d => d.arabic && !existingIds.has(d.id));
        if (newOnes.length === 0) { alert("No new duas found in this file."); return; }
        setDuas(prev => [...newOnes.map(d => ({ tags: [], reciteCount: 0, ...d })), ...prev]);
        alert(`Imported ${newOnes.length} dua${newOnes.length > 1 ? "s" : ""}!`);
      } catch { alert("Invalid backup file. Please use a file exported from Daily Dua."); }
      if (importRef.current) importRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const setScriptMode = (v) => { setScriptModeState(v); saveScriptMode(v); };

  /* ── Load ── */
  useEffect(() => {
    const stored = loadDuas();
    setDuas(stored || SAMPLE_DUAS);
    setTajweedMode(loadTajweedMode());
    setStreak(loadStreak());
    setArabicFontSize(loadFontSize());
    setScriptModeState(loadScriptMode());
    setLoading(false);
  }, []);

  useEffect(() => { if (!loading) saveDuas(duas); }, [duas, loading]);

  // Arabic script style → CSS variables used by every Arabic text element
  useEffect(() => {
    const script = ARABIC_SCRIPTS[scriptMode] || ARABIC_SCRIPTS.indopak;
    document.documentElement.style.setProperty("--arabic-font", script.font);
    document.documentElement.style.setProperty("--arabic-scale", String(script.scale));
  }, [scriptMode]);

  /* ── Form reset ── */
  const resetForm = () => { setTitle(""); setArabic(""); setTranslit(""); setTrans(""); setSelectedTags([]); setSelectedCategory("general"); setScreenshot(null); setExtractError(null); setExtracting(false); setAddMode("screenshot"); };

  /* ── Screenshot upload with duplicate + validation ── */
  const handleScreenshot = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const fullData = ev.target.result;
      const base64   = fullData.split(",")[1];

      // Duplicate check
      const hash = hashImage(base64);
      if (processedHashes.current.has(hash)) {
        setExtractError("You've already uploaded this screenshot. The dua was extracted earlier — check your list or edit it manually.");
        return;
      }

      setScreenshot(fullData);
      setExtracting(true);
      setExtractError(null);

      try {
        const result = await extractDuaFromImage(base64, file.type || "image/jpeg");
        processedHashes.current.add(hash);
        setTitle(result.title || "");
        setArabic(result.arabic || "");
        setTranslit(result.transliteration || "");
        setTrans(result.translation || "");
        if (result.category) setSelectedCategory(result.category);
      } catch (err) {
        setScreenshot(null); // clear preview on error so user can try again
        setExtractError(err.message || "Could not extract. Fill in manually.");
      }
      setExtracting(false);
    };
    reader.readAsDataURL(file);
  };

  /* ── Paste text extract ── */
  const handlePasteExtract = async (pastedText) => {
    if (!pastedText.trim()) return;
    setExtracting(true);
    setExtractError(null);
    try {
      const result = await extractDuaFromText(pastedText);
      setTitle(result.title || "");
      setArabic(result.arabic || pastedText);
      setTranslit(result.transliteration || "");
      setTrans(result.translation || "");
      if (result.category) setSelectedCategory(result.category);
    } catch (err) {
      setExtractError(err.message || "Could not extract. Fill in manually.");
      setArabic(pastedText);
    }
    setExtracting(false);
  };

  /* ── Save ── */
  const handleSave = () => {
    if (!arabic.trim()) return;
    const obj = {
      id: editIdx !== null ? duas[editIdx].id : Date.now(),
      title: title.trim() || `Dua ${duas.length + 1}`,
      arabic: arabic.trim(), transliteration: translit.trim(), translation: translation.trim(),
      status: editIdx !== null ? duas[editIdx].status : "new",
      dateAdded: editIdx !== null ? duas[editIdx].dateAdded : new Date().toISOString().slice(0, 10),
      category: selectedCategory,
      tags: selectedTags,
      reciteCount: editIdx !== null ? (duas[editIdx].reciteCount || 0) : 0,
    };
    if (editIdx !== null) { const u = [...duas]; u[editIdx] = obj; setDuas(u); }
    else setDuas([obj, ...duas]);
    const wasEditing = editIdx !== null;
    resetForm(); setEditIdx(null);
    if (wasEditing) { setSelectedId(obj.id); setView("dua"); } else setView("home");
  };

  const handleEdit = (idx) => {
    const d = duas[idx];
    setTitle(d.title); setArabic(d.arabic); setTranslit(d.transliteration); setTrans(d.translation);
    setSelectedTags(d.tags || []);
    setSelectedCategory(d.category || "general");
    setEditIdx(idx); setView("edit");
  };

  /* ── Dua actions (by id) ── */
  const updateDua = (id, patch) => setDuas((list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const handleRecite = (id) => {
    const day = todayKey();
    setDuas((list) => list.map((d) => (d.id === id
      ? { ...d, reciteCount: (d.reciteCount || 0) + 1, recites: { ...d.recites, [day]: (d.recites?.[day] || 0) + 1 } }
      : d)));
    if (navigator.vibrate) navigator.vibrate(40);
    const yesterday = todayKey(new Date(Date.now() - 86400000));
    setStreak(prev => {
      let next;
      if (prev.lastDate === day) next = prev;
      else if (prev.lastDate === yesterday) next = { count: prev.count + 1, lastDate: day };
      else next = { count: 1, lastDate: day };
      saveStreak(next);
      return next;
    });
  };

  const openDua = (id) => { setSelectedId(id); setView("dua"); window.scrollTo(0, 0); };
  const backToLibrary = () => { setView("home"); setSelectedId(null); };

  const deleteDua = (id) => {
    if (!confirm("Delete this dua? This cannot be undone.")) return;
    setDuas((list) => list.filter((d) => d.id !== id));
    backToLibrary();
  };

  const toggleLearnt = (dua) =>
    updateDua(dua.id, dua.status === "memorized" ? { status: "learning", recall: 0 } : { status: "memorized", recall: RECALL_TARGET });

  /* Memorize: "I said it right" moves a dua toward learnt; "Need practice" steps back one. */
  const memorizeResult = (id, correct) => setDuas((list) => list.map((d) => {
    if (d.id !== id) return d;
    const recall = correct ? Math.min((d.recall || 0) + 1, RECALL_TARGET) : Math.max((d.recall || 0) - 1, 0);
    const status = correct && (recall >= RECALL_TARGET || d.status === "memorized") ? "memorized" : "learning";
    return { ...d, recall, status };
  }));

  const startMemorize = (focusId = null, fromDua = false) => {
    setMemorize((m) => ({ focusId, fromDua, session: m.session + 1 }));
    setSection("memorize");
  };

  const changeFontSize = (v) => { setArabicFontSize(v); saveFontSize(v); };

  const startEdit = (id) => handleEdit(duas.findIndex((d) => d.id === id));

    if (loading) return (
    <div style={{ minHeight: "100vh", background: T.appBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
      <Spinner size={28} />
    </div>
  );

  const L = getLibraryTheme(mode);
  const goSection = (s) => {
    if (s === "memorize" && section !== "memorize") { startMemorize(); return; }
    if (s === "library" && section === "library") backToLibrary();
    setSection(s);
  };
  const nav = <BottomNav section={section} onChange={goSection} L={L} />;

  /* ══ ISTIGHFAR TRACKER ══ */
  if (section === "istighfar") return (
    <>
      <IstighfarSection tracker={istighfar} />
      {nav}
    </>
  );

  /* ══ MEMORIZE ══ */
  if (section === "memorize") return (
    <>
      <MemorizeView
        key={memorize.session}
        L={L}
        duas={duas}
        focusId={memorize.focusId}
        onResult={memorizeResult}
        onBack={memorize.fromDua ? () => setSection("library") : null}
        onLibrary={() => { backToLibrary(); setSection("library"); }}
      />
      {nav}
    </>
  );

  /* ══ LIBRARY ══ */
  const selected = duas.find((d) => d.id === selectedId);
  if (view === "dua" && selected) return (
    <>
      <DuaDetailView
        L={L}
        dua={selected}
        tajweed={tajweedMode}
        fontSize={arabicFontSize}
        onFontSize={changeFontSize}
        onBack={backToLibrary}
        onEdit={() => startEdit(selected.id)}
        onDelete={() => deleteDua(selected.id)}
        onRecite={() => handleRecite(selected.id)}
        onToggleLearnt={() => toggleLearnt(selected)}
        onMemorize={() => startMemorize(selected.id, true)}
        onShare={() => shareAsImage(selected, mode === "paper")}
      />
      {nav}
    </>
  );

  if (view === "home" || view === "dua") return (
    <>
      <LibraryView
        L={L}
        duas={duas}
        filters={libFilters}
        setFilters={setLibFilters}
        streak={streak.count}
        onOpen={openDua}
        onAdd={() => { resetForm(); setEditIdx(null); setView("add"); }}
        onSettings={() => setView("settings")}
      />
      {nav}
    </>
  );

  /* ══ ADD / EDIT / SETTINGS (classic themed screens) ══ */
  const editingId = editIdx !== null ? duas[editIdx]?.id : null;
  const leaveForm = () => {
    resetForm(); setEditIdx(null);
    if (editingId != null) { setSelectedId(editingId); setView("dua"); } else setView("home");
  };

  return (
    <div style={{ minHeight: "100vh", background: T.appBg, color: T.appColor, fontFamily: "var(--font-ui)", paddingBottom: "var(--nav-h)" }}>
      <style>{`
        textarea:focus, input:focus { border-color: ${T.focusBorder} !important; box-shadow: 0 0 20px ${T.focusShadow} !important; outline: none !important; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ══ HEADER ══ */}
      <div style={{ textAlign: "center", padding: "2rem 1.5rem 1rem", position: "relative" }}>
        {/* Top-left: Back */}
        <button onClick={leaveForm}
          style={{ position: "absolute", top: "1.25rem", left: "1.2rem", background: "none", border: "none", color: T.gold, cursor: "pointer", fontSize: "0.9rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, padding: "0.2rem 0.4rem" }}>
          ← Back
        </button>

        {/* Top-right: Theme toggle + Settings */}
        <div style={{ position: "absolute", top: "1.2rem", right: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button onClick={cycleMode}
            title={`Theme: ${mode}`}
            style={{ background: isDark ? "rgba(201,168,76,0.08)" : isLight ? "rgba(26,107,60,0.08)" : "rgba(139,94,32,0.08)", border: `1px solid ${isDark ? "rgba(201,168,76,0.15)" : isLight ? "rgba(26,107,60,0.15)" : "rgba(139,94,32,0.15)"}`, borderRadius: "20px", padding: "0.15rem 0.55rem", color: T.gold, cursor: "pointer", fontSize: "0.85rem", fontFamily: "var(--font-ui)", display: "flex", alignItems: "center", gap: "0.3rem", transition: "all 0.2s" }}>
            <span>{modeIcon}</span>
          </button>
          <button aria-label="Settings" onClick={() => { if (view === "settings") leaveForm(); else setView("settings"); }}
            style={{ background: "none", border: "none", color: T.goldFaint, cursor: "pointer", fontSize: "1.3rem" }}>⚙</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem", marginBottom: "0.3rem" }}>
          <div style={{ width: "35px", height: "1px", background: `linear-gradient(90deg, transparent, ${T.gold})` }} />
          <StarIcon size={12} color={T.gold} />
          <div style={{ width: "35px", height: "1px", background: `linear-gradient(90deg, ${T.gold}, transparent)` }} />
        </div>

        {/* Logo mark — crescent + star inline */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
          <svg width="28" height="28" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
            <path d="M38 13a19 19 0 1 0 0 38 15 15 0 1 1 0-38z" fill={isLight ? "#1a6b3c" : T.gold} />
            <polygon points="45,17 46.4,21.3 51,21.3 47.3,23.9 48.7,28.2 45,25.6 41.3,28.2 42.7,23.9 39,21.3 43.6,21.3" fill={T.gold} />
          </svg>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 300, margin: 0, letterSpacing: "3px", ...(isDark ? { backgroundImage: "linear-gradient(90deg, #c9a84c 40%, #f0dfa0 50%, #c9a84c 60%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 4s linear infinite" } : { color: T.heading }) }}>
            DAILY DUA
          </h1>
        </div>
        <p style={{ fontSize: "0.72rem", color: T.goldFaint, margin: 0, letterSpacing: "3px", textTransform: "uppercase" }}>
          Screenshot · Extract · Memorize
        </p>
        {streak.count > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", marginTop: "0.4rem", padding: "0.2rem 0.75rem", background: streak.count >= 7 ? "rgba(255,140,0,0.12)" : (isDark ? "rgba(201,168,76,0.08)" : isLight ? "rgba(26,107,60,0.06)" : "rgba(139,94,32,0.08)"), border: `1px solid ${streak.count >= 7 ? "rgba(255,140,0,0.3)" : T.goldFaint}`, borderRadius: "20px" }}>
            <span style={{ fontSize: "0.85rem" }}>{streak.count >= 7 ? "🔥" : "✨"}</span>
            <span style={{ fontSize: "0.72rem", color: streak.count >= 7 ? "#ff8c00" : T.gold, fontFamily: "var(--font-ui)", fontWeight: 600 }}>{streak.count} day streak</span>
          </div>
        )}
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 1rem 3rem" }}>

        {/* ══ SETTINGS ══ */}
        {view === "settings" && (
          <SettingsView
            duas={duas}
            setDuas={setDuas}
            tajweedMode={tajweedMode}
            setTajweedMode={setTajweedMode}
            arabicFontSize={arabicFontSize}
            setArabicFontSize={setArabicFontSize}
            scriptMode={scriptMode}
            setScriptMode={setScriptMode}
            importRef={importRef}
            handleImport={handleImport}
            T={T}
          />
        )}

        {/* ══ ADD / EDIT ══ */}
        {(view === "add" || view === "edit") && (
          <AddEditView
            editIdx={editIdx}
            title={title}
            setTitle={setTitle}
            arabic={arabic}
            setArabic={setArabic}
            translit={translit}
            setTranslit={setTranslit}
            translation={translation}
            setTrans={setTrans}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            addMode={addMode}
            setAddMode={setAddMode}
            screenshot={screenshot}
            setScreenshot={setScreenshot}
            extracting={extracting}
            extractError={extractError}
            fileRef={fileRef}
            handleScreenshot={handleScreenshot}
            handlePasteExtract={handlePasteExtract}
            handleSave={handleSave}
            setView={(v) => (v === "home" ? leaveForm() : setView(v))}
            T={T}
            themeMode={mode}
          />
        )}

      </div>
      {nav}
    </div>
  );
}
