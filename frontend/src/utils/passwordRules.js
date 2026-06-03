/** Matches backend validatePassword in authValidation.js */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+='"|{}[\]\\/:;<>?,.\~`]).{8,}$/

export function isValidPassword(password) {
  return PASSWORD_REGEX.test(String(password ?? ''))
}
