import { useRef, useState } from "react";
import { CATEGORIES, MOODS } from "../constants";
import { T, FONT, card, chip, column, h1, iconButton, input, label, page, primaryButton, secondaryButton, segOption, segTrack } from "../theme/tokens";
import { BackIcon } from "../library/icons";
import { needsHarakat } from "../library/duaUtils";

const Spinner = ({ size = 16 }) => (
  <span
    aria-hidden="true"
    style={{ width: size, height: size, border: `2px solid ${T.accentSoft}`, borderTopColor: T.accent, borderRadius: "50%", animation: "spin 0.9s linear infinite", display: "inline-block", flexShrink: 0 }}
  />
);

const Notice = ({ tone = "info", title, children }) => (
  <div
    role={tone === "error" ? "alert" : "status"}
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
      padding: "12px 14px",
      borderRadius: "14px",
      background: tone === "error" ? T.dangerBg : T.accentTint,
      color: tone === "error" ? T.danger : T.text,
      fontSize: "13px",
    }}
  >
    {tone === "info" ? <Spinner /> : <span aria-hidden="true">⚠️</span>}
    <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {title && <strong style={{ fontWeight: 600 }}>{title}</strong>}
      <span style={{ color: tone === "error" ? T.danger : T.muted }}>{children}</span>
    </span>
  </div>
);

/** Add a dua (photo, screenshot, pasted text or typed) or edit one. */
export default function AddEditView({
  editIdx,
  title, setTitle, arabic, setArabic, translit, setTranslit, translation, setTrans,
  selectedCategory, setSelectedCategory,
  selectedMoods = [], setSelectedMoods,
  addMode, setAddMode,
  screenshot, setScreenshot,
  extracting, extractError,
  fileRef, handleScreenshot, handlePasteExtract, handleSave, onAddHarakat,
  onBack,
}) {
  const [pasteText, setPasteText] = useState("");
  const [fixing, setFixing] = useState(false);
  const [fixError, setFixError] = useState("");

  const fixHarakat = async () => {
    setFixing(true);
    setFixError("");
    try {
      await onAddHarakat(arabic);
    } catch (err) {
      setFixError(err.message || "Could not add harakat. Try again.");
    }
    setFixing(false);
  };
  const cameraRef = useRef(null);
  const editing = editIdx !== null;
  const canSave = arabic.trim() && !extracting;

  const pick = (ref) => {
    if (!ref.current) return;
    ref.current.value = "";
    ref.current.click();
  };

  const arabicInput = { ...input, fontFamily: "var(--arabic-font)", fontSize: "calc(20px * var(--arabic-scale))", direction: "rtl", textAlign: "right", lineHeight: 1.9 };

  return (
    <div style={page}>
      <div style={{ ...column, gap: "16px" }}>
        <header style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "8px" }}>
          <button type="button" aria-label="Back" onClick={onBack} style={iconButton}>
            <BackIcon />
          </button>
          <h1 style={{ ...h1, fontSize: "24px" }}>{editing ? "Edit dua" : "Add a dua"}</h1>
        </header>

        {!editing && (
          <>
            <div role="tablist" aria-label="How to add" style={segTrack(2)}>
              {[
                ["screenshot", "📷 Photo / screenshot"],
                ["paste", "📋 Paste text"],
              ].map(([id, text]) => (
                <button key={id} type="button" role="tab" aria-selected={addMode === id} onClick={() => setAddMode(id)} style={{ ...segOption(addMode === id), fontSize: "13px" }}>
                  {text}
                </button>
              ))}
            </div>

            {addMode === "screenshot" && (
              <section style={{ ...card, display: "flex", flexDirection: "column", gap: "12px" }}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleScreenshot} style={{ display: "none" }} />
                {/* capture="environment" opens the back camera directly on phones */}
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleScreenshot} style={{ display: "none" }} />

                {!screenshot ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px 8px", border: `1.5px dashed ${T.border}`, borderRadius: "18px", textAlign: "center" }}>
                    <span aria-hidden="true" style={{ width: "56px", height: "56px", borderRadius: "999px", background: T.accentTint, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                      📷
                    </span>
                    <span style={{ fontSize: "15px", fontWeight: 600 }}>Photo of a dua, or a screenshot</span>
                    <span style={{ fontSize: "13px", color: T.muted, maxWidth: "300px" }}>
                      Book, poster, wall or an Instagram / YouTube screenshot. AI reads the Arabic, transliteration and meaning.
                    </span>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
                      <button type="button" onClick={() => pick(cameraRef)} style={{ ...primaryButton(true), width: "auto", flex: "1 1 140px", height: "48px", fontSize: "15px" }}>
                        Take photo
                      </button>
                      <button type="button" onClick={() => pick(fileRef)} style={{ ...secondaryButton, flex: "1 1 140px" }}>
                        Choose image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ borderRadius: "16px", border: `1px solid ${T.border}`, overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", padding: "8px 12px", background: T.divider }}>
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>{extracting ? "Reading…" : "Your image"}</span>
                      <span style={{ display: "flex", gap: "6px" }}>
                        <button type="button" onClick={() => { setScreenshot(null); pick(fileRef); }} style={{ ...secondaryButton, height: "36px", padding: "0 12px", fontSize: "13px" }}>
                          Change
                        </button>
                        <button type="button" onClick={() => { setScreenshot(null); if (fileRef.current) fileRef.current.value = ""; }} style={{ ...secondaryButton, height: "36px", padding: "0 12px", fontSize: "13px", color: T.danger }}>
                          Remove
                        </button>
                      </span>
                    </div>
                    <img src={screenshot} alt="The dua you added" style={{ width: "100%", display: "block", objectFit: "contain", maxHeight: "300px", background: "#000" }} />
                  </div>
                )}

                {extracting && <Notice title="AI is reading your image…">Extracting Arabic, transliteration and meaning</Notice>}
                {extractError && <Notice tone="error">{extractError}</Notice>}
              </section>
            )}

            {addMode === "paste" && (
              <section style={{ ...card, display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ ...label, marginBottom: 0 }} htmlFor="paste-arabic">
                  Paste the Arabic dua
                </label>
                <textarea
                  id="paste-arabic"
                  rows={4}
                  placeholder="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  style={arabicInput}
                />
                <button type="button" disabled={!pasteText.trim() || extracting} onClick={() => handlePasteExtract(pasteText)} style={{ ...primaryButton(pasteText.trim() && !extracting), display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  {extracting ? (
                    <>
                      <Spinner /> Extracting…
                    </>
                  ) : (
                    "✨ Extract with AI"
                  )}
                </button>
                {extractError && <Notice tone="error">{extractError}</Notice>}
              </section>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: T.muted, fontSize: "12px", fontWeight: 600 }}>
              <span style={{ flex: 1, height: "1px", background: T.border }} />
              {screenshot || pasteText ? "Check and edit" : "Or type it yourself"}
              <span style={{ flex: 1, height: "1px", background: T.border }} />
            </div>
          </>
        )}

        <section style={{ ...card, display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={label} htmlFor="dua-title">Title</label>
            <input id="dua-title" type="text" placeholder="e.g. Dua before sleeping" value={title} onChange={(e) => setTitle(e.target.value)} style={input} />
          </div>
          <div>
            <label style={label} htmlFor="dua-arabic">Arabic</label>
            <textarea id="dua-arabic" rows={3} placeholder="بِسْمِ اللَّهِ" value={arabic} onChange={(e) => setArabic(e.target.value)} style={arabicInput} />
            <span style={{ fontSize: "12px", color: T.muted }}>Start a new line for each part of the dua</span>
            {needsHarakat(arabic) && !extracting && (
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px", padding: "12px", borderRadius: "14px", background: T.warmBg, color: T.warmText, fontSize: "13px" }}>
                <span>This Arabic is missing most of its harakat (zabar, zer, pesh, shadda, madd). Reading, tajweed and memorizing work best with full harakat.</span>
                <button type="button" onClick={fixHarakat} disabled={fixing} style={{ ...secondaryButton, height: "40px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: fixing ? 0.7 : 1 }}>
                  {fixing ? (
                    <>
                      <Spinner /> Adding harakat…
                    </>
                  ) : (
                    "✨ Add harakat with AI"
                  )}
                </button>
                {fixError && <span style={{ color: T.danger }}>{fixError}</span>}
              </div>
            )}
          </div>
          <div>
            <label style={label} htmlFor="dua-translit">Transliteration</label>
            <textarea id="dua-translit" rows={3} placeholder="Bismillahir Rahmanir Raheem" value={translit} onChange={(e) => setTranslit(e.target.value)} style={{ ...input, fontStyle: "italic" }} />
          </div>
          <div>
            <label style={label} htmlFor="dua-meaning">Meaning (Matlab)</label>
            <textarea id="dua-meaning" rows={3} placeholder="Allah ke naam se…" value={translation} onChange={(e) => setTrans(e.target.value)} style={input} />
          </div>
        </section>

        <section style={{ ...card, display: "flex", flexDirection: "column", gap: "10px" }}>
          <span style={{ ...label, marginBottom: 0 }}>Category</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {CATEGORIES.map((cat) => (
              <button key={cat.id} type="button" aria-pressed={selectedCategory === cat.id} onClick={() => setSelectedCategory(cat.id)} style={chip(selectedCategory === cat.id)}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: "12px", color: T.muted, fontFamily: FONT }}>AI picks one for you — change it if needed</span>
        </section>

        <section style={{ ...card, display: "flex", flexDirection: "column", gap: "10px" }}>
          <span style={{ ...label, marginBottom: 0 }}>When is this dua for?</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {MOODS.map((m) => {
              const on = selectedMoods.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelectedMoods(on ? selectedMoods.filter((x) => x !== m.id) : [...selectedMoods, m.id])}
                  style={chip(on)}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
          <span style={{ fontSize: "12px", color: T.muted, fontFamily: FONT }}>Shown under “How is your heart today?” in your Library. Pick any that fit.</span>
        </section>

        <button type="button" onClick={handleSave} disabled={!canSave} style={primaryButton(Boolean(canSave))}>
          {editing ? "Save changes" : "Save dua"}
        </button>
      </div>
    </div>
  );
}
