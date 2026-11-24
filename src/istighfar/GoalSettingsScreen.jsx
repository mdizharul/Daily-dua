import { C, FONT, FONT_NUM, card, iconButton } from "./theme";
import { useState } from "react";
import { BUZZ_OPTIONS, MAX_GOAL, TRACKERS, formatGoal, formatNumber, paceText } from "./data";
import DhikrSwitch from "./DhikrSwitch";
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
  const { settings, updateSettings, info, enabled, setEnabled } = tracker;
  const isPreset = info.goals.includes(settings.goal);
  const [custom, setCustom] = useState(isPreset ? "" : String(settings.goal));
  const applyCustom = (value) => {
    setCustom(value);
    const n = Math.round(Number(value));
    if (n >= 1 && n <= MAX_GOAL) updateSettings({ goal: n });
  };

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

      <section style={{ ...card, padding: "4px 16px", display: "flex", flexDirection: "column" }}>
        <h2 style={{ margin: "12px 0 0", fontSize: "15px", fontWeight: 600, color: C.text }}>Track</h2>
        {Object.entries(TRACKERS).map(([id, t], i, all) => {
          const on = enabled.includes(id);
          const onlyOne = on && enabled.length === 1;
          return (
            <Row key={id} as="label" title={t.label} hint={onlyOne ? "At least one dhikr stays on" : t.forms[t.defaultForm].label} last={i === all.length - 1}>
              <input
                type="checkbox"
                checked={on}
                disabled={onlyOne}
                onChange={(e) => setEnabled(id, e.target.checked)}
                style={{ width: "22px", height: "22px", accentColor: C.accent, flexShrink: 0 }}
              />
            </Row>
          );
        })}
      </section>

      <DhikrSwitch tracker={tracker} />

      <section style={{ ...card, display: "flex", flexDirection: "column", gap: "12px" }}>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: C.text }}>Daily goal · {info.label}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px" }}>
          {info.goals.map((g) => {
            const active = settings.goal === g;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setCustom("");
                  updateSettings({ goal: g });
                }}
                style={{
                  height: "48px",
                  borderRadius: "14px",
                  border: `1px solid ${active ? C.accent : C.border}`,
                  background: active ? C.accent : C.card,
                  color: active ? C.onAccent : C.text,
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
        <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: C.muted }}>
          Or your own number
          <input
            type="number"
            inputMode="numeric"
            min="1"
            max={MAX_GOAL}
            placeholder="e.g. 1500"
            value={custom}
            onChange={(e) => applyCustom(e.target.value)}
            style={{ flex: 1, minWidth: 0, height: "40px", borderRadius: "12px", border: `1px solid ${isPreset ? C.border : C.accent}`, background: C.card, color: C.text, padding: "0 12px", fontSize: "15px", fontFamily: FONT }}
          />
        </label>
        <span style={{ fontSize: "13px", color: C.muted }}>
          Goal: {formatNumber(settings.goal)} a day · {paceText(settings.goal)} · resets every night at 12 am
        </span>
      </section>

      <section style={{ ...card, display: "flex", flexDirection: "column", gap: "12px" }}>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: C.text }}>Wording · {info.label}</h2>
        {Object.entries(info.forms).map(([id, d]) => {
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
