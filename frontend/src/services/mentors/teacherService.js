import { apiRequest, isApiEnabled } from '../core/api'
import { ENDPOINTS } from '../core/endpoints'
import { getStoredUser } from '@/lib/authStorage'
import { filterTeachers } from '@/utils/filterTeachers'
import { buildQueryString, toTeacherQueryParams } from '@/utils/teacherQuery'
import { teachers as mockTeachers } from '@/constants'

const TEACHER_PATHS = {
  list: ENDPOINTS.teachers.list,
  byId: ENDPOINTS.teachers.byId,
}

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
      await apiRequest(ENDPOINTS.mentors.create, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    )
  } catch (err) {
    if (err.status === 409 && id) {
      return unwrapApiData(
        await apiRequest(ENDPOINTS.mentors.byId(id), {
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
    const json = await apiRequest(`${TEACHER_PATHS.list}${qs}`)
    const payload = unwrapApiData(json)
    if (Array.isArray(payload)) {
      return { items: payload, total: payload.length }
    }
    const items = payload?.item ?? payload?.items ?? []
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
    return unwrapApiData(await apiRequest(TEACHER_PATHS.byId(id)))
  }
  return mockTeachers.find((t) => String(t.id) === String(id)) ?? null
}
