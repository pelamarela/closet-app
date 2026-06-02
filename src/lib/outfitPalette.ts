const PALETTES = [
  ['#E8D4C0','#D4BEA8'], // cream
  ['#1A1A1A','#2C2C2C'], // black
  ['#D4A898','#C49080'], // blush
  ['#C8C4BC','#B4B0A8'], // stone
  ['#C4B49C','#B0A088'], // tan
  ['#B8C4C0','#A4B0AC'], // sage
]

export function outfitPalette(id: string): [string, string] {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return PALETTES[hash % PALETTES.length] as [string, string]
}
