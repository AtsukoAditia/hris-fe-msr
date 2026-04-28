import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  login: (user, token) => {
    localStorage.setItem('hris_token', token)
    localStorage.setItem('hris_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('hris_token')
    localStorage.removeItem('hris_user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  initAuth: () => {
    const token = localStorage.getItem('hris_token')
    const userStr = localStorage.getItem('hris_user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({ user, token, isAuthenticated: true })
      } catch {
        localStorage.removeItem('hris_token')
        localStorage.removeItem('hris_user')
      }
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
}))

export default useAuthStore
