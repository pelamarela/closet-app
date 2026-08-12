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

// Visual importance, not data identity: main pieces (the outfit's silhouette)
// get the big tiles; secondary pieces (shoes/accessories) get a sidebar;
// tertiary pieces (fragrance — and anything else added later) get shown even
// smaller within that same sidebar, never claiming a main tile.
const MAIN_CAT = new Set(['top', 'bottom', 'one-piece', 'outerwear'])
const SECONDARY_CAT = new Set(['shoes', 'accessory'])
const tierOf = (category: string): 0 | 1 | 2 =>
  MAIN_CAT.has(category) ? 0 : SECONDARY_CAT.has(category) ? 1 : 2

const G = 3

function Cell({ item, pos = 'center', style }: { item: CollageItem; pos?: string; style?: React.CSSProperties }) {
  return (
    <div key={item.id} style={{ overflow: 'hidden', background: '#ECEAE6', ...style }}>
      {item.signedImageUrl
        ? <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block' }} />
        : <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 10px, #DCD9D3 10px 20px)' }} />
      }
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
      <Cell item={items[0]} pos={m > 0 ? 'top center' : 'center'} style={{ height: '100%' }} />
    )

    // No main pieces to anchor a sidebar around, or few enough tiles overall —
    // fall back to a flat, evenly-weighted grid.
    if (m === 0 || (s === 0 && t === 0) || total === 2) {
      const all = [...main, ...secondary, ...tertiary]
      const pos = m > 0 ? 'top center' : 'center'
      const cols = 2, rows = Math.ceil(all.length / cols)
      return (
        <div style={{ display: 'grid', height: '100%', gap: G, gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {all.map((item, i) => (
            <Cell key={item.id} item={item} pos={pos} style={{
              minHeight: 0,
              ...(all.length % 2 !== 0 && i === all.length - 1 ? { gridColumn: '1 / -1' } : {}),
            }} />
          ))}
        </div>
      )
    }

    // Tertiary pieces count for less than secondary ones when sizing the sidebar —
    // a single fragrance bottle shouldn't force as much width as a pair of shoes would.
    const sidebarWeight = s + t * 0.5
    let leftPct: number
    if (m === 1) leftPct = sidebarWeight >= 5 ? 75 : 60
    else if (m === 2) leftPct = sidebarWeight <= 1 ? 65 : sidebarWeight === 2 ? 50 : 60
    else leftPct = sidebarWeight <= 1 ? 68 : 63

    return (
      <div style={{ display: 'flex', height: '100%', gap: G }}>
        <div style={{ flex: `0 0 ${leftPct}%`, display: 'flex', flexDirection: 'column', gap: G }}>
          {main.map(item => <Cell key={item.id} item={item} pos="top center" style={{ flex: 1, minHeight: 0 }} />)}
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
