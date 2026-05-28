import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import WardrobePage from './pages/WardrobePage'
import ItemFormPage from './pages/ItemFormPage'
import ItemDetailPage from './pages/ItemDetailPage'
import OutfitsPage from './pages/OutfitsPage'
import LogOutfitPage from './pages/LogOutfitPage'
import OutfitDetailPage from './pages/OutfitDetailPage'
import SuggestPage from './pages/SuggestPage'
import BatchUploadPage from './pages/BatchUploadPage'
import SettingsPage from './pages/SettingsPage'
import StyleProfileEditorPage from './pages/StyleProfileEditorPage'

function ProtectedRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100svh', background: '#F7F6F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.06em' }}>loading…</span>
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
            <Route path="/" element={<HomePage />} />
            <Route path="/wardrobe" element={<WardrobePage />} />
            <Route path="/wardrobe/new" element={<ItemFormPage />} />
            <Route path="/wardrobe/batch" element={<BatchUploadPage />} />
            <Route path="/wardrobe/:id" element={<ItemDetailPage />} />
            <Route path="/wardrobe/:id/edit" element={<ItemFormPage />} />
            <Route path="/outfits" element={<OutfitsPage />} />
            <Route path="/outfits/new" element={<LogOutfitPage />} />
            <Route path="/outfits/:id" element={<OutfitDetailPage />} />
            <Route path="/suggest" element={<SuggestPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/profile" element={<StyleProfileEditorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
