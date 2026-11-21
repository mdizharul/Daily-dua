import { C, FONT, FONT_NUM, iconButton, pillButton } from "./theme";
import { formatNumber, headerDate } from "./data";
import DhikrSwitch from "./DhikrSwitch";
import { ChartIcon, ChevronDownIcon, FlameIcon, MoonIcon, SlidersIcon, TapIcon, UndoIcon } from "./icons";

const RING_R = 112;
const RING_LEN = 2 * Math.PI * RING_R;

export default function CounterScreen({ tracker, onOpenSettings, onOpenHistory, onPocket }) {
  const { settings, today, now, streak, add, undo, canUndo, info, form } = tracker;
  const { goal } = settings;
  const count = today.count;
  const progress = Math.min(count / goal, 1);
  const pct = Math.floor((count / goal) * 100);
  const dhikr = form;
  const isLong = form.arabic.length > 60;
  const showReminder = settings.reminder && new Date(now).getHours() >= 18 && count < goal / 2;

  return (
    <div
      style={{
        height: "calc(100svh - var(--nav-h))",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        padding: "20px 20px 14px",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left" }}>
          <span style={{ fontSize: "13px", color: C.muted, fontWeight: 500 }}>{headerDate(now)}</span>
          <h1 style={{ margin: 0, fontFamily: FONT_NUM, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px", color: C.text }}>
            {tracker.enabled.length > 1 ? "Dhikr" : info.label}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {streak > 0 && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: C.streakBg,
                color: C.streakText,
                fontSize: "13px",
                fontWeight: 600,
                padding: "8px 12px",
                borderRadius: "999px",
                whiteSpace: "nowrap",
              }}
            >
              <FlameIcon stroke={C.streakIcon} /> {streak} {streak === 1 ? "day" : "days"}
            </span>
          )}
          <button type="button" aria-label="History" onClick={onOpenHistory} style={iconButton}>
            <ChartIcon size={20} />
          </button>
          <button type="button" aria-label="Goal and settings" onClick={onOpenSettings} style={iconButton}>
            <SlidersIcon />
          </button>
        </div>
      </header>

      <DhikrSwitch tracker={tracker} />

      {/* Current dhikr — tap to change */}
      <button
        type="button"
        aria-label="Change dhikr"
        onClick={onOpenSettings}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "18px",
          padding: "12px 16px",
          cursor: "pointer",
          textAlign: "left",
          color: C.text,
          fontFamily: FONT,
          flexShrink: 0,
        }}
      >
        <span style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0, flex: 1 }}>
          <span
            lang="ar"
            dir="rtl"
            style={{
              fontFamily: "var(--arabic-font)",
              fontSize: isLong ? "calc(17px * var(--arabic-scale))" : "calc(24px * var(--arabic-scale))",
              lineHeight: isLong ? 1.8 : 1.3,
              whiteSpace: "pre-line",
              maxHeight: isLong ? "24svh" : undefined,
              overflowY: isLong ? "auto" : undefined,
            }}
          >
            {dhikr.arabic}
          </span>
          <span style={{ fontSize: "13px", color: C.muted }}>{dhikr.meaning}</span>
        </span>
        <ChevronDownIcon stroke={C.muted} />
      </button>

      {showReminder && (
        <div style={{ background: C.warnBg, color: C.warnText, borderRadius: "14px", padding: "10px 14px", fontSize: "13px", fontWeight: 500, flexShrink: 0 }}>
          Gentle reminder · {info.label} is at {pct}% of today's goal
        </div>
      )}

      {/* Big tap area */}
      <button
        type="button"
        aria-label={`Tap to count one ${info.label}`}
        onClick={() => add(1)}
        style={{
          flexGrow: 1,
          minHeight: 0,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          cursor: "pointer",
          color: C.text,
          padding: "16px",
          fontFamily: FONT,
          touchAction: "manipulation",
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{ position: "relative", width: "min(260px, 34svh)", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 260 260" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
            <circle cx="130" cy="130" r={RING_R} fill="none" stroke={C.ring} strokeWidth="16" />
            <circle
              cx="130"
              cy="130"
              r={RING_R}
              fill="none"
              stroke={C.accent}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={RING_LEN}
              strokeDashoffset={RING_LEN * (1 - progress)}
              style={{ transition: "stroke-dashoffset 0.25s ease" }}
            />
          </svg>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span style={{ fontFamily: FONT_NUM, fontSize: "clamp(40px, 7svh, 56px)", fontWeight: 700, letterSpacing: "-1.5px", lineHeight: 1 }}>
              {formatNumber(count)}
            </span>
            <span style={{ fontSize: "15px", color: C.muted, fontWeight: 500 }}>of {formatNumber(goal)}</span>
            <span style={{ marginTop: "8px", fontSize: "13px", fontWeight: 600, color: C.accent, background: C.accentSoft, padding: "4px 10px", borderRadius: "999px" }}>
              {count >= goal ? `Goal reached · ${formatNumber(count - goal)} extra` : `${pct}% · ${formatNumber(goal - count)} left`}
            </span>
          </span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: C.muted, fontWeight: 500 }}>
          <TapIcon /> Tap anywhere here to count
        </span>
      </button>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px", flexShrink: 0 }}>
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          style={{ ...pillButton, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", fontSize: "12px", fontWeight: 600, opacity: canUndo ? 1 : 0.45, cursor: canUndo ? "pointer" : "default" }}
        >
          <UndoIcon /> Undo
        </button>
        <button type="button" onClick={() => add(33)} style={{ ...pillButton, fontFamily: FONT_NUM, fontSize: "18px", fontWeight: 600 }}>
          +33
        </button>
        <button type="button" onClick={() => add(100)} style={{ ...pillButton, fontFamily: FONT_NUM, fontSize: "18px", fontWeight: 600 }}>
          +100
        </button>
        <button
          type="button"
          onClick={onPocket}
          style={{ ...pillButton, background: C.text, border: "none", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", fontSize: "12px", fontWeight: 600 }}
        >
          <MoonIcon /> Pocket
        </button>
      </div>
    </div>
  );
}
