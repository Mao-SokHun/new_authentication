import { apiRequest } from '../core/client'
import { ENDPOINTS } from '../core/endpoints'
import { isApiEnabled } from '@/constants'

export async function fetchAdminReports() {
  if (isApiEnabled()) {
    return apiRequest(ENDPOINTS.admin.reports)
  }
  return {
    users: 1240,
    teachers: 86,
    sessions: 432,
    revenue: 12450,
  }
}
