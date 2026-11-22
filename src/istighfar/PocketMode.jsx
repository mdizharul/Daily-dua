import { useEffect, useRef, useState } from "react";
import { C, FONT, FONT_NUM } from "./theme";
import { formatNumber } from "./data";
import { useBackHandler } from "../hooks/useBackHandler";
import { CloseIcon, MoonIcon } from "./icons";

const HOLD_MS = 900;
const P = C.pocket;

/** Full-screen dark counter: tap anywhere to count, keeps the screen awake, hold to exit. */
export default function PocketMode({ label, count, goal, strongBuzzEvery, onAdd, onExit }) {
  const [holding, setHolding] = useState(false);
  const [awake, setAwake] = useState(false);
  const holdTimer = useRef(null);
  useBackHandler(true, onExit);

  // Keep the screen on while counting (Screen Wake Lock API; not every browser has it).
  useEffect(() => {
    let lock = null;
    let cancelled = false;
    const request = async () => {
      try {
        lock = await navigator.wakeLock?.request("screen");
        if (!cancelled) setAwake(Boolean(lock));
      } catch {
        setAwake(false);
      }
    };
    request();
    // The browser drops the lock when the tab is hidden; take it again on return.
    const onVisible = () => document.visibilityState === "visible" && request();
    document.addEventListener("visibilitychange", onVisible);
    const onKey = (e) => e.key === "Escape" && onExit();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      lock?.release?.().catch(() => {});
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("keydown", onKey);
    };
  }, [onExit]);

  const startHold = () => {
    setHolding(true);
    holdTimer.current = setTimeout(onExit, HOLD_MS);
  };
  const cancelHold = () => {
    setHolding(false);
    clearTimeout(holdTimer.current);
  };

  const pct = Math.floor((count / goal) * 100);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: P.bg,
        color: P.text,
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        padding: "32px 24px",
        gap: "16px",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", color: P.muted, fontWeight: 500, maxWidth: "480px", width: "100%", margin: "0 auto" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MoonIcon size={16} /> {label} · pocket mode
        </span>
        <span style={{ fontWeight: 400 }}>{awake ? "Screen stays awake" : ""}</span>
      </div>

      <button
        type="button"
        aria-label="Tap anywhere to count"
        onClick={() => onAdd(1)}
        style={{
          flexGrow: 1,
          background: "transparent",
          border: `1px dashed ${P.border}`,
          borderRadius: "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          cursor: "pointer",
          color: P.text,
          fontFamily: FONT,
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          maxWidth: "480px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <span style={{ fontFamily: FONT_NUM, fontSize: "clamp(64px, 12svh, 88px)", fontWeight: 700, letterSpacing: "-2px", lineHeight: 1 }}>
          {formatNumber(count)}
        </span>
        <span style={{ width: "220px", height: "6px", borderRadius: "999px", background: P.track, display: "flex", overflow: "hidden" }}>
          <span style={{ width: `${Math.min(count / goal, 1) * 100}%`, height: "6px", background: P.fill, borderRadius: "999px", transition: "width 0.2s" }} />
        </span>
        <span style={{ fontSize: "15px", color: P.muted }}>
          {pct}% of {formatNumber(goal)}
        </span>
      </button>

      <p style={{ margin: 0, fontSize: "13px", color: P.muted, textAlign: "center" }}>
        Light buzz every tap · strong buzz every {strongBuzzEvery}
      </p>

      <button
        type="button"
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          position: "relative",
          overflow: "hidden",
          height: "56px",
          borderRadius: "16px",
          border: `1px solid ${P.border}`,
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontSize: "15px",
          fontWeight: 600,
          color: P.text,
          fontFamily: FONT,
          cursor: "pointer",
          touchAction: "none",
          maxWidth: "480px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: P.track,
            transformOrigin: "left",
            transform: `scaleX(${holding ? 1 : 0})`,
            transition: holding ? `transform ${HOLD_MS}ms linear` : "transform 0.15s",
          }}
        />
        <span style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
          <CloseIcon /> Press and hold to exit
        </span>
      </button>
    </div>
  );
}
