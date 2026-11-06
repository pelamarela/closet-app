import type { ComponentType } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
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
import MePage from './pages/MePage'
import StyleProfileEditorPage from './pages/StyleProfileEditorPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import IdeasPage from './pages/IdeasPage'
import IdeaDetailPage from './pages/IdeaDetailPage'
import IdeaEditPage from './pages/IdeaEditPage'
import ArchivedPage from './pages/ArchivedPage'
import StatsPage from './pages/StatsPage'
import ConstantsPage from './pages/ConstantsPage'
import LabPage from './pages/LabPage'
import AuditPage from './pages/AuditPage'
import HomePreviewPage from './pages/HomePreviewPage'
import OverhaulPage from './pages/OverhaulPage'
import PreviewPage from './pages/PreviewPage'
import NavVariantsPage from './pages/NavVariantsPage'
import OutfitTestPage from './pages/OutfitTestPage'
import HeaderVariantsPage from './pages/HeaderVariantsPage'

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
      <div style={{ minHeight: '100svh', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: '"Manrope", system-ui, sans-serif', fontSize: 10, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.06em' }}>loading…</span>
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
          {import.meta.env.DEV && <Route path="/lab" element={<LabPage />} />}
          {import.meta.env.DEV && <Route path="/audit" element={<AuditPage />} />}
          {import.meta.env.DEV && <Route path="/home-preview" element={<HomePreviewPage />} />}
          {import.meta.env.DEV && <Route path="/overhaul" element={<OverhaulPage />} />}
          {import.meta.env.DEV && <Route path="/preview" element={<PreviewPage />} />}
          {import.meta.env.DEV && <Route path="/nav" element={<NavVariantsPage />} />}
          {import.meta.env.DEV && <Route path="/outfits-test" element={<OutfitTestPage />} />}
          {import.meta.env.DEV && <Route path="/header" element={<HeaderVariantsPage />} />}
          <Route element={<ProtectedShell Shell={V3Layout} />}>
            <Route path="/" element={<TodayPage />} />
            <Route path="/outfits" element={<MonthPage />} />
            <Route path="/outfits/:id" element={<OutfitDetailPage />} />
            <Route path="/wardrobe" element={<WardrobePage />} />
            <Route path="/wardrobe/new" element={<ItemFormPage />} />
            <Route path="/wardrobe/:id" element={<ItemDetailPage />} />
            <Route path="/wardrobe/:id/edit" element={<ItemFormPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/outfits/new" element={<LogOutfitPage />} />
            <Route path="/outfits/:id/edit" element={<LogOutfitPage />} />
            <Route path="/suggest" element={<SuggestPage />} />
            <Route path="/ideas" element={<IdeasPage />} />
            <Route path="/ideas/:id" element={<IdeaDetailPage />} />
            <Route path="/settings" element={<MePage />} />
            <Route path="/settings/profile" element={<StyleProfileEditorPage />} />
            <Route path="/settings/stats" element={<StatsPage />} />
            <Route path="/wardrobe/batch" element={<BatchUploadPage />} />
            <Route path="/ideas/:id/edit" element={<IdeaEditPage />} />
            <Route path="/settings/password" element={<ChangePasswordPage />} />
            <Route path="/settings/archived" element={<ArchivedPage />} />
            <Route path="/settings/constants" element={<ConstantsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
