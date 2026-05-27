import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import WardrobePage from './pages/WardrobePage'
import OutfitsPage from './pages/OutfitsPage'
import SuggestPage from './pages/SuggestPage'

function ProtectedRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-400 text-sm">Loading…</div>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return <Layout />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/wardrobe" element={<WardrobePage />} />
            <Route path="/outfits" element={<OutfitsPage />} />
            <Route path="/suggest" element={<SuggestPage />} />
            <Route path="/" element={<Navigate to="/wardrobe" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
