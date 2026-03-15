import { useState, useEffect, useRef } from "react";
import { loadDuas, saveDuas, loadPaperMode, loadTajweedMode, loadFontSize, loadStreak, saveStreak } from "./storage";
import hashImage from "./utils/hashImage";
import extractDuaFromImage from "./utils/extractDua";
import { SAMPLE_DUAS } from "./constants";
import { Spinner, StarIcon } from "./components/icons";
import HomeView from "./views/HomeView";
import SettingsView from "./views/SettingsView";
import AddEditView from "./views/AddEditView";
import ReviewView from "./views/ReviewView";

export default function App() {
  const [duas, setDuas]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [view, setView]           = useState("home");
  const [editIdx, setEditIdx]     = useState(null);
  const [filter, setFilter]       = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [archiveView, setArchiveView] = useState(false);
  const [paperMode, setPaperMode]     = useState(false);
  const [tajweedMode, setTajweedMode] = useState(false);
  const [streak, setStreak] = useState({ count: 0, lastDate: "" });
  const [arabicFontSize, setArabicFontSize] = useState(1.2);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [reviewRevealed, setReviewRevealed] = useState(false);

  const [title, setTitle]         = useState("");
  const [arabic, setArabic]       = useState("");
  const [translit, setTranslit]   = useState("");
  const [translation, setTrans]   = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
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

  /* ── Load ── */
  useEffect(() => {
    const stored = loadDuas();
    setDuas(stored || SAMPLE_DUAS);
    setPaperMode(loadPaperMode());
    setTajweedMode(loadTajweedMode());
    setStreak(loadStreak());
    setArabicFontSize(loadFontSize());
    setLoading(false);
  }, []);

  useEffect(() => { if (!loading) saveDuas(duas); }, [duas, loading]);

  /* ── Form reset ── */
  const resetForm = () => { setTitle(""); setArabic(""); setTranslit(""); setTrans(""); setSelectedTags([]); setScreenshot(null); setExtractError(null); setExtracting(false); setAddMode("screenshot"); };

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
        processedHashes.current.add(hash); // mark as processed only on success
        setTitle(result.title || "");
        setArabic(result.arabic || "");
        setTranslit(result.transliteration || "");
        setTrans(result.translation || "");
      } catch (err) {
        setScreenshot(null); // clear preview on error so user can try again
        setExtractError(err.message || "Could not extract. Fill in manually.");
      }
      setExtracting(false);
    };
    reader.readAsDataURL(file);
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
      tags: selectedTags,
      reciteCount: editIdx !== null ? (duas[editIdx].reciteCount || 0) : 0,
    };
    if (editIdx !== null) { const u = [...duas]; u[editIdx] = obj; setDuas(u); }
    else setDuas([obj, ...duas]);
    resetForm(); setEditIdx(null); setView("home");
  };

  const handleEdit = (idx) => {
    const d = duas[idx];
    setTitle(d.title); setArabic(d.arabic); setTranslit(d.transliteration); setTrans(d.translation);
    setSelectedTags(d.tags || []);
    setEditIdx(idx); setView("edit");
  };

  /* ── Handle Recite with streak ── */
  const handleRecite = (ri) => {
    const u = [...duas];
    u[ri] = { ...u[ri], reciteCount: (u[ri].reciteCount || 0) + 1 };
    setDuas(u);
    if (navigator.vibrate) navigator.vibrate(40);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    setStreak(prev => {
      let next;
      if (prev.lastDate === today) {
        next = prev;
      } else if (prev.lastDate === yesterday) {
        next = { count: prev.count + 1, lastDate: today };
      } else {
        next = { count: 1, lastDate: today };
      }
      saveStreak(next);
      return next;
    });
  };

  /* ── Start Review ── */
  const startReview = () => {
    const queue = [...liveDuas].sort(() => Math.random() - 0.5);
    setReviewQueue(queue);
    setReviewIdx(0);
    setReviewRevealed(false);
    setReviewMode(true);
  };

  const liveDuas    = duas.filter(d => d.status !== "memorized");
  const archivedDuas = duas.filter(d => d.status === "memorized");
  const sourceDuas   = archiveView ? archivedDuas : liveDuas;
  const filteredDuas = sourceDuas
    .filter(d => filter === "all" || d.status === filter)
    .filter(d => tagFilter === "all" || (d.tags || []).includes(tagFilter))
    .filter(d => !searchQuery || [d.title, d.transliteration, d.translation].some(f => (f || "").toLowerCase().includes(searchQuery.toLowerCase())));
  const counts = { all: liveDuas.length, new: liveDuas.filter((d) => d.status === "new").length, learning: liveDuas.filter((d) => d.status === "learning").length };

  /* ── Styles ── */
  const appBg = paperMode
    ? "linear-gradient(170deg, #f5ede0 0%, #ede0c8 40%, #f0e8d5 100%)"
    : "linear-gradient(170deg, #0a1a0e 0%, #0d1710 40%, #111a14 100%)";
  const appColor    = paperMode ? "#2d1a00" : "#e8dcc8";
  const goldColor   = paperMode ? "#7a4a00" : "#c9a84c";
  const goldFaint   = paperMode ? "rgba(122,74,0,0.5)" : "rgba(201,168,76,0.5)";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: appBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
      <Spinner size={28} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: appBg, color: appColor, fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
        @keyframes fadeIn  { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin    { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes shimmer { 0% { background-position:-200% center } 100% { background-position:200% center } }
        textarea:focus, input:focus { border-color: ${paperMode ? "rgba(139,94,32,0.5)" : "rgba(201,168,76,0.5)"} !important; box-shadow: 0 0 20px ${paperMode ? "rgba(139,94,32,0.1)" : "rgba(201,168,76,0.1)"} !important; outline: none !important; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ══ HEADER ══ */}
      <div style={{ textAlign: "center", padding: "2rem 1.5rem 1rem", position: "relative" }}>
        <button onClick={() => { setArchiveView(!archiveView); setFilter("all"); setTagFilter("all"); setSearchQuery(""); }}
          style={{ position: "absolute", top: "1.25rem", left: "1.2rem", background: archiveView ? (paperMode ? "rgba(139,94,32,0.15)" : "rgba(100,210,120,0.15)") : "none", border: archiveView ? `1px solid ${paperMode ? "rgba(139,94,32,0.3)" : "rgba(100,210,120,0.3)"}` : "none", borderRadius: "20px", padding: "0.2rem 0.7rem", color: archiveView ? "#7ec97e" : goldFaint, cursor: "pointer", fontSize: "0.72rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, letterSpacing: "1px" }}>
          {archiveView ? "← Live" : `✓ Vault (${archivedDuas.length})`}
        </button>
        <button onClick={() => { setView(view === "settings" ? "home" : "settings"); }}
          style={{ position: "absolute", top: "1.2rem", right: "1.2rem", background: "none", border: "none", color: goldFaint, cursor: "pointer", fontSize: "1.3rem" }}>⚙</button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem", marginBottom: "0.3rem" }}>
          <div style={{ width: "35px", height: "1px", background: `linear-gradient(90deg, transparent, ${goldColor})` }} />
          <StarIcon size={12} color={goldColor} />
          <div style={{ width: "35px", height: "1px", background: `linear-gradient(90deg, ${goldColor}, transparent)` }} />
        </div>

        {/* Logo mark — crescent + star inline */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
          <svg width="28" height="28" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
            <path d="M38 13a19 19 0 1 0 0 38 15 15 0 1 1 0-38z" fill={goldColor} />
            <polygon points="45,17 46.4,21.3 51,21.3 47.3,23.9 48.7,28.2 45,25.6 41.3,28.2 42.7,23.9 39,21.3 43.6,21.3" fill={goldColor} />
          </svg>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 300, margin: 0, letterSpacing: "3px", ...(paperMode ? { color: "#7a4a00" } : { background: "linear-gradient(90deg, #c9a84c 40%, #f0dfa0 50%, #c9a84c 60%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 4s linear infinite" }) }}>
            DAILY DUA
          </h1>
        </div>
        <p style={{ fontSize: "0.72rem", color: archiveView ? "#7ec97e" : goldFaint, margin: 0, letterSpacing: "3px", textTransform: "uppercase" }}>
          {archiveView ? "✓  Memorized Vault" : "Screenshot · Extract · Memorize"}
        </p>
        {streak.count > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", marginTop: "0.4rem", padding: "0.2rem 0.75rem", background: streak.count >= 7 ? "rgba(255,140,0,0.12)" : "rgba(201,168,76,0.08)", border: `1px solid ${streak.count >= 7 ? "rgba(255,140,0,0.3)" : goldFaint}`, borderRadius: "20px" }}>
            <span style={{ fontSize: "0.85rem" }}>{streak.count >= 7 ? "🔥" : "✨"}</span>
            <span style={{ fontSize: "0.72rem", color: streak.count >= 7 ? "#ff8c00" : goldColor, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{streak.count} day streak</span>
          </div>
        )}
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 1rem 3rem" }}>

        {/* ══ SETTINGS ══ */}
        {view === "settings" && (
          <SettingsView
            duas={duas}
            setDuas={setDuas}
            paperMode={paperMode}
            setPaperMode={setPaperMode}
            tajweedMode={tajweedMode}
            setTajweedMode={setTajweedMode}
            arabicFontSize={arabicFontSize}
            setArabicFontSize={setArabicFontSize}
            setView={setView}
            importRef={importRef}
            handleImport={handleImport}
          />
        )}

        {/* ══ REVIEW MODE ══ */}
        {view === "home" && reviewMode && (
          <ReviewView
            reviewQueue={reviewQueue}
            reviewIdx={reviewIdx}
            setReviewIdx={setReviewIdx}
            reviewRevealed={reviewRevealed}
            setReviewRevealed={setReviewRevealed}
            duas={duas}
            setDuas={setDuas}
            arabicFontSize={arabicFontSize}
            paperMode={paperMode}
            setReviewMode={setReviewMode}
            appColor={appColor}
          />
        )}

        {/* ══ HOME ══ */}
        {view === "home" && !reviewMode && (
          <HomeView
            duas={duas}
            setDuas={setDuas}
            liveDuas={liveDuas}
            archivedDuas={archivedDuas}
            filteredDuas={filteredDuas}
            archiveView={archiveView}
            setArchiveView={setArchiveView}
            filter={filter}
            setFilter={setFilter}
            tagFilter={tagFilter}
            setTagFilter={setTagFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            counts={counts}
            paperMode={paperMode}
            tajweedMode={tajweedMode}
            arabicFontSize={arabicFontSize}
            streak={streak}
            startReview={startReview}
            handleRecite={handleRecite}
            handleEdit={handleEdit}
            resetForm={resetForm}
            setEditIdx={setEditIdx}
            setView={setView}
          />
        )}

        {/* ══ ADD / EDIT ══ */}
        {(view === "add" || view === "edit") && (
          <AddEditView
            duas={duas}
            setDuas={setDuas}
            editIdx={editIdx}
            setEditIdx={setEditIdx}
            title={title}
            setTitle={setTitle}
            arabic={arabic}
            setArabic={setArabic}
            translit={translit}
            setTranslit={setTranslit}
            translation={translation}
            setTrans={setTrans}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            addMode={addMode}
            setAddMode={setAddMode}
            screenshot={screenshot}
            setScreenshot={setScreenshot}
            extracting={extracting}
            extractError={extractError}
            fileRef={fileRef}
            handleScreenshot={handleScreenshot}
            handleSave={handleSave}
            resetForm={resetForm}
            setView={setView}
            paperMode={paperMode}
          />
        )}

      </div>
    </div>
  );
}
