import type { OutfitWithItems } from '../hooks/useOutfits'

const TIME_DEFAULTS: Record<'weekday' | 'friday' | 'weekend', string[]> = {
  weekday: ['work', 'lunch', 'errands', 'dinner', 'casual', 'gym'],
  friday:  ['dinner', 'drinks', 'work', 'casual', 'date', 'errands'],
  weekend: ['weekend', 'brunch', 'casual', 'dinner', 'walk', 'errands'],
}

export function getOccasionPresets(outfits: OutfitWithItems[]): string[] {
  const freq: Record<string, number> = {}
  outfits.forEach(o => {
    const k = o.occasion?.trim().toLowerCase()
    if (k) freq[k] = (freq[k] ?? 0) + 1
  })
  const fromHistory = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([k]) => k)
  if (fromHistory.length >= 5) return fromHistory.slice(0, 6)
  const dow = new Date().getDay()
  const slot = dow === 0 || dow === 6 ? 'weekend' : dow === 5 ? 'friday' : 'weekday'
  const seen = new Set(fromHistory)
  const padded = [...fromHistory]
  for (const d of TIME_DEFAULTS[slot]) {
    if (!seen.has(d)) { padded.push(d); seen.add(d) }
    if (padded.length >= 6) break
  }
  return padded
}
