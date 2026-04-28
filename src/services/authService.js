import api from '../lib/axios'

export const authService = {
  /**
   * Login user
   * @param {{ email: string, password: string }} credentials
   */
  login: (credentials) => api.post('/auth/login', credentials),

  /**
   * Logout user (revoke token)
   */
  logout: () => api.post('/auth/logout'),

  /**
   * Get current authenticated user
   */
  me: () => api.get('/auth/me'),

  /**
   * Refresh access token
   */
  refreshToken: () => api.post('/auth/refresh'),

  /**
   * Change password
   */
  changePassword: (data) => api.put('/auth/change-password', data),
}
