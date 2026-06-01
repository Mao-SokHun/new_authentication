# RokKru — មគ្គុណ្យភ្ជាប់ Backend ↔ Frontend (JWT)

> ឯកសារនេះប្រាប់ **ជំហានពេញ** របៀបភ្ជាប់ React frontend ទៅ Express backend ជាមួយ **JWT authentication**.  
> អានពីខាងលើទៅខាងក្រោម — ធ្វើតាមលំដាប់។

ឯកសារផ្សេងទៀត:
- [CONNECT_API_GUIDE.md](./CONNECT_API_GUIDE.md) — endpoint tables, Postman, controller samples
- [FRONTEND_SCOPE.md](./FRONTEND_SCOPE.md) — scope frontend vs backend

---

## តើអ្វីដែលត្រៀមរួចហើយ?

Frontend **មិនចាំបាច់សរសេរឡើងវិញទាំងមូល**។ រចនាសម្ព័ន្ធសម្រាប់ API + JWT ត្រៀមរួចហើយ៖

| ឯកសារ | ធ្វើអ្វី |
|--------|---------|
| `frontend/.env` | បិទ/បើក mock vs real API |
| `frontend/src/constants/env.js` | `isApiEnabled()` — ពិនិត្យ mode |
| `frontend/src/lib/authStorage.js` | រក្សា `rokkru_token` + `rokkru_user` |
| `frontend/src/services/api.js` | HTTP client + `Authorization: Bearer` + 401 |
| `frontend/src/services/endpoints.js` | path constants (ត្រូវ match backend) |
| `frontend/src/services/authService.js` | login, register, me, logout |
| `frontend/src/services/*Service.js` | feature នីមួយ — mock **or** API |
| `frontend/src/hooks/AuthContext.jsx` | session, login, logout |
| `frontend/src/components/layout/ProtectedRoute.jsx` | route guard by role |

### Flow សង្ខេប

```
User click / submit
    → Page (Login, Home, EditProfile…)
    → Hook (useAuth, useTeachers…)
    → Service (authService, teacherService…)
    → apiRequest() + JWT header
    → Backend http://localhost:5000/api/v1/...
    → JSON response → UI update
```

---

## មុនពេលចាប់ — ត្រូវការអ្វី?

| Tool | របៀបពិនិត្យ |
|------|-------------|
| **Node.js** (v18+) | `node -v` |
| **PostgreSQL** | DB server running |
| **Git / code** | `frontend/` + `backend_rokkru/` |
| **Browser DevTools** | Network tab + Application → Local Storage |

Port ស្តង់ដារ:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API base: `http://localhost:5000/api/v1`

---

# ផ្នែក ១ — Setup Backend

## ជំហាន ១.១ — Install

```bash
cd backend_rokkru
npm install
```

## ជំហាន ១.២ — Database PostgreSQL

បើក PostgreSQL រួច run:

```sql
CREATE DATABASE rokkru_db;
```

## ជំហាន ១.៣ — File `.env` (backend)

កែ `backend_rokkru/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=rokkru_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key_change_this
JWT_EXPIRE=7d
```

**សំខាន់:**
- `CLIENT_URL` — ត្រូវដូច frontend URL (CORS)
- `JWT_SECRET` — ត្រូវដូចគ្នាជាន់អនុវត្ត JWT verify

## ជំហាន ១.៤ — Start backend

```bash
npm start
```

ត្រូវឃើញ log ប្រហែល: `Server running on port 5000`, DB connected.

## ជំហាន ១.៥ — Test health

```bash
curl http://localhost:5000/api/v1/health
```

Response OK: `{ "status": "ok", ... }`

បើ fail → ពិនិត្យ DB, port 5000, `.env`.

---

# ផ្នែក ២ — Setup Frontend

## ជំហាន ២.១ — Install

```bash
cd frontend
npm install
```

## ជំហាន ២.២ — Mock mode (ឥលូវ — មិនចាំបាច់ backend)

`frontend/.env`:

```env
VITE_USE_MOCK=true
VITE_API_URL=
```

```bash
npm run dev
```

បើក `http://localhost:5173` — UI ដំណើរការដោយ mock data.

## ជំហាន ២.៣ — API mode (ភ្ជាប់ backend)

**កែ** `frontend/.env`:

```env
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:5000/api/v1
```

**Restart Vite** (ចាំបាច់ — Vite អាន `.env` តែពេល start):

```bash
# Ctrl+C រួច
npm run dev
```

## ជំហាន ២.៤ — Run ទាំងពីរ

| Terminal | Command |
|----------|---------|
| 1 | `cd backend_rokkru && npm start` |
| 2 | `cd frontend && npm run dev` |

---

# ផ្នែក ៣ — JWT: Backend ត្រូវ return អ្វី?

Frontend **រំពឹង** format ដូចនេះ។ Backend team ត្រូវ match។

## ៣.១ Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "student@example.com", "password": "123456" }
```

**Response (required):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "name": "Alex Johnson",
    "email": "student@example.com",
    "role": "student"
  }
}
```

`role` ត្រូវជា **`student`** | **`teacher`** | **`admin`** (lowercase).

Frontend cũng support: `{ "data": { "token", "user" } }`.

## ៣.២ Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "new@example.com",
  "password": "123456",
  "role": "student",
  "name": "Optional Name"
}
```

Response ដូច login — `{ token, user }` (recommended).

## ៣.៣ Get current user (page refresh)

```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

Return user object (same fields as login).

## ៣.៤ Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

Frontend clears `localStorage` regardless.

## ៣.៥ Protected routes

Request ទាំងអស់ (លើក除 login/register) ត្រូវមាន header:

```http
Authorization: Bearer <rokkru_token>
```

Frontend attach **automatically** in `services/api.js`.

## ៣.៦ Token storage (browser)

| localStorage key | Content |
|------------------|---------|
| `rokkru_token` | JWT string |
| `rokkru_user` | JSON user object |

DevTools → Application → Local Storage → `http://localhost:5173`

## ៣.៧ 401 Unauthorized

បើ API return **401** → frontend **clear session** automatically → redirect `/login`.

---

# ផ្នែក ៤ — Backend checklist (មុន wire UI)

Backend developer tick រួចមុខ:

- [ ] CORS allow `http://localhost:5173`
- [ ] `POST /auth/login` → `{ token, user }`
- [ ] `POST /auth/register` → `{ token, user }`
- [ ] `GET /auth/me` → user (with valid JWT)
- [ ] `POST /auth/logout`
- [ ] JWT middleware on protected routes
- [ ] `user.role` = student | teacher | admin
- [ ] (Optional) forgot-password, verify OTP, reset

### Test with Postman (មុន frontend)

**Register:**
```
POST http://localhost:5000/api/v1/auth/register
Body: { "name": "Test", "email": "test@mail.com", "password": "123456", "role": "student" }
```

**Login:**
```
POST http://localhost:5000/api/v1/auth/login
Body: { "email": "test@mail.com", "password": "123456" }
→ copy token
```

**Me:**
```
GET http://localhost:5000/api/v1/auth/me
Header: Authorization: Bearer <paste token>
```

---

# ផ្នែក ៥ — Phase A: Authentication (UI ត្រៀមរួច)

## Frontend — មិនចាំបាច់ code ថ្មី (ធ្វើតែ switch .env)

| Page | Route | Service |
|------|-------|---------|
| Login | `/login` | `authService.login` |
| Sign up | `/create-account` | `authService.register` |
| Admin login | `/admin/login` | `authService.login` (role admin) |
| Forgot password | `/forgot-password` | `authService.sendPasswordResetOtp` |
| Logout | Settings menu | `authService.logout` |

## ជំហាន test Auth

1. Set `VITE_USE_MOCK=false` + `VITE_API_URL=...`
2. Restart `npm run dev`
3. Open DevTools → **Network**
4. Go `/login` → enter email/password → Submit
5. Check:
   - [ ] `POST .../auth/login` status 200
   - [ ] Response has `token`
   - [ ] Local Storage: `rokkru_token`, `rokkru_user`
6. Refresh page (F5)
   - [ ] `GET .../auth/me` status 200
   - [ ] Still logged in
7. Wrong password
   - [ ] Error message on form (not silent login)
8. Logout
   - [ ] Token cleared, redirect login

## Role redirects (after login)

| role | Goes to |
|------|---------|
| student | `/home` |
| teacher | `/teacher/home` |
| admin | `/admin` |

`ProtectedRoute` blocks wrong roles automatically.

---

# ផ្នែក ៦ — Phase B: Teachers list (Home / Schedule)

## Backend — implement

```http
GET /api/v1/teachers?major=...&subject=...&location=...&district=...&commune=...&village=...&sort=...&page=1&pageSize=10
Authorization: Bearer <token>
```

### Query params (from frontend filter UI)

Mapped in `frontend/src/utils/teacherQuery.js`:

| UI filter | Query param |
|-----------|-------------|
| Major | `major` |
| Subject | `subject` |
| Province | `location` |
| ស្រុក/ខណ្ឌ | `district` |
| ឃុំ/សង្កាត់ | `commune` |
| ភូមិ | `village` |
| Sort | `sort` |
| Session type | `type` |
| Time | `time` |
| Pagination | `page`, `pageSize` |

Values are **English strings** (e.g. `Computer Science`, `Phnom Penh`) — backend stores/filters same.

### Response format (either OK)

```json
{
  "data": [ { "id": 1, "name": "...", "major": "...", "rating": 4.5 } ],
  "total": 42,
  "page": 1,
  "pageSize": 10
}
```

or `{ "items": [...], "total": 42 }`

## Frontend — already wired

| File | Function |
|------|----------|
| `services/teacherService.js` | `fetchTeachers(filters)` |
| `hooks/useTeachers.js` | used by Home, Schedule |
| `components/common/SearchFilter.jsx` | filter UI |

## ជំហាន test Teachers

1. Login as student
2. Go `/home`
3. Network → `GET /teachers?...`
4. Change major/subject filter → new request with updated params
5. Teacher cards show API data (not mock)

---

# ផ្នែក ៧ — Phase C: Teacher detail

## Backend

```http
GET /api/v1/teachers/:id
Authorization: Bearer <token>
```

Return single teacher object (bio, subjects, schedule preview, reviews…).

## Frontend — already wired

`teacherService.fetchTeacherById(id)` — used by teacher detail pages.

## Test

Click teacher card → Network `GET /teachers/123` → detail page shows data.

---

# ផ្នែក ៨ — Phase D: Edit Profile (teacher) — **ត្រូវ wire បន្ថែម**

UI ready in `pages/teacher/EditProfile.jsx` — **Save** still local/mock.

## Backend — implement

```http
GET  /api/v1/teachers/me     ← load profile
PUT  /api/v1/teachers/me     ← save profile
Authorization: Bearer <token>  (teacher role only)
```

### PUT body (align with frontend form)

```json
{
  "firstName": "Phe",
  "lastName": "Sophy",
  "title": "Physics Specialist",
  "username": "phe.sophy",
  "phone": "+855 12 345 678",
  "email": "phe.sophy@example.com",
  "gender": "Male",
  "major": "Mechanical Engineering",
  "subject": "Physics",
  "province": "Phnom Penh",
  "locationDistrict": "Chamkar Mon",
  "locationCommune": "",
  "locationVillage": "",
  "bio": "...",
  "portfolios": [
    { "title": "GitHub", "link": "https://github.com/username" }
  ],
  "experience": [
    { "id": 1, "role": "...", "org": "...", "period": "2018–23" }
  ],
  "schedule": [
    { "id": 1, "day": "Monday", "time": "8:00 – 8:45 AM", "subject": "Physics" }
  ]
}
```

**Portfolio:** backend fields = `link` + `title` (link-tag).

**Major / Subject:** can be custom text (teacher typed own value).

## Frontend — steps to wire Save

### Step 1: Add endpoint

`frontend/src/services/endpoints.js`:

```js
teachers: {
  list: '/teachers',
  byId: (id) => `/teachers/${id}`,
  me: '/teachers/me',
},
```

### Step 2: Add service functions

`frontend/src/services/teacherService.js`:

```js
export async function fetchMyTeacherProfile() {
  if (!isApiEnabled()) return TEACHER_PROFILE_MOCK
  const json = await apiRequest('/teachers/me')
  return json.data ?? json.user ?? json
}

export async function updateTeacherProfile(payload) {
  if (!isApiEnabled()) return payload
  const json = await apiRequest('/teachers/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return json.data ?? json.user ?? json
}
```

### Step 3: EditProfile.jsx

On mount: `fetchMyTeacherProfile()` → fill form.

On Save button: `updateTeacherProfile(form + portfolios + experience + schedule)`.

Show loading + error toast/message.

## Test

1. Login as teacher
2. `/teacher/edit-profile`
3. Edit fields → Save
4. Network `PUT /teachers/me`
5. Refresh → data persists from `GET /teachers/me`

---

# ផ្នែក ៩ — Phase E: Student profile

Similar to teacher — backend:

```http
PUT /api/v1/auth/profile
Authorization: Bearer <token>
```

Or separate `/students/me` if your schema splits tables.

Frontend file: `pages/student/StudentEditProfile.jsx` — wire same pattern as Edit Profile.

---

# ផ្នែក ១០ — Phase F: Communities

## Backend endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/communities` | List |
| GET | `/communities/:id` | Detail |
| POST | `/communities` | Create |
| POST | `/communities/:id/join` | Join |
| GET | `/communities/:id/posts` | Posts |
| POST | `/communities/:id/posts` | Create post |
| POST | `/communities/:id/posts/:postId/like` | Like |

## Frontend — already has service stubs

`services/communityService.js` — `fetchCommunities`, `fetchCommunityById`, `createCommunity`, …

When `isApiEnabled()` → calls real API automatically.

## Test

1. Login
2. Go `/community`
3. Network `GET /communities`

---

# ផ្នែក ១១ — Phase G: Sessions (book / schedule)

## Backend

| Method | Path |
|--------|------|
| GET | `/sessions` |
| POST | `/sessions` |
| PUT | `/sessions/:id` |
| DELETE | `/sessions/:id` |

## Frontend

`services/sessionService.js` — already wired for API mode.

Pages: `BookSession.jsx`, `Schedule.jsx`, teacher schedule sections.

---

# ផ្នែក ១២ — Phase H: Notifications, Search, Filters, Subscriptions, Admin

| Feature | Service file | Main endpoint |
|---------|--------------|---------------|
| Notifications | `notificationService.js` | `GET /notifications` |
| Search | `searchService.js` | `GET /search?q=...` |
| Filter options | `filterService.js` | `GET /filters` (public, no JWT) |
| Subscription | `subscriptionService.js` | `GET/POST /subscriptions/...` |
| Admin | `adminApi.js` | `GET /admin/...` |

Each file follows same pattern:

```js
if (isApiEnabled()) {
  return apiRequest(ENDPOINTS.xxx)
}
return MOCK_DATA
```

Full endpoint table: [CONNECT_API_GUIDE.md](./CONNECT_API_GUIDE.md#api-endpoints-summary)

---

# ផ្នែក ១៣ — Pattern: Add new feature end-to-end

## A. Backend team

1. Create DB model / migration
2. Create controller function
3. Add route in `routes/v1/`
4. Add JWT middleware if protected
5. Test with Postman
6. Document request/response JSON

## B. Frontend team

1. Add path in `services/endpoints.js`
2. Add function in `services/xxxService.js`:

```js
import { apiRequest } from './api'
import { isApiEnabled } from '@/constants/env'

export async function myAction(data) {
  if (!isApiEnabled()) {
    return MOCK_RESULT
  }
  const json = await apiRequest('/my-path', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return json.data ?? json
}
```

3. Call from page or hook
4. Handle `loading`, `error`, `success`
5. Test in API mode with Network tab

## C. Page error handling template

```js
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

const handleSave = async () => {
  setLoading(true)
  setError(null)
  try {
    await updateTeacherProfile(formData)
    // show success
  } catch (err) {
    setError(err.message || 'Something went wrong')
  } finally {
    setLoading(false)
  }
}
```

---

# ផ្នែក ១៤ — Mock vs API mode

| | Mock | API + JWT |
|---|------|-----------|
| `.env` | `VITE_USE_MOCK=true`, `VITE_API_URL=` empty | `VITE_USE_MOCK=false`, `VITE_API_URL=http://localhost:5000/api/v1` |
| Backend needed? | ❌ No | ✅ Yes |
| Login | Demo users by email/role | Real DB users |
| Data | `constants/mockData.js` | PostgreSQL |

**Rollout tip:** Keep mock until backend endpoint ready, then test that feature in API mode.

---

# ផ្នែក ១៥ — Testing checklist (ពេញ)

## Environment

- [ ] Backend health `GET /health` OK
- [ ] Frontend `.env` correct
- [ ] Vite restarted after `.env` change
- [ ] No CORS errors in console

## Auth

- [ ] Register new user
- [ ] Login student / teacher / admin
- [ ] Token in localStorage
- [ ] Refresh → still logged in (`GET /auth/me`)
- [ ] Logout → token cleared
- [ ] Wrong password → error shown
- [ ] Expired token → 401 → redirect login

## Roles

- [ ] Student cannot open `/teacher/home` (redirect)
- [ ] Teacher cannot open `/admin` (redirect)
- [ ] Admin login → `/admin`

## Data

- [ ] Home teachers from API
- [ ] Filters send correct query params
- [ ] Teacher detail loads
- [ ] (When wired) Edit profile saves

---

# ផ្នែក ១៦ — Troubleshooting

| បញ្ហា | មូលហេតុ | ដំណោះស្រាយ |
|--------|---------|------------|
| **Failed to fetch** | Backend off / wrong URL | Start backend; check `VITE_API_URL`; restart Vite |
| **CORS error** | `CLIENT_URL` wrong | Backend `.env` → `CLIENT_URL=http://localhost:5173` |
| **401 everywhere** | Bad/expired JWT | Login again; check JWT middleware + secret |
| **Login OK, refresh fails** | `/auth/me` broken | Fix backend me endpoint + response shape |
| **Still mock data** | `VITE_USE_MOCK=true` | Set `false`, restart dev |
| **Login always works (any password)** | Still mock mode | Switch to API mode |
| **Empty teacher list** | Query/filter mismatch | Match param names in `teacherQuery.js` |
| **404 on API** | Path mismatch | Compare `endpoints.js` vs backend routes |
| **Network Error** | Backend not running | `npm start` in backend_rokkru |

---

# ផ្នែក ១៧ — Rollout timeline (recommended)

| Week | Work |
|------|------|
| **1** | Backend: Auth + CORS + `/auth/me`. Frontend: switch `.env`, test login |
| **2** | `GET /teachers` + filters. Test Home / Schedule |
| **3** | `GET /teachers/:id`. Test teacher detail |
| **4** | `GET/PUT /teachers/me`. Wire EditProfile Save |
| **5** | `PUT /auth/profile` or student profile. Communities list |
| **6** | Sessions, notifications |
| **7+** | Subscriptions, admin panel, search |

---

# Quick reference

```env
# frontend/.env — MOCK (no backend)
VITE_USE_MOCK=true
VITE_API_URL=

# frontend/.env — API + JWT
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:5000/api/v1
```

```bash
# Terminal 1
cd backend_rokkru && npm start

# Terminal 2
cd frontend && npm run dev
```

```js
// Import in any page
import { apiRequest } from '@/services'
import { useAuth } from '@/hooks'

const { user, login, logout } = useAuth()
// JWT attached automatically on apiRequest()
```

---

**សង្ខេប:** Frontend architecture ត្រៀមរួច — **switch `.env` → test Auth → implement backend endpoints one phase at a time → service layer calls API automatically**. Feature ដែល UI មាន service stub (`teacherService`, `communityService`, …) ភ្ជាប់ភ្លាមពេល backend endpoint ready + API mode on.
