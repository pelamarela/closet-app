// Prototype screens: closet, item detail, add flow.
import { useState } from 'react'
import { motion } from 'motion/react'
import { rise } from '../design/rise'
import { T, fS, V4Icon, Btn, Pill, Disp, Ph, ItemTile, RoundBtn, Switch, Dots } from '../design/kit'
import { catLabel } from '../lib/categoryLabel'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { usePhotos } from './usePhotos'
import { CATS, COLORS, ITEMS, tone, PHOTOS } from './data'
import { Title, Heading, TopBar, Row, PieceGrid, Field, Pic } from './ui'
import type { Nav } from './nav'

export function ClosetScreen({ nav }: { nav: Nav }) {
  usePhotos()
  const [cat, setCat] = useState('all')
  const items = ITEMS.filter(i => cat === 'all' || i.cat === cat)
  return (
    <div>
      <Title right={<><Btn kind="quiet" icon="bag" onClick={() => nav.go('shop')} style={{ height: 40, fontSize: 13 }}>check</Btn><RoundBtn icon="plus" tone="peach" onClick={() => nav.go('add')} style={{ width: 40, height: 40 }} /></>}>closet</Title>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {CATS.map(c => <Pill key={c} group="pv-closet" s="sm" on={cat === c} onClick={() => setCat(c)}>{catLabel(c)}</Pill>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 6, marginTop: 18 }}>
        {items.map((it, i) => (
          <motion.div key={it.id} layout {...rise(i)}>
            <ItemTile src={PHOTOS[it.id]?.src} tone={tone(it.id, 3)} worn={it.worn || undefined} onClick={() => nav.go('item', it.id)} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function ItemScreen({ id, nav }: { id: number; nav: Nav }) {
  const { isDesktop } = useBreakpoint()
  const it = ITEMS[id]
  const withIds = [(id + 3) % 20, (id + 7) % 20, (id + 11) % 20, (id + 13) % 20]
  return (
    <div>
      <TopBar onBack={nav.back} right={<RoundBtn icon="pen" style={{ width: 44, height: 44 }} onClick={() => nav.go('add')} />} />
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'minmax(0,5fr) minmax(0,6fr)' : '1fr', gap: isDesktop ? 48 : 22, alignItems: 'start' }}>
        <div style={{ aspectRatio: isDesktop ? '1/1' : '4/3' }}><Pic id={id} /></div>
        <div>
          <Disp s={isDesktop ? 36 : 28}>{it.name}</Disp>
          <div style={{ marginTop: 18 }}>
            <Row title="type" value={catLabel(it.cat)} />
            <Row title="color" value={it.color} />
            <Row title="brand" value={it.brand} />
            <Row title="worn" value={`${it.worn}×`} />
            <Row title="last" value="2 weeks ago" last />
          </div>
          <div style={{ marginTop: 28 }}>
            <Heading action="all" onAction={() => nav.tab('today')}>worn with</Heading>
            <PieceGrid ids={withIds} min={72} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <Btn kind="quiet" flex={1} onClick={nav.back}>archive</Btn>
            <Btn kind="peach" flex={1} onClick={() => nav.log([id])}>log with</Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

const DRAFTS = [{ cat: 'top', name: 'striped tee', color: 'navy', brand: 'cos' }, { cat: 'bottom', name: 'wide jeans', color: 'blush', brand: 'levi\'s' }, { cat: 'shoes', name: 'loafers', color: 'black', brand: 'arket' }]

/** One add flow for single and batch: photos first, details filled in, review one by one. */
export function AddScreen({ nav }: { nav: Nav }) {
  const { isDesktop } = useBreakpoint()
  const [drafts, setDrafts] = useState<typeof DRAFTS | null>(null)
  const [i, setI] = useState(0)
  const [sport, setSport] = useState(false)
  const patch = (p: Partial<(typeof DRAFTS)[number]>) => setDrafts(d => d && d.map((x, k) => k === i ? { ...x, ...p } : x))
  if (!drafts) {
    return (
      <div>
        <TopBar title="add" onBack={nav.back} />
        <button onClick={() => setDrafts(DRAFTS)} style={{ width: '100%', minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: T.white, border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 16, color: T.ink }}>
          <V4Icon n="cam" s={34} w={1.4} />photos
        </button>
      </div>
    )
  }
  const d = drafts[i]
  const last = i === drafts.length - 1
  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar onBack={() => i === 0 ? setDrafts(null) : setI(i - 1)} right={<Dots n={drafts.length} i={i} />} />
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'minmax(0,4fr) minmax(0,6fr)' : '1fr', gap: isDesktop ? 40 : 18, alignItems: 'start', maxWidth: 900 }}>
        <div style={{ aspectRatio: isDesktop ? '3/4' : '4/3' }}><Ph tone={tone(i + 2, 1)} /></div>
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{CATS.slice(1).map(c => <Pill key={c} group="pv-add-cat" on={d.cat === c} onClick={() => patch({ cat: c })}>{catLabel(c)}</Pill>)}</div>
          <Field value={d.name} onChange={v => patch({ name: v })} placeholder="name" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{COLORS.map(c => <Pill key={c} group="pv-add-color" on={d.color === c} onClick={() => patch({ color: c })}>{c}</Pill>)}</div>
          <Field value={d.brand} onChange={v => patch({ brand: v })} placeholder="brand" />
          <button onClick={() => setSport(s => !s)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 14px', background: T.white, border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 15, color: T.ink }}>sport<Switch on={sport} /></button>
        </div>
      </div>
      <div style={{ position: 'fixed', left: isDesktop ? 236 : 0, right: 0, bottom: 0, zIndex: 20, background: T.paper, padding: '12px 22px calc(14px + env(safe-area-inset-bottom, 0px))' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Btn full onClick={() => last ? nav.tab('closet') : setI(i + 1)}>{last ? 'save all' : 'next'}</Btn>
        </div>
      </div>
    </div>
  )
}
