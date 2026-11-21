// The app's single design system (the Dhikr look), Day + Night.
// Colour values are CSS variables defined in src/index.css, so switching
// <html data-theme="night"> recolours every screen without re-rendering.

export const T = {
  bg: "var(--bg)",
  card: "var(--card)",
  border: "var(--border)",
  divider: "var(--divider)",
  text: "var(--text)",
  body: "var(--body)",
  muted: "var(--muted)",
  accent: "var(--accent)",
  onAccent: "var(--on-accent)",
  accentSoft: "var(--accent-soft)",
  accentTint: "var(--accent-tint)",
  primary: "var(--primary)",
  onPrimary: "var(--on-primary)",
  ring: "var(--ring)",
  barLight: "var(--bar-light)",
  barToday: "var(--bar-today)",
  goalLine: "var(--goal-line)",
  legendLine: "var(--legend-line)",
  radioOff: "var(--radio-off)",
  warmBg: "var(--warm-bg)",
  warmText: "var(--warm-text)",
  warmIcon: "var(--warm-icon)",
  hero: "linear-gradient(150deg, var(--hero) 0%, var(--hero-2) 100%)",
  heroText: "var(--hero-text)",
  heroMuted: "var(--hero-muted)",
  heroAccent: "var(--hero-accent)",
  heroFrame: "var(--hero-frame)",
  danger: "var(--danger)",
  dangerBg: "var(--danger-bg)",
  shadow: "var(--shadow)",
};

export const FONT = "'Inter', system-ui, sans-serif";
export const FONT_DISPLAY = "'Space Grotesk', 'Inter', sans-serif";

// ---------- shared building blocks ----------

export const page = {
  minHeight: "100svh",
  background: T.bg,
  color: T.text,
  fontFamily: FONT,
  paddingBottom: "var(--nav-h)",
  textAlign: "left",
};

export const column = {
  maxWidth: "480px",
  margin: "0 auto",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

export const card = {
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: "24px",
  padding: "16px",
};

export const iconButton = {
  width: "44px",
  height: "44px",
  borderRadius: "999px",
  background: T.card,
  border: `1px solid ${T.border}`,
  color: T.text,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  padding: 0,
  flexShrink: 0,
};

export const pillButton = {
  height: "56px",
  borderRadius: "16px",
  background: T.card,
  border: `1px solid ${T.border}`,
  color: T.text,
  cursor: "pointer",
  fontFamily: FONT,
};

export const tile = {
  ...pillButton,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "2px",
  fontSize: "12px",
  fontWeight: 600,
};

export const chip = (active) => ({
  flexShrink: 0,
  height: "36px",
  padding: "0 14px",
  borderRadius: "999px",
  border: `1px solid ${active ? T.accent : T.border}`,
  background: active ? T.accent : T.card,
  color: active ? T.onAccent : T.text,
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: FONT,
  cursor: "pointer",
  whiteSpace: "nowrap",
});

/** Grey track with a raised white option — the Istighfar / Hasbunallah switch style. */
export const segTrack = (cols) => ({
  display: "grid",
  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
  gap: "4px",
  background: T.divider,
  borderRadius: "14px",
  padding: "4px",
});

export const segOption = (active) => ({
  height: "38px",
  border: "none",
  borderRadius: "10px",
  background: active ? T.card : "transparent",
  color: active ? T.accent : T.muted,
  boxShadow: active ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
  fontFamily: FONT,
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
});

export const primaryButton = (enabled = true) => ({
  width: "100%",
  height: "56px",
  borderRadius: "18px",
  border: "none",
  background: enabled ? T.accent : T.divider,
  color: enabled ? T.onAccent : T.muted,
  fontSize: "16px",
  fontWeight: 700,
  fontFamily: FONT,
  cursor: enabled ? "pointer" : "not-allowed",
});

export const secondaryButton = {
  height: "48px",
  padding: "0 18px",
  borderRadius: "16px",
  border: `1px solid ${T.border}`,
  background: T.card,
  color: T.text,
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: FONT,
  cursor: "pointer",
};

export const input = {
  width: "100%",
  padding: "12px 14px",
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: "14px",
  color: T.text,
  fontSize: "15px",
  fontFamily: FONT,
  resize: "vertical",
  boxSizing: "border-box",
};

export const label = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: T.muted,
  marginBottom: "6px",
};

export const h1 = { margin: 0, fontFamily: FONT_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px", color: T.text };
export const h2 = { margin: 0, fontSize: "15px", fontWeight: 600, color: T.text };
