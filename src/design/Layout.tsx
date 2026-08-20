// v3 app shell — replaces components/Layout.tsx for pages that have migrated
// to the design/kit.tsx system. Persistent header (logo + avatar) on every
// screen, 4 tabs + a raised Log action, per design-materials/v3.
//
// During the phased migration, routes that haven't been rebuilt yet still
// render under the old <Layout/> (components/Layout.tsx) with the old 5-tab
// nav — see App.tsx. Navigating between an old-shell page and a new-shell
// page swaps the whole chrome; that's expected until every page migrates.

import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { T, fS, V4Icon, type IconName } from './kit'

const TABS: { id: string; label: string; to: string; icon: IconName; active: (p: string) => boolean }[] = [
  { id: 'today', label: 'Today', to: '/', icon: 'home', active: p => p === '/' || p.startsWith('/outfits') },
  { id: 'closet', label: 'Closet', to: '/wardrobe', icon: 'hanger', active: p => p.startsWith('/wardrobe') },
  { id: 'ideas', label: 'Ideas', to: '/ideas', icon: 'bulb', active: p => p.startsWith('/ideas') },
  { id: 'me', label: 'Me', to: '/settings', icon: 'user', active: p => p.startsWith('/settings') },
]

function Header() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const initial = (user?.email ?? '?').charAt(0).toUpperCase()
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 30, background: T.paper,
      padding: '10px 22px 12px', borderBottom: `1px solid ${T.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
        <img src="/logo.png" alt="" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
        <span style={{ fontFamily: fS, fontSize: 14, fontWeight: 600, letterSpacing: '-.01em', color: T.ink }}>closet</span>
      </button>
      <button onClick={() => navigate('/settings')} style={{
        width: 36, height: 36, borderRadius: 2, background: T.peach, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fS, fontSize: 15, fontWeight: 600, color: T.ink,
      }}>{initial}</button>
    </div>
  )
}

function TabBar() {
  const { pathname } = useLocation()
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
      height: 'var(--nav-h)', paddingBottom: 'var(--safe-b)',
      background: 'rgba(247,246,245,.94)', backdropFilter: 'blur(12px)',
      borderTop: `1px solid ${T.line}`, display: 'flex', alignItems: 'center',
    }}>
      {TABS.slice(0, 2).map(tab => <TabLink key={tab.id} tab={tab} active={tab.active(pathname)} />)}
      <Link to="/outfits/new" aria-label="Log an outfit" style={{ width: 78, display: 'flex', justifyContent: 'center', textDecoration: 'none' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 2, background: T.ink, color: '#fff',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          marginTop: -30, boxShadow: '0 8px 20px rgba(0,0,0,.22)',
        }}>
          <V4Icon n="cal" s={22} w={1.9} />
          <div style={{ fontFamily: fS, fontSize: 8.5, fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: -1 }}>log</div>
        </div>
      </Link>
      {TABS.slice(2).map(tab => <TabLink key={tab.id} tab={tab} active={tab.active(pathname)} />)}
    </nav>
  )
}

function TabLink({ tab, active }: { tab: (typeof TABS)[number]; active: boolean }) {
  return (
    <Link to={tab.to} style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      color: active ? T.ink : T.g400, textDecoration: 'none',
    }}>
      <V4Icon n={tab.icon} s={23} w={active ? 1.9 : 1.5} />
      <div style={{ fontFamily: fS, fontSize: 10.5, fontWeight: active ? 500 : 400 }}>{tab.label}</div>
    </Link>
  )
}

export default function V3Layout() {
  return (
    <div style={{ minHeight: '100svh', background: T.paper, display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
      <Header />
      <main style={{ flex: 1, paddingBottom: 'var(--nav-h)', overflowX: 'hidden' }}>
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
