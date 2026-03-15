import { savePaperMode, saveTajweedMode, saveFontSize, saveDuas } from "../storage";

export default function SettingsView({
  duas, setDuas, paperMode, setPaperMode, tajweedMode, setTajweedMode,
  arabicFontSize, setArabicFontSize, setView, importRef, handleImport,
}) {
  const goldColor  = paperMode ? "#7a4a00" : "#c9a84c";
  const goldFaint  = paperMode ? "rgba(122,74,0,0.5)" : "rgba(201,168,76,0.5)";
  const cardBg     = paperMode ? "linear-gradient(145deg, #faf6ec 0%, #f3ead5 100%)" : "linear-gradient(145deg, #1a2a1a 0%, #0f1f14 100%)";
  const cardBorder = paperMode ? "rgba(139,94,32,0.25)" : "rgba(201,168,76,0.2)";
  const btnStyle   = { background: paperMode ? "rgba(139,94,32,0.07)" : "rgba(201,168,76,0.08)", border: `1px solid ${paperMode ? "rgba(139,94,32,0.18)" : "rgba(201,168,76,0.15)"}`, borderRadius: "8px", padding: "0.22rem 0.55rem", color: paperMode ? "rgba(90,51,0,0.55)" : "rgba(201,168,76,0.55)", cursor: "pointer", fontSize: "0.7rem", fontFamily: "'Cormorant Garamond', serif" };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: goldColor, cursor: "pointer", fontSize: "0.9rem", fontFamily: "'Cormorant Garamond', serif", padding: "0.5rem 0", marginBottom: "1rem" }}>← Back</button>
      <div style={{ background: cardBg, borderRadius: "20px", border: `1px solid ${cardBorder}`, padding: "1.3rem" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: goldColor, margin: "0 0 1rem" }}>Settings</h2>

        {/* Paper mode toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.7rem 0.9rem", background: paperMode ? "rgba(139,94,32,0.07)" : "rgba(201,168,76,0.05)", borderRadius: "10px", border: `1px solid ${cardBorder}`, marginBottom: "1rem" }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: goldColor }}>📜 Paper Mode</p>
            <p style={{ margin: "0.1rem 0 0", fontSize: "0.72rem", color: goldFaint }}>Warm parchment look — like Muslim Pro</p>
          </div>
          <button onClick={() => { const next = !paperMode; setPaperMode(next); savePaperMode(next); }}
            style={{ width: "44px", height: "24px", borderRadius: "12px", background: paperMode ? "#c9a84c" : "rgba(201,168,76,0.2)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: paperMode ? "23px" : "3px", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
          </button>
        </div>

        {/* Tajweed mode toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.7rem 0.9rem", background: tajweedMode ? "rgba(155,89,182,0.07)" : paperMode ? "rgba(139,94,32,0.05)" : "rgba(201,168,76,0.05)", borderRadius: "10px", border: `1px solid ${tajweedMode ? "rgba(155,89,182,0.25)" : cardBorder}`, marginBottom: "1rem" }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: tajweedMode ? "#9b59b6" : goldColor }}>🎨 Tajweed Colors</p>
            <p style={{ margin: "0.1rem 0 0", fontSize: "0.72rem", color: goldFaint }}>Color-coded Arabic: Qalqalah · Ghunna · Tafkheem · Madd</p>
          </div>
          <button onClick={() => { const next = !tajweedMode; setTajweedMode(next); saveTajweedMode(next); }}
            style={{ width: "44px", height: "24px", borderRadius: "12px", background: tajweedMode ? "#9b59b6" : "rgba(201,168,76,0.2)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: tajweedMode ? "23px" : "3px", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
          </button>
        </div>

        {/* Font size slider */}
        <div style={{ padding: "0.7rem 0.9rem", background: paperMode ? "rgba(139,94,32,0.05)" : "rgba(201,168,76,0.05)", borderRadius: "10px", border: `1px solid ${cardBorder}`, marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: goldColor }}>🔤 Arabic Font Size</p>
            <span style={{ fontFamily: "'Amiri', serif", fontSize: `${arabicFontSize}rem`, color: goldColor, lineHeight: 1 }}>ب</span>
          </div>
          <input type="range" min="0.9" max="2.0" step="0.1" value={arabicFontSize}
            onChange={e => { const v = parseFloat(e.target.value); setArabicFontSize(v); saveFontSize(v); }}
            style={{ width: "100%", accentColor: "#c9a84c", cursor: "pointer" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: goldFaint, marginTop: "0.2rem" }}>
            <span>Small</span><span>Default</span><span>Large</span>
          </div>
        </div>

        <div style={{ height: "1px", background: cardBorder, margin: "0 0 1rem" }} />

        {/* Data */}
        <h3 style={{ fontSize: "0.9rem", color: goldColor, margin: "0 0 0.5rem" }}>Data</h3>
        <p style={{ fontSize: "0.8rem", color: goldFaint, margin: "0 0 0.5rem" }}>{duas.length} duas saved locally</p>
        <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={() => { const blob = new Blob([JSON.stringify(duas, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "daily-dua-backup.json"; a.click(); }}
            style={{ ...btnStyle, padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Export Backup</button>
          <button onClick={() => importRef.current?.click()}
            style={{ ...btnStyle, padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Import Backup</button>
          <button onClick={() => { if (confirm("Clear ALL duas? This cannot be undone.")) { setDuas([]); saveDuas([]); } }}
            style={{ ...btnStyle, padding: "0.4rem 0.8rem", fontSize: "0.8rem", color: "rgba(200,100,100,0.6)", borderColor: "rgba(200,100,100,0.15)" }}>Clear All</button>
        </div>
      </div>
    </div>
  );
}
