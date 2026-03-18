import { useState, useEffect, useMemo } from "react";
import { loadThemeMode, saveThemeMode } from "../storage";

const DARK = {
  mode: "dark",
  appBg: "linear-gradient(170deg, #0a1a0e 0%, #0d1710 40%, #111a14 100%)",
  appColor: "#e8dcc8",
  gold: "#c9a84c",
  goldFaint: "rgba(201,168,76,0.5)",
  cardBg: "linear-gradient(145deg, #1a2a1a 0%, #0f1f14 50%, #162016 100%)",
  cardBorder: "rgba(201,168,76,0.2)",
  inputBg: "rgba(201,168,76,0.05)",
  inputBorder: "rgba(201,168,76,0.2)",
  focusBorder: "rgba(201,168,76,0.5)",
  focusShadow: "rgba(201,168,76,0.1)",
  btnBg: "rgba(201,168,76,0.08)",
  btnBorder: "rgba(201,168,76,0.15)",
  btnText: "rgba(201,168,76,0.55)",
  ctaBg: "linear-gradient(135deg, #c9a84c 0%, #a8883a 100%)",
  ctaColor: "#0a1a0e",
  ctaShadow: "0 4px 18px rgba(201,168,76,0.3)",
  heading: "#c9a84c",
  shimmer: true,
  // DuaCard tokens
  title: "#c9a84c",
  arabic: "#e8dcc8",
  translit: "#c9a84c",
  transl: "rgba(232,220,200,0.55)",
  divider: "rgba(201,168,76,0.08)",
  revealOn: "rgba(201,168,76,0.15)",
  revealOnBorder: "rgba(201,168,76,0.4)",
  revealOnText: "#c9a84c",
  revealOff: "rgba(201,168,76,0.04)",
  revealOffBorder: "rgba(201,168,76,0.12)",
  revealOffText: "rgba(201,168,76,0.4)",
  cardShadow: "0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(201,168,76,0.1)",
  toolbarBg: "rgba(0,0,0,0.22)",
  statusActive: "rgba(100,210,120,0.15)",
  statusActiveBorder: "rgba(100,210,120,0.3)",
  statusActiveText: "#7ec97e",
  geoStroke: "currentColor",
  geoOpacity: 0.035,
};

const PAPER = {
  mode: "paper",
  appBg: "linear-gradient(170deg, #f5ede0 0%, #ede0c8 40%, #f0e8d5 100%)",
  appColor: "#2d1a00",
  gold: "#7a4a00",
  goldFaint: "rgba(122,74,0,0.5)",
  cardBg: "linear-gradient(145deg, #faf6ec 0%, #f3ead5 50%, #f7f1e3 100%)",
  cardBorder: "rgba(139,94,32,0.25)",
  inputBg: "rgba(139,94,32,0.06)",
  inputBorder: "rgba(139,94,32,0.25)",
  focusBorder: "rgba(139,94,32,0.5)",
  focusShadow: "rgba(139,94,32,0.1)",
  btnBg: "rgba(139,94,32,0.07)",
  btnBorder: "rgba(139,94,32,0.18)",
  btnText: "rgba(90,51,0,0.55)",
  ctaBg: "linear-gradient(135deg, #c9a84c 0%, #a8883a 100%)",
  ctaColor: "#0a1a0e",
  ctaShadow: "0 4px 18px rgba(201,168,76,0.3)",
  heading: "#7a4a00",
  shimmer: false,
  title: "#5a3300",
  arabic: "#2d1a00",
  translit: "#8b5e00",
  transl: "#6b4a00",
  divider: "rgba(139,94,32,0.15)",
  revealOn: "rgba(139,94,32,0.18)",
  revealOnBorder: "rgba(139,94,32,0.45)",
  revealOnText: "#5a3300",
  revealOff: "rgba(139,94,32,0.04)",
  revealOffBorder: "rgba(139,94,32,0.12)",
  revealOffText: "rgba(90,51,0,0.4)",
  cardShadow: "0 4px 20px rgba(100,70,20,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
  toolbarBg: "rgba(139,94,32,0.07)",
  statusActive: "rgba(139,94,32,0.15)",
  statusActiveBorder: "rgba(139,94,32,0.3)",
  statusActiveText: "#7a4a00",
  geoStroke: "#8b5e20",
  geoOpacity: 0.06,
};

const LIGHT = {
  mode: "light",
  // Laylatul Qadr palette — high contrast on cream/beige
  appBg: "linear-gradient(170deg, #f5efe2 0%, #ece3d0 40%, #f0e8d5 100%)",
  appColor: "#2c2c2c",
  gold: "#8b6914",         // deep warm gold — visible on cream
  goldFaint: "#9e8045",    // muted gold — still readable
  primary: "#1a6b3c",      // emerald green
  cardBg: "linear-gradient(145deg, #fdf8ee 0%, #f9f2e4 50%, #fdf8ee 100%)",
  cardBorder: "#c9a84c",
  cardOuterBorder: "#1a6b3c",
  inputBg: "rgba(26,107,60,0.06)",
  inputBorder: "rgba(26,107,60,0.3)",
  focusBorder: "#1a6b3c",
  focusShadow: "rgba(26,107,60,0.15)",
  btnBg: "rgba(26,107,60,0.08)",
  btnBorder: "rgba(26,107,60,0.25)",
  btnText: "#2a7a4a",      // solid green — readable
  ctaBg: "linear-gradient(135deg, #1a6b3c 0%, #155732 100%)",
  ctaColor: "#fdf8ee",
  ctaShadow: "0 4px 18px rgba(26,107,60,0.25)",
  heading: "#1a6b3c",
  shimmer: false,
  title: "#1a6b3c",
  arabic: "#1a1a1a",
  translit: "#1a6b3c",
  transl: "#3d3d3d",
  divider: "rgba(201,168,76,0.3)",
  revealOn: "rgba(26,107,60,0.15)",
  revealOnBorder: "#1a6b3c",
  revealOnText: "#155732",
  revealOff: "rgba(26,107,60,0.05)",
  revealOffBorder: "rgba(26,107,60,0.2)",
  revealOffText: "#3a7a55",
  cardShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
  toolbarBg: "rgba(26,107,60,0.07)",
  statusActive: "rgba(26,107,60,0.12)",
  statusActiveBorder: "#1a6b3c",
  statusActiveText: "#1a6b3c",
  geoStroke: "#c9a84c",
  geoOpacity: 0.07,
};

const THEMES = { dark: DARK, light: LIGHT, paper: PAPER };
const MODES = ["dark", "light", "paper"];
const MODE_ICONS = { dark: "☽", light: "☀", paper: "📜" };

export default function useTheme() {
  const [mode, setModeState] = useState(() => loadThemeMode());

  const setMode = (m) => {
    setModeState(m);
    saveThemeMode(m);
  };

  const cycleMode = () => {
    const idx = MODES.indexOf(mode);
    setMode(MODES[(idx + 1) % MODES.length]);
  };

  const T = useMemo(() => THEMES[mode] || DARK, [mode]);

  return { mode, setMode, cycleMode, T, icon: MODE_ICONS[mode], isPaper: mode === "paper", isLight: mode === "light", isDark: mode === "dark" };
}

export { THEMES, MODES, MODE_ICONS };
