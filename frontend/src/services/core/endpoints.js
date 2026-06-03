/**
 * API path constants — must match backend routes.
 *
 * Base URL (.env): VITE_API_URL=http://localhost:3000/api
 * Full URL = VITE_API_URL + path
 *
 * Naming:
 * - Backend resource: mentor  →  /api/v1/mentors/...
 * - UI role & pages:  teacher  →  /teacher/edit-profile, /teacher/home, ...
 * - ENDPOINTS.teacher and ENDPOINTS.mentors point to the same paths.
 */

const mentorRoutes = {
  list: '/v1/mentors',
  search: '/v1/mentors/search',
  byId: (userId) => `/v1/mentors/${userId}`,
  me: '/v1/mentors/me',
  myAnalytics: '/v1/mentors/me/analytics',
  create: '/v1/mentors',
  skills: {
    listAll: '/v1/mentors/skill/listAllSkill',
    byMentor: (userId) => `/v1/mentors/${userId}/skills`,
  },
  portfolio: {
    byMentor: (userId) => `/v1/mentors/${userId}/portfolio`,
    item: (userId, link) =>
      `/v1/mentors/${userId}/portfolio/${encodeURIComponent(link)}`,
  },
  posts: {
    byMentor: (userId) => `/v1/mentors/${userId}/posts`,
    byId: (postId) => `/v1/mentors/posts/${postId}`,
  },
}

export const ENDPOINTS = {
  health: '/health',

  /** Auth — backend mount: /api/auth */
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/profile',
    deleteAccount: '/auth/delete-user',
    verifyLoginOtp: '/auth/verify-otp',
    forgotPassword: '/auth/forgot-password',
    verifyResetOtp: '/auth/verify-forgot-otp',
    setNewPassword: '/auth/set-new-password',
    resetPassword: '/auth/reset-password',
  },

  /** Mentor API paths — same object as mentors / teacher */
  mentorRoutes,

  /** User types — backend mount: /api/v1/user-types */
  userTypes: {
    list: '/v1/user-types',
  },

  /** Backend name — use in services that talk to mentor API directly */
  mentors: mentorRoutes,

  /**
   * Teacher UI name — same paths as mentors.
   * Use from /teacher/* pages and teacherService.js.
   */
  teacher: mentorRoutes,

  communities: {
    list: '/communities',
    byId: (id) => `/communities/${id}`,
  },

  sessions: {
    list: '/sessions',
    byId: (id) => `/sessions/${id}`,
  },

  users: {
    list: '/users',
    byId: (id) => `/users/${id}`,
  },

  admin: {
    reports: '/admin/reports',
    content: '/admin/content',
  },
}
