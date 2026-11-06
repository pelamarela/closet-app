// Sample data for the dev-only prototype pages. Not used by the real app.
import type { PhTone } from '../design/kit'

export const TONES: PhTone[] = ['rose', 'sand', 'cocoa', 'paper', 'ink', 'peach']
export const tone = (i: number, shift = 0) => TONES[(i * 5 + shift) % TONES.length]
export const CATS = ['all', 'top', 'bottom', 'one-piece', 'outerwear', 'shoes', 'accessory']
const BASE_CATS = ['top', 'bottom', 'one-piece', 'outerwear', 'shoes']
export const NAMES = ['linen shirt', 'cream trousers', 'knit dress', 'denim jacket', 'white sneakers']
export const COLORS = ['cream', 'navy', 'black', 'olive', 'blush']
export const ITEMS = Array.from({ length: 60 }, (_, i) => ({
  id: i, cat: BASE_CATS[i % 5], name: NAMES[i % 5], worn: (i * 3) % 7, color: COLORS[i % 5], brand: ['arket', 'cos', 'zara', 'levi\'s', 'veja'][i % 5],
}))
// 10 accessories and 2 fragrances, ids 60 to 71
ITEMS.push(...Array.from({ length: 12 }, (_, k) => ({
  id: 60 + k, cat: k < 10 ? 'accessory' : 'fragrance', name: ['belt', 'watch', 'earrings', 'scarf', 'bag', 'ring', 'hat', 'sunglasses', 'necklace', 'gloves', 'perfume', 'mist'][k],
  worn: (k * 2) % 6, color: COLORS[k % 5], brand: ['arket', 'cos', 'zara', 'levi\'s', 'veja'][k % 5],
})))

// How an outfit is shown: worn order, three tiers (main garments, shoes, small things).
export const WORN_ORDER: Record<string, number> = { 'one-piece': 0, top: 0, bottom: 1, outerwear: 2, shoes: 3, accessory: 4, fragrance: 5 }
export const tierOf = (cat: string): 'main' | 'shoes' | 'small' => cat === 'shoes' ? 'shoes' : cat === 'accessory' || cat === 'fragrance' ? 'small' : 'main'
export const sortWorn = (ids: number[]) => [...ids].sort((a, b) => (WORN_ORDER[ITEMS[a].cat] ?? 9) - (WORN_ORDER[ITEMS[b].cat] ?? 9) || a - b)

export const TODAY = '2026-11-06'
export const WEEK_DATES = ['2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09']
export const OUTFIT = { title: 'linen shirt, cream trousers', date: 'thu, nov 6', occasion: 'work', pieces: [0, 1, 3, 4, 60, 61, 62, 63, 64, 65] }
export const OCCASIONS = ['work', 'casual', 'evening', 'sport']
export const LOOKS = ['smart', 'relaxed', 'bold']
export const SEASONS = ['spring', 'summer', 'autumn', 'winter']

// outfits per day of november 2026 for the month view: day -> piece ids
export const MONTH_OUTFITS: Record<number, number[]> = {
  2: [0, 1], 3: [2, 3], 4: [4, 5], 5: [6, 7, 8], 6: [0, 1, 3, 4], 9: [1, 2], 10: [3, 4], 12: [5, 6], 13: [7, 8], 16: [0, 9],
}
export const SUGGESTIONS = [
  { pieces: [0, 1, 4, 60, 61, 62], why: 'light layers for a cool, grey day' },
  { pieces: [2, 3, 4], why: 'soft knit, easy to wear all day' },
  { pieces: [6, 8, 9], why: 'a bit sharper for the evening' },
]
export const IDEAS = [
  { id: 0, pieces: [0, 1, 3, 4, 60, 61, 62, 63, 64, 65], occasion: 'work' }, { id: 1, pieces: [2, 3], occasion: 'casual' },
  { id: 2, pieces: [6, 7, 8], occasion: 'evening' }, { id: 3, pieces: [1, 5, 9], occasion: '' },
]

// Real closet photos (local, gitignored) assigned to the sample items by category, loaded once.
export const PHOTOS: Record<number, { src: string; ar: number }> = {}
let loaded = false
const subs = new Set<() => void>()
export const photosLoaded = () => loaded
export const onPhotos = (cb: () => void) => { subs.add(cb); return () => { subs.delete(cb) } }
let started = false
export function loadPhotos() {
  if (started) return
  started = true
  fetch('/preview/items/manifest.json').then(r => r.json()).then((m: { file: string; cat: string; ar: number }[]) => {
    const by: Record<string, typeof m> = {}
    m.forEach(e => { (by[e.cat] ??= []).push(e) })
    const used: Record<string, number> = {}
    ITEMS.forEach(it => {
      const pool = by[it.cat]
      if (!pool?.length) return
      const k = used[it.cat] ?? 0
      const e = pool[k % pool.length]
      used[it.cat] = k + 1
      PHOTOS[it.id] = { src: `/preview/items/${e.file}`, ar: e.ar }
    })
    loaded = true
    subs.forEach(f => f())
  }).catch(() => { /* no local photos: placeholders stay */ })
}
