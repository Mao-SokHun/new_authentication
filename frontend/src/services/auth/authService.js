import { isApiEnabled } from '@/constants'
import {
  clearAuthSession,
  COOKIE_SESSION_TOKEN,
  setAuthSession,
  getStoredUser,
  setStoredUser,
} from '@/lib/authStorage'
import { apiRequest } from '../core/api'
import { ENDPOINTS } from '../core/endpoints'

const OTP_STORE_KEY = 'rokkru_reset_otp'
const DEMO_OTP = '123456'

const MOCK_ROLE_EMAIL = {
  student: 'student@rokkru.com',
  teacher: 'teacher@rokkru.com',
  admin: 'admin@rokkru.com',
}

const MOCK_BY_EMAIL = {
  'student@rokkru.com': {
    id: '1',
    name: 'Alex Johnson',
    email: 'student@rokkru.com',
    role: 'student',
  },
  'teacher@rokkru.com': {
    id: '2',
    name: 'Dr. Phe Sophy',
    email: 'teacher@rokkru.com',
    role: 'teacher',
  },
  'admin@rokkru.com': {
    id: '3',
    name: 'Super Admin',
    email: 'admin@rokkru.com',
    role: 'admin',
  },
}

/** @type {Array<{ user_type_id: number, user_type_name: string }> | null} */
let userTypesCache = null

const storeMockOtp = (email, otp) => {
  sessionStorage.setItem(
    OTP_STORE_KEY,
    JSON.stringify({ email, otp, expires: Date.now() + 5 * 60 * 1000 })
  )
}

const readMockOtp = (email, otp) => {
  try {
    const raw = sessionStorage.getItem(OTP_STORE_KEY)
    if (!raw) return false
    const stored = JSON.parse(raw)
    return stored.email === email && stored.otp === otp && Date.now() <= stored.expires
  } catch {
    return false
  }
}

const clearMockOtp = () => {
  sessionStorage.removeItem(OTP_STORE_KEY)
}

function resolveMockUser({ email, role = 'student' }) {
  const normalized = (email || MOCK_ROLE_EMAIL[role] || MOCK_ROLE_EMAIL.student).trim().toLowerCase()
  return MOCK_BY_EMAIL[normalized] ?? { ...MOCK_BY_EMAIL[MOCK_ROLE_EMAIL[role]], email: normalized }
}

function normalizeUser(raw) {
  if (!raw || typeof raw !== 'object') return null
  const roleRaw = String(raw.role ?? raw.user_type_name ?? 'student').toLowerCase()
  const role = roleRaw === 'mentor' ? 'teacher' : roleRaw
  return {
    id: String(raw.id ?? raw.user_id ?? ''),
    email: raw.email,
    role,
    name: raw.name ?? raw.email?.split('@')[0] ?? 'User',
  }
}

function persistSession(user, token = COOKIE_SESSION_TOKEN) {
  setAuthSession({ token, user })
  return user
}

async function resolveUserTypeId(role = 'student') {
  if (!userTypesCache) {
    const raw = await apiRequest(ENDPOINTS.userTypes.list, { auth: false })
    userTypesCache = Array.isArray(raw) ? raw : raw?.data ?? []
  }
  const wanted = role.toLowerCase()
  const match = userTypesCache.find((type) => {
    const name = String(type.user_type_name ?? '').toLowerCase()
    if (wanted === 'teacher') return name === 'teacher' || name === 'mentor'
    return name === wanted
  })
  if (!match) {
    throw new Error(`Account type "${role}" is not configured on the server`)
  }
  return match.user_type_id
}

/**
 * Step 1 of backend login — sends OTP to email.
 * @param {{ email?: string, password?: string }} credentials
 */
export async function requestLoginOtp(credentials = {}) {
  if (isApiEnabled()) {
    return apiRequest(ENDPOINTS.auth.login, {
      method: 'POST',
      auth: false,
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    })
  }
  return { message: 'OTP sent success' }
}

/**
 * Step 2 of backend login — verifies OTP and opens cookie session.
 * @param {{ email: string, otp: string }} data
 */
export async function verifyLoginOtp({ email, otp }) {
  if (isApiEnabled()) {
    await apiRequest(ENDPOINTS.auth.verifyLoginOtp, {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, otp }),
    })
    const user = await fetchCurrentUser()
    if (!user) throw new Error('Login succeeded but profile could not be loaded')
    return persistSession(user)
  }

  const user = resolveMockUser({ email })
  return persistSession(user, 'mock-token')
}

/**
 * Mock mode only — one-step login.
 * @param {{ email?: string, password?: string, role?: 'student'|'teacher'|'admin' }} credentials
 */
export async function login(credentials = {}) {
  if (isApiEnabled()) {
    await requestLoginOtp(credentials)
    throw new Error('OTP_REQUIRED')
  }

  const user = resolveMockUser(credentials)
  return persistSession(user, 'mock-token')
}

/**
 * @param {{ email: string, password: string, role?: string, name?: string }} data
 */
export async function register(data) {
  if (isApiEnabled()) {
    const user_type = await resolveUserTypeId(data.role || 'student')
    await apiRequest(ENDPOINTS.auth.register, {
      method: 'POST',
      auth: false,
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        user_type,
      }),
    })

    let user = null
    try {
      user = await fetchCurrentUser()
    } catch {
      user = normalizeUser({ email: data.email, role: data.role || 'student' })
    }
    if (!user) throw new Error('Registration succeeded but profile could not be loaded')
    return persistSession(user)
  }

  const user = {
    id: `mock-${Date.now()}`,
    name: data.name || data.email?.split('@')[0] || 'User',
    email: data.email,
    role: data.role || 'student',
  }
  return persistSession(user, 'mock-token')
}

function mergeStoredProfile(user, stored) {
  if (!user || !stored) return user

  const fields = [
    'firstName',
    'lastName',
    'name',
    'title',
    'phone',
    'gender',
    'experienceYears',
    'major',
    'subject',
    'province',
    'bio',
    'location',
  ]
  const merged = { ...user }
  let hasProfile = false

  for (const key of fields) {
    if (stored[key] != null && stored[key] !== '') {
      merged[key] = stored[key]
      hasProfile = true
    }
  }

  if (!hasProfile) return user
  if (!merged.name && merged.firstName) {
    merged.name = `${merged.firstName} ${merged.lastName ?? ''}`.trim()
  }
  return merged
}

export async function fetchCurrentUser() {
  if (isApiEnabled()) {
    const json = await apiRequest(ENDPOINTS.auth.me)
    const stored = getStoredUser()
    const user = mergeStoredProfile(
      normalizeUser(json.user ?? json.data ?? json),
      stored
    )
    if (user) setStoredUser(user)
    return user
  }
  return getStoredUser()
}

export async function logout() {
  if (isApiEnabled()) {
    try {
      await apiRequest(ENDPOINTS.auth.logout, { method: 'POST' })
    } catch {
      /* ignore */
    }
  }
  clearAuthSession()
}

export async function sendPasswordResetOtp(email) {
  if (isApiEnabled()) {
    return apiRequest(ENDPOINTS.auth.forgotPassword, {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email }),
    })
  }
  await new Promise((r) => setTimeout(r, 600))
  storeMockOtp(email, DEMO_OTP)
  return { ok: true }
}

export async function verifyPasswordResetOtp(email, otp) {
  if (isApiEnabled()) {
    return apiRequest(ENDPOINTS.auth.verifyResetOtp, {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, otp }),
    })
  }
  await new Promise((r) => setTimeout(r, 400))
  if (!readMockOtp(email, otp)) {
    throw new Error('Invalid or expired verification code')
  }
  return { ok: true }
}

export async function resetPasswordWithOtp({ email, otp, password }) {
  if (isApiEnabled()) {
    return apiRequest(ENDPOINTS.auth.setNewPassword, {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, newPassword: password }),
    })
  }
  await new Promise((r) => setTimeout(r, 500))
  if (!readMockOtp(email, otp)) {
    throw new Error('Invalid or expired verification code')
  }
  clearMockOtp()
  return { ok: true }
}
