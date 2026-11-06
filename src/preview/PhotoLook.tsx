// Dev-only: outfit collage for real photos, never cropped. Every tile keeps its own aspect ratio and
// the columns are sized so they all end at the same height, so nothing floats and nothing is cut off.
// Hierarchy comes out of the structure: garments sit in wide columns, small things in a narrow one.
import { R } from '../design/radii'
import { WORN_ORDER, tierOf } from './data'

export type LookItem = { cat: string; src: string; name?: string; ar: number }
export type LookVariant = 'a' | 'b' | 'c'

const G = 3
type Node = LookItem | LookItem[] // a single tile, or a row of tiles sharing one height

const isRow = (n: Node): n is LookItem[] => Array.isArray(n)
// how tall a node is, relative to the width of its column
const tall = (n: Node) => isRow(n) ? 1 / n.reduce((s, i) => s + i.ar, 0) : 1 / n.ar
const colTall = (c: Node[]) => c.reduce((s, n) => s + tall(n), 0)
const order = (a: LookItem, b: LookItem) => (WORN_ORDER[a.cat] ?? 9) - (WORN_ORDER[b.cat] ?? 9)

function Img({ item }: { item: LookItem }) {
  return <img src={item.src} alt="" style={{ display: 'block', width: '100%', aspectRatio: String(item.ar), objectFit: 'cover', borderRadius: R.sm }} />
}

function build(variant: LookVariant, items: LookItem[], gcols: number, scols: number): Node[][] {
  const sorted = [...items].sort(order)
  const outer = sorted.filter(i => i.cat === 'outerwear')
  const inner = sorted.filter(i => tierOf(i.cat) === 'main' && i.cat !== 'outerwear')
  const garm = [...outer, ...inner] // outerwear first
  const shoes = sorted.filter(i => tierOf(i.cat) === 'shoes')
  const small = sorted.filter(i => tierOf(i.cat) === 'small').slice(0, 6)

  const cols: Node[][] = Array.from({ length: gcols }, () => [])
  const lighter = () => cols.reduce((m, c) => (colTall(c) < colTall(m) ? c : m), cols[0])

  if (variant === 'c') {
    const hero = garm[0]
    if (hero) cols[0].push(hero)
    garm.slice(1).forEach(g => (cols[1] ?? cols[0]).push(g))
    shoes.forEach(s => lighter().push(s))
  } else {
    garm.forEach(g => lighter().push(g))
    if (variant === 'a') shoes.forEach(s => lighter().push(s))
  }

  // small things: several get their own column, laid out `scols` tiles per row so they stay big enough to read;
  // one to three become a single row under the lighter column
  const sideCol: Node[] = variant === 'b' ? [...shoes] : []
  if (small.length >= 4) {
    for (let i = 0; i < small.length; i += scols) {
      const chunk = small.slice(i, i + scols)
      sideCol.push(chunk.length === 1 ? chunk[0] : chunk)
    }
  } else if (small.length > 0) lighter().push(small)
  return [...cols, sideCol].filter(c => c.length > 0)
}

// height of a column = a * width + b (b collects the gaps), so we can solve for widths that end exactly level
function dims(c: Node[]) {
  let a = 0, b = (c.length - 1) * G
  for (const n of c) {
    if (isRow(n)) { const sa = n.reduce((t, i) => t + i.ar, 0); a += 1 / sa; b -= ((n.length - 1) * G) / sa } else a += 1 / n.ar
  }
  return { a, b }
}

/** `square` forces every tile to 1:1 (photos are cropped to fit); otherwise each tile keeps its own shape. */
const REF = 340
function measure(cols: Node[][]) {
  const d = cols.map(dims)
  const D = d.reduce((t, x) => t + 1 / x.a, 0)
  const C = d.reduce((t, x) => t + x.b / x.a, 0)
  const H = (REF - (cols.length - 1) * G + C) / D
  return { H, w: d.map(x => (H - x.b) / x.a) }
}

/**
 * Tries a few column counts and picks the one where small things stay readable (at least ~17% of the width)
 * and garments stay big, preferring a block that is a little taller than wide, which suits a phone.
 */
function chooseLayout(variant: LookVariant, items: LookItem[]) {
  const nSmall = items.filter(i => tierOf(i.cat) === 'small').length
  const nGarm = items.filter(i => tierOf(i.cat) === 'main').length
  const options: { cols: Node[][]; score: number; ok: boolean }[] = []
  for (let g = 1; g <= Math.min(3, Math.max(nGarm, 1)); g++) {
    for (let sc = 1; sc <= (nSmall >= 4 ? 3 : 1); sc++) {
      const cols = build(variant, items, g, sc)
      const m = measure(cols)
      const hasSide = nSmall >= 4
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

export default function PhotoLook({ items, variant = 'a', square = false }: { items: LookItem[]; variant?: LookVariant; square?: boolean }) {
  const cols = chooseLayout(variant, square ? items.map(i => ({ ...i, ar: 1 })) : items)
  const d = cols.map(dims)
  const D = d.reduce((t, x) => t + 1 / x.a, 0)
  const C = d.reduce((t, x) => t + x.b / x.a, 0)
  const H = `((100cqw - ${(cols.length - 1) * G}px + ${C}px) / ${D})`
  return (
    <div style={{ containerType: 'inline-size', width: '100%' }}>
      <div style={{ display: 'flex', gap: G, alignItems: 'flex-start' }}>
        {cols.map((c, ci) => (
          <div key={ci} style={{ flex: 'none', width: `calc((${H} - ${d[ci].b}px) / ${d[ci].a})`, display: 'flex', flexDirection: 'column', gap: G }}>
            {c.map((n, ni) => isRow(n)
              ? <div key={ni} style={{ display: 'flex', gap: G }}>{n.map((i, k) => <div key={k} style={{ flex: `${i.ar} 1 0`, minWidth: 0 }}><Img item={i} /></div>)}</div>
              : <Img key={ni} item={n} />)}
          </div>
        ))}
      </div>
    </div>
  )
}
