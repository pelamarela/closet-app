// v3 app shell — replaces components/Layout.tsx for pages that have migrated
// to the design/kit.tsx system. Persistent header (logo + avatar) + 4 tabs +
// a raised Log action on mobile; a sidebar nav on desktop, per
// design-materials/v3's 07_Desktop reference. Every migrated page still only
// has its own single-column mobile layout internally — the desktop
// adaptation here is a shared shell (sidebar nav, centered content column)
// rather than bespoke per-page desktop layouts.
//
// During the phased migration, routes that haven't been rebuilt yet still
// render under the old <Layout/> (components/Layout.tsx) with the old 5-tab
// nav — see App.tsx. Navigating between an old-shell page and a new-shell
// page swaps the whole chrome; that's expected until every page migrates.

import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { T, fS, V4Icon, Btn, APP_HEADER_H, type IconName } from './kit'

const TABS: { id: string; label: string; to: string; icon: IconName; active: (p: string) => boolean }[] = [
  { id: 'today', label: 'Today', to: '/', icon: 'home', active: p => p === '/' || p.startsWith('/outfits') },
  { id: 'closet', label: 'Closet', to: '/wardrobe', icon: 'hanger', active: p => p.startsWith('/wardrobe') || p === '/shop' },
  { id: 'ideas', label: 'Ideas', to: '/ideas', icon: 'bulb', active: p => p.startsWith('/ideas') },
  { id: 'me', label: 'Me', to: '/settings', icon: 'user', active: p => p.startsWith('/settings') },
]
const SIDENAV_W = 236

function Header() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const initial = (user?.email ?? '?').charAt(0).toUpperCase()
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30, background: T.paper, height: APP_HEADER_H, boxSizing: 'border-box',
      padding: '0 22px', borderBottom: `1px solid ${T.line}`,
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

function SideNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const initial = (user?.email ?? '?').charAt(0).toUpperCase()
  return (
    <div style={{
      width: SIDENAV_W, position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 30,
      borderRight: `1px solid ${T.line}`, background: T.paper,
      padding: '30px 18px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 12px 26px', background: 'none', border: 'none', cursor: 'pointer' }}>
        <img src="/logo.png" alt="" style={{ width: 26, height: 26, objectFit: 'contain', display: 'block' }} />
        <span style={{ fontFamily: fS, fontSize: 15, fontWeight: 600, color: T.ink }}>closet</span>
      </button>
      <div style={{ padding: '0 0 18px' }}><Link to="/outfits/new" style={{ textDecoration: 'none', display: 'block' }}><Btn full icon="cal">Log an outfit</Btn></Link></div>
      {TABS.map(tab => {
        const active = tab.active(pathname)
        return (
          <Link key={tab.id} to={tab.to} style={{
            height: 46, borderRadius: 2, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 11,
            background: active ? T.peach : 'transparent', textDecoration: 'none',
            fontFamily: fS, fontSize: 14.5, fontWeight: active ? 600 : 400, color: active ? T.ink : T.g500,
          }}>
            <V4Icon n={tab.icon} s={21} w={active ? 1.9 : 1.5} />{tab.label}
          </Link>
        )
      })}
      <div style={{ flex: 1 }} />
      <button onClick={() => navigate('/settings')} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 34, height: 34, borderRadius: 2, background: T.peach, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fS, fontSize: 14, fontWeight: 600, color: T.ink, flexShrink: 0 }}>{initial}</div>
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 500, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email?.split('@')[0]}</div>
        </div>
      </button>
    </div>
  )
}

export default function V3Layout() {
  const { isDesktop } = useBreakpoint()

  if (isDesktop) {
    return (
      <div style={{ minHeight: '100svh', background: T.paper, width: '100%' }}>
        <SideNav />
        <main style={{ marginLeft: SIDENAV_W, padding: '0 44px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}><Outlet /></div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100svh', background: T.paper, display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Header />
      <main style={{ flex: 1, paddingTop: APP_HEADER_H, paddingBottom: 'var(--nav-h)' }}>
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
