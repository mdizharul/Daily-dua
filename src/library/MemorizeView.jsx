import { useState } from "react";
import { FONT_SERIF, column, iconBtn, page } from "./theme";
import { RECALL_TARGET, categoryLabel, isLearnt, splitLines } from "./duaUtils";
import { BackIcon } from "./icons";

const MODES = [
  ["read", "Read"],
  ["blanks", "Fill blanks"],
  ["memory", "From memory"],
];
const MODE_KEY = "memorize-mode";

const loadMode = () => {
  try {
    const m = localStorage.getItem(MODE_KEY);
    return MODES.some(([id]) => id === m) ? m : "blanks";
  } catch {
    return "blanks";
  }
};

/** Practice order: the dua you came from first, then the least-practised duas still to learn. */
function buildQueue(duas, focusId) {
  const toLearn = duas.filter((d) => !isLearnt(d)).sort((a, b) => (a.recall || 0) - (b.recall || 0));
  const pool = toLearn.length ? toLearn : duas;
  const ids = pool.map((d) => d.id).filter((id) => id !== focusId);
  return focusId != null ? [focusId, ...ids] : ids;
}

const words = (line) => line.split(/\s+/).filter(Boolean);

/** Memorize mode (mockup screen 5). `onResult(id, correct)` updates the dua's recall progress. */
export default function MemorizeView({ L, duas, focusId, onResult, onBack, onLibrary }) {
  const [mode, setModeState] = useState(loadMode);
  const [queue, setQueue] = useState(() => buildQueue(duas, focusId));
  const [index, setIndex] = useState(0);
  const [tally, setTally] = useState({ right: 0, practice: 0 });
  const [justLearnt, setJustLearnt] = useState(null);

  const setMode = (m) => {
    setModeState(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      // storage blocked
    }
  };

  const dua = duas.find((d) => d.id === queue[index]);
  const done = !dua;

  const answer = (correct) => {
    const recall = dua.recall || 0;
    setJustLearnt(correct && !isLearnt(dua) && recall + 1 >= RECALL_TARGET ? dua.title : null);
    onResult(dua.id, correct);
    setTally((t) => (correct ? { ...t, right: t.right + 1 } : { ...t, practice: t.practice + 1 }));
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setQueue(buildQueue(duas, null));
    setIndex(0);
    setTally({ right: 0, practice: 0 });
    setJustLearnt(null);
  };

  return (
    <div style={page(L)}>
      <div style={{ ...column, gap: "16px", minHeight: "calc(100svh - var(--nav-h))" }}>
        <header style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "8px" }}>
          {onBack && (
            <button type="button" aria-label="Back to dua" onClick={onBack} style={iconBtn(L)}>
              <BackIcon />
            </button>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: 0, fontFamily: FONT_SERIF, fontSize: "26px", fontWeight: 400, color: L.text }}>Memorize</h1>
            {dua && (
              <span style={{ fontSize: "12px", color: L.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {dua.title} · {categoryLabel(dua)}
              </span>
            )}
          </div>
          {dua && queue.length > 1 && (
            <span style={{ fontSize: "13px", color: L.muted, fontWeight: 500, flexShrink: 0 }}>
              {index + 1} / {queue.length}
            </span>
          )}
        </header>

        {justLearnt && (
          <div role="status" style={{ background: L.greenBg, color: L.green, borderRadius: "14px", padding: "10px 14px", fontSize: "13px", fontWeight: 600 }}>
            ✓ “{justLearnt}” is now learnt — moved to Learnt.
          </div>
        )}

        {done ? (
          <Finished L={L} empty={queue.length === 0} tally={tally} onRestart={restart} onLibrary={onLibrary} />
        ) : (
          <>
            <div role="group" aria-label="Difficulty" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "4px", background: L.track, borderRadius: "14px", padding: "4px" }}>
              {MODES.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={mode === id}
                  onClick={() => setMode(id)}
                  style={{ height: "40px", border: "none", borderRadius: "10px", background: mode === id ? L.card : "transparent", color: L.text, fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-ui)", cursor: "pointer" }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Keyed so peeked words reset for each dua and mode */}
            <Practice key={`${dua.id}-${mode}`} L={L} dua={dua} mode={mode} />

            {dua.translation && (
              <section style={{ background: L.card, border: `1px solid ${L.border}`, borderRadius: "20px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: L.tagText }}>Matlab</span>
                <p style={{ margin: 0, fontFamily: FONT_SERIF, fontSize: "18px", lineHeight: 1.4, color: L.text }}>“{splitLines(dua.translation).join(" ")}”</p>
              </section>
            )}

            <section style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600 }}>
                <span>Recall without looking</span>
                <span style={{ color: L.muted, fontWeight: 500 }}>
                  {isLearnt(dua) ? "Learnt" : `${dua.recall || 0} / ${RECALL_TARGET} correct`}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${RECALL_TARGET}, minmax(0, 1fr))`, gap: "6px" }}>
                {Array.from({ length: RECALL_TARGET }, (_, i) => (
                  <span key={i} style={{ height: "8px", borderRadius: "999px", background: isLearnt(dua) || i < (dua.recall || 0) ? L.green : L.track }} />
                ))}
              </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginTop: "auto" }}>
              <button type="button" onClick={() => answer(false)} style={{ height: "56px", borderRadius: "18px", background: L.card, border: `1px solid ${L.border}`, fontSize: "15px", fontWeight: 600, color: L.text, fontFamily: "var(--font-ui)", cursor: "pointer" }}>
                Need practice
              </button>
              <button type="button" onClick={() => answer(true)} style={{ height: "56px", borderRadius: "18px", background: L.primaryBg, border: "none", fontSize: "15px", fontWeight: 700, color: L.primaryText, fontFamily: "var(--font-ui)", cursor: "pointer" }}>
                I said it right
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** The navy practice card: full text, every other word hidden, or everything hidden. */
function Practice({ L, dua, mode }) {
  const [peeked, setPeeked] = useState(() => new Set());
  const [showAll, setShowAll] = useState(false);
  const peek = (key) => setPeeked((s) => new Set(s).add(key));

  const aLines = splitLines(dua.arabic).map(words);
  const tLines = splitLines(dua.transliteration).map(words);
  // Blank the transliteration word-for-word only when it lines up with the Arabic.
  const translitAligned = tLines.length === aLines.length && tLines.every((t, i) => t.length === aLines[i].length);

  const hidden = (li, wi) => mode === "blanks" && wi % 2 === 1 && !peeked.has(`${li}-${wi}`);
  const wordPx = dua.arabic.length < 60 ? 32 : 24;

  const box = { position: "relative", background: L.hero, color: L.heroText, borderRadius: "28px", padding: "28px 20px", display: "flex", flexDirection: "column", gap: "18px", alignItems: "center", textAlign: "center" };

  if (mode === "memory" && !showAll) {
    return (
      <section style={box}>
        <p style={{ margin: 0, fontFamily: FONT_SERIF, fontSize: "20px", lineHeight: 1.4 }}>Recite “{dua.title}” from memory</p>
        <p style={{ margin: 0, fontSize: "13px", color: L.heroMuted }}>Use the meaning below as your cue. Then check yourself.</p>
        <button type="button" onClick={() => setShowAll(true)} style={{ height: "44px", padding: "0 18px", borderRadius: "999px", border: `1px dashed ${L.gold}`, background: "rgba(217,180,94,0.12)", color: L.heroText, fontSize: "14px", fontWeight: 600, fontFamily: "var(--font-ui)", cursor: "pointer" }}>
          Show the dua
        </button>
      </section>
    );
  }

  return (
    <section style={box}>
      <div lang="ar" dir="rtl" style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
        {aLines.map((line, li) => (
          <div key={li} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
            {line.map((w, wi) =>
              hidden(li, wi) ? (
                <button
                  key={wi}
                  type="button"
                  aria-label={`Hidden word ${wi + 1}, tap to reveal`}
                  onClick={() => peek(`${li}-${wi}`)}
                  style={{ minHeight: "52px", minWidth: "60px", padding: "4px 12px", borderRadius: "14px", border: `1px dashed ${L.gold}`, background: "rgba(217,180,94,0.12)", color: L.heroText, fontSize: "22px", fontWeight: 700, cursor: "pointer" }}
                >
                  · · ·
                </button>
              ) : (
                <span key={wi} style={{ fontFamily: "var(--arabic-font)", fontSize: `calc(${wordPx}px * var(--arabic-scale))`, fontWeight: 700, lineHeight: 1.6 }}>
                  {w}
                </span>
              ),
            )}
          </div>
        ))}
      </div>

      {tLines.length > 0 && (mode !== "blanks" || translitAligned) && (
        <p style={{ margin: 0, fontSize: "15px", fontStyle: "italic", color: L.heroMuted, lineHeight: 1.6 }}>
          {tLines.map((line, li) => (
            <span key={li} style={{ display: "block" }}>
              {line.map((w, wi) => (hidden(li, wi) ? "___" : w)).join(" ")}
            </span>
          ))}
        </p>
      )}

      {mode === "blanks" && <span style={{ fontSize: "12px", color: L.heroMuted }}>Tap a blank to peek</span>}
    </section>
  );
}

function Finished({ L, empty, tally, onRestart, onLibrary }) {
  return (
    <section style={{ background: L.card, border: `1px solid ${L.border}`, borderRadius: "24px", padding: "28px 20px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", textAlign: "center" }}>
      <p style={{ margin: 0, fontFamily: FONT_SERIF, fontSize: "24px" }}>{empty ? "Nothing to practise yet" : "Session complete"}</p>
      <p style={{ margin: 0, fontSize: "14px", color: L.muted }}>
        {empty ? "Add a dua to your library to start memorizing." : `${tally.right} said right · ${tally.practice} need practice`}
      </p>
      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        {!empty && (
          <button type="button" onClick={onRestart} style={{ height: "48px", padding: "0 18px", borderRadius: "16px", border: "none", background: L.primaryBg, color: L.primaryText, fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-ui)", cursor: "pointer" }}>
            Practise again
          </button>
        )}
        <button type="button" onClick={onLibrary} style={{ height: "48px", padding: "0 18px", borderRadius: "16px", border: `1px solid ${L.border}`, background: L.card, color: L.text, fontSize: "14px", fontWeight: 600, fontFamily: "var(--font-ui)", cursor: "pointer" }}>
          Back to library
        </button>
      </div>
    </section>
  );
}
