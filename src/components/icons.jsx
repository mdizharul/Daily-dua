export const StarIcon = ({ size = 16, color = "#c9a84c" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
  </svg>
);

export const Spinner = ({ size = 20, inline = false }) => (
  <div style={{ width: size, height: size, border: "2px solid rgba(201,168,76,0.2)", borderTop: "2px solid #c9a84c", borderRadius: "50%", animation: "spin 1s linear infinite", ...(inline ? { display: "inline-block", flexShrink: 0 } : { margin: "0 auto" }) }} />
);
