import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/index.jsx'
import { useAuthStore } from './store/authStore'

function App() {
  const { token, hasHydrated, syncMe } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated || !token) return
    syncMe()
  }, [hasHydrated, token, syncMe])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
