import { PRESET_TAGS } from "../constants";
import { Spinner } from "../components/icons";

export default function AddEditView({
  duas, setDuas, editIdx, setEditIdx,
  title, setTitle, arabic, setArabic, translit, setTranslit, translation, setTrans,
  selectedTags, setSelectedTags,
  addMode, setAddMode,
  screenshot, setScreenshot,
  extracting, extractError,
  fileRef, handleScreenshot, handleSave,
  resetForm, setView, paperMode,
}) {
  const goldColor  = paperMode ? "#7a4a00" : "#c9a84c";
  const goldFaint  = paperMode ? "rgba(122,74,0,0.5)" : "rgba(201,168,76,0.5)";
  const appColor   = paperMode ? "#2d1a00" : "#e8dcc8";
  const inputStyle = { width: "100%", padding: "0.8rem 1rem", background: paperMode ? "rgba(139,94,32,0.06)" : "rgba(201,168,76,0.05)", border: `1px solid ${paperMode ? "rgba(139,94,32,0.25)" : "rgba(201,168,76,0.2)"}`, borderRadius: "12px", color: appColor, fontSize: "0.95rem", fontFamily: "'Cormorant Garamond', serif", outline: "none", resize: "vertical", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontFamily: "'Cormorant Garamond', serif", fontSize: "0.82rem", fontWeight: 600, color: goldColor, marginBottom: "0.35rem", letterSpacing: "1px", textTransform: "uppercase" };
  const cardBg     = paperMode ? "linear-gradient(145deg, #faf6ec 0%, #f3ead5 100%)" : "linear-gradient(145deg, #1a2a1a 0%, #0f1f14 100%)";
  const cardBorder = paperMode ? "rgba(139,94,32,0.25)" : "rgba(201,168,76,0.2)";
  const btnStyle   = { background: paperMode ? "rgba(139,94,32,0.07)" : "rgba(201,168,76,0.08)", border: `1px solid ${paperMode ? "rgba(139,94,32,0.18)" : "rgba(201,168,76,0.15)"}`, borderRadius: "8px", padding: "0.22rem 0.55rem", color: paperMode ? "rgba(90,51,0,0.55)" : "rgba(201,168,76,0.55)", cursor: "pointer", fontSize: "0.7rem", fontFamily: "'Cormorant Garamond', serif" };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <button onClick={() => { resetForm(); setEditIdx(null); setView("home"); }} style={{ background: "none", border: "none", color: goldColor, cursor: "pointer", fontSize: "0.9rem", fontFamily: "'Cormorant Garamond', serif", padding: "0.5rem 0", marginBottom: "1rem" }}>
        ← Back
      </button>
      <div style={{ background: cardBg, borderRadius: "20px", border: `1px solid ${cardBorder}`, padding: "1.3rem" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: goldColor, margin: "0 0 1rem" }}>
          {editIdx !== null ? "Edit Dua" : "Add New Dua"}
        </h2>

        {/* Screenshot / mode section */}
        {editIdx === null && (
          <>
            {/* Mode switcher */}
            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", padding: "0.25rem", background: paperMode ? "rgba(139,94,32,0.06)" : "rgba(201,168,76,0.05)", borderRadius: "30px", border: `1px solid ${cardBorder}` }}>
              {[{ id: "screenshot", icon: "📷", label: "Screenshot" }, { id: "manual", icon: "✍", label: "Type" }].map(({ id, icon, label }) => (
                <button key={id} onClick={() => setAddMode(id)}
                  style={{ flex: 1, padding: "0.4rem", background: addMode === id ? (paperMode ? "rgba(139,94,32,0.18)" : "rgba(201,168,76,0.18)") : "transparent", border: "none", borderRadius: "24px", color: addMode === id ? goldColor : goldFaint, cursor: "pointer", fontSize: "0.78rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: addMode === id ? 600 : 400, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", transition: "all 0.2s" }}>
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Screenshot upload */}
            {addMode === "screenshot" && (
              <div style={{ marginBottom: "1.2rem" }}>
                <label style={labelStyle}>Screenshot (auto-extracts dua)</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleScreenshot} style={{ display: "none" }} />

                {!screenshot ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "1.8rem 1rem", background: paperMode ? "rgba(139,94,32,0.04)" : "rgba(201,168,76,0.04)", border: `1.5px dashed ${paperMode ? "rgba(139,94,32,0.25)" : "rgba(201,168,76,0.25)"}`, borderRadius: "18px" }}>
                    {/* Upload icon circle */}
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: paperMode ? "rgba(139,94,32,0.08)" : "rgba(201,168,76,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={goldColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: paperMode ? "rgba(90,51,0,0.6)" : "rgba(201,168,76,0.6)", textAlign: "center" }}>
                      Drop your screenshot here<br />
                      <span style={{ fontSize: "0.72rem", color: goldFaint }}>AI extracts Arabic, transliteration & translation</span>
                    </p>
                    <div style={{ display: "flex", gap: "0.6rem" }}>
                      <button type="button" onClick={() => setView("home")}
                        style={{ padding: "0.55rem 1.4rem", background: "transparent", border: `1.5px solid ${paperMode ? "rgba(139,94,32,0.3)" : "rgba(201,168,76,0.25)"}`, borderRadius: "50px", color: goldFaint, cursor: "pointer", fontSize: "0.9rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
                        Cancel
                      </button>
                      <button type="button" onClick={() => { if(fileRef.current) { fileRef.current.value = ""; fileRef.current.click(); } }}
                        style={{ padding: "0.55rem 1.6rem", background: "linear-gradient(135deg, #c9a84c 0%, #a8883a 100%)", border: "none", borderRadius: "50px", color: "#0a1a0e", cursor: "pointer", fontSize: "0.9rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, boxShadow: "0 3px 12px rgba(201,168,76,0.3)" }}>
                        Upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: paperMode ? "rgba(139,94,32,0.06)" : "rgba(0,0,0,0.3)", borderRadius: "14px", border: `1px solid ${cardBorder}`, overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.8rem", background: paperMode ? "rgba(139,94,32,0.08)" : "rgba(201,168,76,0.08)", borderBottom: `1px solid ${cardBorder}` }}>
                      <span style={{ fontSize: "0.78rem", color: goldColor, fontWeight: 600 }}>{extracting ? "🔍 Extracting..." : "📷 Reference"}</span>
                      <div style={{ display: "flex", gap: "0.3rem" }}>
                        <button onClick={() => { setScreenshot(null); if(fileRef.current) { fileRef.current.value=""; fileRef.current.click(); } }} style={btnStyle}>Re-upload</button>
                        <button onClick={() => { setScreenshot(null); if(fileRef.current) fileRef.current.value=""; }} style={{ ...btnStyle, color: "rgba(200,100,100,0.6)" }}>Remove</button>
                      </div>
                    </div>
                    <img src={screenshot} alt="Dua" style={{ width: "100%", display: "block", objectFit: "contain", maxHeight: "300px", background: "#000" }} />
                  </div>
                )}

                {extracting && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem", marginTop: "0.6rem", background: paperMode ? "rgba(139,94,32,0.06)" : "rgba(201,168,76,0.06)", borderRadius: "10px", border: `1px solid ${cardBorder}` }}>
                    <Spinner size={16} inline />
                    <div>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: goldColor }}>AI is reading your screenshot...</p>
                      <p style={{ margin: "0.1rem 0 0", fontSize: "0.72rem", color: goldFaint }}>Extracting Arabic, transliteration & translation</p>
                    </div>
                  </div>
                )}
                {extractError && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.75rem", marginTop: "0.6rem", background: "rgba(220,60,60,0.08)", borderRadius: "10px", border: "1px solid rgba(220,60,60,0.2)" }}>
                    <span style={{ fontSize: "1rem", flexShrink: 0 }}>⚠️</span>
                    <p style={{ fontSize: "0.82rem", color: "#e88", margin: 0 }}>{extractError}</p>
                  </div>
                )}
              </div>
            )}

            {editIdx === null && addMode === "screenshot" && !screenshot && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", margin: "0.3rem 0 1rem" }}>
                <div style={{ flex: 1, height: "1px", background: cardBorder }} />
                <span style={{ fontSize: "0.72rem", color: goldFaint, letterSpacing: "2px" }}>OR TYPE MANUALLY</span>
                <div style={{ flex: 1, height: "1px", background: cardBorder }} />
              </div>
            )}
          </>
        )}

        <div style={{ marginBottom: "0.9rem" }}>
          <label style={labelStyle}>Title</label>
          <input type="text" placeholder="e.g. Dua Before Sleeping" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: "0.9rem" }}>
          <label style={labelStyle}>Arabic Text</label>
          <textarea rows={3} placeholder="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" value={arabic} onChange={(e) => setArabic(e.target.value)}
            style={{ ...inputStyle, fontFamily: "'Amiri', serif", fontSize: "1.25rem", direction: "rtl", textAlign: "right", lineHeight: 2 }} />
          <span style={{ fontSize: "0.7rem", color: goldFaint, display: "block", marginTop: "0.2rem" }}>Use new lines to separate sections</span>
        </div>
        <div style={{ marginBottom: "0.9rem" }}>
          <label style={labelStyle}>Transliteration (Roman Urdu)</label>
          <textarea rows={3} placeholder="Bismillahir Rahmanir Raheem" value={translit} onChange={(e) => setTranslit(e.target.value)} style={{ ...inputStyle, fontStyle: "italic" }} />
        </div>
        <div style={{ marginBottom: "1.2rem" }}>
          <label style={labelStyle}>Translation (Roman Urdu)</label>
          <textarea rows={3} placeholder="Allah ke naam se jo bara meherbaan hai" value={translation} onChange={(e) => setTrans(e.target.value)} style={inputStyle} />
        </div>

        {/* Tags */}
        <div style={{ marginBottom: "1.2rem" }}>
          <label style={labelStyle}>Tags</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {PRESET_TAGS.map(tag => {
              const active = selectedTags.includes(tag);
              return (
                <button key={tag} type="button" onClick={() => setSelectedTags(prev => active ? prev.filter(t => t !== tag) : [...prev, tag])}
                  style={{ background: active ? (paperMode ? "rgba(139,94,32,0.18)" : "rgba(201,168,76,0.18)") : "transparent", border: `1px solid ${active ? goldColor : cardBorder}`, borderRadius: "20px", padding: "0.25rem 0.75rem", color: active ? goldColor : goldFaint, cursor: "pointer", fontSize: "0.78rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: active ? 600 : 400, transition: "all 0.15s" }}>
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={handleSave} disabled={!arabic.trim() || extracting}
          style={{ width: "100%", padding: "0.9rem", background: arabic.trim() && !extracting ? "linear-gradient(135deg, #c9a84c 0%, #a8883a 100%)" : paperMode ? "rgba(139,94,32,0.1)" : "rgba(201,168,76,0.12)", border: "none", borderRadius: "50px", color: arabic.trim() && !extracting ? "#0a1a0e" : goldFaint, cursor: arabic.trim() && !extracting ? "pointer" : "not-allowed", fontSize: "1rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", boxShadow: arabic.trim() && !extracting ? "0 4px 18px rgba(201,168,76,0.3)" : "none" }}>
          {editIdx !== null ? "Update Dua" : "Save Dua"}
        </button>
      </div>
    </div>
  );
}
