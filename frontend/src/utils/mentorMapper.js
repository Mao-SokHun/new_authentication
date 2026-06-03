import { parseMentorDescription as parseMentorDescriptionFromApi } from '@/lib/mentorApiMap'

/** @deprecated Import from @/lib/mentorApiMap — re-exported for existing imports */
export function parseMentorDescription(description = '') {
  return parseMentorDescriptionFromApi(description)
}

/** Backend mentor row → TeacherCard / TeacherList shape */
export function mapMentorToTeacher(mentor) {
  if (!mentor) return null

  const id = String(mentor.user_id ?? mentor.id ?? '')
  const firstName = mentor.firstname ?? mentor.firstName ?? ''
  const lastName = mentor.lastname ?? mentor.lastName ?? ''
  const name = `${firstName} ${lastName}`.trim() || 'Teacher'
  const parsed = parseMentorDescription(mentor.description ?? '')

  return {
    id,
    userId: mentor.user_id ?? mentor.id,
    name,
    firstName,
    lastName,
    title: parsed.title,
    major: parsed.major,
    subject: parsed.subject,
    subjects: parsed.subjects,
    bio: parsed.bio,
    workOrganization: parsed.workOrganization,
    workPosition: parsed.workPosition,
    location: mentor.address ?? '',
    experience: mentor.experience_years ?? 0,
    experienceYears: mentor.experience_years ?? 0,
    rating: mentor.rating ?? 0,
    reviewCount: mentor.review_count ?? mentor.reviewCount ?? 0,
    students: mentor.students ?? 0,
    verified: Boolean(mentor.verified),
    online: false,
    avatarUrl: mentor.profile_picture ?? null,
    gender: mentor.gender ?? '',
    phone: mentor.phone_number ?? '',
    province: mentor.address ?? '',
    description: mentor.description ?? '',
  }
}

export function mapMentorsToTeachers(rows) {
  if (!Array.isArray(rows)) return []
  return rows.map(mapMentorToTeacher).filter(Boolean)
}
