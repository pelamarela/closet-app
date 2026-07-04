import type { ColorSeason } from '../types/database'

export const COLOR_SEASONS: { value: ColorSeason; label: string; group: string; palette: string }[] = [
  { value: 'bright-spring', label: 'Bright Spring', group: 'Spring', palette: 'Warm, clear, high-contrast — poppy red, marigold, grass green, turquoise, warm white. Avoid: muted or dusty tones, black.' },
  { value: 'true-spring',   label: 'True Spring',   group: 'Spring', palette: 'Warm, fresh, medium-bright — coral, warm peach, golden yellow, leaf green, camel. Avoid: cool or ashy tones, stark black.' },
  { value: 'light-spring',  label: 'Light Spring',  group: 'Spring', palette: 'Warm, light, soft — peach, buttery yellow, light aqua, warm beige. Avoid: dark or heavy colors, black.' },

  { value: 'light-summer',  label: 'Light Summer',  group: 'Summer', palette: 'Cool, light, soft — powder blue, lavender, soft rose, light grey. Avoid: warm oranges, black, neon.' },
  { value: 'true-summer',   label: 'True Summer',   group: 'Summer', palette: 'Cool, muted, medium — dusty blue, mauve, soft navy, rose pink, grey-beige. Avoid: warm orange/gold, stark black.' },
  { value: 'soft-summer',   label: 'Soft Summer',   group: 'Summer', palette: 'Cool, muted, low-contrast — dusty rose, sage, soft plum, greyed navy. Avoid: bright warm tones, pure black/white.' },

  { value: 'soft-autumn',   label: 'Soft Autumn',   group: 'Autumn', palette: 'Warm, muted, medium — camel, olive, terracotta, dusty rose, warm ivory. Avoid: icy brights, stark black/white, neon.' },
  { value: 'true-autumn',   label: 'True Autumn',   group: 'Autumn', palette: 'Warm, rich, earthy — rust, mustard, forest green, chocolate brown, burnt orange. Avoid: cool icy pastels, pure white.' },
  { value: 'deep-autumn',   label: 'Deep Autumn',   group: 'Autumn', palette: 'Warm, deep, rich — espresso, deep olive, burgundy, pumpkin, dark teal. Avoid: pale pastels, cool light tones.' },

  { value: 'deep-winter',   label: 'Deep Winter',   group: 'Winter', palette: 'Cool, deep, high-contrast — true black, emerald, deep red, navy, icy white. Avoid: muted earth tones, warm beige.' },
  { value: 'true-winter',   label: 'True Winter',   group: 'Winter', palette: 'Cool, clear, high-contrast — true red, royal blue, black, pure white, magenta. Avoid: muted/dusty tones, warm gold.' },
  { value: 'bright-winter', label: 'Bright Winter', group: 'Winter', palette: 'Cool, bright, high-contrast — fuchsia, ice blue, true green, black, white. Avoid: muted or warm earthy tones.' },
]

export const COLOR_SEASON_MAP: Record<ColorSeason, typeof COLOR_SEASONS[number]> =
  Object.fromEntries(COLOR_SEASONS.map(s => [s.value, s])) as Record<ColorSeason, typeof COLOR_SEASONS[number]>
