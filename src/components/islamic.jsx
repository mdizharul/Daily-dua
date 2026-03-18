// Islamic decorative components for light mode

// Quatrefoil lattice pattern background — used on light mode cards
export const IslamicPattern = ({ opacity = 0.07 }) => (
  <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, opacity, pointerEvents: "none" }}>
    <defs>
      <pattern id="quatrefoil" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        {/* 4-leaf clover / quatrefoil */}
        <circle cx="20" cy="10" r="8" fill="none" stroke="#c9a84c" strokeWidth="0.4" />
        <circle cx="20" cy="30" r="8" fill="none" stroke="#c9a84c" strokeWidth="0.4" />
        <circle cx="10" cy="20" r="8" fill="none" stroke="#c9a84c" strokeWidth="0.4" />
        <circle cx="30" cy="20" r="8" fill="none" stroke="#c9a84c" strokeWidth="0.4" />
        {/* Center diamond connector */}
        <rect x="16" y="16" width="8" height="8" transform="rotate(45 20 20)" fill="none" stroke="#c9a84c" strokeWidth="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#quatrefoil)" />
  </svg>
);

// Top badge/seal — crescent moon + star in emerald shield
export const BadgeSeal = ({ size = 48 }) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 48 53" fill="none" style={{ display: "block", margin: "0 auto" }}>
    {/* Shield shape */}
    <path d="M24 2 C10 2 4 10 4 20 C4 35 24 51 24 51 C24 51 44 35 44 20 C44 10 38 2 24 2Z" fill="#1a6b3c" stroke="#c9a84c" strokeWidth="1.5" />
    {/* Inner border */}
    <path d="M24 5 C12 5 7 12 7 20 C7 33 24 47 24 47 C24 47 41 33 41 20 C41 12 36 5 24 5Z" fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.6" />
    {/* Crescent */}
    <path d="M27 16 a10 10 0 1 0 0 16 a8 8 0 1 1 0-16z" fill="#c9a84c" />
    {/* Star */}
    <polygon points="33,18 34.2,21.7 38,21.7 34.9,23.9 36.1,27.6 33,25.4 29.9,27.6 31.1,23.9 28,21.7 31.8,21.7" fill="#c9a84c" />
  </svg>
);

// Gold decorative star
export const GoldStar = ({ size = 8, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#c9a84c" style={style}>
    <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
  </svg>
);

// Gold horizontal divider with center diamond
export const GoldDivider = ({ width = "80%" }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", margin: "0.6rem auto", width }}>
    <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, #c9a84c)" }} />
    <svg width="8" height="8" viewBox="0 0 8 8" fill="#c9a84c"><rect x="4" y="0" width="5.66" height="5.66" transform="rotate(45 4 4)" /></svg>
    <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, #c9a84c, transparent)" }} />
  </div>
);

// Mihrab arch frame — wraps card content in pointed arch shape (CSS-based)
export const MihrabFrame = ({ children }) => (
  <div style={{
    position: "relative",
    borderRadius: "16px",
    overflow: "hidden",
    // Triple border effect via nested divs
  }}>
    {/* Outermost gold border */}
    <div style={{
      border: "2px solid #c9a84c",
      borderRadius: "16px",
      padding: "3px",
    }}>
      {/* Green band */}
      <div style={{
        border: "3px solid #1a6b3c",
        borderRadius: "13px",
        padding: "2px",
      }}>
        {/* Inner gold border */}
        <div style={{
          border: "1.5px solid #c9a84c",
          borderRadius: "10px",
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Arch shape at top — decorative pointed top */}
          <div style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "6px",
            background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), rgba(26,107,60,0.3), rgba(201,168,76,0.3), transparent)",
            borderRadius: "0 0 50% 50%",
            zIndex: 1,
          }} />
          {children}
        </div>
      </div>
    </div>
  </div>
);
