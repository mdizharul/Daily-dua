import { useEffect, useState } from "react";
import { loadThemeMode, saveThemeMode } from "../services/storage";

const META_COLOR = { day: "#F5F3EC", night: "#0B100E" };

/**
 * The app has one design (see src/theme/tokens.js) in two modes: "day" and "night".
 * The mode is applied as <html data-theme="night">, which switches the CSS variables.
 */
export default function useTheme() {
  const [mode, setModeState] = useState(loadThemeMode);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "night") root.setAttribute("data-theme", "night");
    else root.removeAttribute("data-theme");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META_COLOR[mode]);
  }, [mode]);

  const setMode = (m) => {
    setModeState(m);
    saveThemeMode(m);
  };

  return { mode, setMode, isNight: mode === "night", toggle: () => setMode(mode === "night" ? "day" : "night") };
}
