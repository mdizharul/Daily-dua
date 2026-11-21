import { useState, useEffect, useRef } from "react";
import { loadDuas, saveDuas, loadTajweedMode, loadFontSize, saveFontSize, loadStreak, saveStreak, loadScriptMode, saveScriptMode } from "./services/storage";
import hashImage from "./utils/hashImage";
import prepareImage from "./utils/prepareImage";
import { extractDuaFromImage, extractDuaFromText } from "./services/extractApi";
import { SAMPLE_DUAS, ARABIC_SCRIPTS } from "./constants";
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
  const { mode, setMode } = useTheme();
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
    {
      // Camera photos are scaled down so the upload stays under the host's size limit.
      let fullData, base64, mimeType;
      try {
        ({ dataUrl: fullData, base64, mimeType } = await prepareImage(file));
      } catch (err) {
        setExtractError(err.message || "Could not open this image.");
        return;
      }

      // Duplicate check
      const hash = hashImage(base64);
      if (processedHashes.current.has(hash)) {
        setExtractError("You've already uploaded this image. The dua was extracted earlier — check your list or edit it manually.");
        return;
      }

      setScreenshot(fullData);
      setExtracting(true);
      setExtractError(null);

      try {
        const result = await extractDuaFromImage(base64, mimeType);
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
    }
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

  if (loading) return <div style={{ minHeight: "100svh", background: "var(--bg)" }} />;

  const L = getLibraryTheme();
  const goSection = (s) => {
    if (s === "memorize" && section !== "memorize") { startMemorize(); return; }
    if (s === "library" && section === "library") backToLibrary();
    setSection(s);
  };
  const nav = <BottomNav section={section} onChange={goSection} />;

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
        onShare={() => shareAsImage(selected, mode === "night")}
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

  /* ══ ADD / EDIT / SETTINGS ══ */
  const editingId = editIdx !== null ? duas[editIdx]?.id : null;
  const leaveForm = () => {
    resetForm(); setEditIdx(null);
    if (editingId != null) { setSelectedId(editingId); setView("dua"); } else setView("home");
  };

  if (view === "settings") return (
    <>
      <SettingsView
        duas={duas}
        setDuas={setDuas}
        tajweedMode={tajweedMode}
        setTajweedMode={setTajweedMode}
        arabicFontSize={arabicFontSize}
        setArabicFontSize={setArabicFontSize}
        scriptMode={scriptMode}
        setScriptMode={setScriptMode}
        themeMode={mode}
        setThemeMode={setMode}
        importRef={importRef}
        handleImport={handleImport}
        onBack={leaveForm}
      />
      {nav}
    </>
  );

  return (
    <>
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
        onBack={leaveForm}
      />
      {nav}
    </>
  );
}

