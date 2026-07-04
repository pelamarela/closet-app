import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { AppBar, SectionLabel, Icon, MONO, UI, INK, RULE, BLUSH } from '../components/ui'
import TextBlock from '../components/TextBlock'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { items } = useItems()
  const { outfits } = useOutfits()
  const [profile, setProfile] = useState<string | null>(null)

  const initial = user?.email?.[0]?.toUpperCase() ?? '?'
  const email = user?.email ?? ''

  useEffect(() => {
    if (!user) return
    supabase.from('style_profile').select('description').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data.description) })
  }, [user])

  function Row({ k, v, last }: { k: string; v: React.ReactNode; last?: boolean }) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '11px 0', borderBottom: last ? 'none' : RULE,
      }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</span>
        <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, color: INK, display: 'flex', alignItems: 'center', gap: 6 }}>{v}</span>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <AppBar
        title="Settings"
        meta="signed in"
      />

      {/* Owner block */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, background: BLUSH,
            color: INK, fontFamily: UI, fontSize: 22, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>{initial}</div>
          <div>
            <div style={{ fontFamily: UI, fontSize: 18, fontWeight: 500, letterSpacing: '-0.015em' }}>
              {email.split('@')[0]}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', marginTop: 2 }}>
              {email} · owner
            </div>
          </div>
        </div>
      </div>

      {/* Style profile */}
      <div style={{ padding: '24px 20px 0' }}>
        <SectionLabel right={
          <button onClick={() => navigate('/settings/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', padding: 0 }}>
            edit ›
          </button>
        }>style profile</SectionLabel>
        <TextBlock>
          {profile
            ? profile
            : <span style={{ color: 'rgba(0,0,0,0.35)', fontStyle: 'italic' }}>No style profile yet — used by suggestions.</span>
          }
        </TextBlock>
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
          <span>used by suggestions</span>
          {profile && <span>{profile.length} chars</span>}
        </div>
      </div>

      {/* Storage */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>storage</SectionLabel>
        <div style={{ borderTop: RULE }}>
          <Row k="items"   v={`${items.length} / unlimited`} />
          <Row k="outfits" v={`${outfits.length} / unlimited`} last />
        </div>
      </div>

      {/* Wardrobe */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>wardrobe</SectionLabel>
        <div style={{ borderTop: RULE }}>
          <button
            onClick={() => navigate('/settings/archived')}
            style={{
              width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '11px 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer',
              fontFamily: MONO, fontSize: 11, color: INK,
              borderBottom: RULE,
            }}
          >
            Archived items
            <Icon name="forward" size={14} stroke={1.2} />
          </button>
          <button
            onClick={() => navigate('/settings/stats')}
            style={{
              width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '11px 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer',
              fontFamily: MONO, fontSize: 11, color: INK,
            }}
          >
            Statistics
            <Icon name="forward" size={14} stroke={1.2} />
          </button>
        </div>
      </div>

      {/* Support */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>support</SectionLabel>
        <div style={{ borderTop: RULE }}>
          <a
            href="mailto:spela.anzeljc26@gmail.com?subject=Closet%20app%20support"
            style={{
              width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '11px 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer', textDecoration: 'none',
              fontFamily: MONO, fontSize: 11, color: INK,
            }}
          >
            Email support
            <Icon name="forward" size={14} stroke={1.2} />
          </a>
        </div>
      </div>

      {/* Sync */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>account</SectionLabel>
        <div style={{ borderTop: RULE }}>
          <Row k="provider" v="supabase auth" />
          <Row k="version"  v="v 2.1.0" last />
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>navigate</SectionLabel>
        <div style={{ borderTop: RULE }}>
          {[
            ['Wardrobe', '/wardrobe'],
            ['Calendar', '/outfits'],
            ['Suggestions', '/suggest'],
          ].map(([label, path], i) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '11px 0',
                borderBottom: i < 2 ? RULE : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer',
                fontFamily: MONO, fontSize: 11, color: INK,
              }}
            >
              {label}
              <Icon name="forward" size={14} stroke={1.2} />
            </button>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <div style={{ padding: '24px 20px 28px' }}>
        <button
          onClick={signOut}
          style={{
            width: '100%', height: 48, padding: '0 20px',
            background: 'transparent', color: INK, border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: 4, cursor: 'pointer',
            fontFamily: UI, fontSize: 13, fontWeight: 600,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
