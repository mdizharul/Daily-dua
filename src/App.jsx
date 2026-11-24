import { useState, useEffect, useRef } from "react";
import { loadDuas, saveDuas, loadTajweedMode, loadFontSize, saveFontSize, loadStreak, saveStreak, loadScriptMode, saveScriptMode } from "./services/storage";
import hashImage from "./utils/hashImage";
import prepareImage from "./utils/prepareImage";
import { extractDuaFromImage, extractDuaFromText } from "./services/extractApi";
import { lookupVerse, matchesVerse, verifyQuranRef } from "./services/quran";
import { SAMPLE_DUAS, ARABIC_SCRIPTS, MOOD_IDS } from "./constants";
import useTheme from "./hooks/useTheme";
import { runBackHandler } from "./hooks/useBackHandler";
import SettingsView from "./views/SettingsView";
import AddEditView from "./views/AddEditView";
import BottomNav from "./components/BottomNav";
import IstighfarSection from "./istighfar/IstighfarSection";
import useIstighfar from "./istighfar/useIstighfar";
import LibraryView from "./library/LibraryView";
import DuaDetailView from "./library/DuaDetailView";
import MemorizeView from "./library/MemorizeView";
import { getLibraryTheme } from "./library/theme";
import { MAX_REPEAT, RECALL_TARGET, duaMoods, missingLanguageParts, todayKey } from "./library/duaUtils";

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
  const [libFilters, setLibFilters] = useState({ tab: "learn", mood: "all", routineOnly: false, search: "", searchOpen: false });
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
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [translationEn, setTranslationEn] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [repeat, setRepeat] = useState(1);
  const [source, setSource] = useState("");
  // Quran verification: the verse the dua was matched to, and what the check found.
  const [quranRef, setQuranRef] = useState("");
  const [verseArabic, setVerseArabic] = useState("");
  const [quranCheck, setQuranCheck] = useState(null); // { ok, label, whole } or null
  const [sharedText, setSharedText] = useState(""); // text shared into the app from another app
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

    // Opened via Android "Share → Daily Dua": start a new dua with the shared text.
    const params = new URLSearchParams(window.location.search);
    const shared = [params.get("text"), params.get("url")].filter(Boolean).join("\n").trim();
    if (shared) {
      setSharedText(shared);
      setSectionState("library");
      setAddMode("paste");
      setView("add");
      window.history.replaceState(null, "", "/");
    }
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
  const resetForm = () => { setTitle(""); setArabic(""); setTranslit(""); setTrans(""); setSelectedMoods([]); setTranslationEn(""); setTitleHi(""); setRepeat(1); setSource(""); setQuranRef(""); setVerseArabic(""); setQuranCheck(null); setSelectedCategory("general"); setScreenshot(null); setExtractError(null); setExtracting(false); setAddMode("screenshot"); };

  /* ── Fill the form from an AI result, then check any Quran reference against the real text ── */
  const applyResult = async (result, fallbackArabic = "") => {
    const ar = result.arabic || fallbackArabic;
    setTitle(result.title || "");
    setArabic(ar);
    setTranslit(result.transliteration || "");
    setTrans(result.translation || "");
    setTranslationEn(result.translation_en || "");
    setTitleHi(result.title_hi || "");
    setRepeat(Math.min(1000, Math.max(1, Number(result.repeat) || 1)));
    setSource(result.source || "");
    setQuranRef("");
    setVerseArabic("");
    setQuranCheck(null);
    if (result.category) setSelectedCategory(result.category);
    if (Array.isArray(result.moods)) setSelectedMoods(result.moods.filter((m) => MOOD_IDS.includes(m)));
    if (!result.quran_ref) return;
    try {
      const check = await verifyQuranRef(ar, result.quran_ref);
      if (!check) return;
      if (check.verified) {
        // Whole verse: use the verified Quran text and translation. Part of a verse: keep the dua as read.
        if (check.whole) {
          setArabic(check.verse.arabic);
          setTranslationEn(check.verse.english);
        }
        setQuranRef(check.verse.ref);
        setVerseArabic(check.verse.arabic);
        setSource(check.verse.label);
      }
      setQuranCheck({ ok: check.verified, whole: check.whole, label: check.verse.label });
    } catch {
      // Quran service unreachable (offline): keep the AI result, just unverified.
    }
  };

  /* ── Quran reference lookup: verified text first, then AI for transliteration and meaning ── */
  const handleQuranLookup = async (input) => {
    if (!input.trim()) return;
    setExtracting(true);
    setExtractError(null);
    setQuranCheck(null);
    try {
      const verse = await lookupVerse(input);
      setArabic(verse.arabic);
      setTranslationEn(verse.english);
      setSource(verse.label);
      setQuranRef(verse.ref);
      setVerseArabic(verse.arabic);
      setQuranCheck({ ok: true, whole: true, label: verse.label, lookup: true });
      if (!title.trim()) setTitle(verse.label);
      try {
        const r = await extractDuaFromText(verse.arabic);
        if (r.title) setTitle(r.title);
        if (r.title_hi) setTitleHi(r.title_hi);
        if (r.repeat) setRepeat(Math.min(1000, Math.max(1, Number(r.repeat) || 1)));
        setTranslit(r.transliteration || "");
        setTrans(r.translation || "");
        if (r.category) setSelectedCategory(r.category);
        if (Array.isArray(r.moods)) setSelectedMoods(r.moods.filter((m) => MOOD_IDS.includes(m)));
      } catch {
        setExtractError("Verse found, but the AI couldn't write the transliteration and meaning. You can type them, or try again.");
      }
    } catch (err) {
      setExtractError(err.message || "Could not find that verse.");
    }
    setExtracting(false);
  };

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
        await applyResult(result);
      } catch (err) {
        setScreenshot(null); // clear preview on error so user can try again
        setExtractError(err.message || "Could not extract. Fill in manually.");
      }
      setExtracting(false);
    }
  };

  /* ── Add missing harakat: sends only the Arabic, replaces only the Arabic ── */
  const addHarakat = async (text) => {
    const result = await extractDuaFromText(text);
    if (!result.arabic) throw new Error("Could not add harakat. Try again.");
    setArabic(result.arabic);
    if (!translit.trim() && result.transliteration) setTranslit(result.transliteration);
    if (!translation.trim() && result.translation) setTrans(result.translation);
    if (!translationEn.trim() && result.translation_en) setTranslationEn(result.translation_en);
    if (!titleHi.trim() && result.title_hi) setTitleHi(result.title_hi);
  };

  /* ── Paste text extract ── */
  const handlePasteExtract = async (pastedText) => {
    if (!pastedText.trim()) return;
    setExtracting(true);
    setExtractError(null);
    try {
      const result = await extractDuaFromText(pastedText);
      await applyResult(result, pastedText);
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
      translationEn: translationEn.trim(),
      titleHi: titleHi.trim(),
      repeat: Math.min(MAX_REPEAT, Math.max(1, Math.round(Number(repeat)) || 1)),
      source: source.trim(),
      quranRef: quranRef || undefined,
      quranText: verseArabic || undefined,
      // Verified only when the saved Arabic is still found in the real verse.
      verified: Boolean(verseArabic && matchesVerse(arabic, verseArabic)),
      status: editIdx !== null ? duas[editIdx].status : "new",
      dateAdded: editIdx !== null ? duas[editIdx].dateAdded : new Date().toISOString().slice(0, 10),
      category: selectedCategory,
      tags: editIdx !== null ? duas[editIdx].tags || [] : [],
      moods: selectedMoods,
      routine: editIdx !== null ? Boolean(duas[editIdx].routine) : false,
      recites: editIdx !== null ? duas[editIdx].recites : undefined,
      recall: editIdx !== null ? duas[editIdx].recall : undefined,
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
    setSelectedMoods(duaMoods(d));
    setTranslationEn(d.translationEn || "");
    setTitleHi(d.titleHi || "");
    setRepeat(Math.max(1, Number(d.repeat) || 1));
    setSource(d.source || "");
    setQuranRef(d.quranRef || "");
    setVerseArabic(d.quranText || "");
    setQuranCheck(null);
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

  /** Fills missing Roman Hindi titles and meanings (either language) with AI, one dua at a time. */
  const fillMissingLanguage = async (onProgress) => {
    const todo = duas.filter(missingLanguageParts);
    let failed = 0;
    for (let i = 0; i < todo.length; i++) {
      const d = todo[i];
      try {
        const r = await extractDuaFromText(d.arabic);
        updateDua(d.id, {
          titleHi: d.titleHi || r.title_hi || "",
          translation: (d.translation || "").trim() ? d.translation : r.translation || "",
          translationEn: (d.translationEn || "").trim() ? d.translationEn : r.translation_en || "",
        });
      } catch {
        failed++;
      }
      onProgress(i + 1, todo.length);
    }
    return { total: todo.length, failed };
  };

  const toggleRoutine = (dua) => updateDua(dua.id, { routine: !dua.routine });

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

  /* ── Phone back gesture: step back inside the app instead of leaving it ── */
  const goBack = () => {
    if (runBackHandler()) return true; // share sheet, Pocket mode, Dhikr sub-screens
    if (section !== "library") {
      setSection("library");
      return true;
    }
    if (view === "add" || view === "edit" || view === "settings") {
      const editingId = editIdx !== null ? duas[editIdx]?.id : null;
      resetForm();
      setEditIdx(null);
      if (editingId != null) {
        setSelectedId(editingId);
        setView("dua");
      } else setView("home");
      return true;
    }
    if (view === "dua") {
      backToLibrary();
      return true;
    }
    if (libFilters.searchOpen || libFilters.routineOnly || libFilters.mood !== "all") {
      setLibFilters((f) => ({ ...f, search: "", searchOpen: false, routineOnly: false, mood: "all" }));
      return true;
    }
    return false; // on the Library home: let the app close
  };
  const goBackRef = useRef(goBack);
  useEffect(() => {
    goBackRef.current = goBack;
  });

  useEffect(() => {
    // One extra history entry acts as a guard: a back gesture lands on it,
    // we handle it in the app and put the guard back.
    window.history.pushState({ dailyDua: true }, "");
    const onPop = () => {
      if (goBackRef.current()) {
        window.history.pushState({ dailyDua: true }, "");
        window.scrollTo(0, 0);
      } else {
        window.history.back(); // nothing to go back to inside the app: leave
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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
        onToggleRoutine={() => toggleRoutine(selected)}
        onMemorize={() => startMemorize(selected.id, true)}
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
        missingLanguageCount={duas.filter(missingLanguageParts).length}
        onFillMissingLanguage={fillMissingLanguage}
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
        selectedMoods={selectedMoods}
        setSelectedMoods={setSelectedMoods}
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
        onAddHarakat={addHarakat}
        initialPaste={sharedText}
        translationEn={translationEn}
        setTranslationEn={setTranslationEn}
        titleHi={titleHi}
        setTitleHi={setTitleHi}
        repeat={repeat}
        setRepeat={setRepeat}
        source={source}
        setSource={setSource}
        verseArabic={verseArabic}
        quranCheck={quranCheck}
        handleQuranLookup={handleQuranLookup}
        onBack={leaveForm}
      />
      {nav}
    </>
  );
}

