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
  const { token, setAuth, clearAuth, isAuthenticated, user, isLoading, setLoading } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      if (token && !user) {
        try {
          setLoading(true)
          const res = await authService.me()
          setAuth(res.data.data, token)
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
    setAuth(res.data.data.user, res.data.data.token)
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
