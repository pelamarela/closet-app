import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { MONO, INK } from './ui'

const tabs = [
  {
    id: 'wardrobe',
    label: 'closet',
    to: '/wardrobe',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8a2 2 0 1 1 2-2"/><path d="M12 8v2"/><path d="M3 18l9-6 9 6"/><path d="M3 18h18"/>
      </svg>
    ),
  },
  {
    id: 'outfits',
    label: 'log',
    to: '/outfits',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>
      </svg>
    ),
  },
  {
    id: 'suggest',
    label: 'suggest',
    to: '/suggest',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/>
      </svg>
    ),
  },
]

export default function Layout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100svh', background: '#F7F6F5', display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto' }}>
      {/* Top bar */}
      <div style={{
        padding: '12px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.10)',
        background: '#F7F6F5',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <button
          onClick={() => navigate('/wardrobe')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: "'Geist','Inter',system-ui,sans-serif",
            fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
            color: INK, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <div style={{
            width: 18, height: 18, background: '#DFAFA1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <div style={{ width: 6, height: 6, background: INK }} />
          </div>
          closet
        </button>
        <button
          onClick={signOut}
          style={{
            fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          sign out
        </button>
      </div>

      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 84 }}>
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        height: 84, paddingBottom: 24,
        borderTop: '1px solid rgba(0,0,0,0.10)',
        background: '#F7F6F5',
        display: 'flex',
      }}>
        {tabs.map(tab => (
          <NavLink
            key={tab.id}
            to={tab.to}
            style={({ isActive }) => ({
              flex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              color: isActive ? INK : 'rgba(0,0,0,0.38)',
              fontFamily: MONO, fontSize: 9.5,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              textDecoration: 'none', position: 'relative',
              strokeWidth: isActive ? 1.8 : 1.4,
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 0, left: '30%', right: '30%',
                    height: 2, background: INK,
                  }} />
                )}
                {tab.icon}
                {tab.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
