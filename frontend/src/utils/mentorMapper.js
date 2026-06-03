/** Parse description saved by toMentorPayload (Title / Teaching / bio lines). */
export function parseMentorDescription(description = '') {
  const text = String(description).trim()
  if (!text) {
    return { title: '', major: '', subject: '', bio: '', subjects: [] }
  }

  const lines = text.split('\n\n').filter(Boolean)
  let title = ''
  let major = ''
  let subject = ''
  let bio = text

  for (const line of lines) {
    if (line.startsWith('Title: ')) title = line.slice(7).trim()
    else if (line.startsWith('Teaching: ')) {
      const parts = line.slice(10).split(' · ').map((p) => p.trim())
      major = parts[0] ?? ''
      subject = parts[1] ?? ''
    } else if (!line.startsWith('Title: ') && !line.startsWith('Teaching: ')) {
      bio = line
    }
  }

  const subjects = subject ? [subject] : []
  return { title, major, subject, bio, subjects }
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
