import { useEffect, useRef, useState } from "react";
import { addCount, dayKey, getDay, loadTracker, removeCount, saveTracker, streak, weekStats } from "./data";

const vibrate = (pattern) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // vibration not supported (e.g. iPhone Safari)
  }
};

/** All Istighfar tracker state: today's count, history stats, settings, undo. */
export default function useIstighfar() {
  const [data, setData] = useState(loadTracker);
  const [now, setNow] = useState(() => Date.now());
  const [undoStack, setUndoStack] = useState([]); // [{ amount, key }] — this visit only

  useEffect(() => saveTracker(data), [data]);

  // Re-check the clock every minute so the day rolls over and the reminder can appear.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const { settings } = data;
  const todayKey = dayKey(now, settings.resetAt);
  const today = getDay(data, todayKey);

  // Latest count for haptics, so rapid taps between renders still buzz correctly.
  const countRef = useRef(today.count);
  useEffect(() => {
    countRef.current = today.count;
  }, [today.count]);

  const add = (amount) => {
    const t = Date.now();
    const before = countRef.current;
    const after = before + amount;
    countRef.current = after;

    const every = settings.strongBuzzEvery;
    if (before < settings.goal && after >= settings.goal) vibrate([80, 60, 80, 60, 160]);
    else if (Math.floor(after / every) > Math.floor(before / every)) vibrate([40, 60, 40]);
    else vibrate(12);

    setNow(t);
    setData((d) => addCount(d, amount, t));
    setUndoStack((s) => [...s.slice(-199), { amount, key: dayKey(t, settings.resetAt) }]);
  };

  const undo = () => {
    const last = undoStack[undoStack.length - 1];
    if (!last) return;
    vibrate(20);
    setUndoStack((s) => s.slice(0, -1));
    setData((d) => removeCount(d, last.amount, last.key));
  };

  const updateSettings = (patch) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));

  return {
    now,
    settings,
    updateSettings,
    today,
    todayKey,
    add,
    undo,
    canUndo: undoStack.length > 0,
    streak: streak(data, todayKey),
    week: weekStats(data, todayKey),
  };
}
