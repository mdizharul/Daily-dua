import { useCallback, useState } from "react";
import { C, FONT } from "./theme";
import CounterScreen from "./CounterScreen";
import HistoryScreen from "./HistoryScreen";
import GoalSettingsScreen from "./GoalSettingsScreen";
import PocketMode from "./PocketMode";

/**
 * The Istighfar tracker. `tab` is "istighfar" (counter) or "history".
 * `tracker` comes from useIstighfar() in App, so counts and undo survive tab switches.
 */
export default function IstighfarSection({ tab, tracker }) {
  const [showSettings, setShowSettings] = useState(false);
  const [pocket, setPocket] = useState(false);
  const exitPocket = useCallback(() => setPocket(false), []);

  let screen;
  if (tab === "history") screen = <HistoryScreen tracker={tracker} />;
  else if (showSettings) screen = <GoalSettingsScreen tracker={tracker} onBack={() => setShowSettings(false)} />;
  else screen = <CounterScreen tracker={tracker} onOpenSettings={() => setShowSettings(true)} onPocket={() => setPocket(true)} />;

  return (
    <div style={{ minHeight: "100svh", background: C.bg, color: C.text, fontFamily: FONT, paddingBottom: "var(--nav-h)" }}>
      {screen}
      {pocket && (
        <PocketMode
          count={tracker.today.count}
          goal={tracker.settings.goal}
          strongBuzzEvery={tracker.settings.strongBuzzEvery}
          onAdd={tracker.add}
          onExit={exitPocket}
        />
      )}
    </div>
  );
}
