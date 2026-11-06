// Dev-only preview of the proposed new Home layout, with sample data.
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { rise } from '../design/rise'
import { T, fS, V4Icon, Btn, Disp, Body, Ph } from '../design/kit'
import type { PhTone } from '../design/kit'
import { R } from '../design/radii'
import { useBreakpoint } from '../hooks/useBreakpoint'

// Sample data only: real screens get their tone from outfitTone(id).
const TONES: PhTone[] = ['rose', 'sand', 'cocoa', 'paper', 'ink', 'peach']
const tone = (i: number, shift = 0) => TONES[(i * 5 + shift) % TONES.length]

const WEEK = [
  { d: 'Mon', n: 3, id: 'a1b2c3' }, { d: 'Tue', n: 4, id: 'b2c3d4' }, { d: 'Wed', n: 5, id: 'c3d4e5' },
  { d: 'Thu', n: 6, id: 'd4e5f6', today: true }, { d: 'Fri', n: 7 }, { d: 'Sat', n: 8 }, { d: 'Sun', n: 9 },
]
const PAST = [
  { id: 'a1b2c3', title: 'Linen shirt, cream trousers', date: 'Mon' },
  { id: 'b2c3d4', title: 'Denim jacket, white tee', date: 'Tue' },
  { id: 'c3d4e5', title: 'Knit dress, boots', date: 'Wed' },
]
const IDEAS = [
  { id: 'e5f6a7', title: 'Camel coat, black jeans' },
  { id: 'f6a7b8', title: 'Striped top, midi skirt' },
  { id: 'a7b8c9', title: 'Trench, loafers' },
]

function Heading({ children, action }: { children: string; action?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
      <Disp s={20}>{children}</Disp>
      {action && <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: fS, fontSize: 13.5, color: T.cocoa }}>{action}</button>}
    </div>
  )
}

function Row({ items, w }: { items: { id: string; title: string; date?: string }[]; w: number }) {
  const shift = items.length === 3 && items[0].date ? 1 : 3
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, overflowX: 'auto', margin: '0 -22px', padding: '0 22px 4px' }}>
      {items.map((it, i) => (
        <motion.button key={it.id} {...rise(i)} whileTap={{ scale: 0.97 }} style={{ flexShrink: 0, width: w, background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ aspectRatio: '3/4', borderRadius: R.md, overflow: 'hidden' }}><Ph tone={tone(i, shift)} /></div>
          <div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 500, marginTop: 8, lineHeight: 1.3 }}>{it.title}</div>
          {it.date && <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g400, marginTop: 2 }}>{it.date}</div>}
        </motion.button>
      ))}
    </div>
  )
}

// Preview only: swap the colour tokens in place to compare the current palette with the design system's.
const TOK = T as unknown as Record<string, string>
const CURRENT = { ...TOK }
const DS: Record<string, string> = {
  paper: '#FFFFFF', white: '#FCF9F4', ink: '#1B1210', peach: '#E1AFA1', peachSoft: '#FCF9F4', peachDeep: '#D49A8A',
  rose: '#E1AFA1', roseDeep: '#E9558C', line: '#ECE6DF', g700: '#3A302D', g500: '#6B605B', g400: '#8F8580', g200: '#DDD6D0',
}

export default function HomePreviewPage() {
  const [ds, setDs] = useState(false)
  const setPalette = (on: boolean) => { Object.assign(TOK, on ? DS : CURRENT); setDs(on) }
  useEffect(() => () => { Object.assign(TOK, CURRENT) }, [])
  const { isDesktop } = useBreakpoint()
  const [logged, setLogged] = useState(true)

  const Header = (
    <div>
      <Body s={14} c={T.g400}>Thursday, Nov 6</Body>
      <Disp s={isDesktop ? 44 : 34} style={{ marginTop: 6 }}>Cloudy, 11°</Disp>
    </div>
  )

  const Hero = logged ? (
    <div>
      <motion.div {...rise(0)} style={{ position: 'relative', aspectRatio: isDesktop ? '4/5' : '1/1', borderRadius: R.lg, overflow: 'hidden' }}>
        <Ph tone="rose" />
        <div style={{ position: 'absolute', left: 14, top: 14, height: 28, padding: '0 12px', display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,.94)', borderRadius: R.sm, fontFamily: fS, fontSize: 12.5, fontWeight: 500, color: T.cocoa }}>Work</div>
      </motion.div>
      <Disp s={20} style={{ marginTop: 14 }}>Linen shirt, cream trousers, loafers</Disp>
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <Btn kind="quiet" flex={1}>Wear again</Btn>
        <Btn kind="peach" icon="spark" flex={1}>Suggest</Btn>
      </div>
    </div>
  ) : (
    <motion.div {...rise(0)} style={{ background: T.white, borderRadius: R.lg, padding: '28px 22px' }}>
      <img src="/brand/wave.png" alt="" style={{ width: 84, display: 'block', marginBottom: 16 }} />
      <Disp s={24}>Nothing on today yet</Disp>
      <Body s={14} style={{ marginTop: 8 }}>Log it yourself or get a suggestion.</Body>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <Btn kind="primary" icon="plus" flex={1}>Log</Btn>
        <Btn kind="peach" icon="spark" flex={1}>Suggest</Btn>
      </div>
    </motion.div>
  )

  const Week = (
    <div>
      <Heading action="Month">This week</Heading>
      <div style={{ display: 'flex', gap: 8 }}>
        {WEEK.map((w, i) => (
          <motion.button key={w.n} {...rise(i, 8)} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <span style={{ fontFamily: fS, fontSize: 12, color: w.today ? T.cocoa : T.g400, fontWeight: w.today ? 600 : 400 }}>{w.d}</span>
            <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: R.md, overflow: 'hidden', background: w.id ? undefined : T.white, boxShadow: w.today ? `0 0 0 2px ${T.cocoa}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.g200 }}>
              {w.id ? <Ph tone={tone(i, 2)} /> : <V4Icon n="plus" s={15} w={1.8} />}
            </div>
            <span style={{ fontFamily: fS, fontSize: 12.5, color: w.today ? T.cocoa : T.g400, fontWeight: w.today ? 600 : 400 }}>{w.n}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ background: T.paper, minHeight: '100svh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 22px 80px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Btn kind={!ds ? 'primary' : 'quiet'} onClick={() => setPalette(false)} style={{ height: 38, fontSize: 13 }}>Current colors</Btn>
          <Btn kind={ds ? 'primary' : 'quiet'} onClick={() => setPalette(true)} style={{ height: 38, fontSize: 13 }}>Design system colors</Btn>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          <Btn kind={logged ? 'primary' : 'quiet'} onClick={() => setLogged(true)} style={{ height: 38, fontSize: 13 }}>Outfit logged</Btn>
          <Btn kind={!logged ? 'primary' : 'quiet'} onClick={() => setLogged(false)} style={{ height: 38, fontSize: 13 }}>Nothing logged</Btn>
        </div>
        {isDesktop ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 6fr)', gap: 56 }}>
            <div style={{ display: 'grid', gap: 28, alignContent: 'start' }}>{Header}{Hero}</div>
            <div style={{ display: 'grid', gap: 40, alignContent: 'start', paddingTop: 6 }}>
              {Week}
              <div><Heading action="Calendar">Past outfits</Heading><Row items={PAST} w={150} /></div>
              <div><Heading action="Ideas">Saved for later</Heading><Row items={IDEAS} w={150} /></div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 36 }}>
            {Header}{Hero}{Week}
            <div><Heading action="Calendar">Past outfits</Heading><Row items={PAST} w={140} /></div>
            <div><Heading action="Ideas">Saved for later</Heading><Row items={IDEAS} w={140} /></div>
          </div>
        )}
      </div>
    </div>
  )
}
