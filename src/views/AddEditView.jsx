import { useState } from "react";
import { CATEGORIES, CATEGORY_MAP } from "../constants";
import { Spinner } from "../components/icons";

export default function AddEditView({
  duas, setDuas, editIdx, setEditIdx,
  title, setTitle, arabic, setArabic, translit, setTranslit, translation, setTrans,
  selectedCategory, setSelectedCategory,
  addMode, setAddMode,
  screenshot, setScreenshot,
  extracting, extractError,
  fileRef, handleScreenshot, handlePasteExtract, handleSave,
  resetForm, setView, T, themeMode,
}) {
  const [pasteText, setPasteText] = useState("");

  const inputStyle = { width: "100%", padding: "0.8rem 1rem", background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: "12px", color: T.appColor, fontSize: "0.95rem", fontFamily: "'Cormorant Garamond', serif", outline: "none", resize: "vertical", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontFamily: "'Cormorant Garamond', serif", fontSize: "0.82rem", fontWeight: 600, color: T.gold, marginBottom: "0.35rem", letterSpacing: "1px", textTransform: "uppercase" };
  const btnStyle   = { background: T.btnBg, border: `1px solid ${T.btnBorder}`, borderRadius: "8px", padding: "0.22rem 0.55rem", color: T.btnText, cursor: "pointer", fontSize: "0.7rem", fontFamily: "'Cormorant Garamond', serif" };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <div style={{ background: T.cardBg, borderRadius: "20px", border: `1px solid ${T.cardBorder}`, padding: "1.3rem" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: T.gold, margin: "0 0 1rem" }}>
          {editIdx !== null ? "Edit Dua" : "Add New Dua"}
        </h2>

        {/* Screenshot / mode section */}
        {editIdx === null && (
          <>
            {/* Mode switcher — 2 tabs: Screenshot + Paste */}
            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", padding: "0.25rem", background: T.inputBg, borderRadius: "30px", border: `1px solid ${T.cardBorder}` }}>
              {[{ id: "screenshot", icon: "📷", label: "Screenshot" }, { id: "paste", icon: "📋", label: "Paste" }].map(({ id, icon, label }) => (
                <button key={id} onClick={() => setAddMode(id)}
                  style={{ flex: 1, padding: "0.4rem", background: addMode === id ? T.btnBg : "transparent", border: "none", borderRadius: "24px", color: addMode === id ? T.gold : T.goldFaint, cursor: "pointer", fontSize: "0.78rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: addMode === id ? 600 : 400, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", transition: "all 0.2s" }}>
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
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "1.8rem 1rem", background: T.inputBg, border: `1.5px dashed ${T.inputBorder}`, borderRadius: "18px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: T.btnBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: T.goldFaint, textAlign: "center" }}>
                      Drop your screenshot here<br />
                      <span style={{ fontSize: "0.72rem" }}>AI extracts Arabic, transliteration & translation</span>
                    </p>
                    <div style={{ display: "flex", gap: "0.6rem" }}>
                      <button type="button" onClick={() => setView("home")}
                        style={{ padding: "0.55rem 1.4rem", background: "transparent", border: `1.5px solid ${T.cardBorder}`, borderRadius: "50px", color: T.goldFaint, cursor: "pointer", fontSize: "0.9rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
                        Cancel
                      </button>
                      <button type="button" onClick={() => { if(fileRef.current) { fileRef.current.value = ""; fileRef.current.click(); } }}
                        style={{ padding: "0.55rem 1.6rem", background: T.ctaBg, border: "none", borderRadius: "50px", color: T.ctaColor, cursor: "pointer", fontSize: "0.9rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, boxShadow: T.ctaShadow }}>
                        Upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: themeMode === "dark" ? "rgba(0,0,0,0.3)" : T.inputBg, borderRadius: "14px", border: `1px solid ${T.cardBorder}`, overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.8rem", background: T.btnBg, borderBottom: `1px solid ${T.cardBorder}` }}>
                      <span style={{ fontSize: "0.78rem", color: T.gold, fontWeight: 600 }}>{extracting ? "🔍 Extracting..." : "📷 Reference"}</span>
                      <div style={{ display: "flex", gap: "0.3rem" }}>
                        <button onClick={() => { setScreenshot(null); if(fileRef.current) { fileRef.current.value=""; fileRef.current.click(); } }} style={btnStyle}>Re-upload</button>
                        <button onClick={() => { setScreenshot(null); if(fileRef.current) fileRef.current.value=""; }} style={{ ...btnStyle, color: "rgba(200,100,100,0.6)" }}>Remove</button>
                      </div>
                    </div>
                    <img src={screenshot} alt="Dua" style={{ width: "100%", display: "block", objectFit: "contain", maxHeight: "300px", background: "#000" }} />
                  </div>
                )}

                {extracting && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem", marginTop: "0.6rem", background: T.inputBg, borderRadius: "10px", border: `1px solid ${T.cardBorder}` }}>
                    <Spinner size={16} inline />
                    <div>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: T.gold }}>AI is reading your screenshot...</p>
                      <p style={{ margin: "0.1rem 0 0", fontSize: "0.72rem", color: T.goldFaint }}>Extracting Arabic, transliteration & translation</p>
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

            {/* Paste mode */}
            {addMode === "paste" && (
              <div style={{ marginBottom: "1.2rem" }}>
                <label style={labelStyle}>Paste Arabic Dua Text</label>
                <textarea rows={4} placeholder={"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nPaste your Arabic dua here — AI will extract title, transliteration & translation"} value={pasteText} onChange={(e) => setPasteText(e.target.value)}
                  style={{ ...inputStyle, fontFamily: "'Amiri', serif", fontSize: "1.15rem", direction: "rtl", textAlign: "right", lineHeight: 2 }} />
                <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.8rem" }}>
                  <button type="button" onClick={() => { setPasteText(""); setView("home"); }}
                    style={{ flex: 1, padding: "0.55rem 1.4rem", background: "transparent", border: `1.5px solid ${T.cardBorder}`, borderRadius: "50px", color: T.goldFaint, cursor: "pointer", fontSize: "0.9rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
                    Cancel
                  </button>
                  <button type="button" disabled={!pasteText.trim() || extracting} onClick={() => handlePasteExtract(pasteText)}
                    style={{ flex: 1, padding: "0.55rem 1.6rem", background: pasteText.trim() && !extracting ? T.ctaBg : T.btnBg, border: "none", borderRadius: "50px", color: pasteText.trim() && !extracting ? T.ctaColor : T.goldFaint, cursor: pasteText.trim() && !extracting ? "pointer" : "not-allowed", fontSize: "0.9rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, boxShadow: pasteText.trim() && !extracting ? T.ctaShadow : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                    {extracting ? <><Spinner size={14} inline /> Extracting...</> : "✨ Extract with AI"}
                  </button>
                </div>
                {extracting && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem", marginTop: "0.6rem", background: T.inputBg, borderRadius: "10px", border: `1px solid ${T.cardBorder}` }}>
                    <Spinner size={16} inline />
                    <div>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: T.gold }}>AI is analyzing your dua...</p>
                      <p style={{ margin: "0.1rem 0 0", fontSize: "0.72rem", color: T.goldFaint }}>Generating title, transliteration & translation</p>
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
                <div style={{ flex: 1, height: "1px", background: T.cardBorder }} />
                <span style={{ fontSize: "0.72rem", color: T.goldFaint, letterSpacing: "2px" }}>OR FILL MANUALLY</span>
                <div style={{ flex: 1, height: "1px", background: T.cardBorder }} />
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
          <span style={{ fontSize: "0.7rem", color: T.goldFaint, display: "block", marginTop: "0.2rem" }}>Use new lines to separate sections</span>
        </div>
        <div style={{ marginBottom: "0.9rem" }}>
          <label style={labelStyle}>Transliteration (Roman Urdu)</label>
          <textarea rows={3} placeholder="Bismillahir Rahmanir Raheem" value={translit} onChange={(e) => setTranslit(e.target.value)} style={{ ...inputStyle, fontStyle: "italic" }} />
        </div>
        <div style={{ marginBottom: "1.2rem" }}>
          <label style={labelStyle}>Translation (Roman Urdu)</label>
          <textarea rows={3} placeholder="Allah ke naam se jo bara meherbaan hai" value={translation} onChange={(e) => setTrans(e.target.value)} style={inputStyle} />
        </div>

        {/* Category picker */}
        <div style={{ marginBottom: "1.2rem" }}>
          <label style={labelStyle}>Category</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat.id;
              return (
                <button key={cat.id} type="button" onClick={() => setSelectedCategory(cat.id)}
                  style={{ background: active ? T.btnBg : "transparent", border: `1px solid ${active ? T.gold : T.cardBorder}`, borderRadius: "20px", padding: "0.25rem 0.75rem", color: active ? T.gold : T.goldFaint, cursor: "pointer", fontSize: "0.78rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: active ? 600 : 400, transition: "all 0.15s", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <span style={{ fontSize: "0.75rem" }}>{cat.icon}</span> {cat.label}
                </button>
              );
            })}
          </div>
          <span style={{ fontSize: "0.65rem", color: T.goldFaint, display: "block", marginTop: "0.3rem" }}>
            AI auto-selects category — you can change it here
          </span>
        </div>

        <button onClick={handleSave} disabled={!arabic.trim() || extracting}
          style={{ width: "100%", padding: "0.9rem", background: arabic.trim() && !extracting ? T.ctaBg : T.btnBg, border: "none", borderRadius: "50px", color: arabic.trim() && !extracting ? T.ctaColor : T.goldFaint, cursor: arabic.trim() && !extracting ? "pointer" : "not-allowed", fontSize: "1rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", boxShadow: arabic.trim() && !extracting ? T.ctaShadow : "none" }}>
          {editIdx !== null ? "Update Dua" : "Save Dua"}
        </button>
      </div>
    </div>
  );
}
