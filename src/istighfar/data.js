// Istighfar tracker — data model and pure helpers (no React here).
//
// Stored in localStorage under "istighfar-tracker":
// {
//   settings: { goal, dhikr, resetAt, reminder, strongBuzzEvery },
//   days: { "YYYY-MM-DD": { count, sessions: [{ start, end, count }] } }
// }

export const STORAGE_KEY = "istighfar-tracker";

export const GOALS = [1000, 3000, 5000, 10000];
export const BUZZ_OPTIONS = [33, 100, 500];

// Fajr time varies by location and season; the day rollover uses a fixed 5 am.
export const FAJR_HOUR = 5;

// A pause longer than this starts a new session in History.
const SESSION_GAP_MS = 10 * 60 * 1000;

// Steady pace used for the "About 3h 20m a day" estimate.
const COUNTS_PER_MINUTE = 50;

export const DHIKR = {
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
};

export const DEFAULT_SETTINGS = {
  goal: 10000,
  dhikr: "short",
  resetAt: "fajr", // "fajr" | "midnight"
  reminder: true,
  strongBuzzEvery: 100,
};

const EMPTY_DAY = { count: 0, sessions: [] };

// ---------- storage ----------

export function loadTracker() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (parsed && typeof parsed === "object") {
      return { settings: { ...DEFAULT_SETTINGS, ...parsed.settings }, days: parsed.days || {} };
    }
  } catch {
    // corrupt or blocked storage — start fresh
  }
  return { settings: { ...DEFAULT_SETTINGS }, days: {} };
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

export const getDay = (data, key) => data.days[key] || EMPTY_DAY;

// ---------- counting ----------

/** Adds `amount` at time `t`, extending the latest session or starting a new one. */
export function addCount(data, amount, t) {
  const key = dayKey(t, data.settings.resetAt);
  const day = getDay(data, key);
  const sessions = [...day.sessions];
  const last = sessions[sessions.length - 1];
  if (last && t - last.end < SESSION_GAP_MS) {
    sessions[sessions.length - 1] = { ...last, end: t, count: last.count + amount };
  } else {
    sessions.push({ start: t, end: t, count: amount });
  }
  return { ...data, days: { ...data.days, [key]: { count: day.count + amount, sessions } } };
}

/** Reverses a previous addCount on day `key`. */
export function removeCount(data, amount, key) {
  const day = getDay(data, key);
  if (!day.count) return data;
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
  return { ...data, days: { ...data.days, [key]: { count: day.count - take, sessions } } };
}

// ---------- stats ----------

/** Consecutive days with any istighfar, ending today (or yesterday if today is still 0). */
export function streak(data, todayKey) {
  const [y, m, d] = todayKey.split("-").map(Number);
  let i = getDay(data, todayKey).count > 0 ? 0 : 1;
  let n = 0;
  while (getDay(data, localISO(new Date(y, m - 1, d - i))).count > 0) {
    n++;
    i++;
  }
  return n;
}

export function weekStats(data, todayKey) {
  const goal = data.settings.goal;
  const days = lastSevenKeys(todayKey).map((key) => ({ key, count: getDay(data, key).count }));
  return {
    days,
    total: days.reduce((sum, d) => sum + d.count, 0),
    goalHit: days.filter((d) => d.count >= goal).length,
  };
}

// ---------- formatting ----------

export const formatNumber = (n) => n.toLocaleString("en-US");

export const formatShort = (n) => (n >= 10000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : formatNumber(n));

export const formatGoal = (n) => `${n / 1000}k`;

export function paceText(goal) {
  const minutes = Math.round(goal / COUNTS_PER_MINUTE);
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
