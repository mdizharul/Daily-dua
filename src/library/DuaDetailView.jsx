import { useEffect, useState } from "react";
import TajweedText from "../components/TajweedText";
import { FONT_SERIF, chip, column, iconBtn, page, tile } from "./theme";
import { RECALL_TARGET, categoryLabel, isLearnt, recitedToday, splitLines } from "./duaUtils";
import { BackIcon, CheckIcon, CopyIcon, EditIcon, Medallion, MemorizeIcon, ShareIcon, SpeakerIcon, StarPattern, TrashIcon } from "./icons";

const SIZES = [
  { value: 1.0, label: "S" },
  { value: 1.2, label: "M" },
  { value: 1.5, label: "L" },
];

/** One dua on its own page (mockup screen 3). */
export default function DuaDetailView({ L, dua, tajweed, fontSize, onFontSize, onBack, onEdit, onDelete, onRecite, onToggleLearnt, onMemorize, onShare }) {
  const [showTranslit, setShowTranslit] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Stop any reading-aloud when leaving the page.
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const aLines = splitLines(dua.arabic);
  const tLines = splitLines(dua.transliteration);
  const mLines = splitLines(dua.translation);
  const learnt = isLearnt(dua);
  const today = recitedToday(dua);

  // Short duas get big Arabic; long ones scale down so they still fit.
  const chars = dua.arabic.length;
  const base = chars < 40 ? 40 : chars < 90 ? 32 : 26;
  const arabicPx = Math.round(base * (fontSize / 1.2));
  const sizeIdx = SIZES.reduce((best, s, i) => (Math.abs(s.value - fontSize) < Math.abs(SIZES[best].value - fontSize) ? i : best), 0);

  const speak = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const utt = new SpeechSynthesisUtterance(dua.arabic);
    utt.lang = "ar-SA";
    const voice = synth.getVoices().find((v) => v.lang.startsWith("ar"));
    if (voice) utt.voice = voice;
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utt);
  };

  const copy = () => {
    const text = [dua.title, dua.arabic, dua.transliteration, dua.translation].filter(Boolean).join("\n\n");
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const label = { fontSize: "11px", fontWeight: 600, letterSpacing: "1.4px", textTransform: "uppercase", color: L.gold };

  return (
    <div style={page(L)}>
      <div style={column}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", paddingTop: "8px" }}>
          <button type="button" aria-label="Back to library" onClick={onBack} style={iconBtn(L)}>
            <BackIcon />
          </button>
          <span style={{ fontSize: "15px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>{dua.title}</span>
          <button type="button" aria-label="Edit dua" onClick={onEdit} style={iconBtn(L)}>
            <EditIcon />
          </button>
        </header>

        {/* Hero card */}
        <article style={{ position: "relative", overflow: "hidden", background: L.hero, color: L.heroText, borderRadius: "28px", padding: "28px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", textAlign: "center" }}>
          <StarPattern color={L.gold} />
          <span aria-hidden="true" style={{ position: "absolute", inset: "10px", border: `1px solid ${L.heroFrame}`, borderRadius: "20px", pointerEvents: "none" }} />
          <span style={{ position: "relative" }}>
            <Medallion color={L.gold} />
          </span>

          <div lang="ar" dir="rtl" style={{ position: "relative", display: "flex", flexDirection: "column", gap: "6px" }}>
            {aLines.map((line, i) => (
              <p key={i} style={{ margin: 0, fontFamily: "var(--arabic-font)", fontSize: `calc(${arabicPx}px * var(--arabic-scale))`, lineHeight: 1.6, fontWeight: 700 }}>
                {tajweed ? <TajweedText text={line} defaultColor={L.heroText} /> : line}
              </p>
            ))}
          </div>

          {showTranslit && tLines.length > 0 && (
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
              <span style={label}>Transliteration</span>
              {tLines.map((line, i) => (
                <p key={i} style={{ margin: 0, fontSize: "17px", fontStyle: "italic", lineHeight: 1.5, color: L.heroText }}>
                  {line}
                </p>
              ))}
            </div>
          )}

          {showTranslit && showMeaning && tLines.length > 0 && mLines.length > 0 && (
            <span aria-hidden="true" style={{ position: "relative", width: "64px", height: "1px", background: L.heroFrame }} />
          )}

          {showMeaning && mLines.length > 0 && (
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
              <span style={label}>Matlab</span>
              <p style={{ margin: 0, fontFamily: FONT_SERIF, fontSize: mLines.join(" ").length > 120 ? "17px" : "21px", lineHeight: 1.4, color: "#FFFFFF" }}>
                “{mLines.join(" ")}”
              </p>
            </div>
          )}

          <span style={{ position: "relative", fontSize: "13px", color: L.heroMuted }}>{categoryLabel(dua)}</span>
        </article>

        {/* What to show + listen + text size */}
        <div role="group" aria-label="Show on card" style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <button type="button" aria-pressed={showTranslit} onClick={() => setShowTranslit(!showTranslit)} style={chip(L, showTranslit)}>
            Transliteration
          </button>
          <button type="button" aria-pressed={showMeaning} onClick={() => setShowMeaning(!showMeaning)} style={chip(L, showMeaning)}>
            Matlab
          </button>
          {/* Listen + size stay together; on narrow phones they wrap as a pair */}
          <span style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
            <button type="button" aria-label={speaking ? "Stop" : "Listen"} onClick={speak} style={{ ...chip(L, speaking), width: "40px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SpeakerIcon playing={speaking} />
            </button>
            <button
              type="button"
              aria-label="Change Arabic text size"
              onClick={() => onFontSize(SIZES[(sizeIdx + 1) % SIZES.length].value)}
              style={{ ...chip(L, false), minWidth: "52px", fontWeight: 700 }}
            >
              Aa {SIZES[sizeIdx].label}
            </button>
          </span>
        </div>

        {/* Recited today */}
        <section style={{ background: L.card, border: `1px solid ${L.border}`, borderRadius: "20px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600 }}>Recited today</span>
            <span style={{ fontSize: "12px", color: L.muted }}>
              Tap after each recitation · {dua.reciteCount || 0} total
            </span>
          </span>
          <button
            type="button"
            onClick={onRecite}
            style={{ height: "44px", minWidth: "88px", padding: "0 14px", borderRadius: "14px", border: "none", background: L.primaryBg, color: L.primaryText, fontSize: "15px", fontWeight: 700, fontFamily: "var(--font-ui)", cursor: "pointer" }}
          >
            {today} ×
          </button>
        </section>

        {!learnt && (dua.recall || 0) > 0 && (
          <p style={{ margin: 0, fontSize: "12px", color: L.muted }}>
            Memorize progress: {dua.recall} of {RECALL_TARGET} correct recalls
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
          <button type="button" onClick={onMemorize} style={tile(L)}>
            <MemorizeIcon size={18} /> Memorize
          </button>
          <button type="button" aria-pressed={learnt} onClick={onToggleLearnt} style={{ ...tile(L), ...(learnt ? { background: L.greenBg, borderColor: L.green, color: L.green } : null) }}>
            <CheckIcon /> {learnt ? "Learnt" : "Mark learnt"}
          </button>
          <button type="button" onClick={onShare} style={{ ...tile(L), background: L.gold, border: "none", color: "#131A2E", fontWeight: 700 }}>
            <ShareIcon /> Share card
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "24px", paddingTop: "4px" }}>
          <button type="button" onClick={copy} style={{ display: "flex", alignItems: "center", gap: "6px", minHeight: "44px", padding: "0 10px", background: "none", border: "none", color: L.muted, fontSize: "13px", fontWeight: 500, fontFamily: "var(--font-ui)", cursor: "pointer" }}>
            <CopyIcon /> {copied ? "Copied" : "Copy text"}
          </button>
          <button type="button" onClick={onDelete} style={{ display: "flex", alignItems: "center", gap: "6px", minHeight: "44px", padding: "0 10px", background: "none", border: "none", color: L.danger, fontSize: "13px", fontWeight: 500, fontFamily: "var(--font-ui)", cursor: "pointer" }}>
            <TrashIcon /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
