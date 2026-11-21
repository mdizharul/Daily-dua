import { useEffect, useRef, useState } from "react";
import { TRACKERS, addCount, dayKey, getDay, loadTracker, removeCount, saveTracker, streak, weekStats } from "./data";

const vibrate = (pattern) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // vibration not supported (e.g. iPhone Safari)
  }
};

/**
 * Dhikr tracker state (Istighfar, Hasbunallah, …). Everything returned is for the
 * *active* dhikr; switch with setActive. Undo works per dhikr.
 */
export default function useIstighfar() {
  const [data, setData] = useState(loadTracker);
  const [now, setNow] = useState(() => Date.now());
  const [undoStack, setUndoStack] = useState([]); // [{ id, key, amount }] — this visit only

  useEffect(() => saveTracker(data), [data]);

  // Re-check the clock every minute so the day rolls over and the reminder can appear.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const shared = data.settings;
  const active = shared.active;
  const tracker = data.trackers[active];
  const info = TRACKERS[active];
  const form = info.forms[tracker.form] || info.forms[info.defaultForm];
  const settings = { ...shared, goal: tracker.goal, dhikr: tracker.form };

  const todayKey = dayKey(now, shared.resetAt);
  const today = getDay(tracker.days, todayKey);

  // Tasbih-style rounds: Reset keeps today's total but starts the big counter at 0.
  const round = tracker.round?.key === todayKey ? tracker.round : null;
  const roundBase = Math.min(round?.base || 0, today.count);
  const roundCount = today.count - roundBase;

  // Latest count for haptics, so rapid taps between renders still buzz correctly.
  const countRef = useRef(today.count);
  useEffect(() => {
    countRef.current = today.count;
  }, [today.count, active]);

  const updateTrackerOf = (id, fn) =>
    setData((d) => ({ ...d, trackers: { ...d.trackers, [id]: fn(d.trackers[id]) } }));

  const add = (amount) => {
    const t = Date.now();
    const before = countRef.current;
    const after = before + amount;
    countRef.current = after;

    const every = shared.strongBuzzEvery;
    if (before < tracker.goal && after >= tracker.goal) vibrate([80, 60, 80, 60, 160]);
    else if (Math.floor(after / every) > Math.floor(before / every)) vibrate([40, 60, 40]);
    else vibrate(12);

    const key = dayKey(t, shared.resetAt);
    setNow(t);
    updateTrackerOf(active, (tr) => ({ ...tr, days: addCount(tr.days, key, amount, t, tr.round?.key === key ? tr.round.at : 0) }));
    setUndoStack((s) => [...s.slice(-199), { id: active, key, amount }]);
  };

  // Undo the latest count of the dhikr on screen.
  const lastIndex = undoStack.map((u) => u.id).lastIndexOf(active);
  const undo = () => {
    if (lastIndex < 0) return;
    const last = undoStack[lastIndex];
    vibrate(20);
    setUndoStack((s) => s.filter((_, i) => i !== lastIndex));
    updateTrackerOf(last.id, (tr) => ({ ...tr, days: removeCount(tr.days, last.key, last.amount) }));
  };

  /** Save the current round (it stays in today's total and History) and start counting from 0. */
  const reset = () => {
    if (roundCount === 0) return;
    vibrate([30, 40, 30]);
    const saved = roundCount;
    updateTrackerOf(active, (tr) => ({ ...tr, round: { key: todayKey, base: getDay(tr.days, todayKey).count, at: Date.now(), last: saved } }));
    // Undoing counts from a finished round would change a saved round, so clear them.
    setUndoStack((s) => s.filter((u) => u.id !== active));
  };

  /** Shared settings: resetAt, reminder, strongBuzzEvery. Goal & dhikr form go to the active dhikr. */
  const updateSettings = (patch) => {
    const { goal, dhikr, ...rest } = patch;
    if (goal !== undefined || dhikr !== undefined) {
      updateTrackerOf(active, (tr) => ({ ...tr, ...(goal !== undefined && { goal }), ...(dhikr !== undefined && { form: dhikr }) }));
    }
    if (Object.keys(rest).length) setData((d) => ({ ...d, settings: { ...d.settings, ...rest } }));
  };

  const setActive = (id) => setData((d) => ({ ...d, settings: { ...d.settings, active: id } }));

  /** Turn tracking of a dhikr on or off. At least one stays on. */
  const setEnabled = (id, on) =>
    setData((d) => {
      const list = on ? [...new Set([...d.settings.enabled, id])] : d.settings.enabled.filter((x) => x !== id);
      if (!list.length) return d;
      const ordered = Object.keys(TRACKERS).filter((x) => list.includes(x));
      const nextActive = ordered.includes(d.settings.active) ? d.settings.active : ordered[0];
      return { ...d, settings: { ...d.settings, enabled: ordered, active: nextActive } };
    });

  return {
    now,
    active,
    info,
    form,
    enabled: shared.enabled,
    setActive,
    setEnabled,
    settings,
    updateSettings,
    today,
    todayKey,
    add,
    undo,
    canUndo: lastIndex >= 0,
    roundCount,
    roundReset: roundBase > 0,
    lastRound: round?.last || 0,
    reset,
    streak: streak(tracker.days, todayKey),
    week: weekStats(tracker.days, todayKey, tracker.goal),
  };
}
