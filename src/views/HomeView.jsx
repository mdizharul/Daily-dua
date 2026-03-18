import DuaCard from "../components/DuaCard";
import shareAsImage from "../utils/shareAsImage";
import { CATEGORIES, STATUS_MAP, CATEGORY_MAP } from "../constants";

export default function HomeView({
  duas, setDuas, liveDuas, archivedDuas, filteredDuas,
  archiveView, setArchiveView,
  filter, setFilter, categoryFilter, setCategoryFilter,
  searchQuery, setSearchQuery,
  counts,
  tajweedMode, arabicFontSize,
  streak,
  startReview,
  handleRecite,
  handleEdit,
  resetForm, setEditIdx, setView,
  T, themeMode,
}) {
  const inputStyle = { width: "100%", padding: "0.8rem 1rem", background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: "12px", color: T.appColor, fontSize: "0.95rem", fontFamily: "'Cormorant Garamond', serif", outline: "none", resize: "vertical", boxSizing: "border-box" };

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>

      {/* ── Progress Dashboard ── */}
      {!archiveView && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
          {[
            { label: "Memorized", value: counts.memorized || 0, icon: "✓", color: "#7ec97e" },
            { label: "Learning", value: counts.learning, icon: "📖", color: "#ffbe3c" },
            { label: "Streak", value: `${streak.count}d`, icon: streak.count >= 7 ? "🔥" : "✨", color: streak.count >= 7 ? "#ff8c00" : T.gold },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{ background: T.cardBg, borderRadius: "14px", border: `1px solid ${T.cardBorder}`, padding: "0.65rem 0.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "1rem", marginBottom: "0.15rem" }}>{icon}</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color, fontFamily: "'Cormorant Garamond', serif" }}>{value}</div>
              <div style={{ fontSize: "0.62rem", color: T.goldFaint, fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.5px" }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Upload CTA */}
      <button onClick={() => { resetForm(); setEditIdx(null); setView("add"); }}
        style={{ width: "100%", padding: "1rem 1.5rem", background: T.ctaBg, border: "none", borderRadius: "50px", color: T.ctaColor, cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", fontSize: "1rem", letterSpacing: "1px", boxShadow: T.ctaShadow }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.ctaColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Add New Dua
      </button>

      {/* Review button */}
      {!archiveView && liveDuas.length > 0 && (
        <button onClick={startReview}
          style={{ width: "100%", padding: "0.75rem 1.5rem", background: "transparent", border: `1.5px solid ${T.cardBorder}`, borderRadius: "50px", color: T.gold, cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, marginBottom: "0.8rem", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", letterSpacing: "0.5px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          Review Duas ({liveDuas.length})
        </button>
      )}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "0.8rem" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.goldFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" placeholder="Search duas…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          style={{ ...inputStyle, paddingLeft: "2.2rem", paddingTop: "0.55rem", paddingBottom: "0.55rem" }} />
      </div>

      {/* Category filter row */}
      <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.6rem", overflowX: "auto", paddingBottom: "0.2rem" }}>
        <button onClick={() => setCategoryFilter("all")}
          style={{ flexShrink: 0, background: categoryFilter === "all" ? T.btnBg : "transparent", border: `1px solid ${categoryFilter === "all" ? T.gold : T.btnBorder}`, borderRadius: "20px", padding: "0.2rem 0.65rem", color: categoryFilter === "all" ? T.gold : T.goldFaint, cursor: "pointer", fontSize: "0.72rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: categoryFilter === "all" ? 600 : 400, whiteSpace: "nowrap" }}>
          All
        </button>
        {CATEGORIES.map(cat => {
          const active = categoryFilter === cat.id;
          return (
            <button key={cat.id} onClick={() => setCategoryFilter(cat.id)}
              style={{ flexShrink: 0, background: active ? T.btnBg : "transparent", border: `1px solid ${active ? T.gold : T.btnBorder}`, borderRadius: "20px", padding: "0.2rem 0.65rem", color: active ? T.gold : T.goldFaint, cursor: "pointer", fontSize: "0.72rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: active ? 600 : 400, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <span style={{ fontSize: "0.7rem" }}>{cat.icon}</span> {cat.label}
            </button>
          );
        })}
      </div>

      {/* Status Filters */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {["all","new","learning"].map((f) => {
          const active = filter === f;
          const c = f === "all" ? { text: T.gold, bg: T.btnBg, border: T.cardBorder } : STATUS_MAP[f];
          return <button key={f} onClick={() => setFilter(f)} style={{ background: active ? c.bg : "transparent", border: `1px solid ${active ? c.border : T.btnBorder}`, borderRadius: "20px", padding: "0.25rem 0.7rem", color: active ? c.text : T.goldFaint, cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: active ? 600 : 400 }}>
            {f === "all" ? "All" : STATUS_MAP[f].label} ({counts[f]})
          </button>;
        })}
      </div>

      {/* Progress bar */}
      {duas.length > 0 && (
        <div style={{ marginBottom: "1.2rem" }}>
          <div style={{ display: "flex", height: "4px", borderRadius: "2px", overflow: "hidden", background: T.btnBg }}>
            {counts.memorized > 0 && <div style={{ width: `${(counts.memorized/duas.length)*100}%`, background: "#7ec97e" }} />}
            {counts.learning  > 0 && <div style={{ width: `${(counts.learning/duas.length)*100}%`,  background: "#ffbe3c" }} />}
            {counts.new       > 0 && <div style={{ width: `${(counts.new/duas.length)*100}%`,       background: "#7ab4ff" }} />}
          </div>
          <p style={{ fontSize: "0.72rem", color: T.goldFaint, margin: "0.35rem 0 0", textAlign: "center" }}>
            {counts.memorized} memorized · {counts.learning} learning · {counts.new} new
          </p>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filteredDuas.map((dua, fi) => {
          const ri = duas.findIndex((d) => d.id === dua.id);
          return (
            <div key={dua.id} style={{ animation: `fadeIn 0.4s ease-out ${Math.min(fi*0.08,0.5)}s both` }}>
              <DuaCard dua={dua} themeMode={themeMode} T={T} tajweed={tajweedMode} fontSize={arabicFontSize}
                onStatusChange={(s) => { const u=[...duas]; u[ri]={...u[ri],status:s}; setDuas(u); }}
                onDelete={() => { if(confirm("Remove this dua?")) setDuas(duas.filter((_,i)=>i!==ri)); }}
                onEdit={() => handleEdit(ri)}
                onRecite={() => handleRecite(ri)}
                onShare={() => shareAsImage(dua, themeMode === "paper")} />
            </div>
          );
        })}
      </div>

      {filteredDuas.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: T.goldFaint }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{archiveView ? "🏆" : "☽"}</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {archiveView ? "No memorized duas yet. Mark duas as Memorized to move them here." : filter === "all" ? "No duas yet. Upload a screenshot to begin." : `No ${STATUS_MAP[filter]?.label.toLowerCase()} duas.`}
          </p>
        </div>
      )}
    </div>
  );
}
