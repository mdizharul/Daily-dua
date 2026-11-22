import { useCallback, useState } from "react";
import { C, FONT } from "./theme";
import { useBackHandler } from "../hooks/useBackHandler";
import CounterScreen from "./CounterScreen";
import HistoryScreen from "./HistoryScreen";
import GoalSettingsScreen from "./GoalSettingsScreen";
import PocketMode from "./PocketMode";

/**
 * Dhikr tracker (Istighfar, Hasbunallah): Counter, with History and Goal & settings opened from its header.
 * `tracker` comes from useIstighfar() in App, so counts and undo survive tab switches.
 */
export default function IstighfarSection({ tracker }) {
  const [screen, setScreen] = useState("counter"); // "counter" | "history" | "settings"
  const [pocket, setPocket] = useState(false);
  const exitPocket = useCallback(() => setPocket(false), []);
  const toCounter = () => setScreen("counter");
  useBackHandler(screen !== "counter", toCounter);

  let content;
  if (screen === "history") content = <HistoryScreen tracker={tracker} onBack={toCounter} />;
  else if (screen === "settings") content = <GoalSettingsScreen tracker={tracker} onBack={toCounter} />;
  else
    content = (
      <CounterScreen
        tracker={tracker}
        onOpenSettings={() => setScreen("settings")}
        onOpenHistory={() => setScreen("history")}
        onPocket={() => setPocket(true)}
      />
    );

  return (
    <div style={{ minHeight: "100svh", background: C.bg, color: C.text, fontFamily: FONT, paddingBottom: "var(--nav-h)" }}>
      {content}
      {pocket && (
        <PocketMode
          label={tracker.info.label}
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
