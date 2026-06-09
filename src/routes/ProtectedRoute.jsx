import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, token, hasHydrated, isLoading } = useAuthStore()
  const location = useLocation()

  if (!hasHydrated || (token && isLoading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Memuat sesi pengguna...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
