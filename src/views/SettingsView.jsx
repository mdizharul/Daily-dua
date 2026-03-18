import { saveTajweedMode, saveFontSize, saveDuas, saveScriptMode } from "../storage";

export default function SettingsView({
  duas, setDuas, themeMode, setThemeMode, tajweedMode, setTajweedMode,
  arabicFontSize, setArabicFontSize, scriptMode, setScriptMode,
  setView, importRef, handleImport, T,
}) {
  const btnStyle = { background: T.btnBg, border: `1px solid ${T.btnBorder}`, borderRadius: "8px", padding: "0.22rem 0.55rem", color: T.btnText, cursor: "pointer", fontSize: "0.7rem", fontFamily: "'Cormorant Garamond', serif" };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <div style={{ background: T.cardBg, borderRadius: "20px", border: `1px solid ${T.cardBorder}`, padding: "1.3rem" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: T.gold, margin: "0 0 1rem" }}>Settings</h2>

        {/* Script toggle */}
        <div style={{ padding: "0.7rem 0.9rem", background: T.inputBg, borderRadius: "10px", border: `1px solid ${T.cardBorder}`, marginBottom: "1rem" }}>
          <p style={{ margin: "0 0 0.4rem", fontSize: "0.9rem", fontWeight: 600, color: T.gold }}>📜 Arabic Script</p>
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.72rem", color: T.goldFaint }}>Choose the Arabic font style for your duas</p>
          <div style={{ display: "flex", gap: "0.4rem", padding: "0.2rem", background: T.btnBg, borderRadius: "24px" }}>
            {[
              { id: "indopak", label: "Indo-Pak", desc: "Default for subcontinent" },
              { id: "uthmani", label: "Uthmani", desc: "Medina Mushaf style" },
            ].map(({ id, label }) => {
              const active = scriptMode === id;
              return (
                <button key={id} onClick={() => setScriptMode(id)}
                  style={{ flex: 1, padding: "0.4rem 0.6rem", background: active ? T.cardBg : "transparent", border: active ? `1px solid ${T.gold}` : "1px solid transparent", borderRadius: "20px", color: active ? T.gold : T.goldFaint, cursor: "pointer", fontSize: "0.78rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: active ? 600 : 400, transition: "all 0.2s" }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tajweed mode toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.7rem 0.9rem", background: tajweedMode ? "rgba(155,89,182,0.07)" : T.inputBg, borderRadius: "10px", border: `1px solid ${tajweedMode ? "rgba(155,89,182,0.25)" : T.cardBorder}`, marginBottom: "1rem" }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: tajweedMode ? "#9b59b6" : T.gold }}>🎨 Tajweed Markers</p>
            <p style={{ margin: "0.1rem 0 0", fontSize: "0.72rem", color: T.goldFaint }}>Subtle underlines: Ghunna · Qalqalah · Madd</p>
          </div>
          <button onClick={() => { const next = !tajweedMode; setTajweedMode(next); saveTajweedMode(next); }}
            style={{ width: "44px", height: "24px", borderRadius: "12px", background: tajweedMode ? "#9b59b6" : T.btnBg, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: tajweedMode ? "23px" : "3px", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
          </button>
        </div>

        {/* Font size slider */}
        <div style={{ padding: "0.7rem 0.9rem", background: T.inputBg, borderRadius: "10px", border: `1px solid ${T.cardBorder}`, marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: T.gold }}>🔤 Arabic Font Size</p>
            <span style={{ fontFamily: "'Amiri', serif", fontSize: `${arabicFontSize}rem`, color: T.gold, lineHeight: 1 }}>ب</span>
          </div>
          <input type="range" min="0.9" max="2.0" step="0.1" value={arabicFontSize}
            onChange={e => { const v = parseFloat(e.target.value); setArabicFontSize(v); saveFontSize(v); }}
            style={{ width: "100%", accentColor: T.gold, cursor: "pointer" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: T.goldFaint, marginTop: "0.2rem" }}>
            <span>Small</span><span>Default</span><span>Large</span>
          </div>
        </div>

        <div style={{ height: "1px", background: T.cardBorder, margin: "0 0 1rem" }} />

        {/* Data */}
        <h3 style={{ fontSize: "0.9rem", color: T.gold, margin: "0 0 0.5rem" }}>Data</h3>
        <p style={{ fontSize: "0.8rem", color: T.goldFaint, margin: "0 0 0.5rem" }}>{duas.length} duas saved locally</p>
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
