/** JWT + user session keys — keep in sync with backend auth responses */
export const AUTH_TOKEN_KEY = 'rokkru_token'
export const AUTH_USER_KEY = 'rokkru_user'
/** Placeholder when session lives in httpOnly cookie (backend auth) */
export const COOKIE_SESSION_TOKEN = 'cookie-session'

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setToken(token) {
  if (typeof window === 'undefined' || !token) return
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  if (typeof window === 'undefined') return
  if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(AUTH_USER_KEY)
}

/** @param {{ token?: string, user?: object }} session */
export function setAuthSession({ token, user }) {
  if (token) setToken(token)
  if (user) setStoredUser(user)
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

export function isAuthenticated() {
  const token = getToken()
  const user = getStoredUser()
  if (token === COOKIE_SESSION_TOKEN) return Boolean(user)
  return Boolean(token && user)
}
