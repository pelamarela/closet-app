// Dev-only: real closet photos composed into outfits with the tidy collage. Not used by the real app.
import { useEffect, useMemo, useState } from 'react'
import { T, fS, Disp, Btn } from '../design/kit'
import { usePreviewPalette } from '../design/previewPalette'
import Collage from '../design/Collage'
import type { LookItem, LookVariant } from '../preview/PhotoLook'

// pretend the photos have other shapes: portrait, landscape, tall, wide, square (picked per photo, always the same)
const SHAPES = [0.75, 1, 1.33, 0.67, 1.5, 0.8, 1.2]
const shapeOf = (name: string) => SHAPES[[...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7) % SHAPES.length]

type Entry = { file: string; cat: string; name: string; ar: number }

// each recipe: how many of which category, so we see tall, short, no-shoes and 6-accessory cases
const RECIPES: Record<string, number>[] = [
  { top: 2, bottom: 1, outerwear: 1, shoes: 1, accessory: 6 },
  { top: 1, bottom: 1, outerwear: 1, shoes: 1, accessory: 3, fragrance: 1 },
  { 'one-piece': 1, shoes: 1, accessory: 4 },
  { top: 1, bottom: 1, accessory: 5, fragrance: 1 },
  { top: 1, bottom: 1, outerwear: 1, shoes: 1 },
  { 'one-piece': 1, outerwear: 1, shoes: 1, accessory: 2 },
  { top: 1, bottom: 1, shoes: 1, accessory: 6 },
  { top: 2, bottom: 2, outerwear: 1, shoes: 2, accessory: 6 },
  { top: 1, bottom: 1, shoes: 1, accessory: 6 },
  { 'one-piece': 1, shoes: 1, accessory: 6 },
  { top: 1, bottom: 1, accessory: 6 },
]
const VARIANTS: { id: LookVariant; name: string }[] = [{ id: 'a', name: 'a' }]

function seeded(seed: number) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 } }

export default function OutfitTestPage() {
  const ready = usePreviewPalette()
  const [items, setItems] = useState<Entry[]>([])
  const [seed, setSeed] = useState(7)
  const [mode, setMode] = useState<'mixed' | 'square'>('mixed')
  const [phone, setPhone] = useState(true)
  const [cards, setCards] = useState(false)
  const width = cards ? 170 : phone ? 354 : 520
  useEffect(() => { fetch('/preview/items/manifest.json').then(r => r.json()).then(setItems).catch(() => setItems([])) }, [])
  const looks = useMemo(() => {
    const rnd = seeded(seed)
    const by = (cat: string) => items.filter(i => i.cat === cat)
    return RECIPES.map(r => {
      const out: LookItem[] = []
      for (const [cat, n] of Object.entries(r)) {
        const pool = [...by(cat)]
        for (let k = 0; k < n && pool.length; k++) {
          const e = pool.splice(Math.floor(rnd() * pool.length), 1)[0]
          out.push({ cat, src: `/preview/items/${e.file}`, name: e.name.replace(/-/g, ' ').toLowerCase(), ar: shapeOf(e.name) })
        }
      }
      return out
    })
  }, [items, seed])
  if (!ready) return null
  return (
    <div style={{ background: T.line, minHeight: '100svh', padding: '32px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Disp s={32}>outfits</Disp>
        <Btn kind="quiet" icon="repeat" onClick={() => setSeed(s => s + 1)} style={{ height: 40, fontSize: 13 }}>shuffle</Btn>
        <Btn kind={cards ? 'primary' : 'quiet'} onClick={() => setCards(c => !c)} style={{ height: 40, fontSize: 13 }}>cards</Btn>
        <Btn kind={phone ? 'primary' : 'quiet'} onClick={() => setPhone(p => !p)} style={{ height: 40, fontSize: 13 }}>phone width</Btn>
        <Btn kind={mode === 'mixed' ? 'primary' : 'quiet'} onClick={() => setMode('mixed')} style={{ height: 40, fontSize: 13 }}>mixed shapes</Btn>
        <Btn kind={mode === 'square' ? 'primary' : 'quiet'} onClick={() => setMode('square')} style={{ height: 40, fontSize: 13 }}>all square</Btn>
      </div>
      {VARIANTS.map(v => (
        <div key={v.id} style={{ marginTop: 40 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(260px, ${width}px))`, gap: 20 }}>
            {looks.map((l, i) => (
              <div key={i} style={{ maxWidth: width, background: T.paper, padding: 12 }}>
                <Collage items={l.map((x, k) => ({ id: String(k), name: x.name ?? '', category: x.cat, signedImageUrl: x.src }))} square={mode === 'square'} maxSmall={cards ? 4 : 6} />
                <div style={{ fontFamily: fS, fontSize: 12, color: T.g500, marginTop: 10, lineHeight: 1.4 }}>{l.map(x => x.name).join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
