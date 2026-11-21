// Look of the Library / Dua page / Memorize screens, from docs/design/daily-dua-mockup.html.
// Light & Paper app themes use the cream-and-navy mockup palette; Dark uses a navy night version.

const LIGHT = {
  bg: "#F4F4F1",
  card: "#FFFFFF",
  border: "#E2E2DC",
  text: "#131A2E",
  muted: "#5A6070",
  body: "#3A4152",
  hero: "#131A2E",
  heroText: "#F4F1E8",
  heroMuted: "#C3C7D4",
  heroFrame: "rgba(217,180,94,0.45)",
  gold: "#D9B45E",
  tagBg: "#F6EDD6",
  tagText: "#6B4E0F",
  track: "#E8E8E2",
  green: "#1D5B43",
  greenBg: "#E3EFE9",
  chipOnBg: "#131A2E",
  chipOnText: "#FFFFFF",
  primaryBg: "#131A2E",
  primaryText: "#FFFFFF",
  danger: "#B3412E",
  shadow: "0 8px 24px rgba(19,26,46,0.25)",
};

const PAPER = { ...LIGHT, bg: "#F3ECDD", card: "#FBF7EE", border: "#E4D9C3", track: "#E9DFCB" };

const DARK = {
  bg: "#0D1220",
  card: "#161D30",
  border: "#262F47",
  text: "#ECEEF4",
  muted: "#9AA1B4",
  body: "#C9CEDB",
  hero: "#1B2440",
  heroText: "#F4F1E8",
  heroMuted: "#B9BDCB",
  heroFrame: "rgba(217,180,94,0.5)",
  gold: "#D9B45E",
  tagBg: "rgba(217,180,94,0.14)",
  tagText: "#E3C47A",
  track: "#262F47",
  green: "#4FAE84",
  greenBg: "rgba(79,174,132,0.15)",
  chipOnBg: "#D9B45E",
  chipOnText: "#131A2E",
  primaryBg: "#D9B45E",
  primaryText: "#131A2E",
  danger: "#E0826F",
  shadow: "0 8px 24px rgba(0,0,0,0.45)",
};

export function getLibraryTheme(mode) {
  if (mode === "dark") return DARK;
  if (mode === "paper") return PAPER;
  return LIGHT;
}

export const FONT_SERIF = "'DM Serif Display', Georgia, serif";

export const iconBtn = (L) => ({
  width: "44px",
  height: "44px",
  borderRadius: "999px",
  background: L.card,
  border: `1px solid ${L.border}`,
  color: L.text,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  padding: 0,
  flexShrink: 0,
});

export const chip = (L, active) => ({
  flexShrink: 0,
  height: "36px",
  padding: "0 14px",
  borderRadius: "999px",
  border: `1px solid ${active ? L.chipOnBg : L.border}`,
  background: active ? L.chipOnBg : L.card,
  color: active ? L.chipOnText : L.text,
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "var(--font-ui)",
  cursor: "pointer",
  whiteSpace: "nowrap",
});

export const tile = (L) => ({
  height: "56px",
  borderRadius: "16px",
  background: L.card,
  border: `1px solid ${L.border}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "2px",
  fontSize: "12px",
  fontWeight: 600,
  fontFamily: "var(--font-ui)",
  color: L.text,
  cursor: "pointer",
});

/** Page wrapper shared by the library screens. */
export const page = (L) => ({
  minHeight: "100svh",
  background: L.bg,
  color: L.text,
  fontFamily: "var(--font-ui)",
  paddingBottom: "var(--nav-h)",
  textAlign: "left",
});

export const column = {
  maxWidth: "480px",
  margin: "0 auto",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};
