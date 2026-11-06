// Buckets a free-text item.color value (e.g. "burgundy / pink", "cognac")
// into one of a small set of canonical colors, for the Statistics → Colour
// tab. Order matters — first keyword match wins, so more specific terms
// (e.g. "navy" before a generic "blue") come first within a bucket's list.
export type ColorBucket = { key: string; label: string; hex: string }

const BUCKETS: (ColorBucket & { keywords: string[] })[] = [
  { key: 'black', label: 'black', hex: '#111111', keywords: ['black'] },
  { key: 'white', label: 'white', hex: '#F4F2EF', keywords: ['white'] },
  { key: 'cream', label: 'cream / beige', hex: '#E8DCCA', keywords: ['cream', 'beige', 'ivory', 'ecru', 'tan', 'sand', 'stone'] },
  { key: 'brown', label: 'brown / cognac', hex: '#8B5A2B', keywords: ['cognac', 'brown', 'camel', 'chocolate', 'mocha', 'coffee', 'espresso', 'tobacco'] },
  { key: 'grey', label: 'grey', hex: '#8A8884', keywords: ['grey', 'gray', 'charcoal', 'silver'] },
  { key: 'navy', label: 'navy / blue', hex: '#2C3E50', keywords: ['navy', 'blue', 'denim', 'indigo', 'cobalt', 'teal'] },
  { key: 'green', label: 'green', hex: '#3F5A4A', keywords: ['green', 'olive', 'khaki', 'forest', 'sage', 'emerald', 'mint'] },
  { key: 'red', label: 'red', hex: '#8C2F2F', keywords: ['red', 'burgundy', 'maroon', 'wine', 'crimson'] },
  { key: 'rose', label: 'pink / rose', hex: '#C98E7C', keywords: ['pink', 'rose', 'blush', 'mauve', 'fuchsia', 'magenta'] },
  { key: 'orange', label: 'orange / rust', hex: '#B5602B', keywords: ['orange', 'rust', 'terracotta', 'coral', 'peach', 'apricot'] },
  { key: 'purple', label: 'purple', hex: '#6B4E71', keywords: ['purple', 'lavender', 'lilac', 'plum', 'violet'] },
  { key: 'yellow', label: 'yellow / gold', hex: '#C9A227', keywords: ['yellow', 'mustard', 'gold', 'golden'] },
]

export function bucketColor(raw: string | null | undefined): ColorBucket | null {
  if (!raw) return null
  const s = raw.toLowerCase()
  for (const b of BUCKETS) {
    if (b.keywords.some(k => s.includes(k))) return { key: b.key, label: b.label, hex: b.hex }
  }
  return null
}

export const COLOR_BUCKET_LIST = BUCKETS.map(({ key, label, hex }) => ({ key, label, hex }))
