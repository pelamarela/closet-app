// Outfit collage. Same piece rules as before (which categories are garments, the worn order, what counts
// as small) but a new arrangement: every photo keeps its own shape, nothing is cropped, the columns are
// sized so they all end at the same line, and small things (accessories and the like) sit in their own
// narrow, readable column instead of floating. See design-materials / the /outfits-test dev page.

import { useEffect, useMemo, useState } from 'react'
import { SafeImg } from './SafeImg'
import { T } from './kit'
import { R } from './radii'

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

const G = 3
const REF = 340

type Tile = { item: CollageItem; ar: number; more?: number }
type Node = Tile | Tile[] // one tile, or a row of tiles sharing a height

// natural shape of each photo, measured once and remembered
const arCache = new Map<string, number>()
function useAspects(urls: (string | null)[]): number[] {
  const [, bump] = useState(0)
  const key = urls.join('|')
  useEffect(() => {
    let alive = true
    urls.forEach(u => {
      if (!u || arCache.has(u)) return
      const img = new Image()
      img.onload = () => { arCache.set(u, img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1); if (alive) bump(n => n + 1) }
      img.src = u
    })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return urls.map(u => (u ? arCache.get(u) ?? 1 : 1))
}

const isRow = (n: Node): n is Tile[] => Array.isArray(n)
const tall = (n: Node) => isRow(n) ? 1 / n.reduce((s, t) => s + t.ar, 0) : 1 / n.ar
const colTall = (c: Node[]) => c.reduce((s, n) => s + tall(n), 0)

// a column's height is a * width + b (b collects the gaps), so widths can be solved to end exactly level
function dims(c: Node[]) {
  let a = 0, b = (c.length - 1) * G
  for (const n of c) {
    if (isRow(n)) { const sa = n.reduce((t, x) => t + x.ar, 0); a += 1 / sa; b -= ((n.length - 1) * G) / sa } else a += 1 / n.ar
  }
  return { a, b }
}

function tiers(tiles: Tile[], maxSmall: number) {
  const sorted = [...tiles].sort((x, y) => byMainOrder(x.item, y.item))
  const outer = sorted.filter(t => t.item.category === 'outerwear')
  const inner = sorted.filter(t => GARMENT_CAT.has(t.item.category) && t.item.category !== 'outerwear')
  const garments = [...outer, ...inner] // outerwear first
  const shoes = sorted.filter(t => t.item.category === 'shoes')
  let small = sorted.filter(t => !GARMENT_CAT.has(t.item.category) && t.item.category !== 'shoes')
  if (small.length > maxSmall) {
    const rest = small.length - (maxSmall - 1)
    small = [...small.slice(0, maxSmall - 1), { item: small[maxSmall - 1].item, ar: 1, more: rest }]
  }
  return { garments, shoes, small }
}

function build(t: ReturnType<typeof tiers>, gcols: number, scols: number): Node[][] {
  const cols: Node[][] = Array.from({ length: gcols }, () => [])
  const lighter = () => cols.reduce((m, c) => (colTall(c) < colTall(m) ? c : m), cols[0])
  t.garments.forEach(g => lighter().push(g))
  t.shoes.forEach(s => lighter().push(s))
  const side: Node[] = []
  if (t.small.length >= 4) {
    // rows as even as possible, so a lone leftover tile never ends up huge
    const n = t.small.length
    const rows = Math.max(1, n % scols === 1 ? Math.floor(n / scols) : Math.ceil(n / scols))
    let at = 0
    for (let r = 0; r < rows; r++) {
      const size = Math.ceil((n - at) / (rows - r))
      const chunk = t.small.slice(at, at + size)
      at += size
      side.push(chunk.length === 1 ? chunk[0] : chunk)
    }
  } else if (t.small.length > 0) lighter().push(t.small)
  return [...cols, side].filter(c => c.length > 0)
}

function measure(cols: Node[][]) {
  const d = cols.map(dims)
  const D = d.reduce((s, x) => s + 1 / x.a, 0)
  const C = d.reduce((s, x) => s + x.b / x.a, 0)
  const H = (REF - (cols.length - 1) * G + C) / D
  return { H, w: d.map(x => (H - x.b) / x.a) }
}

// tries a few column counts and keeps the one where small things stay readable and garments stay big
function choose(t: ReturnType<typeof tiers>): Node[][] {
  const nGarm = t.garments.length + t.shoes.length
  const hasSide = t.small.length >= 4
  const options: { cols: Node[][]; ok: boolean; score: number }[] = []
  for (let g = 1; g <= Math.min(3, Math.max(nGarm, 1)); g++) {
    for (let sc = 1; sc <= (hasSide ? 3 : 1); sc++) {
      const cols = build(t, g, sc)
      const m = measure(cols)
      const sideTile = hasSide ? m.w[m.w.length - 1] / sc / REF : 1
      const garmMin = Math.min(...m.w.slice(0, hasSide ? -1 : undefined)) / REF
      const ratio = m.H / REF
      const ok = sideTile >= 0.17 && garmMin >= 0.17 && ratio <= 2
      options.push({ cols, ok, score: ok ? Math.abs(ratio - 1.1) : 10 - sideTile })
    }
  }
  const good = options.filter(o => o.ok)
  return (good.length ? good : options).sort((a, b) => a.score - b.score)[0].cols
}

function Cell({ tile, square }: { tile: Tile; square: boolean }) {
  const { item, more } = tile
  const ar = square ? 1 : tile.ar
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: String(ar), overflow: 'hidden', borderRadius: R.sm, background: T.line }}>
      {item.signedImageUrl && !more && (
        <SafeImg src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: posFor(item.category), display: 'block' }} />
      )}
      {more != null && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Manrope", system-ui, sans-serif', fontSize: 14, color: T.ink }}>+{more}</div>
      )}
    </div>
  )
}

/**
 * `thumb`: just the first garment, for tiny boxes the caller sizes itself.
 * `square`: force every tile to 1:1 (photos are cropped) instead of keeping their own shape.
 * `maxSmall`: most small tiles to show; extra ones become a "+n" tile (use 4 on small cards).
 * `height`: render at exactly this many px tall; the width follows from the layout, so a row of collages lines up top and bottom.
 */
export default function Collage({ items, thumb = false, square = false, maxSmall = 6, height }: {
  items: CollageItem[]; thumb?: boolean; square?: boolean; maxSmall?: number; height?: number
}) {
  const ars = useAspects(items.map(i => i.signedImageUrl))
  const tiles = useMemo<Tile[]>(() => items.map((item, i) => ({ item, ar: square ? 1 : Math.min(Math.max(ars[i], 0.5), 2) })), [items, ars, square])

  if (thumb) {
    const first = [...items].sort(byMainOrder).find(i => GARMENT_CAT.has(i.category)) ?? items[0]
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: T.line }}>
        {first?.signedImageUrl && <SafeImg src={first.signedImageUrl} alt={first.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: posFor(first.category), display: 'block' }} />}
      </div>
    )
  }
  if (tiles.length === 0) return <div style={{ width: '100%', aspectRatio: '4/5', background: T.line }} />

  const cols = choose(tiers(tiles, maxSmall))
  const d = cols.map(dims)
  const D = d.reduce((s, x) => s + 1 / x.a, 0)
  const C = d.reduce((s, x) => s + x.b / x.a, 0)
  const H = `((100cqw - ${(cols.length - 1) * G}px + ${C}px) / ${D})`
  // for a fixed height, the width that makes every column end exactly there
  const fixedW = height != null ? Math.round(height * D + (cols.length - 1) * G - C) : null
  return (
    <div style={{ containerType: 'inline-size', ...(fixedW != null ? { width: fixedW, flexShrink: 0 } : { width: '100%', minWidth: 0, maxWidth: '100%' }) }}>
      <div style={{ display: 'flex', gap: G, alignItems: 'flex-start' }}>
        {cols.map((c, ci) => (
          <div key={ci} style={{ flex: 'none', width: `calc((${H} - ${d[ci].b}px) / ${d[ci].a})`, display: 'flex', flexDirection: 'column', gap: G }}>
            {c.map((n, ni) => isRow(n)
              ? <div key={ni} style={{ display: 'flex', gap: G }}>{n.map((x, k) => <div key={k} style={{ flex: `${square ? 1 : x.ar} 1 0`, minWidth: 0 }}><Cell tile={x} square={square} /></div>)}</div>
              : <Cell key={ni} tile={n} square={square} />)}
          </div>
        ))}
      </div>
    </div>
  )
}
