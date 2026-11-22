import { T, FONT } from "../theme/tokens";
import { BeadsIcon, LibraryIcon, MemorizeIcon } from "../library/icons";

const ITEMS = [
  { id: "library", label: "Library", Icon: LibraryIcon },
  { id: "istighfar", label: "Dhikr", Icon: BeadsIcon },
  { id: "memorize", label: "Memorize", Icon: MemorizeIcon },
];

/** App-wide bottom navigation, same look on every tab. */
export default function BottomNav({ section, onChange }) {
  return (
    <nav
      aria-label="Main"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        background: T.bg,
        borderTop: `1px solid ${T.border}`,
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
                fontFamily: FONT,
                fontSize: "12px",
                fontWeight: active ? 600 : 500,
                color: active ? T.accent : T.muted,
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
