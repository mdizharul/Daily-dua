import { useCallback, useEffect, useMemo, useState } from "react";
import ShareSheet from "./ShareSheet";
import TajweedText from "../components/TajweedText";
import { FONT_SERIF, chip, column, iconBtn, page, tile } from "./theme";
import { RECALL_TARGET, categoryLabel, duaMoods, isLearnt, needsHarakat, recitedToday, splitLines } from "./duaUtils";
import { MOODS } from "../constants";
import { BackIcon, CheckIcon, CopyIcon, EditIcon, Medallion, MemorizeIcon, ShareIcon, SpeakerIcon, StarPattern, TrashIcon } from "./icons";

const SIZES = [
  { value: 1.0, label: "S" },
  { value: 1.2, label: "M" },
  { value: 1.5, label: "L" },
];

/** One dua on its own page (mockup screen 3). */
const SHOW_KEY = "card-show";
const loadShow = () => {
  try {
    return { translit: true, matlab: true, english: false, ...JSON.parse(localStorage.getItem(SHOW_KEY) || "{}") };
  } catch {
    return { translit: true, matlab: true, english: false };
  }
};

// Duas longer than this start collapsed, with a "Show full dua" button.
const isLongDua = (dua) =>
  splitLines(dua.arabic).length > 3 || dua.arabic.length > 160 || (dua.transliteration || "").length + (dua.translation || "").length > 420;

export default function DuaDetailView({ L, dua, tajweed, fontSize, onFontSize, onBack, onEdit, onDelete, onRecite, onToggleLearnt, onToggleRoutine, onMemorize }) {
  // Which parts the card shows — remembered across duas and used for the share card too.
  const [show, setShowState] = useState(loadShow);
  const setShow = (patch) =>
    setShowState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(SHOW_KEY, JSON.stringify(next));
      } catch {
        // storage blocked
      }
      return next;
    });
  const showTranslit = show.translit;
  const showMeaning = show.matlab;
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const closeShare = useCallback(() => setSharing(false), []);
  const long = isLongDua(dua);
  const collapsed = long && !expanded;

  // Stop any reading-aloud when leaving the page.
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const aLines = splitLines(dua.arabic);
  const tLines = splitLines(dua.transliteration);
  const mLines = splitLines(dua.translation);
  const eLines = splitLines(dua.translationEn);
  const showEnglish = show.english && eLines.length > 0;
  const shareShow = useMemo(() => ({ translit: showTranslit, matlab: showMeaning, english: showEnglish }), [showTranslit, showMeaning, showEnglish]);
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
          {/* Full title, wrapping onto more lines instead of being cut off with "…" */}
          <h1 style={{ margin: 0, flex: 1, fontSize: "16px", fontWeight: 600, lineHeight: 1.3, textAlign: "center", overflowWrap: "anywhere" }}>{dua.title}</h1>
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

          {/* Long duas are clipped with a fade until "Show full dua" is tapped */}
          <div
            id="dua-text"
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              width: "100%",
              maxHeight: collapsed ? "300px" : "none",
              overflow: "hidden",
              WebkitMaskImage: collapsed ? "linear-gradient(to bottom, #000 70%, transparent)" : "none",
              maskImage: collapsed ? "linear-gradient(to bottom, #000 70%, transparent)" : "none",
            }}
          >
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
                <p key={i} style={{ margin: 0, fontSize: "15px", fontStyle: "italic", lineHeight: 1.55, color: L.heroText }}>
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
              <p style={{ margin: 0, fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: mLines.join(" ").length > 120 ? "14px" : "15px", lineHeight: 1.55, color: L.heroText }}>
                “{mLines.join(" ")}”
              </p>
            </div>
          )}

          {showEnglish && (
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
              <span style={label}>English</span>
              <p style={{ margin: 0, fontFamily: "var(--font-ui)", fontWeight: 400, fontSize: "14px", lineHeight: 1.55, color: L.heroMuted }}>
                “{eLines.join(" ")}”
              </p>
            </div>
          )}

          </div>

          {long && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls="dua-text"
              onClick={() => setExpanded(!expanded)}
              style={{ position: "relative", height: "40px", padding: "0 16px", borderRadius: "999px", border: `1px solid ${L.heroFrame}`, background: "rgba(255,255,255,0.08)", color: L.heroText, fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-ui)", cursor: "pointer" }}
            >
              {expanded ? "Show less ▴" : "Show full dua ▾"}
            </button>
          )}

          {dua.source && (
            <span style={{ position: "relative", fontSize: "13px", color: L.heroText, fontWeight: 600 }}>
              {dua.source}
              {dua.verified && <span style={{ color: L.gold, marginLeft: "6px" }}>✓ Verified</span>}
            </span>
          )}

          <span style={{ position: "relative", fontSize: "13px", color: L.heroMuted }}>
            {[categoryLabel(dua), ...duaMoods(dua).map((id) => MOODS.find((m) => m.id === id)?.label)].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(" · ")}
          </span>
        </article>

        {/* What to show + listen + text size */}
        <div role="group" aria-label="Show on card" style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <button type="button" aria-pressed={showTranslit} onClick={() => setShow({ translit: !showTranslit })} style={chip(L, showTranslit)}>
            Transliteration
          </button>
          <button type="button" aria-pressed={showMeaning} onClick={() => setShow({ matlab: !showMeaning })} style={chip(L, showMeaning)}>
            Matlab
          </button>
          {eLines.length > 0 && (
            <button type="button" aria-pressed={show.english} onClick={() => setShow({ english: !show.english })} style={chip(L, show.english)}>
              English
            </button>
          )}
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

        {/* Recited today + Daily routine */}
        <section style={{ background: L.card, border: `1px solid ${L.border}`, borderRadius: "20px", padding: "4px 16px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "10px 0", borderBottom: `1px solid ${L.track}` }}>
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
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "12px 0" }}>
            <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>Daily routine</span>
              <span style={{ fontSize: "12px", color: L.muted }}>Show in “Today's routine” to recite every day</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(dua.routine)}
              aria-label="Daily routine"
              onClick={onToggleRoutine}
              style={{ width: "50px", height: "30px", borderRadius: "999px", background: dua.routine ? L.accent : "var(--radio-off)", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}
            >
              <span style={{ position: "absolute", top: "3px", left: dua.routine ? "23px" : "3px", width: "24px", height: "24px", borderRadius: "999px", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)", transition: "left 0.2s" }} />
            </button>
          </div>
        </section>

        {needsHarakat(dua.arabic) && (
          <button
            type="button"
            onClick={onEdit}
            style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left", padding: "12px 14px", borderRadius: "16px", border: "none", background: L.tagBg, color: L.tagText, fontSize: "13px", fontFamily: "var(--font-ui)", cursor: "pointer" }}
          >
            <strong style={{ fontWeight: 600 }}>Harakat missing</strong>
            <span>This dua has few vowel marks, so tajweed markers can't show. Tap to add them with AI.</span>
          </button>
        )}

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
          <button type="button" onClick={() => setSharing(true)} style={{ ...tile(L), background: L.accent, border: "none", color: L.onAccent, fontWeight: 700 }}>
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
      {sharing && <ShareSheet dua={dua} show={shareShow} night={document.documentElement.dataset.theme === "night"} onClose={closeShare} />}
    </div>
  );
}
