// Flat, shared pieces for the dev-only prototype screens.
import { motion } from 'motion/react'
import { T, fS, V4Icon, Disp, Ph } from '../design/kit'
import type { IconName } from '../design/kit'
import { R } from '../design/radii'
import { ITEMS, PHOTOS, sortWorn, tierOf, tone } from './data'
import PhotoLook from './PhotoLook'
import { usePhotos } from './usePhotos'

export function Title({ children, right }: { children: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
      <Disp s={32}>{children}</Disp>
      <div style={{ display: 'flex', gap: 8 }}>{right}</div>
    </div>
  )
}

export function Heading({ children, action, onAction }: { children: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
      <Disp s={20}>{children}</Disp>
      {action && <button onClick={onAction} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: fS, fontSize: 13.5, color: T.cocoa }}>{action}</button>}
    </div>
  )
}

/** Back arrow and title for every screen that sits on top of a tab. */
export function TopBar({ title, onBack, right }: { title?: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 48, marginBottom: 12 }}>
      <button onClick={onBack} aria-label="back" style={{ width: 44, height: 44, marginLeft: -10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: T.ink }}><V4Icon n="back" s={22} w={1.8} /></button>
      {title && <Disp s={24}>{title}</Disp>}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>{right}</div>
    </div>
  )
}

/** 2 to 4 options in one flat row, replaces dropdowns. */
export function Segmented({ options, value, onChange, group }: { options: string[]; value: string; onChange: (v: string) => void; group: string }) {
  return (
    <div style={{ display: 'flex', background: T.white, padding: 3, gap: 3 }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} aria-pressed={o === value} style={{ position: 'relative', flex: 1, height: 40, border: 'none', cursor: 'pointer', background: 'none', fontFamily: fS, fontSize: 14, color: T.ink, fontWeight: o === value ? 600 : 400 }}>
          {o === value && <motion.span layoutId={`seg-${group}`} transition={{ type: 'spring', stiffness: 520, damping: 40 }} style={{ position: 'absolute', inset: 0, background: T.peach, borderRadius: R.sm }} />}
          <span style={{ position: 'relative' }}>{o}</span>
        </button>
      ))}
    </div>
  )
}

export function Field({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', height: 52, padding: '0 14px', border: 'none', background: T.white, fontFamily: fS, fontSize: 15, color: T.ink, outline: 'none' }} />
}

/** One list row: leading icon or photo, one title, one value. Space separates rows, no lines. */
export function Row({ title, value, icon, photo, onClick, last }: { title: string; value?: string; icon?: IconName; photo?: number; onClick?: () => void; last?: boolean }) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', background: T.white, border: 'none', padding: photo != null ? 8 : '0 16px', minHeight: 56, cursor: onClick ? 'pointer' : 'default', marginBottom: last ? 0 : 8, fontFamily: fS, color: T.ink }}>
      {photo != null && <div style={{ width: 40, height: 52, flexShrink: 0 }}><Pic id={photo} /></div>}
      {icon && <V4Icon n={icon} s={21} w={1.6} />}
      <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{title}</span>
      {value && <span style={{ fontSize: 14, color: T.g500 }}>{value}</span>}
      {onClick && <V4Icon n="next" s={16} w={1.8} c={T.g400} />}
    </button>
  )
}

/** Small grid of piece tiles, no names. */
export function PieceGrid({ ids, min = 84, onPick }: { ids: number[]; min?: number; onPick?: (id: number) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 6 }}>
      {ids.map(id => (
        <button key={id} onClick={() => onPick?.(id)} style={{ padding: 0, border: 'none', background: 'none', cursor: onPick ? 'pointer' : 'default', aspectRatio: '3/4' }}><Pic id={id} /></button>
      ))}
    </div>
  )
}

/**
 * An outfit as three tiers, always in worn order:
 * 1. main garments (top, bottom, outerwear or one-piece) as big tiles side by side,
 * 2. shoes, medium,
 * 3. small things (accessories, fragrance, up to 6) as a separate strip of little tiles under the look.
 */
function PlaceholderCollage({ ids, ratio = '4/5' }: { ids: number[]; ratio?: string }) {
  const sorted = sortWorn(ids)
  const main = sorted.filter(id => tierOf(ITEMS[id].cat) === 'main')
  const shoes = sorted.filter(id => tierOf(ITEMS[id].cat) === 'shoes')
  const small = sorted.filter(id => tierOf(ITEMS[id].cat) === 'small').slice(0, 6)
  const rows = [main.length ? 'minmax(0, 3fr)' : null, shoes.length ? 'minmax(0, 1.1fr)' : null].filter(Boolean).join(' ')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: small.length ? 8 : 0 }}>
      <div style={{ display: 'grid', gridTemplateRows: rows || 'minmax(0, 1fr)', gap: 3, aspectRatio: ratio, overflow: 'hidden', borderRadius: R.sm }}>
        {main.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: `repeat(${main.length}, minmax(0, 1fr))`, gap: 3, minHeight: 0 }}>{main.map(id => <div key={id} style={{ minHeight: 0 }}><Ph tone={tone(id, 3)} /></div>)}</div>}
        {shoes.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: `repeat(${shoes.length}, minmax(0, 1fr))`, gap: 3, minHeight: 0 }}>{shoes.map(id => <div key={id} style={{ minHeight: 0 }}><Ph tone={tone(id, 3)} /></div>)}</div>}
      </div>
      {small.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 3, background: T.white, padding: 6 }}>
          {small.map(id => <div key={id} style={{ aspectRatio: '1/1' }}><Ph tone={tone(id, 3)} /></div>)}
        </div>
      )}
    </div>
  )
}

/** An item photo that fills its box (placeholder until the local photos load). */
export function Pic({ id }: { id: number }) {
  usePhotos()
  const p = PHOTOS[id]
  if (!p) return <Ph tone={tone(id, 3)} />
  return <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
}

/** An outfit as one collage: aspect-true tiles in balanced columns, small things in a narrow column. */
export function Collage({ ids, ratio = '4/5' }: { ids: number[]; ratio?: string }) {
  const ready = usePhotos()
  if (ready && ids.every(id => PHOTOS[id])) {
    return <PhotoLook items={ids.map(id => ({ cat: ITEMS[id].cat, src: PHOTOS[id].src, ar: PHOTOS[id].ar }))} />
  }
  return <PlaceholderCollage ids={ids} ratio={ratio} />
}
