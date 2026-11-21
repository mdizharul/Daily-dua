import { C, FONT } from "./theme";
import { TRACKERS } from "./data";

/** Segmented switch between the dhikr being tracked. Hidden when only one is on. */
export default function DhikrSwitch({ tracker }) {
  const { enabled, active, setActive } = tracker;
  if (enabled.length < 2) return null;

  return (
    <div
      role="tablist"
      aria-label="Dhikr"
      style={{ display: "grid", gridTemplateColumns: `repeat(${enabled.length}, minmax(0, 1fr))`, gap: "4px", background: C.divider, borderRadius: "14px", padding: "4px", flexShrink: 0 }}
    >
      {enabled.map((id) => {
        const on = id === active;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => setActive(id)}
            style={{
              height: "38px",
              border: "none",
              borderRadius: "10px",
              background: on ? C.card : "transparent",
              color: on ? C.accent : C.muted,
              boxShadow: on ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              fontFamily: FONT,
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {TRACKERS[id].label}
          </button>
        );
      })}
    </div>
  );
}
