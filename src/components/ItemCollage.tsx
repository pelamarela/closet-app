import React from 'react'
import { RULE } from './ui'

export type CollageItem = {
  id: string
  name: string
  category: string
  signedImageUrl: string | null
}

type Props = {
  items: CollageItem[]
  aspectRatio?: string
  fill?: boolean
}

// Visual importance, not data identity: main pieces (the outfit's actual
// silhouette — including shoes, which are as defining as a top or bottom)
// get the big tiles; secondary pieces (accessories) get a sidebar; tertiary
// pieces (fragrance — and anything else added later) get shown even smaller
// within that same sidebar, never claiming a main tile.
const MAIN_CAT = new Set(['top', 'bottom', 'one-piece', 'outerwear', 'shoes'])
const SECONDARY_CAT = new Set(['accessory'])
const tierOf = (category: string): 0 | 1 | 2 =>
  MAIN_CAT.has(category) ? 0 : SECONDARY_CAT.has(category) ? 1 : 2

// Garment photos are usually shot on a person/hanger, so anchoring the crop
// to the top keeps the garment itself in frame. Shoes/accessories/fragrance
// are usually flat product shots, so a centered crop reads better.
const GARMENT_CAT = new Set(['top', 'bottom', 'one-piece', 'outerwear'])
const posFor = (category: string) => GARMENT_CAT.has(category) ? 'top center' : 'center'

const G = 3

function Cell({ item, pos, style }: { item: CollageItem; pos?: string; style?: React.CSSProperties }) {
  return (
    <div key={item.id} style={{ overflow: 'hidden', background: '#ECEAE6', ...style }}>
      {item.signedImageUrl
        ? <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos ?? posFor(item.category), display: 'block' }} />
        : <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 10px, #DCD9D3 10px 20px)' }} />
      }
    </div>
  )
}

function Grid({ items: cellItems }: { items: CollageItem[] }) {
  const cols = 2, rows = Math.ceil(cellItems.length / cols)
  return (
    <div style={{ display: 'grid', height: '100%', gap: G, gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
      {cellItems.map((item, i) => (
        <Cell key={item.id} item={item} style={{
          minHeight: 0,
          ...(cellItems.length % 2 !== 0 && i === cellItems.length - 1 ? { gridColumn: '1 / -1' } : {}),
        }} />
      ))}
    </div>
  )
}

export default function ItemCollage({ items, aspectRatio = '5/4', fill = false }: Props) {
  const main = items.filter(i => tierOf(i.category) === 0)
  const secondary = items.filter(i => tierOf(i.category) === 1)
  const tertiary = items.filter(i => tierOf(i.category) === 2)
  const m = main.length, s = secondary.length, t = tertiary.length
  const total = m + s + t

  const renderInner = () => {
    if (total === 0) return (
      <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 14px, #DCD9D3 14px 28px)' }} />
    )

    if (total === 1) return (
      <Cell item={items[0]} style={{ height: '100%' }} />
    )

    // No main pieces to anchor a sidebar around, or few enough tiles overall —
    // fall back to a flat, evenly-weighted grid.
    if (m === 0 || (s === 0 && t === 0) || total === 2) {
      return <Grid items={[...main, ...secondary, ...tertiary]} />
    }

    // Tertiary pieces count for less than secondary ones when sizing the sidebar —
    // a single fragrance bottle shouldn't force as much width as an accessory would.
    const sidebarWeight = s + t * 0.5
    let leftPct: number
    if (m === 1) leftPct = sidebarWeight >= 5 ? 75 : 60
    else if (m === 2) leftPct = sidebarWeight <= 1 ? 65 : sidebarWeight === 2 ? 50 : 60
    else leftPct = sidebarWeight <= 1 ? 72 : sidebarWeight <= 3 ? 66 : 60

    return (
      <div style={{ display: 'flex', height: '100%', gap: G }}>
        <div style={{ flex: `0 0 ${leftPct}%` }}>
          {m <= 2 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: G, height: '100%' }}>
              {main.map(item => <Cell key={item.id} item={item} style={{ flex: 1, minHeight: 0 }} />)}
            </div>
          ) : <Grid items={main} />}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: G }}>
          {secondary.map(item => <Cell key={item.id} item={item} style={{ flex: 1, minHeight: 0 }} />)}
          {tertiary.map(item => <Cell key={item.id} item={item} style={{ flex: 0.55, minHeight: 0 }} />)}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      border: RULE, borderRadius: 3, overflow: 'hidden',
      ...(fill ? { position: 'absolute', inset: 0 } : { width: '100%', aspectRatio }),
    }}>
      {renderInner()}
    </div>
  )
}
