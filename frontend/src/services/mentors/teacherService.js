import { apiRequest, isApiEnabled } from '../core/api'
import { ENDPOINTS } from '../core/endpoints'
import { getStoredUser } from '@/lib/authStorage'
import { resolveTeacherProfile } from '@/lib/teacherProfile'
import { filterTeachers } from '@/utils/filterTeachers'
import {
  mentorRowToTeacherProfile,
  teacherProfileToMentorPayload,
} from '@/lib/mentorApiMap'
import { mapMentorToTeacher, mapMentorsToTeachers } from '@/utils/mentorMapper'
import { buildQueryString, toTeacherQueryParams } from '@/utils/teacherQuery'

/** Teacher UI → mentor API (ENDPOINTS.teacher === ENDPOINTS.mentors) */
const MENTOR_API = ENDPOINTS.mentors

function unwrapApiData(json) {
  return json?.data ?? json
}

/** Map teacher UI profile → mentor API body (see lib/mentorApiMap.js). */
export function toMentorPayload(profile) {
  return teacherProfileToMentorPayload(profile)
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

  if (!isApiEnabled()) {
    return { items: [], total: 0, page: filters.page ?? 1, pageSize: filters.pageSize ?? 0 }
  }

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

export async function fetchTeacherById(id) {
  if (!isApiEnabled() || !id) return null
  const mentor = unwrapApiData(await apiRequest(MENTOR_API.byId(id)))
  return mapMentorToTeacher(mentor)
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

/** Map mentor API row → teacher edit-profile / auth user shape */
export function mentorRowToProfile(mentor, user) {
  return mentorRowToTeacherProfile(mentor, resolveTeacherProfile(user))
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