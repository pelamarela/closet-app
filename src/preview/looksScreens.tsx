// Prototype screens: suggest, shop (check a piece), ideas, idea detail.
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { rise } from '../design/rise'
import { T, fS, V4Icon, Btn, Pill, Disp, Body, Ph, RoundBtn, Dots } from '../design/kit'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { IDEAS, ITEMS, LOOKS, OCCASIONS, SUGGESTIONS } from './data'
import { Title, Heading, TopBar, Row, PieceGrid, Collage, Field, Pic } from './ui'
import type { Nav } from './nav'

export function SuggestScreen({ nav }: { nav: Nav }) {
  const { isDesktop } = useBreakpoint()
  const [stage, setStage] = useState<'brief' | 'loading' | 'result'>('brief')
  const [occ, setOcc] = useState('work')
  const [look, setLook] = useState('smart')
  const [anchor, setAnchor] = useState<number | null>(null)
  const [k, setK] = useState(0)
  useEffect(() => {
    if (stage !== 'loading') return
    const t = setTimeout(() => setStage('result'), 1800)
    return () => clearTimeout(t)
  }, [stage])

  if (stage === 'result') {
    const s = SUGGESTIONS[k]
    return (
      <div style={{ paddingBottom: 90 }}>
        <TopBar onBack={() => setStage('brief')} right={<Dots n={SUGGESTIONS.length} i={k} />} />
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'minmax(0,5fr) minmax(0,6fr)' : '1fr', gap: isDesktop ? 48 : 18, alignItems: 'start' }}>
          <motion.div key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}><Collage ids={s.pieces} /></motion.div>
          <div>
            <Disp s={24}>{s.why}</Disp>
            <div style={{ marginTop: 18 }}><PieceGrid ids={s.pieces} min={72} /></div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <RoundBtn icon="back" onClick={() => setK(v => (v + SUGGESTIONS.length - 1) % SUGGESTIONS.length)} />
              <RoundBtn icon="next" onClick={() => setK(v => (v + 1) % SUGGESTIONS.length)} />
              <Btn kind="quiet" flex={1}>save</Btn>
            </div>
          </div>
        </div>
        <Bar><Btn full onClick={() => nav.log(s.pieces)}>log this</Btn></Bar>
      </div>
    )
  }
  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="suggest" onBack={nav.back} />
      <div style={{ display: 'grid', gap: 22, maxWidth: 640 }}>
        <Body s={14} c={T.g500}>cloudy, 11°</Body>
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{OCCASIONS.map(o => <Pill key={o} group="pv-s-occ" on={occ === o} onClick={() => setOcc(o)}>{o}</Pill>)}</div>
          <div style={{ marginTop: 10 }}><Field value={OCCASIONS.includes(occ) ? '' : occ} onChange={setOcc} placeholder="other" /></div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{LOOKS.map(l => <Pill key={l} group="pv-s-look" on={look === l} onClick={() => setLook(l)}>{l}</Pill>)}</div>
        <div>
          <Heading>start from</Heading>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: 3 }}>
            {ITEMS.slice(0, 14).map(it => (
              <button key={it.id} onClick={() => setAnchor(a => a === it.id ? null : it.id)} aria-pressed={anchor === it.id} style={{ flexShrink: 0, width: 56, height: 74, padding: 0, border: 'none', cursor: 'pointer', background: 'none', boxShadow: anchor === it.id ? `0 0 0 3px ${T.ink}` : 'none' }}><Pic id={it.id} /></button>
            ))}
          </div>
        </div>
      </div>
      <Bar><Btn full icon="spark" loading={stage === 'loading'} loadingLabels={['weather', 'closet', 'looks']} onClick={() => setStage('loading')}>suggest</Btn></Bar>
    </div>
  )
}

function Bar({ children }: { children: React.ReactNode }) {
  const { isDesktop } = useBreakpoint()
  return (
    <div style={{ position: 'fixed', left: isDesktop ? 236 : 0, right: 0, bottom: 0, zIndex: 20, background: T.paper, padding: '12px 22px calc(14px + env(safe-area-inset-bottom, 0px))' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>{children}</div>
    </div>
  )
}

export function ShopScreen({ nav }: { nav: Nav }) {
  const { isDesktop } = useBreakpoint()
  const [stage, setStage] = useState<'upload' | 'loading' | 'verdict'>('upload')
  const [link, setLink] = useState('')
  useEffect(() => {
    if (stage !== 'loading') return
    const t = setTimeout(() => setStage('verdict'), 1800)
    return () => clearTimeout(t)
  }, [stage])

  if (stage === 'verdict') {
    return (
      <div style={{ paddingBottom: 90 }}>
        <TopBar onBack={() => setStage('upload')} />
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'minmax(0,4fr) minmax(0,6fr)' : '1fr', gap: isDesktop ? 48 : 20, alignItems: 'start' }}>
          <div style={{ aspectRatio: '3/4' }}><Ph tone="paper" /></div>
          <div>
            <Disp s={56}>82%</Disp>
            <div style={{ marginTop: 18 }}>
              <Row title="fits your palette" icon="check" />
              <Row title="goes with 9 pieces" icon="check" />
              <Row title="you own a similar one" icon="close" last />
            </div>
            <div style={{ marginTop: 26 }}><Heading>you own</Heading><PieceGrid ids={[3, 8, 13]} min={72} /></div>
            <div style={{ marginTop: 26 }}><Heading>pairs with</Heading><PieceGrid ids={[1, 4, 6, 9]} min={72} /></div>
          </div>
        </div>
        <Bar><div style={{ display: 'flex', gap: 10 }}><Btn kind="quiet" onClick={nav.back}>skip</Btn><Btn flex={1} kind="peach" onClick={() => nav.go('add')}>add</Btn></div></Bar>
      </div>
    )
  }
  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="check" onBack={nav.back} />
      <div style={{ display: 'grid', gap: 14, maxWidth: 640 }}>
        <button style={{ minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: T.white, border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 16, color: T.ink }}><V4Icon n="cam" s={32} w={1.4} />photo</button>
        <Field value={link} onChange={setLink} placeholder="link" />
      </div>
      <Bar><Btn full icon="bag" loading={stage === 'loading'} loadingLabels={['reading', 'comparing']} onClick={() => setStage('loading')}>check</Btn></Bar>
    </div>
  )
}

export function IdeasScreen({ nav }: { nav: Nav }) {
  return (
    <div>
      <Title right={<Btn kind="peach" icon="spark" onClick={() => nav.go('suggest')} style={{ height: 40, fontSize: 13 }}>suggest</Btn>}>ideas</Title>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {IDEAS.map((idea, i) => (
          <motion.button key={idea.id} {...rise(i)} whileTap={{ scale: 0.98 }} onClick={() => nav.go('idea', idea.id)} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}><Collage ids={idea.pieces} /></motion.button>
        ))}
      </div>
    </div>
  )
}

export function IdeaScreen({ id, nav }: { id: number; nav: Nav }) {
  const { isDesktop } = useBreakpoint()
  const idea = IDEAS[id]
  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar onBack={nav.back} right={<RoundBtn icon="trash" style={{ width: 44, height: 44 }} onClick={nav.back} />} />
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'minmax(0,5fr) minmax(0,6fr)' : '1fr', gap: isDesktop ? 48 : 18, alignItems: 'start' }}>
        <Collage ids={idea.pieces} />
        <div>
          {idea.occasion && <Disp s={28}>{idea.occasion}</Disp>}
          <div style={{ marginTop: 18 }}><PieceGrid ids={idea.pieces} min={72} /></div>
        </div>
      </div>
      <Bar><Btn full onClick={() => nav.log(idea.pieces)}>log this</Btn></Bar>
    </div>
  )
}
