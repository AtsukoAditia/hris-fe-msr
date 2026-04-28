import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import MainLayout from '../components/layout/MainLayout'

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}

export default ProtectedRoute
