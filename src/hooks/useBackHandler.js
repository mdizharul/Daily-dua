import { useEffect, useRef } from "react";

// Phone back gesture / back button inside the app.
// Screens that open on top of others (share sheet, Pocket mode, Dhikr History…)
// register a handler while they're open; the most recent one runs first.
// App.jsx asks runBackHandler() before doing its own screen-level back.
const handlers = [];

export function useBackHandler(active, onBack) {
  const latest = useRef(onBack);
  useEffect(() => {
    latest.current = onBack;
  });
  useEffect(() => {
    if (!active) return undefined;
    const handler = () => latest.current();
    handlers.push(handler);
    return () => {
      const i = handlers.lastIndexOf(handler);
      if (i >= 0) handlers.splice(i, 1);
    };
  }, [active]);
}

/** Runs the top-most back handler. Returns true if one was found. */
export function runBackHandler() {
  const handler = handlers[handlers.length - 1];
  if (!handler) return false;
  handler();
  return true;
}
