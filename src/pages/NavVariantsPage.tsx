// Dev-only: bottom navigation variations, each clickable. Flat, lowercase, no shadows.
import { useState } from 'react'
import { T, fS, V4Icon, Disp } from '../design/kit'
import type { IconName } from '../design/kit'
import { R } from '../design/radii'
import { usePreviewPalette } from '../design/previewPalette'

type Id = 'today' | 'closet' | 'ideas' | 'me'
const TABS: { id: Id; label: string; icon: IconName }[] = [
  { id: 'today', label: 'today', icon: 'home' }, { id: 'closet', label: 'closet', icon: 'hanger' },
  { id: 'ideas', label: 'ideas', icon: 'bulb' }, { id: 'me', label: 'me', icon: 'user' },
]
const BASE = { border: 'none', cursor: 'pointer', fontFamily: fS } as const

function Frame({ name, note, children }: { name: string; note: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: fS, fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{name}</div>
      <div style={{ fontFamily: fS, fontSize: 13, color: T.g500, marginBottom: 10 }}>{note}</div>
      <div style={{ position: 'relative', width: 340, height: 520, background: T.paper, overflow: 'hidden' }}>
        <div style={{ padding: 20 }}>
          <Disp s={30}>cloudy, 11°</Disp>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
            {['#E1AFA1', '#5E3436', '#FCF3EA', '#E9558C'].map(c => <div key={c} style={{ aspectRatio: '3/4', background: c, opacity: 0.9 }} />)}
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

function useTab() { const [t, setT] = useState<Id>('today'); return [t, setT] as const }

// c in other colour combinations from the design system
type Combo = { name: string; bar: string; icon: string; on: string; onIcon: string; log: string; logIcon: string }
const COMBOS: Combo[] = [
  { name: 'cream bar, blush selected, espresso log', bar: '#FCF9F4', icon: '#1B1210', on: '#E1AFA1', onIcon: '#1B1210', log: '#1B1210', logIcon: '#FFFFFF' },
  { name: 'same, rosewood log', bar: '#FCF9F4', icon: '#1B1210', on: '#E1AFA1', onIcon: '#1B1210', log: '#5E3436', logIcon: '#FFFFFF' },
  { name: 'same, white bar', bar: '#FFFFFF', icon: '#1B1210', on: '#E1AFA1', onIcon: '#1B1210', log: '#1B1210', logIcon: '#FFFFFF' },
]
function CombosC() {
  const [t, setT] = useTab()
  return (
    <>
      {COMBOS.map(c => (
        <Frame key={c.name} name={c.name} note="">
          <nav style={{ position: 'absolute', left: 12, right: 12, bottom: 12, display: 'flex', gap: 4, padding: 4, background: c.bar, borderRadius: R.sm }}>
            {TABS.slice(0, 2).map(x => (
              <button key={x.id} onClick={() => setT(x.id)} aria-label={x.label} style={{ ...BASE, flex: 1, height: 48, background: t === x.id ? c.on : 'none', color: t === x.id ? c.onIcon : c.icon, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: R.sm }}><V4Icon n={x.icon} s={22} w={1.7} /></button>
            ))}
            <button aria-label="log" style={{ ...BASE, flex: 1, height: 48, background: c.log, color: c.logIcon, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: R.sm }}><V4Icon n="plus" s={22} w={2} /></button>
            {TABS.slice(2).map(x => (
              <button key={x.id} onClick={() => setT(x.id)} aria-label={x.label} style={{ ...BASE, flex: 1, height: 48, background: t === x.id ? c.on : 'none', color: t === x.id ? c.onIcon : c.icon, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: R.sm }}><V4Icon n={x.icon} s={22} w={1.7} /></button>
            ))}
          </nav>
        </Frame>
      ))}
    </>
  )
}

export default function NavVariantsPage() {
  const ready = usePreviewPalette()
  if (!ready) return null
  return (
    <div style={{ background: T.line, minHeight: '100svh', padding: '32px 24px 80px' }}>
      <Disp s={32}>bottom nav</Disp>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, marginTop: 28 }}>
        <CombosC />
      </div>
    </div>
  )
}
