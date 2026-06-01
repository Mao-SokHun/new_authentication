/** API path constants — must match `backend/src/routes/v1` */

export const ENDPOINTS = {
  health: '/health',

  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/profile',
    verifyLoginOtp: '/auth/verify-otp',
    forgotPassword: '/auth/forgot-password',
    verifyResetOtp: '/auth/verify-forgot-otp',
    setNewPassword: '/auth/set-new-password',
    resetPassword: '/auth/reset-password',
  },

  userTypes: {
    list: '/v1/user-types',
  },

  teachers: {
    list: '/teachers',
    byId: (id) => `/teachers/${id}`,
  },

  mentors: {
    me: '/v1/mentors/me',
    create: '/v1/mentors',
    byId: (id) => `/v1/mentors/${id}`,
  },

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
