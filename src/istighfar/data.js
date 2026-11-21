// Dhikr tracker (Istighfar, Hasbunallah) — data model and pure helpers (no React here).
//
// Stored in localStorage under "istighfar-tracker":
// {
//   settings: { resetAt, reminder, strongBuzzEvery, enabled: ["istighfar", ...], active },
//   trackers: {
//     istighfar:   { goal, form, days: { "YYYY-MM-DD": { count, sessions: [{ start, end, count }] } },
//                    round: { key, base, at, last } },   // tasbih-style Reset: today's count at reset
//     hasbunallah: { goal, form, days: { ... } }
//   }
// }
// Older saves ({ settings: { goal, dhikr, ... }, days }) are upgraded on load.

export const STORAGE_KEY = "istighfar-tracker";

export const BUZZ_OPTIONS = [33, 100, 500];

// Fajr time varies by location and season; the day rollover uses a fixed 5 am.
export const FAJR_HOUR = 5;

// A pause longer than this starts a new session in History.
const SESSION_GAP_MS = 10 * 60 * 1000;

// Steady pace used for the "About 3h 20m a day" estimate.
const COUNTS_PER_MINUTE = 50;

/** Every dhikr the user can track. Each has its own count, goal, streak and history. */
export const TRACKERS = {
  istighfar: {
    label: "Istighfar",
    goals: [1000, 3000, 5000, 10000],
    defaultGoal: 10000,
    defaultForm: "short",
    forms: {
      short: {
        label: "Astaghfirullah",
        hint: "Short form — fastest to count",
        arabic: "أَسْتَغْفِرُ ٱللَّٰهَ",
        meaning: "Astaghfirullah · I seek Allah's forgiveness",
      },
      tawbah: {
        label: "Astaghfirullah wa atubu ilayh",
        hint: "With tawbah",
        arabic: "أَسْتَغْفِرُ ٱللَّٰهَ وَأَتُوبُ إِلَيْهِ",
        meaning: "I seek Allah's forgiveness and turn to Him in repentance",
      },
      sayyid: {
        label: "Sayyidul Istighfar",
        hint: "Full text shown on screen",
        arabic: [
          "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ",
          "وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
          "أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ",
          "أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي",
          "فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        ].join("\n"),
        meaning: "Sayyidul Istighfar · the master of seeking forgiveness",
      },
    },
  },
  hasbunallah: {
    label: "Hasbunallah",
    goals: [100, 500, 1000, 3000],
    defaultGoal: 500,
    defaultForm: "short",
    forms: {
      short: {
        label: "Hasbunallahu wa ni'mal wakeel",
        hint: "Surah Aal-e-Imran 3:173",
        arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        // Hindi meaning as given in docs/design/hasbunallah-reference.webp
        meaning: "अल्लाह हमारे लिए काफी है, और वही सबसे अच्छा कारसाज़ (मामलों का सुलझाने वाला) है।",
      },
      full: {
        label: "…ni'mal mawla wa ni'man naseer",
        hint: "With “the best Protector, the best Helper”",
        arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ\nنِعْمَ الْمَوْلَىٰ وَنِعْمَ النَّصِيرُ",
        meaning: "अल्लाह हमारे लिए काफी है, और वही सबसे अच्छा कारसाज़ है — वही सबसे अच्छा मौला और सबसे अच्छा मददगार है।",
      },
    },
  },
};

export const TRACKER_IDS = Object.keys(TRACKERS);

export const DEFAULT_SETTINGS = {
  resetAt: "fajr", // "fajr" | "midnight"
  reminder: true,
  strongBuzzEvery: 100,
  enabled: [...TRACKER_IDS],
  active: "istighfar",
};

const newTracker = (id) => ({ goal: TRACKERS[id].defaultGoal, form: TRACKERS[id].defaultForm, days: {} });

const EMPTY_DAY = { count: 0, sessions: [] };

// ---------- storage ----------

function normalize(parsed) {
  const s = parsed?.settings || {};
  const trackers = Object.fromEntries(TRACKER_IDS.map((id) => [id, { ...newTracker(id), ...parsed?.trackers?.[id] }]));

  // Upgrade the first version, which only tracked Istighfar.
  if (!parsed?.trackers && parsed?.days) {
    trackers.istighfar = {
      goal: s.goal || TRACKERS.istighfar.defaultGoal,
      form: s.dhikr || TRACKERS.istighfar.defaultForm,
      days: parsed.days,
    };
  }

  const enabled = (Array.isArray(s.enabled) ? s.enabled : DEFAULT_SETTINGS.enabled).filter((id) => TRACKERS[id]);
  const safeEnabled = enabled.length ? enabled : ["istighfar"];
  const active = safeEnabled.includes(s.active) ? s.active : safeEnabled[0];

  return {
    settings: {
      resetAt: s.resetAt || DEFAULT_SETTINGS.resetAt,
      reminder: s.reminder ?? DEFAULT_SETTINGS.reminder,
      strongBuzzEvery: s.strongBuzzEvery || DEFAULT_SETTINGS.strongBuzzEvery,
      enabled: safeEnabled,
      active,
    },
    trackers,
  };
}

export function loadTracker() {
  try {
    return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
  } catch {
    return normalize(null); // corrupt or blocked storage — start fresh
  }
}

export function saveTracker(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or blocked
  }
}

// ---------- days ----------

const pad = (n) => String(n).padStart(2, "0");
const localISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** The tracker "day" a timestamp belongs to. With a Fajr reset, 2 am still counts as yesterday. */
export function dayKey(timestamp, resetAt) {
  const shift = resetAt === "fajr" ? FAJR_HOUR * 3600 * 1000 : 0;
  return localISO(new Date(timestamp - shift));
}

/** Day keys for the 7 days ending on `todayKey` (oldest first). */
export function lastSevenKeys(todayKey) {
  const [y, m, d] = todayKey.split("-").map(Number);
  return Array.from({ length: 7 }, (_, i) => localISO(new Date(y, m - 1, d - 6 + i)));
}

export const getDay = (days, key) => days[key] || EMPTY_DAY;

// ---------- counting (operate on one tracker's `days`) ----------

/**
 * Adds `amount` on day `key` at time `t`, extending the latest session or starting a new one.
 * A session that ended before `splitAfter` (the last Reset) is never extended.
 */
export function addCount(days, key, amount, t, splitAfter = 0) {
  const day = getDay(days, key);
  const sessions = [...day.sessions];
  const last = sessions[sessions.length - 1];
  if (last && t - last.end < SESSION_GAP_MS && last.end >= splitAfter) {
    sessions[sessions.length - 1] = { ...last, end: t, count: last.count + amount };
  } else {
    sessions.push({ start: t, end: t, count: amount });
  }
  return { ...days, [key]: { count: day.count + amount, sessions } };
}

/** Reverses a previous addCount on day `key`. */
export function removeCount(days, key, amount) {
  const day = getDay(days, key);
  if (!day.count) return days;
  const take = Math.min(amount, day.count);
  const sessions = [...day.sessions];
  let left = take;
  while (left > 0 && sessions.length) {
    const last = sessions[sessions.length - 1];
    const used = Math.min(left, last.count);
    left -= used;
    if (last.count - used <= 0) sessions.pop();
    else sessions[sessions.length - 1] = { ...last, count: last.count - used };
  }
  return { ...days, [key]: { count: day.count - take, sessions } };
}

// ---------- stats ----------

/** Consecutive days with any count, ending today (or yesterday if today is still 0). */
export function streak(days, todayKey) {
  const [y, m, d] = todayKey.split("-").map(Number);
  let i = getDay(days, todayKey).count > 0 ? 0 : 1;
  let n = 0;
  while (getDay(days, localISO(new Date(y, m - 1, d - i))).count > 0) {
    n++;
    i++;
  }
  return n;
}

export function weekStats(days, todayKey, goal) {
  const week = lastSevenKeys(todayKey).map((key) => ({ key, count: getDay(days, key).count }));
  return {
    days: week,
    total: week.reduce((sum, d) => sum + d.count, 0),
    goalHit: week.filter((d) => d.count >= goal).length,
  };
}

// ---------- formatting ----------

export const formatNumber = (n) => n.toLocaleString("en-US");

export const formatShort = (n) => (n >= 10000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : formatNumber(n));

export const formatGoal = (n) => (n >= 1000 ? `${n / 1000}k` : String(n));

export function paceText(goal) {
  const minutes = Math.max(1, Math.round(goal / COUNTS_PER_MINUTE));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `About ${h ? `${h}h ` : ""}${m ? `${m}m` : ""}`.trim() + " a day at a steady pace";
}

export function formatTime(t) {
  return new Date(t)
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .replace("AM", "am")
    .replace("PM", "pm");
}

export function headerDate(t) {
  const d = new Date(t);
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
  const rest = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${weekday}, ${rest}`;
}

export const weekdayShort = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "short" });
};

/** Names a session by the prayer window it started in (approximate times). */
export function sessionLabel(t) {
  const h = new Date(t).getHours() + new Date(t).getMinutes() / 60;
  if (h < 5) return "Tahajjud";
  if (h < 8) return "After Fajr";
  if (h < 12) return "Morning";
  if (h < 15.5) return "After Zuhr";
  if (h < 18) return "After Asr";
  if (h < 19.5) return "After Maghrib";
  return "After Isha";
}
