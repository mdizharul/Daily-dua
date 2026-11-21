import { C } from "../istighfar/theme";
import { BookIcon, ChartIcon, ClockIcon } from "../istighfar/icons";

const ITEMS = [
  { id: "duas", label: "Duas", Icon: BookIcon },
  { id: "istighfar", label: "Istighfar", Icon: ClockIcon },
  { id: "history", label: "History", Icon: ChartIcon },
];

/**
 * App-wide bottom navigation. On the Duas tab it follows the Daily Dua theme (T);
 * on the Istighfar tabs it uses the tracker's own green-on-white style.
 */
export default function BottomNav({ section, onChange, T }) {
  const tracker = section !== "duas";
  const colors = tracker
    ? { bg: C.bg, border: C.border, active: C.accent, idle: C.muted }
    : { bg: T.navBg, border: T.cardBorder, active: T.gold, idle: T.goldFaint };

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
