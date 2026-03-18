import { useState, useRef } from "react";
import { STATUS_MAP, CATEGORY_MAP } from "../constants";
import { GeoBg, StarIcon } from "./icons";
import { IslamicPattern, BadgeSeal, GoldDivider, MihrabFrame } from "./islamic";
import { TajweedText, TAJWEED_LEGEND } from "./tajweed";

const DuaCard = ({ dua, onStatusChange, onDelete, onEdit, onRecite, onShare, T, themeMode, tajweed, fontSize = 1.2 }) => {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [swipeDx, setSwipeDx] = useState(0);
  const touchStartX = useRef(null);

  const aLines  = dua.arabic.split("\n").filter((l) => l.trim());
  const tLines  = (dua.transliteration || "").split("\n").filter((l) => l.trim());
  const trLines = (dua.translation || "").split("\n").filter((l) => l.trim());
  const isLong  = aLines.length > 3;
  const st      = STATUS_MAP[dua.status || "new"];

  const isLight = themeMode === "light";
  const isPaper = themeMode === "paper";

  // ── Card Inner Content ──
  const cardInner = (
    <div style={{ position: "relative" }}>
      {/* Background pattern */}
      {isLight ? <IslamicPattern opacity={0.045} /> : <GeoBg paper={isPaper} />}

      {/* ── Top Badge (light mode only) ── */}
      {isLight && (
        <div style={{ padding: "0.9rem 0 0.3rem", position: "relative", zIndex: 1, textAlign: "center" }}>
          <BadgeSeal size={32} />
        </div>
      )}

      {/* ── Title Section ── */}
      <div style={{ padding: isLight ? "0.3rem 1.2rem 0" : "0.7rem 1rem 0", position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* Title — large, bold, center */}
        <h3 style={{
          margin: 0, fontFamily: "'Cormorant Garamond', serif",
          fontSize: isLight ? "1.15rem" : "1rem", fontWeight: 700,
          color: T.title, letterSpacing: "0.5px",
        }}>
          {dua.title}
        </h3>

        {/* Status badge + dua number */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "0.3rem" }}>
          <button onClick={() => { if (navigator.vibrate) navigator.vibrate(20); const o = ["new","learning","memorized"]; onStatusChange(o[(o.indexOf(dua.status||"new")+1)%3]); }}
            style={{ background: st.bg, border: `1px solid ${st.border}`, borderRadius: "20px", padding: "0.12rem 0.55rem", color: st.text, cursor: "pointer", fontSize: "0.62rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, whiteSpace: "nowrap" }}>
            {st.label}
          </button>
          {dua.category && CATEGORY_MAP[dua.category] && (
            <span style={{ fontSize: "0.6rem", color: T.goldFaint, fontFamily: "'Cormorant Garamond', serif", display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <span>{CATEGORY_MAP[dua.category].icon}</span> {CATEGORY_MAP[dua.category].label}
            </span>
          )}
        </div>
      </div>

      {/* ── Gold Divider ── */}
      {isLight ? (
        <GoldDivider width="85%" />
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", margin: "0.6rem auto", width: "85%" }}>
          <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, transparent, ${T.divider})` }} />
          <StarIcon size={8} color={T.gold} />
          <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${T.divider}, transparent)` }} />
        </div>
      )}

      {/* ── Arabic Text — Large, RTL, center of attention ── */}
      <div style={{
        padding: "0 1.2rem",
        position: "relative", zIndex: 1,
        maxHeight: !isLong || expanded ? "5000px" : "0px",
        overflow: "hidden", transition: "max-height 0.5s ease",
        opacity: !isLong || expanded ? 1 : 0,
      }}>
        {aLines.map((line, i) => (
          <div key={i} style={{ marginBottom: i < aLines.length - 1 ? "0.8rem" : 0 }}>
            {/* Arabic line */}
            <p style={{
              fontFamily: "'Amiri', 'Noto Nastaliq Urdu', serif",
              fontSize: `${fontSize * 1.1}rem`,
              lineHeight: 2.1,
              color: T.arabic,
              textAlign: "center",
              direction: "rtl",
              margin: 0,
              fontWeight: 700,
              textShadow: isLight ? "none" : isPaper ? "none" : "0 0 30px rgba(201,168,76,0.12)",
            }}>
              {tajweed ? <TajweedText text={line} defaultColor={T.arabic} /> : line}
            </p>

            {/* Transliteration — italic, directly below Arabic */}
            {tLines[i] && (
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "0.92rem",
                lineHeight: 1.7,
                color: T.translit,
                margin: "0.25rem 0 0",
                fontStyle: "italic",
                textAlign: "center",
                letterSpacing: "0.3px",
              }}>
                {tLines[i]}
              </p>
            )}

            {/* Translation — smaller, below transliteration */}
            {trLines[i] && (
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "0.82rem",
                lineHeight: 1.6,
                color: T.transl,
                margin: "0.2rem 0 0",
                textAlign: "center",
              }}>
                {trLines[i]}
              </p>
            )}

            {/* Section separator for multi-line duas */}
            {i < aLines.length - 1 && (
              <div style={{ height: "1px", background: `linear-gradient(90deg, transparent 10%, ${T.divider} 50%, transparent 90%)`, margin: "0.7rem 0 0" }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Collapsed preview ── */}
      {isLong && !expanded && (
        <div style={{ padding: "0.6rem 1.2rem 0", position: "relative", zIndex: 1, textAlign: "center" }}>
          <p style={{ fontFamily: "'Amiri', serif", fontSize: "1.1rem", color: isLight ? "rgba(26,26,26,0.4)" : isPaper ? "rgba(45,26,0,0.4)" : "rgba(232,220,200,0.45)", direction: "rtl", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {aLines[0]}...
          </p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.78rem", color: T.goldFaint, margin: "0.3rem 0 0" }}>
            {aLines.length} lines · Tap to expand
          </p>
        </div>
      )}

      {/* ── Tajweed legend ── */}
      {tajweed && expanded && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 0.9rem", margin: "0.6rem 1.2rem 0", paddingTop: "0.6rem", borderTop: `1px solid ${T.divider}`, justifyContent: "center" }}>
          {TAJWEED_LEGEND.map(({ label, color, desc }) => (
            <span key={label} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.65rem", color, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <span style={{ fontFamily: "'Amiri', serif", fontSize: "0.85rem" }}>{desc}</span>
              <span style={{ opacity: 0.7 }}>{label}</span>
            </span>
          ))}
        </div>
      )}

      {/* ── Bottom Divider ── */}
      {isLight ? (
        <GoldDivider width="85%" />
      ) : (
        <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${T.divider}, transparent)`, margin: "0.7rem 1.2rem 0" }} />
      )}

      {/* ── Action Toolbar — compact, at bottom ── */}
      <div style={{ padding: "0.5rem 0.8rem 0.7rem", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.25rem 0.4rem", background: T.toolbarBg, borderRadius: "30px", border: `1px solid ${T.btnBorder}` }}>
          {/* TTS */}
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
          }} title="Listen" style={{ width: "26px", height: "26px", borderRadius: "50%", background: speaking ? T.revealOn : "transparent", border: `1px solid ${speaking ? T.revealOnBorder : "transparent"}`, color: speaking ? T.revealOnText : T.btnText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
            {speaking ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            )}
          </button>

          {/* Copy */}
          <button onClick={() => { navigator.clipboard.writeText(`${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }} title="Copy" style={{ width: "26px", height: "26px", borderRadius: "50%", background: copied ? T.revealOn : "transparent", border: "1px solid transparent", color: copied ? T.revealOnText : T.btnText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
            {copied ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            )}
          </button>

          {/* Share */}
          <button onClick={() => onShare()} title="Share" style={{ width: "26px", height: "26px", borderRadius: "50%", background: "transparent", border: "1px solid transparent", color: T.btnText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>

          {/* Expand/collapse for long duas */}
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} title={expanded ? "Collapse" : "Expand"} style={{ width: "26px", height: "26px", borderRadius: "50%", background: "transparent", border: "1px solid transparent", color: T.btnText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points={expanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></svg>
            </button>
          )}

          {/* Separator */}
          <div style={{ width: "1px", height: "16px", background: T.btnBorder, flexShrink: 0 }} />

          {/* Edit */}
          <button onClick={onEdit} title="Edit" style={{ width: "26px", height: "26px", borderRadius: "50%", background: "transparent", border: "1px solid transparent", color: T.btnText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>

          {/* Delete */}
          <button onClick={onDelete} title="Remove" style={{ width: "26px", height: "26px", borderRadius: "50%", background: "transparent", border: "1px solid transparent", color: "rgba(200,100,100,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>

          {/* Recite counter — pill, far right */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.25rem", background: T.btnBg, borderRadius: "20px", padding: "0.15rem 0.4rem 0.15rem 0.55rem", border: `1px solid ${T.btnBorder}` }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.btnText} strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            <span style={{ fontSize: "0.62rem", color: T.btnText, fontFamily: "'Cormorant Garamond', serif" }}>{dua.reciteCount || 0}</span>
            <button onClick={onRecite} title="Count recitation" style={{ width: "18px", height: "18px", borderRadius: "50%", background: T.revealOn, border: `1px solid ${T.btnBorder}`, color: T.revealOnText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, lineHeight: 1, padding: 0 }}>+</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Outer wrapper with swipe ──
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
        style={{
          background: T.cardBg,
          borderRadius: isLight ? "0" : "16px",
          border: isLight ? "none" : `1px solid ${T.cardBorder}`,
          overflow: "hidden",
          position: "relative",
          boxShadow: T.cardShadow,
          transform: swipeDx !== 0 ? `translateX(${swipeDx * 0.3}px)` : "none",
          transition: swipeDx === 0 ? "transform 0.3s ease" : "none",
        }}
      >
        {isLight ? (
          <MihrabFrame>{cardInner}</MihrabFrame>
        ) : (
          cardInner
        )}
      </div>
    </div>
  );
};

export default DuaCard;
