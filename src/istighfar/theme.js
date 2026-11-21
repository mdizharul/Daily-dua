// The Istighfar tracker keeps the look of its own mockup (green on warm white),
// independent of Daily Dua's Dark / Light / Paper themes.
export const C = {
  bg: "#F5F3EC",
  card: "#FFFFFF",
  border: "#E3E1D8",
  divider: "#EEECE5",
  text: "#14211D",
  muted: "#5B6B65",
  accent: "#1E6B52",
  accentSoft: "#DCEBE4",
  accentTint: "#EEF5F1",
  ring: "#E6EBE7",
  barLight: "#C8D9D1",
  barToday: "#9CC7B6",
  goalLine: "#C9CFCB",
  legendLine: "#8A9792",
  radioOff: "#B9C2BE",
  streakBg: "#FBEFD9",
  streakText: "#6E4A0E",
  streakIcon: "#B8862F",
  warnBg: "#FBEFD9",
  warnText: "#6E4A0E",
  pocket: {
    bg: "#080B0A",
    text: "#C8D8D1",
    muted: "#8FA79D",
    border: "#24302C",
    track: "#1A2420",
    fill: "#3E8C72",
  },
};

export const FONT = "'Inter', system-ui, sans-serif";
export const FONT_NUM = "'Space Grotesk', 'Inter', sans-serif";

export const card = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: "24px",
  padding: "16px",
};

export const pillButton = {
  height: "56px",
  borderRadius: "16px",
  background: C.card,
  border: `1px solid ${C.border}`,
  color: C.text,
  cursor: "pointer",
  fontFamily: FONT,
};

export const iconButton = {
  width: "44px",
  height: "44px",
  borderRadius: "999px",
  background: C.card,
  border: `1px solid ${C.border}`,
  color: C.text,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  padding: 0,
  flexShrink: 0,
};
