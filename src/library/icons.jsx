// Line icons for the Library / Dua page / Memorize screens.
const Svg = ({ size = 20, width = 2, children, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Svg>
);

export const GearIcon = (p) => (
  <Svg width={1.8} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </Svg>
);

export const BackIcon = (p) => (
  <Svg {...p}>
    <path d="M15 18l-6-6 6-6" />
  </Svg>
);

export const EditIcon = (p) => (
  <Svg size={18} {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Svg>
);

export const PlusIcon = (p) => (
  <Svg width={2.4} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const MemorizeIcon = (p) => (
  <Svg size={22} {...p}>
    <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" />
  </Svg>
);

export const LibraryIcon = (p) => (
  <Svg size={22} {...p}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z" />
    <path d="M20 17v4H6.5A2.5 2.5 0 0 1 4 18.5" />
  </Svg>
);

export const BeadsIcon = (p) => (
  <Svg size={22} {...p}>
    <circle cx="12" cy="12" r="8" strokeDasharray="0.1 3.4" strokeWidth="3" />
    <circle cx="12" cy="20" r="1.6" />
  </Svg>
);

export const CheckIcon = (p) => (
  <Svg size={18} width={2.4} {...p}>
    <path d="M20 6L9 17l-5-5" />
  </Svg>
);

export const ShareIcon = (p) => (
  <Svg size={18} {...p}>
    <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
    <path d="M16 6l-4-4-4 4M12 2v13" />
  </Svg>
);

export const SpeakerIcon = ({ playing, ...p }) => (
  <Svg size={18} {...p}>
    {playing ? (
      <>
        <rect x="6" y="5" width="4" height="14" />
        <rect x="14" y="5" width="4" height="14" />
      </>
    ) : (
      <>
        <path d="M11 5L6 9H2v6h4l5 4z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      </>
    )}
  </Svg>
);

export const CopyIcon = (p) => (
  <Svg size={16} {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

export const TrashIcon = (p) => (
  <Svg size={16} {...p}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </Svg>
);

export const FlameIcon = (p) => (
  <Svg size={14} {...p}>
    <path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-4 2-5 0 2 1 3 2 3 0-4-1-6 1-9z" />
  </Svg>
);

/** 8-point star medallion used on the navy hero cards. */
export const Medallion = ({ size = 28, color = "#D9B45E" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke={color} strokeWidth="1.3">
      <rect x="7" y="7" width="18" height="18" />
      <rect x="7" y="7" width="18" height="18" transform="rotate(45 16 16)" />
      <circle cx="16" cy="16" r="4" />
    </g>
  </svg>
);

/** Faint 8-point-star tile pattern behind hero cards. */
export const StarPattern = ({ color = "#D9B45E", opacity = 0.09 }) => (
  <svg width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
    <defs>
      <pattern id="dd-star" width="44" height="44" patternUnits="userSpaceOnUse">
        <g fill="none" stroke={color} strokeWidth="1">
          <rect x="12" y="12" width="20" height="20" />
          <rect x="12" y="12" width="20" height="20" transform="rotate(45 22 22)" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dd-star)" />
  </svg>
);
