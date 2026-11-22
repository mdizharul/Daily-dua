# Daily Dua

Screenshot duas from Instagram & YouTube (or paste the Arabic text) → AI (Google
Gemini) extracts the Arabic, Roman-Urdu transliteration and translation → track
your memorization.

**Features:** photo / screenshot / paste-text extraction with auto-category
and moods · Quran verse lookup by reference with verified Arabic and English
(AlQuran Cloud), and AI-read Quran duas checked against the real verse ·
English meaning and source on every dua · "Share → Daily Dua" from other
apps on Android (installed app) · Library with Today's routine (duas you recite daily, with progress),
Today's dua, "How is your heart today?" mood filters, To learn / Learnt and
search · a page per dua (listen, recited-today counter, daily routine, mark
learnt, share card in 4 themes × fit / square / tall) · Memorize mode: Read, Fill
blanks, From memory — 5 correct recalls marks a dua learnt · daily streak ·
Day / Night appearance · tajweed markers · Arabic script & size · JSON
backup export & import. One design across the app (the Dhikr look: cream, green,
Inter + Space Grotesk) with a Night mode — colours live in `src/index.css`
as CSS variables and are used through `src/theme/tokens.js`.

**Dhikr tracker** (bottom tab) for **Istighfar** and **Hasbunallahu wa ni'mal
wakeel** — track one or both, each with its own count, goal, streak and history:
tap-to-count with daily goal ring, Undo /
+33 / +100, Pocket mode (dark, screen stays awake, hold to exit), streak,
weekly chart and today's sessions, choice of dhikr, Fajr or midnight day reset,
vibration feedback. Its design follows `docs/design/istighfar-tracker-mockup.html`.

Built with React 19 + Vite. Duas and settings are stored in the browser's
`localStorage`; the Gemini API key stays on the server.

Live: https://daily-dua-kappa.vercel.app

## Run locally

```powershell
npm install
copy .env.example .env.local   # then put your GEMINI_API_KEY in .env.local
npm run dev
```

Open http://localhost:5173. `npm run dev` also serves the `/api/*` AI endpoints
(see `vite.config.js`), so screenshot and paste extraction work locally. Get a
free key at https://aistudio.google.com/app/apikey.

Other scripts: `npm run build` (output in `dist/`), `npm run preview`, `npm run lint`.

## Deploy

Works on both **Vercel** (`vercel.json`, functions in `api/`) and **Netlify**
(`netlify.toml`, functions in `netlify/functions/`). On either, set the
environment variable `GEMINI_API_KEY` in the site settings.

## Project structure

```
├── index.html
├── public/                  favicon, app icons, manifest (share target), sw.js
├── src/                       Front end (React)
│   ├── main.jsx               Entry point
│   ├── App.jsx                App state, header, screen switching, dua actions
│   ├── index.css              Global base styles
│   ├── constants.js           Statuses, categories, sample duas
│   ├── theme/tokens.js        Design system: colours (Day/Night), fonts, shared styles
│   ├── library/               Library, dua page, Memorize
│   │   ├── LibraryView.jsx    Home: To learn / Learnt, search, categories, list
│   │   ├── DuaDetailView.jsx  One dua: card, listen, recited today, learnt, share
│   │   ├── MemorizeView.jsx   Read / Fill blanks / From memory practice
│   │   └── duaUtils.js        Dates (incl. Hijri), recall target, helpers
│   ├── views/
│   │   ├── AddEditView.jsx    Add/edit: take photo, image, paste text, or type
│   │   └── SettingsView.jsx   Day/Night, script, text size, tajweed, backup
│   ├── components/
│   │   ├── BottomNav.jsx      Library · Memorize · Istighfar tabs
│   │   ├── TajweedText.jsx    Arabic text with tajweed underlines
│   ├── hooks/useTheme.js      Day / Night switch
│   ├── istighfar/             Dhikr tracker: Istighfar + Hasbunallah
│   │   ├── IstighfarSection.jsx  Counter, with History and Goal & settings
│   │   ├── CounterScreen.jsx, PocketMode.jsx, HistoryScreen.jsx, GoalSettingsScreen.jsx
│   │   ├── useIstighfar.js    State, counting, undo, vibration
│   │   ├── DhikrSwitch.jsx    Istighfar / Hasbunallah switch
│   │   └── data.js            Dhikr list (TRACKERS), storage, day rollover, stats
│   ├── services/
│   │   ├── extractApi.js      Calls /api/extract and /api/extract-text
│   │   ├── quran.js           Verse lookup + verification (api.alquran.cloud)
│   │   └── storage.js         localStorage read/write
│   └── utils/                 tajweed rules, image hash/resize, share-as-image
├── server/                    Back end (shared by every host)
│   ├── gemini.js              Gemini prompts + calls — edit prompts here
│   └── netlify.js             Adapter for Netlify functions
├── api/                       Vercel functions  → server/gemini.js
├── netlify/functions/         Netlify functions → server/gemini.js
└── docs/design/               Design mockups (Daily Dua, Istighfar tracker)
```
