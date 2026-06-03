import { apiRequest, isApiEnabled } from '../core/api'
import { ENDPOINTS } from '../core/endpoints'
import { getStoredUser } from '@/lib/authStorage'
import { resolveTeacherProfile } from '@/lib/teacherProfile'
import { filterTeachers } from '@/utils/filterTeachers'
import { mapMentorToTeacher, mapMentorsToTeachers, parseMentorDescription } from '@/utils/mentorMapper'
import { buildQueryString, toTeacherQueryParams } from '@/utils/teacherQuery'
import { teachers as mockTeachers } from '@/constants'

/** Teacher UI → mentor API (ENDPOINTS.teacher === ENDPOINTS.mentors) */
const MENTOR_API = ENDPOINTS.mentors

function unwrapApiData(json) {
  return json?.data ?? json
}

/** Map onboarding popup fields → mentor table columns */
export function toMentorPayload(profile) {
  const lines = []
  if (profile.title?.trim()) lines.push(`Title: ${profile.title.trim()}`)
  if (profile.major || profile.subject) {
    lines.push(
      `Teaching: ${[profile.major, profile.subject].filter(Boolean).join(' · ')}`
    )
  }
  if (profile.bio?.trim()) lines.push(profile.bio.trim())

  return {
    firstname: profile.firstName?.trim(),
    lastname: profile.lastName?.trim(),
    gender: profile.gender?.trim() || undefined,
    phone_number: profile.phone?.trim() || undefined,
    address: profile.province?.trim() || undefined,
    experience_years: profile.experienceYears ?? undefined,
    description: lines.length ? lines.join('\n\n') : undefined,
  }
}

/** Save teacher onboarding to mentor table (POST or PUT). */
export async function saveMentorFromOnboarding(profile, userId) {
  if (!isApiEnabled()) return null

  const body = toMentorPayload(profile)
  const id = userId ?? getStoredUser()?.id

  try {
    return unwrapApiData(
      await apiRequest(MENTOR_API.create, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    )
  } catch (err) {
    if (err.status === 409 && id) {
      return unwrapApiData(
        await apiRequest(MENTOR_API.byId(id), {
          method: 'PUT',
          body: JSON.stringify(body),
        })
      )
    }
    throw err
  }
}

export async function fetchTeachers(filters = {}) {
  const params = toTeacherQueryParams(filters)
  const qs = buildQueryString(params)

  if (isApiEnabled()) {
    const json = await apiRequest(`${MENTOR_API.list}${qs}`)
    const payload = unwrapApiData(json)
    const rawItems = Array.isArray(payload)
      ? payload
      : payload?.item ?? payload?.items ?? []
    const mapped = mapMentorsToTeachers(rawItems)
    const items = filterTeachers(mapped, filters)
    return {
      items,
      total: payload?.total ?? items.length,
      page: payload?.page,
      pageSize: payload?.limit ?? payload?.pageSize,
    }
  }

  const items = filterTeachers(mockTeachers, filters)
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? items.length
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  }
}

export async function fetchTeacherById(id) {
  if (isApiEnabled()) {
    const mentor = unwrapApiData(await apiRequest(MENTOR_API.byId(id)))
    return mapMentorToTeacher(mentor)
  }
  return mockTeachers.find((t) => String(t.id) === String(id)) ?? null
}

/** GET /teacher/edit-profile — logged-in mentor row */
export async function fetchMyTeacherProfile() {
  if (!isApiEnabled()) return null
  return unwrapApiData(await apiRequest(MENTOR_API.me))
}

/** PUT /teacher/edit-profile — update mentor profile */
export async function updateTeacherProfile(userId, profile) {
  if (!isApiEnabled()) return null
  const body = toMentorPayload(profile)
  return unwrapApiData(
      await apiRequest(MENTOR_API.byId(userId), {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  )
}

/** Map mentor API row → teacher edit-profile form defaults */
export function mentorRowToProfile(mentor, user) {
  const base = resolveTeacherProfile(user)
  if (!mentor) return base

  const parsed = parseMentorDescription(mentor.description ?? '')

  return {
    ...base,
    firstName: mentor.firstname ?? base.firstName,
    lastName: mentor.lastname ?? base.lastName,
    phone: mentor.phone_number ?? base.phone,
    gender: mentor.gender ?? base.gender,
    province: mentor.address ?? base.province,
    experienceYears: mentor.experience_years ?? base.experienceYears,
    bio: parsed.bio || base.bio,
    title: parsed.title || base.title,
    major: parsed.major || base.major,
    subject: parsed.subject || base.subject,
    profilePicture: mentor.profile_picture ?? base.profilePicture,
  }
}
export function portfolioRowToUi(row) {
  const link = row?.link ?? ''
  return { id: link || `tmp-${Date.now()}`, link, title: row?.link_tag ?? '', oldLink: link }
}

function isValidPortfolioUrl(link) {
  return /^https?:\/\/.+/i.test(String(link ?? '').trim())
}

export async function fetchTeacherPortfolio(userId) {
  if (!isApiEnabled() || !userId) return []
  const json = await apiRequest(MENTOR_API.portfolio.byMentor(userId))
  return (unwrapApiData(json) ?? []).map(portfolioRowToUi)
}

export async function createPortfolioItem(userId, { link, title }) {
  const trimmedLink = String(link).trim()
  if (!isValidPortfolioUrl(trimmedLink)) throw new Error('Invalid portfolio URL')
  const json = await apiRequest(MENTOR_API.portfolio.byMentor(userId), {
    method: 'POST',
    body: JSON.stringify({ link: trimmedLink, link_tag: title?.trim() || null }),
  })
  return portfolioRowToUi(unwrapApiData(json))
}

export async function updatePortfolioItem(userId, link, { title }) {
  const json = await apiRequest(MENTOR_API.portfolio.item(userId, link), {
    method: 'PATCH',
    body: JSON.stringify({ link_tag: title?.trim() || null }),
  })
  return portfolioRowToUi(unwrapApiData(json))
}

export async function deletePortfolioItem(userId, link) {
  await apiRequest(MENTOR_API.portfolio.item(userId, link), { method: 'DELETE' })
}