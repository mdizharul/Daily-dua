import { useState, useRef } from "react";
import { STATUS_MAP } from "../constants";
import { GeoBg, StarIcon } from "./icons";
import { TajweedText, TAJWEED_LEGEND } from "./tajweed";

const DuaCard = ({ dua, onStatusChange, onDelete, onEdit, onRecite, onShare, paper, tajweed, fontSize = 1.2 }) => {
  const [expanded, setExpanded] = useState(true);
  const [showTranslit, setShowTranslit] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [swipeDx, setSwipeDx] = useState(0);
  const touchStartX = useRef(null);

  const aLines  = dua.arabic.split("\n").filter((l) => l.trim());
  const tLines  = (dua.transliteration || "").split("\n").filter((l) => l.trim());
  const trLines = (dua.translation || "").split("\n").filter((l) => l.trim());
  const isLong  = aLines.length > 2;
  const st      = STATUS_MAP[dua.status || "new"];

  // Theme values switch between dark (default) and paper mode
  const T = paper ? {
    card:    "linear-gradient(145deg, #faf6ec 0%, #f3ead5 50%, #f7f1e3 100%)",
    border:  "rgba(139,94,32,0.25)",
    shadow:  "0 4px 20px rgba(100,70,20,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
    title:   "#5a3300",
    arabic:  "#2d1a00",
    translit:"#8b5e00",
    transl:  "#6b4a00",
    divider: "rgba(139,94,32,0.15)",
    btnBg:   "rgba(139,94,32,0.07)",
    btnBorder:"rgba(139,94,32,0.18)",
    btnText: "rgba(90,51,0,0.55)",
    revealOn:"rgba(139,94,32,0.18)",
    revealOnBorder:"rgba(139,94,32,0.45)",
    revealOnText:"#5a3300",
    revealOff:"rgba(139,94,32,0.04)",
    revealOffBorder:"rgba(139,94,32,0.12)",
    revealOffText:"rgba(90,51,0,0.4)",
  } : {
    card:    "linear-gradient(145deg, #1a2a1a 0%, #0f1f14 50%, #162016 100%)",
    border:  "rgba(201,168,76,0.2)",
    shadow:  "0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(201,168,76,0.1)",
    title:   "#c9a84c",
    arabic:  "#e8dcc8",
    translit:"#c9a84c",
    transl:  "rgba(232,220,200,0.55)",
    divider: "rgba(201,168,76,0.08)",
    btnBg:   "rgba(201,168,76,0.08)",
    btnBorder:"rgba(201,168,76,0.15)",
    btnText: "rgba(201,168,76,0.55)",
    revealOn:"rgba(201,168,76,0.15)",
    revealOnBorder:"rgba(201,168,76,0.4)",
    revealOnText:"#c9a84c",
    revealOff:"rgba(201,168,76,0.04)",
    revealOffBorder:"rgba(201,168,76,0.12)",
    revealOffText:"rgba(201,168,76,0.4)",
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Swipe hint overlay */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "16px", background: swipeDx > 20 ? `rgba(100,210,120,${Math.min(swipeDx/90, 1) * 0.3})` : swipeDx < -20 ? `rgba(220,80,80,${Math.min(-swipeDx/90, 1) * 0.3})` : "transparent", display: "flex", alignItems: "center", justifyContent: swipeDx > 0 ? "flex-start" : "flex-end", padding: "0 1.2rem", transition: "background 0.1s", pointerEvents: "none", zIndex: 0 }}>
        {swipeDx > 30 && <span style={{ fontSize: "1.2rem" }}>🤲</span>}
        {swipeDx < -30 && <span style={{ fontSize: "1.2rem" }}>🗑</span>}
      </div>

      <div
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchMove={(e) => { if (touchStartX.current === null) return; const dx = e.touches[0].clientX - touchStartX.current; setSwipeDx(Math.max(-90, Math.min(90, dx))); }}
        onTouchEnd={() => { if (swipeDx > 70) { onRecite(); if (navigator.vibrate) navigator.vibrate(40); } else if (swipeDx < -70) { if (confirm("Remove this dua?")) { onDelete(); } } touchStartX.current = null; setSwipeDx(0); }}
        style={{ background: T.card, borderRadius: "16px", border: `1px solid ${T.border}`, overflow: "hidden", position: "relative", boxShadow: T.shadow, transform: swipeDx !== 0 ? `translateX(${swipeDx * 0.3}px)` : "none", transition: swipeDx === 0 ? "transform 0.3s ease" : "none" }}
      >
        <GeoBg paper={paper} />

        {/* Header */}
        <div style={{ padding: "0.55rem 0.85rem 0.4rem", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1, minWidth: 0 }}>
              <StarIcon size={13} color={T.title} />
              <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", fontWeight: 600, color: T.title, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {dua.title}
              </h3>
            </div>
            <button onClick={() => { if (navigator.vibrate) navigator.vibrate(20); const o = ["new","learning","memorized"]; onStatusChange(o[(o.indexOf(dua.status||"new")+1)%3]); }}
              style={{ background: st.bg, border: `1px solid ${st.border}`, borderRadius: "20px", padding: "0.15rem 0.55rem", color: st.text, cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, whiteSpace: "nowrap" }}>
              {st.label}
            </button>
          </div>
          {/* Capsule action toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.35rem", padding: "0.25rem 0.4rem", background: paper ? "rgba(139,94,32,0.07)" : "rgba(0,0,0,0.22)", borderRadius: "30px", border: `1px solid ${T.btnBorder}` }}>
            {/* TTS circular button */}
            <button onClick={() => {
              if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
              const utt = new SpeechSynthesisUtterance(dua.arabic);
              utt.lang = "ar-SA";
              const voices = window.speechSynthesis.getVoices();
              const arVoice = voices.find(v => v.lang.startsWith("ar"));
              if (arVoice) utt.voice = arVoice;
              utt.onend = () => setSpeaking(false);
              setSpeaking(true);
              window.speechSynthesis.speak(utt);
            }} title="Listen" style={{ width: "26px", height: "26px", borderRadius: "50%", background: speaking ? (paper ? "rgba(139,94,32,0.2)" : "rgba(201,168,76,0.2)") : "transparent", border: `1px solid ${speaking ? T.revealOnBorder : "transparent"}`, color: speaking ? T.revealOnText : T.btnText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", flexShrink: 0, transition: "all 0.15s" }}>
              {speaking ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              )}
            </button>

            {/* Copy circular */}
            <button onClick={() => { navigator.clipboard.writeText(`${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }} title="Copy" style={{ width: "26px", height: "26px", borderRadius: "50%", background: copied ? (paper ? "rgba(139,94,32,0.2)" : "rgba(201,168,76,0.2)") : "transparent", border: "1px solid transparent", color: copied ? T.revealOnText : T.btnText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
              {copied ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              )}
            </button>

            {/* Share circular */}
            <button onClick={() => onShare()} title="Share as image" style={{ width: "26px", height: "26px", borderRadius: "50%", background: "transparent", border: "1px solid transparent", color: T.btnText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>

            {isLong && (
              <button onClick={() => setExpanded(!expanded)} title={expanded ? "Collapse" : "Expand"} style={{ width: "26px", height: "26px", borderRadius: "50%", background: "transparent", border: "1px solid transparent", color: T.btnText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points={expanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></svg>
              </button>
            )}

            {/* Separator */}
            <div style={{ width: "1px", height: "16px", background: T.btnBorder, flexShrink: 0 }} />

            {/* Edit circular */}
            <button onClick={onEdit} title="Edit" style={{ width: "26px", height: "26px", borderRadius: "50%", background: "transparent", border: "1px solid transparent", color: T.btnText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>

            {/* Delete circular */}
            <button onClick={onDelete} title="Remove" style={{ width: "26px", height: "26px", borderRadius: "50%", background: "transparent", border: "1px solid transparent", color: "rgba(200,100,100,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>

            {/* Recite counter — pill on right */}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.25rem", background: paper ? "rgba(139,94,32,0.1)" : "rgba(201,168,76,0.08)", borderRadius: "20px", padding: "0.15rem 0.4rem 0.15rem 0.55rem", border: `1px solid ${T.btnBorder}` }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.btnText} strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
              <span style={{ fontSize: "0.62rem", color: T.btnText, fontFamily: "'Cormorant Garamond', serif" }}>{dua.reciteCount || 0}</span>
              <button onClick={onRecite} title="Count recitation" style={{ width: "18px", height: "18px", borderRadius: "50%", background: paper ? "rgba(139,94,32,0.15)" : "rgba(201,168,76,0.15)", border: `1px solid ${T.btnBorder}`, color: T.revealOnText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, lineHeight: 1, padding: 0 }}>+</button>
            </div>
          </div>

          {/* Tags */}
          {(dua.tags || []).length > 0 && (
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
              {(dua.tags || []).map(tag => (
                <span key={tag} style={{ fontSize: "0.62rem", padding: "0.1rem 0.45rem", borderRadius: "10px", background: paper ? "rgba(139,94,32,0.1)" : "rgba(201,168,76,0.1)", border: `1px solid ${paper ? "rgba(139,94,32,0.2)" : "rgba(201,168,76,0.15)"}`, color: T.btnText, fontFamily: "'Cormorant Garamond', serif" }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${T.border}, transparent)`, margin: "0 1rem" }} />

        {/* Body */}
        <div style={{ padding: "0.55rem 0.85rem 0.7rem", position: "relative", zIndex: 1, maxHeight: !isLong || expanded ? "3000px" : "0px", overflow: "hidden", transition: "max-height 0.5s ease", opacity: !isLong || expanded ? 1 : 0 }}>
          {aLines.map((line, i) => (
            <div key={i} style={{ marginBottom: i < aLines.length - 1 ? "0.6rem" : 0, paddingBottom: i < aLines.length - 1 ? "0.6rem" : 0, borderBottom: i < aLines.length - 1 ? `1px solid ${T.divider}` : "none" }}>
              <p style={{ fontFamily: "'Amiri', 'Noto Nastaliq Urdu', serif", fontSize: `${fontSize}rem`, lineHeight: 1.9, color: T.arabic, textAlign: "right", direction: "rtl", margin: "0 0 0.4rem 0", textShadow: paper ? "none" : "0 0 30px rgba(201,168,76,0.15)" }}>
                {tajweed ? <TajweedText text={line} defaultColor={T.arabic} /> : line}
              </p>
              {tLines[i] && (
                <div style={{ overflow: "hidden", maxHeight: showTranslit ? "300px" : "0px", transition: "max-height 0.3s ease", opacity: showTranslit ? 1 : 0 }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9rem", lineHeight: 1.6, color: T.translit, margin: "0 0 0.25rem 0", fontStyle: "italic" }}>{tLines[i]}</p>
                </div>
              )}
              {trLines[i] && (
                <div style={{ overflow: "hidden", maxHeight: showTranslation ? "300px" : "0px", transition: "max-height 0.3s ease", opacity: showTranslation ? 1 : 0 }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.83rem", lineHeight: 1.6, color: T.transl, margin: 0, paddingLeft: "0.6rem", borderLeft: `2px solid ${T.divider}` }}>{trLines[i]}</p>
                </div>
              )}
            </div>
          ))}

          {/* Tajweed legend */}
          {tajweed && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 0.9rem", marginTop: "0.6rem", paddingTop: "0.6rem", borderTop: `1px solid ${T.divider}` }}>
              {TAJWEED_LEGEND.map(({ label, color, desc }) => (
                <span key={label} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.65rem", color, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <span style={{ fontFamily: "'Amiri', serif", fontSize: "0.85rem" }}>{desc}</span>
                  <span style={{ opacity: 0.7 }}>{label}</span>
                </span>
              ))}
            </div>
          )}

          {/* Reveal buttons */}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
            {[
              { show: showTranslit,    setShow: setShowTranslit,    label: "Transliteration" },
              { show: showTranslation, setShow: setShowTranslation, label: "Translation"     },
            ].map(({ show, setShow, label }) => (
              <button key={label} onClick={() => setShow(!show)}
                style={{ flex: 1, padding: "0.38rem 0.6rem", background: show ? T.revealOn : T.revealOff, border: `1px solid ${show ? T.revealOnBorder : T.revealOffBorder}`, borderRadius: "20px", color: show ? T.revealOnText : T.revealOffText, cursor: "pointer", fontSize: "0.7rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, letterSpacing: "0.3px", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: "opacity 0.2s", opacity: show ? 1 : 0.6 }}>
                  {show ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  ) : (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  )}
                </svg>
                {show ? `Hide ${label}` : label}
              </button>
            ))}
          </div>
        </div>

        {/* Collapsed preview */}
        {isLong && !expanded && (
          <div style={{ padding: "0.6rem 1rem 0.8rem", position: "relative", zIndex: 1 }}>
            <p style={{ fontFamily: "'Amiri', serif", fontSize: "1.1rem", color: paper ? "rgba(45,26,0,0.4)" : "rgba(232,220,200,0.45)", textAlign: "right", direction: "rtl", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {aLines[0]}...
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.8rem", color: paper ? "rgba(90,51,0,0.4)" : "rgba(201,168,76,0.4)", margin: "0.3rem 0 0", textAlign: "center" }}>
              {aLines.length} lines · Tap Expand
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DuaCard;
