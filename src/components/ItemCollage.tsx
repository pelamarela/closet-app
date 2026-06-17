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
}

const SMALL_CAT = new Set(['shoes', 'accessory'])
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

export default function ItemCollage({ items, aspectRatio = '5/4' }: Props) {
  const main = items.filter(i => !SMALL_CAT.has(i.category))
  const small = items.filter(i => SMALL_CAT.has(i.category))
  const m = main.length, s = small.length, total = m + s

  const renderInner = () => {
    if (total === 0) return (
      <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 14px, #DCD9D3 14px 28px)' }} />
    )

    if (total === 1) return (
      <Cell item={items[0]} pos={m > 0 ? 'top center' : 'center'} style={{ height: '100%' }} />
    )

    if (m === 0 || s === 0 || total === 2) {
      const all = [...main, ...small]
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

    let leftPct: number
    if (m === 1) leftPct = s >= 5 ? 75 : 60
    else if (m === 2) leftPct = s <= 1 ? 65 : s === 2 ? 50 : 60
    else leftPct = s <= 1 ? 68 : 63

    return (
      <div style={{ display: 'flex', height: '100%', gap: G }}>
        <div style={{ flex: `0 0 ${leftPct}%`, display: 'flex', flexDirection: 'column', gap: G }}>
          {main.map(item => <Cell key={item.id} item={item} pos="top center" style={{ flex: 1, minHeight: 0 }} />)}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: G, gridTemplateColumns: '1fr', gridTemplateRows: `repeat(${s}, 1fr)` }}>
          {small.map(item => <Cell key={item.id} item={item} style={{ minHeight: 0 }} />)}
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', aspectRatio, border: RULE, borderRadius: 3, overflow: 'hidden' }}>
      {renderInner()}
    </div>
  )
}
