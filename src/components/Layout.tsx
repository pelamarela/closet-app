import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Icon, MONO, INK } from './ui'
import { useBreakpoint } from '../hooks/useBreakpoint'

const tabs = [
  { id: 'home',     label: 'home',     to: '/',         icon: 'home',     active: (p: string) => p === '/' },
  { id: 'closet',   label: 'closet',   to: '/wardrobe', icon: 'hanger',   active: (p: string) => p.startsWith('/wardrobe') },
  { id: 'calendar', label: 'calendar', to: '/outfits',  icon: 'calendar', active: (p: string) => p.startsWith('/outfits') },
  { id: 'suggest',  label: 'suggest',  to: '/suggest',  icon: 'spark',    active: (p: string) => p.startsWith('/suggest') },
]

const CONTENT_MAX = 1200

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isDesktop } = useBreakpoint()

  if (isDesktop) {
    return (
      <div style={{ minHeight: '100svh', background: '#F7F6F5', display: 'flex', flexDirection: 'column' }}>
        {/* Top nav */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: '#F7F6F5', borderBottom: '1px solid rgba(0,0,0,0.10)',
          display: 'flex', alignItems: 'center',
          padding: '0 32px', height: 56,
        }}>
          {/* Logo */}
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', marginRight: 40 }}>
            <img src="/logo.png" style={{ width: 28, height: 28, display: 'block' }} alt="home" />
          </button>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 4, flex: 1 }}>
            {tabs.map(tab => {
              const isActive = tab.active(pathname)
              return (
                <Link
                  key={tab.id}
                  to={tab.to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '6px 14px',
                    fontFamily: MONO, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase',
                    color: isActive ? INK : 'rgba(0,0,0,0.45)',
                    textDecoration: 'none',
                    borderBottom: `2px solid ${isActive ? INK : 'transparent'}`,
                    marginBottom: -1,
                  }}
                >
                  <Icon name={tab.icon} size={15} stroke={isActive ? 1.8 : 1.4} />
                  {tab.label}
                </Link>
              )
            })}
          </div>

          {/* User */}
          <button
            onClick={() => navigate('/settings')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK, padding: 6, display: 'flex', alignItems: 'center' }}
          >
            <Icon name="user" size={20} stroke={1.5} />
          </button>
        </nav>

        {/* Content */}
        <main style={{ flex: 1, maxWidth: CONTENT_MAX, width: '100%', margin: '0 auto', padding: '0 32px', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>
    )
  }

  // Mobile — original bottom nav layout
  return (
    <div style={{
      minHeight: '100svh', background: '#F7F6F5',
      display: 'flex', flexDirection: 'column',
      maxWidth: 430, margin: '0 auto',
    }}>
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 84 }}>
        <Outlet />
      </main>

      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        height: 84, paddingBottom: 24,
        borderTop: '1px solid rgba(0,0,0,0.10)',
        background: '#F7F6F5',
        display: 'flex',
        zIndex: 20,
      }}>
        {tabs.map(tab => {
          const isActive = tab.active(pathname)
          return (
            <Link
              key={tab.id}
              to={tab.to}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
                color: isActive ? INK : 'rgba(0,0,0,0.38)',
                fontFamily: MONO, fontSize: 9.5,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                textDecoration: 'none', position: 'relative',
              }}
            >
              {isActive && (
                <div style={{ position: 'absolute', top: 0, left: '30%', right: '30%', height: 2, background: INK }} />
              )}
              <Icon name={tab.icon} size={20} stroke={isActive ? 1.8 : 1.4} />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
