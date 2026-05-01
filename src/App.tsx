import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import api from './lib/api'
import AppLayout from './components/layout/AppLayout'
import LoadingScreen from './components/ui/LoadingScreen'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import Transactions from './pages/Transactions'
import WeeklyReport from './pages/WeeklyReport'
import MonthlyReport from './pages/MonthlyReport'
import Settings from './pages/Settings'
import Loans from './pages/Loans'

// Route Guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Redirect if already logged in (but allow bypass for "Logout simulation")
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitializing } = useAuthStore()
  const searchParams = new URLSearchParams(window.location.search)
  const isLocked = searchParams.get('exit') === 'true'

  if (isAuthenticated && !isLocked && !isInitializing) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

function App() {
  const { isInitializing, setInitializing, setAuth, logout } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = useAuthStore.getState().accessToken
      
      try {
        if (storedToken) {
          const { data } = await api.get('/auth/me')
          if (data.success) {
            const user = data.data
            const at = useAuthStore.getState().accessToken!
            const rt = useAuthStore.getState().refreshToken!
            setAuth(user, at, rt)
          }
        }
      } catch (err) {
        console.error('Initial auth check failed:', err)
        logout()
      } finally {
        // Asegurar que la pantalla profesional sea visible por el tiempo deseado
        setTimeout(() => setInitializing(false), 5000)
      }
    }

    initAuth()
  }, [])

  if (isInitializing) {
    return <LoadingScreen />
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/goals/:id" element={<Goals />} /> {/* Goal Detail future expansion */}
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/weekly" element={<WeeklyReport />} />
            <Route path="/monthly" element={<MonthlyReport />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/loans" element={<Loans />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
