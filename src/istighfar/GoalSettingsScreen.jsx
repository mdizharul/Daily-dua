import { C, FONT, FONT_NUM, card, iconButton } from "./theme";
import { BUZZ_OPTIONS, DHIKR, GOALS, FAJR_HOUR, formatGoal, paceText } from "./data";
import { BackIcon } from "./icons";

const Row = ({ title, hint, last, children, as = "div" }) => {
  const Tag = as;
  return (
    <Tag
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        padding: "12px 0",
        borderBottom: last ? "none" : `1px solid ${C.divider}`,
        cursor: as === "label" ? "pointer" : undefined,
      }}
    >
      <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600 }}>{title}</span>
        <span style={{ fontSize: "12px", color: C.muted }}>{hint}</span>
      </span>
      {children}
    </Tag>
  );
};

export default function GoalSettingsScreen({ tracker, onBack }) {
  const { settings, updateSettings } = tracker;

  return (
    <div style={{ minHeight: "calc(100svh - var(--nav-h))", display: "flex", flexDirection: "column", gap: "16px", padding: "20px", maxWidth: "480px", margin: "0 auto", textAlign: "left" }}>
      <header style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "8px" }}>
        <button type="button" aria-label="Back to counter" onClick={onBack} style={iconButton}>
          <BackIcon />
        </button>
        <h1 style={{ margin: 0, fontFamily: FONT_NUM, fontSize: "24px", fontWeight: 700, letterSpacing: "-0.5px", color: C.text }}>
          Goal &amp; settings
        </h1>
      </header>

      <section style={{ ...card, display: "flex", flexDirection: "column", gap: "12px" }}>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: C.text }}>Daily goal</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px" }}>
          {GOALS.map((g) => {
            const active = settings.goal === g;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={active}
                onClick={() => updateSettings({ goal: g })}
                style={{
                  height: "48px",
                  borderRadius: "14px",
                  border: `1px solid ${active ? C.accent : C.border}`,
                  background: active ? C.accent : C.card,
                  color: active ? "#fff" : C.text,
                  fontFamily: FONT_NUM,
                  fontSize: "17px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {formatGoal(g)}
              </button>
            );
          })}
        </div>
        <span style={{ fontSize: "13px", color: C.muted }}>{paceText(settings.goal)}</span>
      </section>

      <section style={{ ...card, display: "flex", flexDirection: "column", gap: "12px" }}>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: C.text }}>Dhikr</h2>
        {Object.entries(DHIKR).map(([id, d]) => {
          const active = settings.dhikr === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => updateSettings({ dhikr: id })}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "14px",
                border: `1px solid ${active ? C.accent : C.border}`,
                background: active ? C.accentTint : C.card,
                cursor: "pointer",
                textAlign: "left",
                color: C.text,
                fontFamily: FONT,
              }}
            >
              <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600 }}>{d.label}</span>
                <span style={{ fontSize: "12px", color: C.muted }}>{d.hint}</span>
              </span>
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "999px",
                  border: `2px solid ${active ? C.accent : C.radioOff}`,
                  background: active ? C.accent : C.card,
                  boxShadow: active ? `inset 0 0 0 3px ${C.card}` : "none",
                  flexShrink: 0,
                }}
              />
            </button>
          );
        })}
      </section>

      <section style={{ ...card, padding: "4px 16px", display: "flex", flexDirection: "column" }}>
        <Row title="Day resets at" hint={`Yesterday's count moves to History · Fajr ≈ ${FAJR_HOUR} am`}>
          <span style={{ display: "flex", background: C.divider, borderRadius: "12px", padding: "3px", flexShrink: 0 }}>
            {[
              ["fajr", "Fajr"],
              ["midnight", "Midnight"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={settings.resetAt === id}
                onClick={() => updateSettings({ resetAt: id })}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  border: "none",
                  borderRadius: "10px",
                  background: settings.resetAt === id ? C.card : "transparent",
                  color: C.text,
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: FONT,
                  cursor: "pointer",
                  boxShadow: settings.resetAt === id ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {label}
              </button>
            ))}
          </span>
        </Row>

        <Row as="label" title="Gentle reminder" hint="In the app after 6 pm if under 50%">
          <input
            type="checkbox"
            checked={settings.reminder}
            onChange={(e) => updateSettings({ reminder: e.target.checked })}
            style={{ width: "22px", height: "22px", accentColor: C.accent, flexShrink: 0 }}
          />
        </Row>

        <Row as="label" title="Strong buzz every" hint="Light buzz on each tap" last>
          <select
            value={settings.strongBuzzEvery}
            onChange={(e) => updateSettings({ strongBuzzEvery: Number(e.target.value) })}
            style={{ height: "36px", borderRadius: "10px", border: `1px solid ${C.border}`, background: C.card, fontFamily: FONT, fontSize: "13px", fontWeight: 600, color: C.text, padding: "0 8px" }}
          >
            {BUZZ_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Row>
      </section>
    </div>
  );
}
