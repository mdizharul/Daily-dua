import { useMemo } from "react";
import { MOODS } from "../constants";
import { FONT_SERIF, chip, column, iconBtn, page } from "./theme";
import { categoryLabel, duaMoods, headerDate, isLearnt, routineStats, splitLines, todayKey, todaysDua } from "./duaUtils";
import { FlameIcon, GearIcon, PlusIcon, SearchIcon, StarPattern } from "./icons";

/**
 * Home screen: today's routine, today's dua, mood chips and the list of duas.
 * `filters` = { tab: "learn" | "learnt", mood, routineOnly, search, searchOpen } — kept in App
 * so they survive opening a dua and coming back.
 */
export default function LibraryView({ L, duas, filters, setFilters, streak, onOpen, onAdd, onSettings }) {
  const { tab, mood, routineOnly, search, searchOpen } = filters;
  const set = (patch) => setFilters({ ...filters, ...patch });

  const day = todayKey();
  const routine = routineStats(duas, day);
  const featured = todaysDua(duas, day);

  const learnt = duas.filter(isLearnt);
  const toLearn = duas.filter((d) => !isLearnt(d));
  const source = routineOnly ? routine.list : tab === "learnt" ? learnt : toLearn;

  // Only offer moods that some dua actually has.
  const usedMoods = useMemo(() => {
    const used = new Set(duas.flatMap(duaMoods));
    return MOODS.filter((m) => used.has(m.id));
  }, [duas]);

  const q = search.trim().toLowerCase();
  const visible = source
    .filter((d) => mood === "all" || duaMoods(d).includes(mood))
    .filter((d) => !q || [d.title, d.transliteration, d.translation, d.arabic].some((f) => (f || "").toLowerCase().includes(q)));

  const heading = routineOnly ? "Today's routine" : tab === "learnt" ? "Learnt duas" : "My duas";

  return (
    <div style={page(L)}>
      <div style={{ ...column, paddingBottom: "96px" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "13px", color: L.muted, fontWeight: 500 }}>{headerDate()}</span>
            <h1 style={{ margin: 0, fontFamily: FONT_SERIF, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px", color: L.text }}>Daily Dua</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button type="button" aria-label="Search duas" aria-pressed={searchOpen} onClick={() => set({ searchOpen: !searchOpen, search: searchOpen ? "" : search })} style={iconBtn(L)}>
              <SearchIcon />
            </button>
            <button type="button" aria-label="Settings" onClick={onSettings} style={iconBtn(L)}>
              <GearIcon />
            </button>
          </div>
        </header>

        {searchOpen && (
          <input
            autoFocus
            type="search"
            placeholder="Search title, words or meaning…"
            value={search}
            onChange={(e) => set({ search: e.target.value })}
            style={{ height: "44px", borderRadius: "14px", border: `1px solid ${L.border}`, background: L.card, color: L.text, padding: "0 14px", fontSize: "15px", fontFamily: "var(--font-ui)" }}
          />
        )}

        {/* Today's routine */}
        <button
          type="button"
          aria-pressed={routineOnly}
          onClick={() => routine.total && set({ routineOnly: !routineOnly, mood: "all" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            background: L.card,
            border: `1px solid ${routineOnly ? L.accent : L.border}`,
            borderRadius: "18px",
            padding: "12px 14px",
            textAlign: "left",
            color: L.text,
            cursor: routine.total ? "pointer" : "default",
            fontFamily: "var(--font-ui)",
          }}
        >
          <span style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
            <span style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "13px", fontWeight: 600 }}>
              <span>Today's routine</span>
              <span style={{ color: L.muted, fontWeight: 500 }}>
                {routine.total ? `${routine.done} of ${routine.total} recited` : "Not set up"}
              </span>
            </span>
            {routine.total ? (
              <span style={{ height: "6px", borderRadius: "999px", background: L.track, display: "flex", overflow: "hidden" }}>
                <span style={{ width: `${(routine.done / routine.total) * 100}%`, background: L.accent, borderRadius: "999px", transition: "width 0.3s" }} />
              </span>
            ) : (
              <span style={{ fontSize: "12px", color: L.muted }}>Open a dua and turn on “Daily routine” to add it here</span>
            )}
          </span>
          {streak > 0 && (
            <span title="Days in a row with a recitation" style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 700, color: L.tagText, background: L.tagBg, padding: "6px 10px", borderRadius: "999px" }}>
              <FlameIcon /> {streak}
            </span>
          )}
        </button>

        {/* Today's dua */}
        {featured && !q && !routineOnly && (
          <button
            type="button"
            onClick={() => onOpen(featured.id)}
            style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: "10px", width: "100%", background: L.hero, color: L.heroText, border: "none", borderRadius: "28px", padding: "18px 20px", textAlign: "left", cursor: "pointer", fontFamily: "var(--font-ui)" }}
          >
            <StarPattern color={L.gold} />
            <span style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", width: "100%" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: L.gold }}>Today's dua</span>
              <span style={{ fontSize: "12px", color: L.heroMuted, textAlign: "right" }}>{featured.title}</span>
            </span>
            <span
              lang="ar"
              dir="rtl"
              style={{ position: "relative", fontFamily: "var(--arabic-font)", fontSize: "calc(22px * var(--arabic-scale))", lineHeight: 1.7, textAlign: "right", width: "100%", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
            >
              {splitLines(featured.arabic).join(" ")}
            </span>
            {featured.translation && (
              <span style={{ position: "relative", fontSize: "13px", lineHeight: 1.5, color: L.heroMuted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {splitLines(featured.translation).join(" ")}
              </span>
            )}
          </button>
        )}

        {/* How is your heart today? */}
        {usedMoods.length > 0 && (
          <section style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h2 style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: L.muted }}>How is your heart today?</h2>
            <div className="no-scrollbar" style={{ display: "flex", gap: "8px", overflowX: "auto", margin: "0 -20px", padding: "0 20px" }}>
              <button type="button" aria-pressed={mood === "all"} onClick={() => set({ mood: "all" })} style={chip(L, mood === "all")}>
                All
              </button>
              {usedMoods.map((m) => (
                <button key={m.id} type="button" aria-pressed={mood === m.id} onClick={() => set({ mood: mood === m.id ? "all" : m.id })} style={chip(L, mood === m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* To learn / Learnt */}
        {!routineOnly && (
          <div role="group" aria-label="Show" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", background: L.track, borderRadius: "14px", padding: "4px" }}>
            {[
              ["learn", `To learn (${toLearn.length})`],
              ["learnt", `Learnt (${learnt.length})`],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={tab === id}
                onClick={() => set({ tab: id })}
                style={{ height: "36px", border: "none", borderRadius: "10px", background: tab === id ? L.card : "transparent", color: tab === id ? L.accent : L.muted, fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-ui)", cursor: "pointer" }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <section style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: L.text }}>{heading}</h2>
            {routineOnly ? (
              <button type="button" onClick={() => set({ routineOnly: false })} style={{ background: "none", border: "none", color: L.accent, fontSize: "13px", fontWeight: 600, cursor: "pointer", minHeight: "36px", fontFamily: "var(--font-ui)" }}>
                Show all duas
              </button>
            ) : (
              <span style={{ fontSize: "13px", color: L.muted }}>
                {visible.length} {visible.length === 1 ? "dua" : "duas"}
              </span>
            )}
          </div>

          {visible.map((dua) => {
            const recited = (dua.recites?.[day] || 0) > 0;
            return (
              <button
                key={dua.id}
                type="button"
                onClick={() => onOpen(dua.id)}
                style={{ display: "flex", flexDirection: "column", gap: "4px", background: L.card, border: `1px solid ${L.border}`, borderRadius: "20px", padding: "12px 16px", textAlign: "left", color: L.text, cursor: "pointer", fontFamily: "var(--font-ui)", width: "100%" }}
              >
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", width: "100%" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.35, overflowWrap: "anywhere" }}>{dua.title}</span>
                  <span style={{ flexShrink: 0, fontSize: "11px", fontWeight: 600, color: isLearnt(dua) || (routineOnly && recited) ? L.green : L.tagText, background: isLearnt(dua) || (routineOnly && recited) ? L.greenBg : L.tagBg, padding: "3px 8px", borderRadius: "999px" }}>
                    {routineOnly ? (recited ? "✓ Recited" : "Not yet") : isLearnt(dua) ? "Learnt" : categoryLabel(dua)}
                  </span>
                </span>
                <span
                  lang="ar"
                  dir="rtl"
                  style={{ fontFamily: "var(--arabic-font)", fontSize: "calc(20px * var(--arabic-scale))", lineHeight: 1.6, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}
                >
                  {splitLines(dua.arabic)[0]}
                </span>
                {dua.translation && (
                  <span style={{ fontSize: "12px", color: L.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                    {splitLines(dua.translation)[0]}
                  </span>
                )}
              </button>
            );
          })}

          {visible.length === 0 && (
            <p style={{ margin: 0, padding: "32px 8px", textAlign: "center", fontSize: "14px", color: L.muted }}>
              {q
                ? "No duas match your search."
                : mood !== "all"
                  ? "No duas for this feeling here yet. Try “All”, or tag a dua with it when editing."
                  : tab === "learnt"
                    ? "No learnt duas yet. Practise in Memorize, or open a dua and tap “Mark learnt”."
                    : duas.length
                      ? "Every dua here is learnt — mā shā’ Allāh! Add a new one to keep going."
                      : "No duas yet. Tap “Add dua” to add your first."}
            </p>
          )}
        </section>
      </div>

      {/* Floating Add button, above the bottom nav */}
      <button
        type="button"
        aria-label="Add a new dua"
        onClick={onAdd}
        style={{
          position: "fixed",
          right: "max(20px, calc(50% - 220px))",
          bottom: "calc(var(--nav-h) + 16px)",
          height: "56px",
          padding: "0 20px",
          borderRadius: "999px",
          border: "none",
          background: L.accent,
          color: L.onAccent,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "15px",
          fontWeight: 700,
          fontFamily: "var(--font-ui)",
          boxShadow: L.shadow,
          cursor: "pointer",
          zIndex: 40,
        }}
      >
        <PlusIcon /> Add dua
      </button>
    </div>
  );
}
