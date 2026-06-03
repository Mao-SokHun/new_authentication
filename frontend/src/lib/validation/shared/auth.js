/** Matches backend validatePassword in authValidation.js */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+='"|{}[\]\\/:;<>?,.\~`]).{8,}$/

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email ?? '').trim())
}

export function isValidPassword(password) {
  return PASSWORD_REGEX.test(String(password ?? ''))
}
