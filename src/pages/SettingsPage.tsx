import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { AppBar, SectionLabel, MonoTag, Icon, MONO, UI, INK, RULE, BLUSH } from '../components/ui'
import TextBlock from '../components/TextBlock'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { items } = useItems()
  const { outfits } = useOutfits()
  const { isDesktop } = useBreakpoint()
  const [profile, setProfile] = useState<string | null>(null)

  const initial = user?.email?.[0]?.toUpperCase() ?? '?'
  const email = user?.email ?? ''

  useEffect(() => {
    if (!user) return
    supabase.from('style_profile').select('description').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data.description) })
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
  )

  const StyleProfileBlock = (
    <div style={{ marginTop: 24 }}>
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
          <div style={{ padding: '20px 20px 0' }}>{WardrobeBlock}</div>
          <div style={{ padding: '0 20px 0' }}>{SupportBlock}</div>
          <div style={{ padding: '28px 20px 0' }}>{SignOutButton}</div>
        </>
      )}
    </div>
  )
}
