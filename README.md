# Daily Dua

Screenshot duas from Instagram & YouTube (or paste the Arabic text) → AI (Google
Gemini) extracts the Arabic, Roman-Urdu transliteration and translation → track
your memorization.

**Features:** screenshot & paste-text extraction with auto-category · New →
Learning → Memorized tracking with a memorized "Vault" · flashcard Review mode ·
recite counter & daily streak · search and category filters · share a dua as an
image · Dark / Light / Paper themes · tajweed markers · Arabic font size ·
JSON backup export & import.

**Istighfar tracker** (bottom tab): tap-to-count with daily goal ring, Undo /
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
├── public/favicon.svg
├── src/                       Front end (React)
│   ├── main.jsx               Entry point
│   ├── App.jsx                App state, header, screen switching, dua actions
│   ├── index.css              Global base styles
│   ├── constants.js           Statuses, categories, sample duas
│   ├── views/                 Full screens
│   │   ├── HomeView.jsx       Stats, search, filters, dua list
│   │   ├── AddEditView.jsx    Add/edit: screenshot, paste text, or manual
│   │   ├── ReviewView.jsx     Flashcard review
│   │   └── SettingsView.jsx   Script, tajweed, font size, backup/import/clear
│   ├── components/
│   │   ├── DuaCard.jsx        One dua card
│   │   ├── BottomNav.jsx      Duas · Istighfar · History tabs
│   │   ├── TajweedText.jsx    Arabic text with tajweed underlines
│   │   ├── icons.jsx          Star, background pattern, spinner
│   │   └── islamic.jsx        Decorative patterns, seal, divider, frame
│   ├── hooks/useTheme.js      Dark / Light / Paper colour themes
│   ├── istighfar/             Istighfar tracker (own green style, see theme.js)
│   │   ├── IstighfarSection.jsx  Switches Counter / History / Goal & settings
│   │   ├── CounterScreen.jsx, PocketMode.jsx, HistoryScreen.jsx, GoalSettingsScreen.jsx
│   │   ├── useIstighfar.js    State, counting, undo, vibration
│   │   └── data.js            Storage, day rollover, sessions, stats
│   ├── services/
│   │   ├── extractApi.js      Calls /api/extract and /api/extract-text
│   │   └── storage.js         localStorage read/write
│   └── utils/                 tajweed rules, image hash, share-as-image
├── server/                    Back end (shared by every host)
│   ├── gemini.js              Gemini prompts + calls — edit prompts here
│   └── netlify.js             Adapter for Netlify functions
├── api/                       Vercel functions  → server/gemini.js
├── netlify/functions/         Netlify functions → server/gemini.js
└── docs/design/               Design mockups (Istighfar tracker)
```
