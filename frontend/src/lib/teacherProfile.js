import { TEACHER_PROFILE_MOCK } from '@/constants'

/** Merge onboarding/auth user fields with mock defaults for teacher profile UI */
export function resolveTeacherProfile(user, mock = TEACHER_PROFILE_MOCK) {
  const firstName = user?.firstName ?? mock.firstName
  const lastName = user?.lastName ?? mock.lastName
  const displayName =
    user?.name?.trim() || `${firstName} ${lastName}`.trim() || mock.displayName

  return {
    ...mock,
    firstName,
    lastName,
    displayName,
    title: user?.title || mock.title,
    phone: user?.phone || mock.phone,
    gender: user?.gender || mock.gender,
    experienceYears: user?.experienceYears ?? mock.experienceYears,
    major: user?.major || mock.major,
    subject: user?.subject || mock.subject,
    province: user?.province || mock.province,
    bio: user?.bio || mock.bio,
    email: user?.email || mock.email,
  }
}
