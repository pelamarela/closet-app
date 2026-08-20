// Buckets a free-text item.color value (e.g. "burgundy / pink", "cognac")
// into one of a small set of canonical colors, for the Statistics → Colour
// tab. Order matters — first keyword match wins, so more specific terms
// (e.g. "navy" before a generic "blue") come first within a bucket's list.
export type ColorBucket = { key: string; label: string; hex: string }

const BUCKETS: (ColorBucket & { keywords: string[] })[] = [
  { key: 'black', label: 'Black', hex: '#111111', keywords: ['black'] },
  { key: 'white', label: 'White', hex: '#F4F2EF', keywords: ['white'] },
  { key: 'cream', label: 'Cream / beige', hex: '#E8DCCA', keywords: ['cream', 'beige', 'ivory', 'ecru', 'tan', 'sand', 'stone'] },
  { key: 'brown', label: 'Brown / cognac', hex: '#8B5A2B', keywords: ['cognac', 'brown', 'camel', 'chocolate', 'mocha', 'coffee', 'espresso', 'tobacco'] },
  { key: 'grey', label: 'Grey', hex: '#8A8884', keywords: ['grey', 'gray', 'charcoal', 'silver'] },
  { key: 'navy', label: 'Navy / blue', hex: '#2C3E50', keywords: ['navy', 'blue', 'denim', 'indigo', 'cobalt', 'teal'] },
  { key: 'green', label: 'Green', hex: '#3F5A4A', keywords: ['green', 'olive', 'khaki', 'forest', 'sage', 'emerald', 'mint'] },
  { key: 'red', label: 'Red', hex: '#8C2F2F', keywords: ['red', 'burgundy', 'maroon', 'wine', 'crimson'] },
  { key: 'rose', label: 'Pink / rose', hex: '#C98E7C', keywords: ['pink', 'rose', 'blush', 'mauve', 'fuchsia', 'magenta'] },
  { key: 'orange', label: 'Orange / rust', hex: '#B5602B', keywords: ['orange', 'rust', 'terracotta', 'coral', 'peach', 'apricot'] },
  { key: 'purple', label: 'Purple', hex: '#6B4E71', keywords: ['purple', 'lavender', 'lilac', 'plum', 'violet'] },
  { key: 'yellow', label: 'Yellow / gold', hex: '#C9A227', keywords: ['yellow', 'mustard', 'gold', 'golden'] },
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
