# RokKru — Frontend-only scope (current work)

> **Important:** Work in this phase is **frontend only**. Do **not** change anything under `backend_rokkru/`.

## Scope

| In scope | Out of scope |
|----------|--------------|
| `frontend/src/**` (UI, pages, components, hooks) | `backend_rokkru/**` (Express, Sequelize, routes, controllers) |
| Mock data (`constants/mockData.js`, JSON constants) | Database migrations / seeds |
| Frontend services with mock fallbacks (`services/*`, `authService.js`) | Real API wiring unless explicitly requested later |
| i18n (`lib/localeEn.js`, `lib/localeKm.js`, `kmOptionLabels.js`) | Server env (`.env` in backend) |
| Local UI state, `localStorage` demos | PostgreSQL models |

## How data works now

- **Teachers / filters / communities** — mostly static constants + mock data in the frontend.
- **Auth / OTP / comments** — simulated in frontend (e.g. demo OTP, object URLs for avatars).
- **Filter values** — English strings in code; Khmer labels via `labelFor()` for display only.
- Comments like “Backend team: maps to query param …” are **documentation for future integration**, not tasks to implement on the server now.

## Recent frontend areas (this sprint)

- Auth: register (email + password), forgot password OTP flow
- Complete profile modal on `/home`
- Community: full-width feed, post detail, comments
- Home / Schedule: `SearchFilter` (searchable major, subject-by-major, location)
- Student profile / edit profile (learning focus, provinces, languages — no Thai)
- Navbar search placeholder + `/search` results (filters removed from search page)
- Profile page: logout button removed (logout stays in Settings menu)

## Rules for contributors & AI

1. **Never edit** `backend_rokkru/` unless the user explicitly asks for backend work.
2. Prefer **mock/local** solutions over new API endpoints.
3. Keep filter/subject **values in English**; localize labels only in UI.
4. Do not run backend seeds, migrations, or change server routes for UI tweaks.
5. When backend is ready, frontend will connect via existing service layer — see `docs/CONNECT_API_GUIDE.md`.

## Run frontend only

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

Ensure `.env` has **`VITE_USE_MOCK=true`** and **`VITE_API_URL=`** (empty).  
If you see **“Failed to fetch”** on forgot-password or auth, the app is calling the backend — restart dev server after changing `.env`.

Backend is **not required** for current UI work.
