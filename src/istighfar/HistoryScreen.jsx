import { C, FONT_NUM, card } from "./theme";
import { formatGoal, formatNumber, formatShort, formatTime, sessionLabel, weekdayShort } from "./data";

const BAR_MAX = 140; // px height of a bar that reached the goal

export default function HistoryScreen({ tracker }) {
  const { settings, today, todayKey, streak, week } = tracker;
  const { goal } = settings;

  const stats = [
    { label: "Streak", value: `${streak} ${streak === 1 ? "day" : "days"}` },
    { label: "Goal hit", value: `${week.goalHit} / 7` },
    { label: "Week total", value: formatShort(week.total) },
  ];

  const chartLabel =
    "Daily counts: " +
    week.days.map((d) => `${weekdayShort(d.key)} ${formatNumber(d.count)}${d.key === todayKey ? " so far" : ""}`).join(", ");

  return (
    <div style={{ minHeight: "calc(100svh - var(--nav-h))", display: "flex", flexDirection: "column", gap: "16px", padding: "20px", maxWidth: "480px", margin: "0 auto", textAlign: "left" }}>
      <header style={{ display: "flex", flexDirection: "column", gap: "2px", paddingTop: "8px" }}>
        <span style={{ fontSize: "13px", color: C.muted, fontWeight: 500 }}>This week</span>
        <h1 style={{ margin: 0, fontFamily: FONT_NUM, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px", color: C.text }}>History</h1>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
        {stats.map(({ label, value }) => (
          <div key={label} style={{ ...card, borderRadius: "18px", padding: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "12px", color: C.muted, fontWeight: 500 }}>{label}</span>
            <span style={{ fontFamily: FONT_NUM, fontSize: "22px", fontWeight: 700 }}>{value}</span>
          </div>
        ))}
      </div>

      <section style={{ ...card, display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: C.text }}>Daily count</h2>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: C.muted }}>
            <span style={{ width: "14px", borderTop: `2px dashed ${C.legendLine}` }} />
            {formatGoal(goal)} goal
          </span>
        </div>
        <div role="img" aria-label={chartLabel} style={{ position: "relative", height: "170px", display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "10px", alignItems: "end" }}>
          <span style={{ position: "absolute", left: 0, right: 0, top: "10px", borderTop: `2px dashed ${C.goalLine}` }} />
          {week.days.map(({ key, count }) => {
            const isToday = key === todayKey;
            const reached = count >= goal;
            const height = count ? Math.max(4, Math.min(count / goal, 1) * BAR_MAX) : 2;
            return (
              <span key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span
                  title={`${formatNumber(count)}`}
                  style={{
                    width: "100%",
                    height: `${height}px`,
                    background: reached ? C.accent : isToday ? C.barToday : C.barLight,
                    borderRadius: count ? "8px" : "2px",
                    opacity: count ? 1 : 0.5,
                  }}
                />
                <span style={{ fontSize: "12px", color: isToday ? C.text : C.muted, fontWeight: 600 }}>{weekdayShort(key)}</span>
              </span>
            );
          })}
        </div>
      </section>

      <section style={{ ...card, display: "flex", flexDirection: "column", gap: "4px", flexGrow: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "6px" }}>
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: C.text }}>Today's sessions</h2>
          <span style={{ fontSize: "13px", color: C.muted }}>{formatNumber(today.count)} total</span>
        </div>
        {today.sessions.length === 0 && (
          <p style={{ margin: 0, padding: "10px 0", borderTop: `1px solid ${C.divider}`, fontSize: "13px", color: C.muted }}>
            No sessions yet today. Tap the counter to begin.
          </p>
        )}
        {today.sessions.map((s) => (
          <div key={s.start} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: `1px solid ${C.divider}` }}>
            <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>{sessionLabel(s.start)}</span>
              <span style={{ fontSize: "12px", color: C.muted }}>{formatTime(s.start)}</span>
            </span>
            <span style={{ fontFamily: FONT_NUM, fontSize: "17px", fontWeight: 600 }}>{formatNumber(s.count)}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
