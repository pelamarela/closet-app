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

import { motion, MotionConfig } from 'motion/react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { T, fD, fS, V4Icon, Btn, APP_HEADER_H, CONTENT_MAX_W, type IconName } from './kit'
import { R } from './radii'

const TABS: { id: string; label: string; to: string; icon: IconName; active: (p: string) => boolean }[] = [
  { id: 'today', label: 'today', to: '/', icon: 'home', active: p => p === '/' || p.startsWith('/outfits') },
  { id: 'closet', label: 'closet', to: '/wardrobe', icon: 'hanger', active: p => p.startsWith('/wardrobe') },
  // the fourth tab is the suggest function; saved ideas live under it and are also reachable from Today and Me
  { id: 'suggest', label: 'suggest', to: '/suggest', icon: 'spark', active: p => p === '/suggest' || p.startsWith('/ideas') },
  // the profile lives in the top bar; its slot here is the shop feature
  { id: 'shop', label: 'shop', to: '/shop', icon: 'bag', active: p => p === '/shop' },
]
const SIDENAV_W = 236
// full-page flows with their own pinned action bar: no tab bar underneath
const FOCUS_FLOW = /^\/(outfits\/new|outfits\/[^/]+\/edit|wardrobe\/new|wardrobe\/batch|wardrobe\/[^/]+\/edit|ideas\/[^/]+\/edit|settings\/password|settings\/profile)$/

// Mobile app header: the logo and the title on the left, the avatar (a link to Me) on the right.
function Header() {
  const navigate = useNavigate()
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30, background: T.paper, height: APP_HEADER_H, boxSizing: 'border-box',
      padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
        <img src="/logo.png" alt="" style={{ width: 32, height: 32, objectFit: 'contain', display: 'block' }} />
        <span style={{ fontFamily: fD, fontSize: 18, color: T.ink, lineHeight: 1 }}>closet</span>
      </button>
      <button onClick={() => navigate('/settings')} aria-label="me" style={{
        width: 36, height: 36, borderRadius: R.sm, background: T.peach, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fS, fontSize: 15, fontWeight: 600, color: T.ink,
      }}><V4Icon n="user" s={21} w={1.7} /></button>
    </div>
  )
}

// Mobile: a floating white bar inset from the edges. Four icon-only tabs and the dark "log" square in the
// middle, same size as the tabs. The selected tab is a blush block with a dark icon.
function TabBar() {
  const { pathname } = useLocation()
  const tab = (t: (typeof TABS)[number]) => {
    const on = t.active(pathname)
    return (
      <Link key={t.id} to={t.to} aria-label={t.label} aria-current={on ? 'page' : undefined} style={{
        position: 'relative', flex: 1, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.ink, textDecoration: 'none', WebkitTapHighlightColor: 'transparent', borderRadius: R.sm,
      }}>
        {on && <motion.div layoutId="tab-indicator" transition={{ type: 'spring', stiffness: 500, damping: 40 }} style={{ position: 'absolute', inset: 0, background: T.peach, borderRadius: R.sm }} />}
        <motion.div whileTap={{ scale: 0.9 }} style={{ position: 'relative', display: 'flex' }}><V4Icon n={t.icon} s={23} w={1.7} /></motion.div>
      </Link>
    )
  }
  return (
    <nav style={{
      position: 'fixed', left: 22, right: 22, bottom: 'calc(12px + var(--safe-b))', zIndex: 30,
      background: T.paper, display: 'flex', gap: 4, padding: 4, borderRadius: R.sm,
    }}>
      {tab(TABS[0])}{tab(TABS[1])}
      <Link to="/outfits/new" aria-label="log" style={{ flex: 1, textDecoration: 'none', display: 'flex' }}>
        <motion.div whileTap={{ scale: 0.94 }} style={{ flex: 1, height: 52, borderRadius: R.sm, background: T.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <V4Icon n="plus" s={24} w={2} />
        </motion.div>
      </Link>
      {tab(TABS[2])}{tab(TABS[3])}
    </nav>
  )
}

function SideNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  return (
    <div style={{
      width: SIDENAV_W, position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 30, background: T.paper,
      padding: '30px 18px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 12px 22px', background: 'none', border: 'none', cursor: 'pointer' }}>
        <img src="/logo.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain', display: 'block' }} />
        <span style={{ fontFamily: fD, fontSize: 22, color: T.ink }}>closet</span>
      </button>
      <div style={{ padding: '0 0 16px' }}><Link to="/outfits/new" style={{ textDecoration: 'none', display: 'block' }}><Btn full icon="plus">log</Btn></Link></div>
      {TABS.map(tab => {
        const on = tab.active(pathname)
        return (
          <Link key={tab.id} to={tab.to} aria-current={on ? 'page' : undefined} style={{
            position: 'relative', height: 46, borderRadius: R.sm, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 11,
            textDecoration: 'none', fontFamily: fS, fontSize: 14.5, fontWeight: on ? 600 : 400, color: T.ink,
          }}>
            {on && <motion.div layoutId="side-indicator" transition={{ type: 'spring', stiffness: 500, damping: 38 }} style={{ position: 'absolute', inset: 0, background: T.peach, borderRadius: R.sm }} />}
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 11 }}><V4Icon n={tab.icon} s={21} w={on ? 1.9 : 1.6} />{tab.label}</span>
          </Link>
        )
      })}
      <div style={{ flex: 1 }} />
      <Link to="/settings" aria-current={pathname.startsWith('/settings') ? 'page' : undefined} style={{ position: 'relative', height: 46, borderRadius: R.sm, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', fontFamily: fS, fontSize: 14.5, fontWeight: pathname.startsWith('/settings') ? 600 : 400, color: T.ink, background: pathname.startsWith('/settings') ? T.peach : 'none' }}>
        <V4Icon n="user" s={21} w={1.7} />{user?.email?.split('@')[0] ?? 'me'}
      </Link>
    </div>
  )
}

export default function V3Layout() {
  const { isDesktop } = useBreakpoint()
  const { pathname } = useLocation()
  const focus = FOCUS_FLOW.test(pathname)

  // One shared tree instead of two early-return branches, so resizing across the breakpoint doesn't remount
  // the current route and wipe in-progress page state (e.g. a half-filled form).
  return (
    <div style={{ minHeight: '100svh', background: T.paper, width: '100%', ...(isDesktop ? {} : { display: 'flex', flexDirection: 'column' }), ...(focus && !isDesktop ? { ['--v3-sticky-bottom' as string]: '0px' } : {}) }}>
      {isDesktop ? <SideNav /> : <Header />}
      <main style={isDesktop ? { marginLeft: SIDENAV_W, padding: '30px 44px 0' } : { flex: 1, paddingTop: APP_HEADER_H, paddingBottom: focus ? 0 : 'var(--nav-h)' }}>
        <div style={isDesktop ? { maxWidth: CONTENT_MAX_W, margin: '0 auto' } : undefined}>
          <MotionConfig reducedMotion="user">
            <motion.div
              key={pathname}
              // item detail is entered via a View Transition morph from the tile; no fade there
              initial={/^\/wardrobe\/(?!new$|batch$)[^/]+$/.test(pathname) ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </MotionConfig>
        </div>
      </main>
      {!isDesktop && !focus && <TabBar />}
    </div>
  )
}
