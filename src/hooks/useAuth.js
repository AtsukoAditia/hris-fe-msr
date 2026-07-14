import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'

/**
 * Custom hook to handle authentication lifecycle
 * - Auto-fetch current user on mount if token exists
 * - Provides login/logout helpers
 */
export const useAuth = () => {
  const navigate = useNavigate()
  const { token, login: storeLogin, clearAuth, isAuthenticated, user, isLoading, setLoading } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      if (token && !user) {
        try {
          setLoading(true)
          const res = await authService.me()
          const user = res.data?.user || res.data?.data?.user || null
          if (user) storeLogin(user, token)
          else clearAuth()
        } catch {
          clearAuth()
          navigate('/login')
        } finally {
          setLoading(false)
        }
      }
    }
    initAuth()
  }, [token])

  const login = async (credentials) => {
    const res = await authService.login(credentials)
    const user = res.data?.user || res.data?.data?.user
    const authToken = res.data?.token || res.data?.data?.token
    if (user && authToken) storeLogin(user, authToken)
    navigate('/')
    return res
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  return { isAuthenticated, user, isLoading, login, logout }
}
