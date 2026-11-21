import { C } from "../istighfar/theme";
import { BeadsIcon, LibraryIcon, MemorizeIcon } from "../library/icons";

const ITEMS = [
  { id: "library", label: "Library", Icon: LibraryIcon },
  { id: "memorize", label: "Memorize", Icon: MemorizeIcon },
  { id: "istighfar", label: "Dhikr", Icon: BeadsIcon },
];

/**
 * App-wide bottom navigation. Library and Memorize use the library palette (L);
 * the Istighfar tab uses the tracker's own green-on-white style.
 */
export default function BottomNav({ section, onChange, L }) {
  const colors =
    section === "istighfar"
      ? { bg: C.bg, border: C.border, active: C.accent, idle: C.muted }
      : { bg: L.bg, border: L.border, active: L.text, idle: L.muted };

  return (
    <nav
      aria-label="Main"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        background: colors.bg,
        borderTop: `1px solid ${colors.border}`,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${ITEMS.length}, minmax(0, 1fr))`, maxWidth: "600px", margin: "0 auto", padding: "8px 12px 10px" }}>
        {ITEMS.map((item) => {
          const { id, label, Icon } = item;
          const active = section === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onChange(id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-ui)",
                fontSize: "12px",
                fontWeight: active ? 600 : 500,
                color: active ? colors.active : colors.idle,
              }}
            >
              <Icon />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
