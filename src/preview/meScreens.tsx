// Prototype screens: month, me, statistics, style profile, archive, constants, password, login.
import { useState } from 'react'
import { motion } from 'motion/react'
import { T, fS, fD, Btn, Pill, Disp, Ph } from '../design/kit'
import { R } from '../design/radii'
import { catLabel } from '../lib/categoryLabel'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { CATS, ITEMS, MONTH_OUTFITS, SEASONS, tone } from './data'
import { Title, Heading, TopBar, Row, PieceGrid, Collage, Segmented, Field, Pic } from './ui'
import type { Nav } from './nav'

function FootBar({ children }: { children: React.ReactNode }) {
  const { isDesktop } = useBreakpoint()
  return (
    <div style={{ position: 'fixed', left: isDesktop ? 236 : 0, right: 0, bottom: 0, zIndex: 20, background: T.paper, padding: '12px 22px calc(14px + env(safe-area-inset-bottom, 0px))' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 10 }}>{children}</div>
    </div>
  )
}

export function MonthScreen({ nav }: { nav: Nav }) {
  const { isDesktop } = useBreakpoint()
  const [day, setDay] = useState(6)
  const lead = 6 // november 2026 starts on a sunday, week starts on monday
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: 30 }, (_, i) => i + 1)]
  const ids = MONTH_OUTFITS[day]
  const iso = `2026-11-${String(day).padStart(2, '0')}`
  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="november" onBack={nav.back} />
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'minmax(0,6fr) minmax(0,4fr)' : '1fr', gap: isDesktop ? 40 : 20, alignItems: 'start' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(d => <div key={d} style={{ textAlign: 'center', fontFamily: fS, fontSize: 12, color: T.g400, paddingBottom: 2 }}>{d}</div>)}
          {cells.map((d, i) => d == null ? <div key={`e${i}`} /> : (
            <button key={d} onClick={() => setDay(d)} aria-pressed={d === day} style={{ position: 'relative', padding: 0, border: 'none', cursor: 'pointer', aspectRatio: '3/4', background: T.white, boxShadow: d === day ? `0 0 0 2px ${T.cocoa}` : 'none', overflow: 'hidden', borderRadius: R.sm }}>
              {MONTH_OUTFITS[d] && <Ph tone={tone(d, 1)} />}
              <span style={{ position: 'absolute', left: 4, top: 3, fontFamily: fS, fontSize: 11, fontWeight: d === 6 ? 700 : 400, color: MONTH_OUTFITS[d] && tone(d, 1) !== 'paper' && tone(d, 1) !== 'peach' ? '#fff' : T.ink }}>{d}</span>
            </button>
          ))}
        </div>
        <div>
          {ids ? (
            <button onClick={() => nav.go('outfit')} style={{ display: 'block', width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}><Collage ids={ids} ratio="4/3" /></button>
          ) : (
            <Btn full kind="peach" icon="plus" onClick={() => nav.log([], iso)}>log</Btn>
          )}
        </div>
      </div>
    </div>
  )
}

export function MeScreen({ nav }: { nav: Nav }) {
  return (
    <div>
      <Title>me</Title>
      <div style={{ maxWidth: 560 }}>
        <Row title="statistics" icon="chart" onClick={() => nav.go('stats')} />
        <Row title="how i dress" icon="user" onClick={() => nav.go('profile')} />
        <Row title="archive" icon="archive" value="4" onClick={() => nav.go('archive')} />
        <Row title="constants" icon="repeat" value="3" onClick={() => nav.go('constants')} />
        <Row title="password" icon="pen" onClick={() => nav.go('password')} />
        <Row title="sign out" icon="back" onClick={() => nav.go('login')} last />
      </div>
    </div>
  )
}

export function StatsScreen({ nav }: { nav: Nav }) {
  const [period, setPeriod] = useState('month')
  const k = period === 'week' ? 1 : period === 'month' ? 4 : 30
  const bars = CATS.slice(1).map((c, i) => ({ c, v: [34, 26, 18, 12, 10][i] }))
  return (
    <div>
      <TopBar title="statistics" onBack={nav.back} />
      <div style={{ maxWidth: 640, display: 'grid', gap: 28 }}>
        <Segmented options={['week', 'month', 'year']} value={period} onChange={setPeriod} group="stats" />
        <div style={{ display: 'flex', gap: 40 }}>
          <div><Disp s={56}>{5 * k}</Disp><div style={{ fontFamily: fS, fontSize: 14, color: T.g500 }}>outfits</div></div>
          <div><Disp s={56}>{12 + k}</Disp><div style={{ fontFamily: fS, fontSize: 14, color: T.g500 }}>pieces</div></div>
        </div>
        <div><Heading>most worn</Heading><PieceGrid ids={[0, 1, 4, 3]} min={72} /></div>
        <div><Heading>least worn</Heading><PieceGrid ids={[9, 14, 19, 24]} min={72} /></div>
        <div>
          <Heading>by type</Heading>
          <div style={{ display: 'grid', gap: 8 }}>
            {bars.map((b, i) => (
              <div key={b.c} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: fS, fontSize: 14 }}>
                <span style={{ width: 44 }}>{catLabel(b.c)}</span>
                <div style={{ flex: 1, height: 14, background: T.white }}><motion.div initial={{ width: 0 }} animate={{ width: `${b.v * 2.4}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} style={{ height: '100%', background: T.peach }} /></div>
                <span style={{ width: 28, textAlign: 'right', color: T.g500 }}>{b.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfileScreen({ nav }: { nav: Nav }) {
  const [text, setText] = useState('')
  const [season, setSeason] = useState('autumn')
  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="how i dress" onBack={nav.back} />
      <div style={{ maxWidth: 640, display: 'grid', gap: 16 }}>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="in my words" rows={7} style={{ width: '100%', padding: 14, border: 'none', background: T.white, fontFamily: fS, fontSize: 15, color: T.ink, outline: 'none', resize: 'none' }} />
        <Btn kind="quiet" icon="spark" onClick={() => setText('soft neutrals, relaxed shapes, a little polish. layers over bold prints.')}>draft</Btn>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{SEASONS.map(s => <Pill key={s} group="pv-season" on={season === s} onClick={() => setSeason(s)}>{s}</Pill>)}</div>
      </div>
      <FootBar><Btn full onClick={nav.back}>save</Btn></FootBar>
    </div>
  )
}

export function ArchiveScreen({ nav }: { nav: Nav }) {
  const [sel, setSel] = useState<number[]>([])
  const toggle = (id: number) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="archive" onBack={nav.back} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8 }}>
        {[20, 21, 22, 23].map(id => (
          <button key={id} onClick={() => toggle(id)} aria-pressed={sel.includes(id)} style={{ padding: 0, border: 'none', cursor: 'pointer', background: 'none', aspectRatio: '3/4', boxShadow: sel.includes(id) ? `0 0 0 3px ${T.ink}` : 'none' }}><Pic id={id} /></button>
        ))}
      </div>
      <FootBar><Btn kind="quiet" disabled={sel.length === 0} onClick={() => setSel([])}>delete</Btn><Btn flex={1} kind="peach" disabled={sel.length === 0} onClick={() => setSel([])}>restore</Btn></FootBar>
    </div>
  )
}

export function ConstantsScreen({ nav }: { nav: Nav }) {
  const [ids, setIds] = useState([30, 31, 32])
  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="constants" onBack={nav.back} />
      <div style={{ maxWidth: 560 }}>
        {ids.map((id, i) => <Row key={id} title={ITEMS[id].name} photo={id} onClick={() => setIds(l => l.filter(x => x !== id))} last={i === ids.length - 1} />)}
      </div>
      <FootBar><Btn full kind="peach" icon="plus" onClick={() => setIds(l => [...l, 33 + l.length])}>add</Btn></FootBar>
    </div>
  )
}

export function PasswordScreen({ nav }: { nav: Nav }) {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [c, setC] = useState('')
  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="password" onBack={nav.back} />
      <div style={{ maxWidth: 480, display: 'grid', gap: 10 }}>
        <Field type="password" value={a} onChange={setA} placeholder="current" />
        <Field type="password" value={b} onChange={setB} placeholder="new" />
        <Field type="password" value={c} onChange={setC} placeholder="repeat" />
      </div>
      <FootBar><Btn full disabled={!a || !b || b !== c} onClick={nav.back}>save</Btn></FootBar>
    </div>
  )
}

export function LoginScreen({ nav }: { nav: Nav }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  return (
    <div style={{ minHeight: '80svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 380, display: 'grid', gap: 10 }}>
        <img src="/brand/wave.png" alt="" style={{ width: 72, marginBottom: 6 }} />
        <div style={{ fontFamily: fD, fontSize: 34, marginBottom: 10 }}>closet</div>
        <Field value={email} onChange={setEmail} placeholder="email" type="email" />
        <Field value={pw} onChange={setPw} placeholder="password" type="password" />
        <Btn full onClick={() => nav.tab('today')}>sign in</Btn>
      </div>
    </div>
  )
}
