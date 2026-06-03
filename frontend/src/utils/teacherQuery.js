/** Map UI filters → mentor controller query params (buildListQuery) */
export function toTeacherQueryParams(filters = {}) {
  const params = {}

  // Backend supports: page, limit, q, skillId, subSkillId, minExperience
  if (filters.page) params.page = String(filters.page)
  if (filters.pageSize) params.limit = String(filters.pageSize)
  if (filters.q?.trim()) params.q = filters.q.trim()
  if (filters.skillId != null) params.skillId = String(filters.skillId)
  if (filters.subSkillId != null) params.subSkillId = String(filters.subSkillId)
  if (filters.minExperience != null) params.minExperience = String(filters.minExperience)

  // major/subject/location/sort — applied client-side after mapMentorToTeacher
  return params
}

export function buildQueryString(params) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}
