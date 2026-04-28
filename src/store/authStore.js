import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setLoading: (isLoading) => set({ isLoading }),

      login: (user, token) => {
        set({ user, token, isAuthenticated: true, isLoading: false })
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (user) => set({ user }),
    }),
    {
      name: 'hris-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
export { useAuthStore }
