// v3-styled outfit collage — same real-photo tiering logic as
// components/ItemCollage.tsx (mains get the big block, secondary/tertiary
// stack in a sidebar, falls back to an even grid), restyled to v3 tokens
// (sharp corners, hairline border) instead of the old rounded/RULE look.
// This is what design-materials/v3 calls OutfitThumb/LookCollage, built
// against real item photos instead of placeholder tone blocks.

import { T } from './kit'

export type CollageItem = {
  id: string
  name: string
  category: string
  signedImageUrl: string | null
}

const GARMENT_CAT = new Set(['top', 'bottom', 'one-piece', 'outerwear'])
const posFor = (category: string) => GARMENT_CAT.has(category) ? 'top center' : 'center'
const MAIN_ORDER: Record<string, number> = { 'one-piece': 0, top: 0, bottom: 1, outerwear: 2, shoes: 3 }
const byMainOrder = (a: CollageItem, b: CollageItem) => (MAIN_ORDER[a.category] ?? 1) - (MAIN_ORDER[b.category] ?? 1)

const G = 2

function Cell({ item, style }: { item: CollageItem; style?: React.CSSProperties }) {
  return (
    <div key={item.id} style={{ overflow: 'hidden', background: T.g200, ...style }}>
      {item.signedImageUrl
        ? <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: posFor(item.category), display: 'block' }} />
        : <div style={{ width: '100%', height: '100%', backgroundImage: `repeating-linear-gradient(122deg, ${T.g200} 0 18px, #DFDAD3 18px 36px)` }} />}
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

export default function Collage({ items, aspectRatio = '1/1', fill = false, border = true }: {
  items: CollageItem[]; aspectRatio?: string; fill?: boolean; border?: boolean
}) {
  const garments = items.filter(i => GARMENT_CAT.has(i.category))
  const shoes = items.filter(i => i.category === 'shoes')
  const accessories = items.filter(i => i.category === 'accessory')
  const other = items.filter(i => !GARMENT_CAT.has(i.category) && i.category !== 'shoes' && i.category !== 'accessory')

  const shoesInMain = accessories.length > 0 || garments.length === 0
  const main = (shoesInMain ? [...garments, ...shoes] : garments).sort(byMainOrder)
  const secondary = shoesInMain ? accessories : shoes
  const tertiary = other
  const m = main.length, s = secondary.length, t = tertiary.length
  const total = m + s + t

  const renderInner = () => {
    if (total === 0) return <div style={{ width: '100%', height: '100%', backgroundImage: `repeating-linear-gradient(122deg, ${T.g200} 0 18px, #DFDAD3 18px 36px)` }} />
    if (total === 1) return <Cell item={items[0]} style={{ height: '100%' }} />
    if (m === 0 || (s === 0 && t === 0) || total === 2) return <Grid items={[...main, ...secondary, ...tertiary]} />

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
      overflow: 'hidden',
      boxShadow: border ? `inset 0 0 0 1px ${T.line}` : 'none',
      ...(fill ? { position: 'absolute', inset: 0 } : { width: '100%', aspectRatio }),
    }}>
      {renderInner()}
    </div>
  )
}
