import { Link, Outlet, useLocation } from 'react-router-dom'
import { Icon, MONO, INK } from './ui'

const tabs = [
  {
    id: 'closet',
    label: 'closet',
    to: '/wardrobe',
    icon: 'hanger',
    active: (p: string) => p === '/' || p.startsWith('/wardrobe'),
  },
  {
    id: 'log',
    label: 'log',
    to: '/outfits/new',
    icon: 'plus',
    active: (p: string) => p === '/outfits/new',
  },
  {
    id: 'calendar',
    label: 'calendar',
    to: '/outfits',
    icon: 'calendar',
    active: (p: string) => p.startsWith('/outfits') && p !== '/outfits/new',
  },
  {
    id: 'suggest',
    label: 'suggest',
    to: '/suggest',
    icon: 'spark',
    active: (p: string) => p.startsWith('/suggest') || p.startsWith('/settings'),
  },
]

export default function Layout() {
  const { pathname } = useLocation()

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
                <div style={{
                  position: 'absolute', top: 0, left: '30%', right: '30%',
                  height: 2, background: INK,
                }} />
              )}
              <Icon
                name={tab.icon}
                size={20}
                stroke={isActive ? 1.8 : 1.4}
              />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
