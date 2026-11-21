// Line icons from the Istighfar mockup.
const Svg = ({ size = 20, stroke = "currentColor", width = 2, children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const FlameIcon = (p) => (
  <Svg size={16} {...p}>
    <path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-4 2-5 0 2 1 3 2 3 0-4-1-6 1-9z" />
  </Svg>
);

export const SlidersIcon = (p) => (
  <Svg width={1.8} {...p}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </Svg>
);

export const ChevronDownIcon = (p) => (
  <Svg {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);

export const BackIcon = (p) => (
  <Svg {...p}>
    <path d="M15 18l-6-6 6-6" />
  </Svg>
);

export const TapIcon = (p) => (
  <Svg size={18} width={1.8} {...p}>
    <path d="M9 11V5a2 2 0 0 1 4 0v6" />
    <path d="M13 10a2 2 0 0 1 4 0v2" />
    <path d="M17 11a2 2 0 0 1 4 0v4a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-3l-3-5a2 2 0 0 1 3-2l2 2" />
  </Svg>
);

export const UndoIcon = (p) => (
  <Svg size={18} {...p}>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h11a5 5 0 0 1 0 10h-3" />
  </Svg>
);

export const MoonIcon = (p) => (
  <Svg size={18} {...p}>
    <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" />
  </Svg>
);

export const CloseIcon = (p) => (
  <Svg size={18} {...p}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

export const ClockIcon = (p) => (
  <Svg size={22} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const ChartIcon = (p) => (
  <Svg size={22} {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Svg>
);

export const BookIcon = (p) => (
  <Svg size={22} {...p}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z" />
    <path d="M20 17v4H6.5A2.5 2.5 0 0 1 4 18.5" />
  </Svg>
);
