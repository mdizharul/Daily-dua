// The Dhikr tracker uses the app-wide design system (src/theme/tokens.js).
// Kept as its own module so the tracker's screens read naturally (C.accent, C.ring…).
import { T, FONT, FONT_DISPLAY, card, iconButton, pillButton } from "../theme/tokens";

export const C = {
  bg: T.bg,
  card: T.card,
  border: T.border,
  divider: T.divider,
  text: T.text,
  muted: T.muted,
  accent: T.accent,
  onAccent: T.onAccent,
  accentSoft: T.accentSoft,
  accentTint: T.accentTint,
  primary: T.primary,
  onPrimary: T.onPrimary,
  ring: T.ring,
  barLight: T.barLight,
  barToday: T.barToday,
  goalLine: T.goalLine,
  legendLine: T.legendLine,
  radioOff: T.radioOff,
  streakBg: T.warmBg,
  streakText: T.warmText,
  streakIcon: T.warmIcon,
  warnBg: T.warmBg,
  warnText: T.warmText,
  // Pocket mode is always dark (screen dimmed in a pocket), in Day and Night alike.
  pocket: {
    bg: "#080B0A",
    text: "#C8D8D1",
    muted: "#8FA79D",
    border: "#24302C",
    track: "#1A2420",
    fill: "#3E8C72",
  },
};

export { FONT, card, iconButton, pillButton };
export const FONT_NUM = FONT_DISPLAY;
