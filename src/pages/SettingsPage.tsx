import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { useConstants } from '../hooks/useConstants'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { AppBar, SectionLabel, MonoTag, Icon, MONO, UI, INK, RULE, BLUSH, ACCENT } from '../components/ui'
import TextBlock from '../components/TextBlock'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { items } = useItems()
  const { outfits } = useOutfits()
  const { constants } = useConstants()
  const { isDesktop } = useBreakpoint()
  const [profile, setProfile] = useState<string | null>(null)
  const [profileExpanded, setProfileExpanded] = useState(false)

  const initial = user?.email?.[0]?.toUpperCase() ?? '?'
  const email = user?.email ?? ''

  useEffect(() => {
    if (!user) return
    supabase.from('style_profile').select('description').eq('user_id', user.id).single()
      .then(({ data, error }) => {
        if (error) { console.error('style_profile fetch failed:', error); return }
        if (data) setProfile(data.description)
      })
  }, [user])

  function NavRow({ label, value, onClick, last }: { label: string; value?: string; onClick: () => void; last?: boolean }) {
    return (
      <button
        onClick={onClick}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '11px 0',
          borderBottom: last ? 'none' : RULE,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer',
          fontFamily: MONO, fontSize: 11, color: INK,
        }}
      >
        {label}
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {value && <span style={{ color: 'rgba(0,0,0,0.5)' }}>{value}</span>}
          <Icon name="forward" size={14} stroke={1.2} />
        </span>
      </button>
    )
  }

  const OwnerBlock = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <div style={{
          width: 56, height: 56, background: BLUSH,
          color: INK, fontFamily: UI, fontSize: 22, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>{initial}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: UI, fontSize: 18, fontWeight: 500, letterSpacing: '-0.015em' }}>
            {email.split('@')[0]}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </div>
        </div>
      </div>
      <button
        onClick={() => navigate('/settings/password')}
        style={{
          flexShrink: 0, background: ACCENT, color: '#fff', border: 'none',
          borderRadius: 999, padding: '10px 18px', cursor: 'pointer',
          fontFamily: UI, fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em',
          boxShadow: '0 2px 6px rgba(156,85,68,0.35)',
        }}
      >
        change password
      </button>
    </div>
  )

  const StyleProfileBlock = (
    <div style={{ marginTop: 24 }}>
      <SectionLabel right={
        <button onClick={() => navigate('/settings/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', padding: 0 }}>
          edit ›
        </button>
      }>style profile</SectionLabel>
      <div style={{ position: 'relative' }}>
        <TextBlock>
          <div style={!profileExpanded ? { maxHeight: 78, overflow: 'hidden' } : undefined}>
            {profile
              ? profile
              : <span style={{ color: 'rgba(0,0,0,0.35)', fontStyle: 'italic' }}>No style profile yet — used by suggestions.</span>
            }
          </div>
        </TextBlock>
        {profile && profile.length > 220 && !profileExpanded && (
          <div style={{ position: 'absolute', bottom: 1, left: 1, right: 1, height: 32, background: 'linear-gradient(transparent, #fff)', pointerEvents: 'none' }} />
        )}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
        <span>
          used by suggestions
          {profile && profile.length > 220 && (
            <button
              onClick={() => setProfileExpanded(v => !v)}
              style={{ background: 'none', border: 'none', padding: 0, marginLeft: 10, cursor: 'pointer', fontFamily: MONO, fontSize: 9, color: INK, textDecoration: 'underline' }}
            >
              {profileExpanded ? 'show less' : 'show more'}
            </button>
          )}
        </span>
        {profile && <span>{profile.length} chars</span>}
      </div>
    </div>
  )

  const ConstantsBlock = (
    <div style={{ marginTop: 20 }}>
      <div style={{ borderTop: RULE }}>
        <NavRow label="Constants" value={`${constants.length}`} onClick={() => navigate('/settings/constants')} last />
      </div>
    </div>
  )

  const WardrobeBlock = (
    <div>
      <SectionLabel>wardrobe</SectionLabel>
      <div style={{ borderTop: RULE }}>
        <NavRow label="Items" value={`${items.length}`} onClick={() => navigate('/wardrobe')} />
        <NavRow label="Outfits" value={`${outfits.length}`} onClick={() => navigate('/outfits')} />
        <NavRow label="Statistics" onClick={() => navigate('/settings/stats')} />
        <NavRow label="Archived" onClick={() => navigate('/settings/archived')} last />
      </div>
    </div>
  )

  const SupportBlock = (
    <div style={{ marginTop: 24 }}>
      <SectionLabel>support</SectionLabel>
      <div style={{ borderTop: RULE }}>
        <a
          href="mailto:spela@pelamarela.com?subject=Closet%20app%20support"
          style={{
            width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '11px 0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            cursor: 'pointer', textDecoration: 'none',
            fontFamily: MONO, fontSize: 11, color: INK,
          }}
        >
          Email me
          <Icon name="forward" size={14} stroke={1.2} />
        </a>
      </div>
    </div>
  )

  const SignOutButton = (
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
  )

  return (
    <div style={{ paddingBottom: 40 }}>
      <AppBar
        title="Settings"
        meta={<MonoTag>v2.1.0</MonoTag>}
      />

      {isDesktop ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, margin: '18px 20px 0', alignItems: 'start' }}>
          <div>
            {OwnerBlock}
            {StyleProfileBlock}
            {ConstantsBlock}
          </div>
          <div>
            {WardrobeBlock}
            {SupportBlock}
            <div style={{ marginTop: 28 }}>{SignOutButton}</div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: '18px 20px 0' }}>{OwnerBlock}</div>
          <div style={{ padding: '0 20px 0' }}>{StyleProfileBlock}</div>
          <div style={{ padding: '0 20px 0' }}>{ConstantsBlock}</div>
          <div style={{ padding: '20px 20px 0' }}>{WardrobeBlock}</div>
          <div style={{ padding: '0 20px 0' }}>{SupportBlock}</div>
          <div style={{ padding: '28px 20px 0' }}>{SignOutButton}</div>
        </>
      )}
    </div>
  )
}
