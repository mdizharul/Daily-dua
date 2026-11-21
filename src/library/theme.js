// Library / Dua page / Memorize screens use the app-wide design system
// (src/theme/tokens.js). `L` keeps the names these screens were written with.
import { T, FONT_DISPLAY, chip as chipStyle, column as baseColumn, iconButton, page as basePage, tile as baseTile } from "../theme/tokens";

const L = {
  bg: T.bg,
  card: T.card,
  border: T.border,
  text: T.text,
  muted: T.muted,
  body: T.body,
  hero: T.hero,
  heroText: T.heroText,
  heroMuted: T.heroMuted,
  heroFrame: T.heroFrame,
  gold: T.heroAccent, // labels and ornaments on the green hero cards
  tagBg: T.warmBg,
  tagText: T.warmText,
  track: T.divider,
  green: T.accent,
  greenBg: T.accentSoft,
  accent: T.accent,
  onAccent: T.onAccent,
  primaryBg: T.primary,
  primaryText: T.onPrimary,
  danger: T.danger,
  shadow: T.shadow,
};

/** The library palette. Day/Night is handled by CSS variables, so there's only one. */
export const getLibraryTheme = () => L;

// Headings use the same display face as the Dhikr screens.
export const FONT_SERIF = FONT_DISPLAY;

export const iconBtn = () => iconButton;
export const chip = (_L, active) => chipStyle(active);
export const tile = () => baseTile;
export const page = () => basePage;
export const column = baseColumn;
