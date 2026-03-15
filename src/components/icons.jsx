export const StarIcon = ({ size = 16, color = "#c9a84c" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
  </svg>
);

export const GeoBg = ({ paper = false }) => (
  <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, opacity: paper ? 0.06 : 0.035, pointerEvents: "none" }}>
    <defs>
      <pattern id="geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30 0L60 15L60 45L30 60L0 45L0 15Z" fill="none" stroke={paper ? "#8b5e20" : "currentColor"} strokeWidth="0.5" />
        <circle cx="30" cy="30" r="8" fill="none" stroke={paper ? "#8b5e20" : "currentColor"} strokeWidth="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#geo)" />
  </svg>
);

export const Spinner = ({ size = 20, inline = false }) => (
  <div style={{ width: size, height: size, border: "2px solid rgba(201,168,76,0.2)", borderTop: "2px solid #c9a84c", borderRadius: "50%", animation: "spin 1s linear infinite", ...(inline ? { display: "inline-block", flexShrink: 0 } : { margin: "0 auto" }) }} />
);
