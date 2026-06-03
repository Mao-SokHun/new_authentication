import { validateStudentProfileComplete } from '@/lib/validation/student/index.js'
import { validateMentorProfileComplete } from '@/lib/validation/mentor/index.js'

/** Student finished onboarding modal (or saved equivalent fields). */
export function isStudentProfileComplete(user) {
  if (!user || user.role !== 'student') return true
  return validateStudentProfileComplete(user).valid
}

/** Teacher finished onboarding modal (or saved equivalent fields). */
export function isTeacherProfileComplete(user) {
  if (!user || user.role !== 'teacher') return true
  return validateMentorProfileComplete(user).valid
}

export function isProfileComplete(user) {
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.role === 'teacher') return isTeacherProfileComplete(user)
  if (user.role === 'student') return isStudentProfileComplete(user)
  return true
}

export function markProfileComplete(patch = {}) {
  return { ...patch, profileComplete: true }
}
