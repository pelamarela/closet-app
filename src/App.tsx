import type { ComponentType } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import V3Layout from './design/Layout'
import TodayPage from './pages/TodayPage'
import MonthPage from './pages/MonthPage'
import WardrobePage from './pages/WardrobePage'
import ItemFormPage from './pages/ItemFormPage'
import ItemDetailPage from './pages/ItemDetailPage'
import LogOutfitPage from './pages/LogOutfitPage'
import OutfitDetailPage from './pages/OutfitDetailPage'
import SuggestPage from './pages/SuggestPage'
import ShopPage from './pages/ShopPage'
import BatchUploadPage from './pages/BatchUploadPage'
import SettingsPage from './pages/SettingsPage'
import StyleProfileEditorPage from './pages/StyleProfileEditorPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import IdeasPage from './pages/IdeasPage'
import IdeaDetailPage from './pages/IdeaDetailPage'
import IdeaEditPage from './pages/IdeaEditPage'
import ArchivedPage from './pages/ArchivedPage'
import StatsPage from './pages/StatsPage'
import ConstantsPage from './pages/ConstantsPage'

// Two shells during the v3 migration: pages that have been rebuilt against
// design/kit.tsx render under V3Layout (persistent header, 4 tabs + raised
// Log action); everything else still renders under the old Layout (5-tab
// nav, no persistent header) until its turn comes. Navigating between an
// old-shell and new-shell page swaps the chrome — expected until every page
// has migrated, see design/Layout.tsx.
function ProtectedShell({ Shell }: { Shell: ComponentType }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100svh', background: '#F7F6F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.06em' }}>loading…</span>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return <Shell />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedShell Shell={V3Layout} />}>
            <Route path="/" element={<TodayPage />} />
            <Route path="/outfits" element={<MonthPage />} />
            <Route path="/outfits/:id" element={<OutfitDetailPage />} />
            <Route path="/wardrobe" element={<WardrobePage />} />
            <Route path="/wardrobe/:id" element={<ItemDetailPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/outfits/new" element={<LogOutfitPage />} />
            <Route path="/outfits/:id/edit" element={<LogOutfitPage />} />
            <Route path="/suggest" element={<SuggestPage />} />
            <Route path="/ideas" element={<IdeasPage />} />
            <Route path="/ideas/:id" element={<IdeaDetailPage />} />
          </Route>
          <Route element={<ProtectedShell Shell={Layout} />}>
            <Route path="/wardrobe/new" element={<ItemFormPage />} />
            <Route path="/wardrobe/batch" element={<BatchUploadPage />} />
            <Route path="/wardrobe/:id/edit" element={<ItemFormPage />} />
            <Route path="/ideas/:id/edit" element={<IdeaEditPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/profile" element={<StyleProfileEditorPage />} />
            <Route path="/settings/password" element={<ChangePasswordPage />} />
            <Route path="/settings/archived" element={<ArchivedPage />} />
            <Route path="/settings/stats" element={<StatsPage />} />
            <Route path="/settings/constants" element={<ConstantsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
