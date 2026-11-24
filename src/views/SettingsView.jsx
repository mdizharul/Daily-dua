import { saveTajweedMode, saveFontSize, saveDuas } from "../services/storage";
import { TAJWEED_LEGEND } from "../utils/tajweed";
import { T, FONT, card, column, h1, h2, iconButton, page, secondaryButton, segOption, segTrack } from "../theme/tokens";
import { BackIcon } from "../library/icons";
import { useState } from "react";
import { LANGS, setLang, useLang } from "../hooks/useLang";

const Row = ({ title, hint, children, last }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: last ? "none" : `1px solid ${T.divider}` }}>
    <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <span style={{ fontSize: "14px", fontWeight: 600 }}>{title}</span>
      {hint && <span style={{ fontSize: "12px", color: T.muted }}>{hint}</span>}
    </span>
    {children}
  </div>
);

const Switch = ({ on, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={() => onChange(!on)}
    style={{ width: "50px", height: "30px", borderRadius: "999px", background: on ? T.accent : T.radioOff, border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}
  >
    <span style={{ position: "absolute", top: "3px", left: on ? "23px" : "3px", width: "24px", height: "24px", borderRadius: "999px", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)", transition: "left 0.2s" }} />
  </button>
);

export default function SettingsView({
  duas, setDuas, tajweedMode, setTajweedMode,
  arabicFontSize, setArabicFontSize, scriptMode, setScriptMode,
  themeMode, setThemeMode, missingLanguageCount = 0, onFillMissingLanguage,
  importRef, handleImport, onBack,
}) {
  const lang = useLang();
  const [filling, setFilling] = useState(null); // { done, total } while running
  const [fillResult, setFillResult] = useState("");
  const fillMissing = async () => {
    setFillResult("");
    setFilling({ done: 0, total: missingLanguageCount });
    const { total, failed } = await onFillMissingLanguage((done, all) => setFilling({ done, total: all }));
    setFilling(null);
    setFillResult(failed ? `Filled ${total - failed} of ${total}. ${failed} couldn't be done — try again later.` : `Done — ${total} ${total === 1 ? "dua" : "duas"} updated.`);
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(duas, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "daily-dua-backup.json";
    a.click();
  };

  return (
    <div style={page}>
      <div style={{ ...column, gap: "16px" }}>
        <header style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "8px" }}>
          <button type="button" aria-label="Back" onClick={onBack} style={iconButton}>
            <BackIcon />
          </button>
          <h1 style={{ ...h1, fontSize: "24px" }}>Settings</h1>
        </header>

        <section style={{ ...card, display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={h2}>Appearance</h2>
          <div role="radiogroup" aria-label="Appearance" style={segTrack(2)}>
            {[
              ["day", "☀ Day"],
              ["night", "☾ Night"],
            ].map(([id, text]) => (
              <button key={id} type="button" role="radio" aria-checked={themeMode === id} onClick={() => setThemeMode(id)} style={segOption(themeMode === id)}>
                {text}
              </button>
            ))}
          </div>
        </section>

        <section style={{ ...card, display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={h2}>Language</h2>
          <span style={{ fontSize: "13px", color: T.muted, marginTop: "-6px" }}>For dua titles and meanings. Buttons stay in English.</span>
          <div role="radiogroup" aria-label="Language" style={segTrack(2)}>
            {LANGS.map(([id, text]) => (
              <button key={id} type="button" role="radio" aria-checked={lang === id} onClick={() => setLang(id)} style={segOption(lang === id)}>
                {text}
              </button>
            ))}
          </div>
          {(missingLanguageCount > 0 || filling || fillResult) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px", borderRadius: "14px", background: T.accentTint, fontSize: "13px" }}>
              {missingLanguageCount > 0 && !filling && (
                <span>
                  {missingLanguageCount} {missingLanguageCount === 1 ? "dua is" : "duas are"} missing a Roman Hindi title or a meaning in one of the languages.
                </span>
              )}
              {filling ? (
                <span role="status">
                  Filling {filling.done} of {filling.total}…
                </span>
              ) : (
                missingLanguageCount > 0 && (
                  <button type="button" onClick={fillMissing} style={{ ...secondaryButton, height: "40px" }}>
                    ✨ Fill missing with AI
                  </button>
                )
              )}
              {fillResult && <span role="status" style={{ color: T.accent, fontWeight: 600 }}>{fillResult}</span>}
            </div>
          )}
        </section>

        <section style={{ ...card, display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={h2}>Arabic</h2>
          <div>
            <span style={{ fontSize: "13px", color: T.muted }}>Script style</span>
            <div role="radiogroup" aria-label="Arabic script" style={{ ...segTrack(2), marginTop: "6px" }}>
              {[
                ["indopak", "Indo-Pak"],
                ["uthmani", "Uthmani"],
              ].map(([id, text]) => (
                <button key={id} type="button" role="radio" aria-checked={scriptMode === id} onClick={() => setScriptMode(id)} style={segOption(scriptMode === id)}>
                  {text}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: T.muted }}>Text size</span>
              <span lang="ar" style={{ fontFamily: "var(--arabic-font)", fontSize: `calc(${arabicFontSize}rem * var(--arabic-scale))`, color: T.accent, lineHeight: 1 }}>
                بِسْمِ
              </span>
            </div>
            <input
              type="range"
              min="0.9"
              max="2.0"
              step="0.1"
              aria-label="Arabic text size"
              value={arabicFontSize}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setArabicFontSize(v);
                saveFontSize(v);
              }}
              style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer", height: "32px" }}
            />
          </div>

          <div style={{ borderTop: `1px solid ${T.divider}` }}>
            <Row title="Tajweed markers" hint="Subtle underlines on key letters">
              <Switch
                label="Tajweed markers"
                on={tajweedMode}
                onChange={(next) => {
                  setTajweedMode(next);
                  saveTajweedMode(next);
                }}
              />
            </Row>
            {tajweedMode && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", paddingTop: "4px" }}>
                {TAJWEED_LEGEND.map(({ label: name, color, desc }) => (
                  <span key={name} style={{ fontSize: "12px", color, display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                    <span lang="ar" style={{ fontFamily: "var(--arabic-font)", fontSize: "calc(15px * var(--arabic-scale))" }}>{desc}</span>
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section style={{ ...card, display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={h2}>Your data</h2>
          <span style={{ fontSize: "13px", color: T.muted }}>
            {duas.length} {duas.length === 1 ? "dua" : "duas"} saved on this device. Back up before changing phones.
          </span>
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button type="button" onClick={exportBackup} style={secondaryButton}>
              Export backup
            </button>
            <button type="button" onClick={() => importRef.current?.click()} style={secondaryButton}>
              Import backup
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm("Delete ALL duas on this device? This cannot be undone.")) {
                setDuas([]);
                saveDuas([]);
              }
            }}
            style={{ ...secondaryButton, color: T.danger, borderColor: T.danger, fontFamily: FONT }}
          >
            Delete all duas
          </button>
        </section>
      </div>
    </div>
  );
}
