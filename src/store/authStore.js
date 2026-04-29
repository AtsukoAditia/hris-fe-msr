import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/authService'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      setLoading: (isLoading) => set({ isLoading }),

      setHydrated: (hasHydrated) => set({ hasHydrated }),

      login: (user, token) => {
        set({ user, token, isAuthenticated: true, isLoading: false })
      },

      logout: async () => {
        try {
          if (get().token) {
            await authService.logout()
          }
        } catch (error) {
          console.error('Logout API error:', error)
        } finally {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
        }
      },

      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      },

      updateUser: (user) => set({ user }),

      syncMe: async () => {
        if (!get().token) {
          set({ isAuthenticated: false, user: null, isLoading: false })
          return null
        }

        try {
          set({ isLoading: true })
          const response = await authService.me()
          const user = response.data?.user || null

          if (!user) {
            throw new Error('User data not found')
          }

          set({ user, isAuthenticated: true, isLoading: false })
          return user
        } catch (error) {
          console.error('Sync /auth/me error:', error)
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
          return null
        }
      },
    }),
    {
      name: 'hris-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)

export { useAuthStore }
