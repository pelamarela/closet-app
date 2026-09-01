import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useOutfits } from '../hooks/useOutfits'
import { useIdeas } from '../hooks/useIdeas'
import { useConstants } from '../hooks/useConstants'
import { getLogReminderEnabled, setLogReminderEnabled } from '../lib/settings'
import { T, fS, V4Icon, Btn, Row4, Disp, Body, Mono, SecH, V4Card, type IconName } from '../design/kit'

export default function MePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { outfits } = useOutfits()
  const { ideas } = useIdeas()
  const { constants } = useConstants()
  const [profile, setProfile] = useState<string | null>(null)
  const [colorSeason, setColorSeason] = useState<string | null>(null)
  const [archivedCount, setArchivedCount] = useState<number | null>(null)
  const [reminderOn, setReminderOn] = useState(() => getLogReminderEnabled())

  useEffect(() => {
    if (!user) return
    supabase.from('style_profile').select('description, color_season').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) { setProfile(data.description); setColorSeason(data.color_season) } })
    supabase.from('items').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'archived')
      .then(({ count }) => setArchivedCount(count ?? 0))
  }, [user])

  const initial = user?.email?.charAt(0).toUpperCase() ?? '?'
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toLowerCase()
    : null

  const cards: { label: string; sub: string; icon: IconName; to: string }[] = [
    { label: 'Statistics', sub: `${outfits.length} outfits`, icon: 'chart', to: '/settings/stats' },
    { label: 'Ideas', sub: `${ideas.length} saved`, icon: 'bulb', to: '/ideas' },
    { label: 'Archived', sub: archivedCount == null ? '—' : `${archivedCount} piece${archivedCount === 1 ? '' : 's'}`, icon: 'archive', to: '/settings/archived' },
    { label: 'Constants', sub: `${constants.length} always on`, icon: 'repeat', to: '/settings/constants' },
  ]

  const toggleReminder = () => {
    const next = !reminderOn
    setReminderOn(next)
    setLogReminderEnabled(next)
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ padding: '4px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Disp s={30}>Me</Disp><Mono s={11}>v3.0</Mono>
      </div>
      <div style={{ padding: '20px 22px 0' }}>
        <V4Card fill={T.peach} shadow={false} pad={18} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15, minWidth: 0 }}>
            <div style={{ width: 58, height: 58, background: T.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fS, fontSize: 21, fontWeight: 600, flexShrink: 0 }}>{initial}</div>
            <div style={{ minWidth: 0 }}>
              <Disp s={19}>{user?.email?.split('@')[0] ?? 'You'}</Disp>
              <div style={{ marginTop: 3 }}><Mono s={11} c={T.cocoa}>{user?.email}</Mono></div>
              {memberSince && <div style={{ marginTop: 2 }}><Mono s={10.5} c={T.cocoaSoft}>keeping track since {memberSince}</Mono></div>}
            </div>
          </div>
          <button onClick={signOut} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, fontFamily: fS, fontSize: 13, fontWeight: 500, color: T.cocoaDeep }}>sign out</button>
        </V4Card>
      </div>
      <div style={{ padding: '16px 22px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
        {cards.map(c => (
          <button key={c.label} onClick={() => navigate(c.to)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
            <V4Card pad={15} style={{ minHeight: 92, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <V4Icon n={c.icon} s={20} w={1.6} c={T.cocoa} />
              <div>
                <div style={{ fontFamily: fS, fontSize: 14.5, fontWeight: 600 }}>{c.label}</div>
                <div style={{ marginTop: 1 }}><Mono s={10.5}>{c.sub}</Mono></div>
              </div>
            </V4Card>
          </button>
        ))}
      </div>
      <div style={{ padding: '24px 22px 0' }}>
        <SecH right="Edit" onRightClick={() => navigate('/settings/profile')}>How I dress</SecH>
        <V4Card pad={17}>
          <Body s={14} c={T.g700}>{profile || 'No style profile yet — add one for better suggestions.'}</Body>
          {colorSeason && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 13, borderTop: `1px solid ${T.line}` }}>
              <Mono s={10.5}>read by every suggestion</Mono>
              <span style={{ height: 34, display: 'inline-flex', alignItems: 'center', padding: '0 13px', background: T.peach, color: T.ink, fontFamily: fS, fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>{colorSeason.replace('-', ' ')}</span>
            </div>
          )}
        </V4Card>
      </div>
      <div style={{ padding: '26px 22px 0' }}>
        <SecH>Account</SecH>
        <Row4 label="Change password" onClick={() => navigate('/settings/password')} />
        <Row4 label="Notifications" sub="A nudge if you haven't logged by 9pm" toggle={reminderOn} onClick={toggleReminder} />
        <a href="mailto:spela@pelamarela.com?subject=Closet%20app%20support" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <Row4 label="Email me" sub="Bugs, ideas, anything" last chev={false} />
        </a>
      </div>
      <div style={{ padding: '24px 22px 0' }}><Btn full kind="quiet" onClick={signOut}>Sign out</Btn></div>
    </div>
  )
}
