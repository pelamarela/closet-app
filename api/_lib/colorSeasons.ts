export const COLOR_SEASON_PALETTES: Record<string, { label: string; palette: string }> = {
  'bright-spring': { label: 'Bright Spring', palette: 'Warm, clear, high-contrast — poppy red, marigold, grass green, turquoise, warm white. Avoid: muted or dusty tones, black.' },
  'true-spring':   { label: 'True Spring',   palette: 'Warm, fresh, medium-bright — coral, warm peach, golden yellow, leaf green, camel. Avoid: cool or ashy tones, stark black.' },
  'light-spring':  { label: 'Light Spring',  palette: 'Warm, light, soft — peach, buttery yellow, light aqua, warm beige. Avoid: dark or heavy colors, black.' },

  'light-summer':  { label: 'Light Summer',  palette: 'Cool, light, soft — powder blue, lavender, soft rose, light grey. Avoid: warm oranges, black, neon.' },
  'true-summer':   { label: 'True Summer',   palette: 'Cool, muted, medium — dusty blue, mauve, soft navy, rose pink, grey-beige. Avoid: warm orange/gold, stark black.' },
  'soft-summer':   { label: 'Soft Summer',   palette: 'Cool, muted, low-contrast — dusty rose, sage, soft plum, greyed navy. Avoid: bright warm tones, pure black/white.' },

  'soft-autumn':   { label: 'Soft Autumn',   palette: 'Warm, muted, medium — camel, olive, terracotta, dusty rose, warm ivory. Avoid: icy brights, stark black/white, neon.' },
  'true-autumn':   { label: 'True Autumn',   palette: 'Warm, rich, earthy — rust, mustard, forest green, chocolate brown, burnt orange. Avoid: cool icy pastels, pure white.' },
  'deep-autumn':   { label: 'Deep Autumn',   palette: 'Warm, deep, rich — espresso, deep olive, burgundy, pumpkin, dark teal. Avoid: pale pastels, cool light tones.' },

  'deep-winter':   { label: 'Deep Winter',   palette: 'Cool, deep, high-contrast — true black, emerald, deep red, navy, icy white. Avoid: muted earth tones, warm beige.' },
  'true-winter':   { label: 'True Winter',   palette: 'Cool, clear, high-contrast — true red, royal blue, black, pure white, magenta. Avoid: muted/dusty tones, warm gold.' },
  'bright-winter': { label: 'Bright Winter', palette: 'Cool, bright, high-contrast — fuchsia, ice blue, true green, black, white. Avoid: muted or warm earthy tones.' },
}

export function colorSeasonBlock(colorSeason?: string | null): string {
  if (!colorSeason) return ''
  const entry = COLOR_SEASON_PALETTES[colorSeason]
  if (!entry) return ''
  return `\nCLIENT'S COLOR SEASON: ${entry.label} — ${entry.palette}\n`
}
