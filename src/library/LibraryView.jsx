import { useMemo } from "react";
import { CATEGORIES } from "../constants";
import { FONT_SERIF, chip, column, iconBtn, page } from "./theme";
import { categoryLabel, headerDate, isLearnt, splitLines } from "./duaUtils";
import { FlameIcon, GearIcon, PlusIcon, SearchIcon } from "./icons";

/**
 * Home screen: compact list of duas. Tap a dua to open its page.
 * `filters` = { tab: "learn" | "learnt", category, search, searchOpen } — kept in App
 * so they survive opening a dua and coming back.
 */
export default function LibraryView({ L, duas, filters, setFilters, streak, onOpen, onAdd, onSettings }) {
  const { tab, category, search, searchOpen } = filters;
  const set = (patch) => setFilters({ ...filters, ...patch });

  const learnt = duas.filter(isLearnt);
  const toLearn = duas.filter((d) => !isLearnt(d));
  const source = tab === "learnt" ? learnt : toLearn;

  // Only offer categories that actually have duas in the current tab.
  const usedCategories = useMemo(() => {
    const used = new Set(source.map((d) => d.category || "general"));
    return CATEGORIES.filter((c) => used.has(c.id));
  }, [source]);

  const q = search.trim().toLowerCase();
  const visible = source
    .filter((d) => category === "all" || (d.category || "general") === category)
    .filter((d) => !q || [d.title, d.transliteration, d.translation, d.arabic].some((f) => (f || "").toLowerCase().includes(q)));

  return (
    <div style={page(L)}>
      <div style={{ ...column, paddingBottom: "96px" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "13px", color: L.muted, fontWeight: 500 }}>{headerDate()}</span>
            <h1 style={{ margin: 0, fontFamily: FONT_SERIF, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px", color: L.text }}>Daily Dua</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {streak > 0 && (
              <span title="Days in a row with a recitation" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 700, color: L.tagText, background: L.tagBg, padding: "6px 10px", borderRadius: "999px" }}>
                <FlameIcon /> {streak}
              </span>
            )}
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
            style={{ height: "44px", borderRadius: "14px", border: `1px solid ${L.border}`, background: L.card, color: L.text, padding: "0 14px", fontSize: "15px", fontFamily: "var(--font-ui)", outline: "none" }}
          />
        )}

        {/* To learn / Learnt */}
        <div role="group" aria-label="Show" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", background: L.track, borderRadius: "14px", padding: "4px" }}>
          {[
            ["learn", `To learn (${toLearn.length})`],
            ["learnt", `Learnt (${learnt.length})`],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={tab === id}
              onClick={() => set({ tab: id, category: "all" })}
              style={{ height: "36px", border: "none", borderRadius: "10px", background: tab === id ? L.card : "transparent", color: L.text, fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-ui)", cursor: "pointer" }}
            >
              {label}
            </button>
          ))}
        </div>

        {usedCategories.length > 1 && (
          <div className="no-scrollbar" style={{ display: "flex", gap: "8px", overflowX: "auto", margin: "0 -20px", padding: "0 20px" }}>
            <button type="button" aria-pressed={category === "all"} onClick={() => set({ category: "all" })} style={chip(L, category === "all")}>
              All
            </button>
            {usedCategories.map((c) => (
              <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => set({ category: c.id })} style={chip(L, category === c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        )}

        <section style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: L.text }}>{tab === "learnt" ? "Learnt duas" : "My duas"}</h2>
            <span style={{ fontSize: "13px", color: L.muted }}>
              {visible.length} {visible.length === 1 ? "dua" : "duas"}
            </span>
          </div>

          {visible.map((dua) => (
            <button
              key={dua.id}
              type="button"
              onClick={() => onOpen(dua.id)}
              style={{ display: "flex", flexDirection: "column", gap: "4px", background: L.card, border: `1px solid ${L.border}`, borderRadius: "20px", padding: "12px 16px", textAlign: "left", color: L.text, cursor: "pointer", fontFamily: "var(--font-ui)", width: "100%" }}
            >
              <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", width: "100%" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.35, overflowWrap: "anywhere" }}>{dua.title}</span>
                <span style={{ flexShrink: 0, fontSize: "11px", fontWeight: 600, color: isLearnt(dua) ? L.green : L.tagText, background: isLearnt(dua) ? L.greenBg : L.tagBg, padding: "3px 8px", borderRadius: "999px" }}>
                  {isLearnt(dua) ? "Learnt" : categoryLabel(dua)}
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
          ))}

          {visible.length === 0 && (
            <p style={{ margin: 0, padding: "32px 8px", textAlign: "center", fontSize: "14px", color: L.muted }}>
              {q
                ? "No duas match your search."
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
