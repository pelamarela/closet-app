import type { ColorSeason } from '../types/database'

export const COLOR_SEASONS: { value: ColorSeason; label: string; group: string; palette: string }[] = [
  { value: 'bright-spring', label: 'bright spring', group: 'spring', palette: 'warm, clear, high-contrast — poppy red, marigold, grass green, turquoise, warm white. avoid: muted or dusty tones, black.' },
  { value: 'true-spring',   label: 'true spring',   group: 'spring', palette: 'warm, fresh, medium-bright — coral, warm peach, golden yellow, leaf green, camel. avoid: cool or ashy tones, stark black.' },
  { value: 'light-spring',  label: 'light spring',  group: 'spring', palette: 'warm, light, soft — peach, buttery yellow, light aqua, warm beige. avoid: dark or heavy colors, black.' },

  { value: 'light-summer',  label: 'light summer',  group: 'summer', palette: 'cool, light, soft — powder blue, lavender, soft rose, light grey. avoid: warm oranges, black, neon.' },
  { value: 'true-summer',   label: 'true summer',   group: 'summer', palette: 'cool, muted, medium — dusty blue, mauve, soft navy, rose pink, grey-beige. avoid: warm orange/gold, stark black.' },
  { value: 'soft-summer',   label: 'soft summer',   group: 'summer', palette: 'cool, muted, low-contrast — dusty rose, sage, soft plum, greyed navy. avoid: bright warm tones, pure black/white.' },

  { value: 'soft-autumn',   label: 'soft autumn',   group: 'autumn', palette: 'warm, muted, medium — camel, olive, terracotta, dusty rose, warm ivory. avoid: icy brights, stark black/white, neon.' },
  { value: 'true-autumn',   label: 'true autumn',   group: 'autumn', palette: 'warm, rich, earthy — rust, mustard, forest green, chocolate brown, burnt orange. avoid: cool icy pastels, pure white.' },
  { value: 'deep-autumn',   label: 'deep autumn',   group: 'autumn', palette: 'warm, deep, rich — espresso, deep olive, burgundy, pumpkin, dark teal. avoid: pale pastels, cool light tones.' },

  { value: 'deep-winter',   label: 'deep winter',   group: 'winter', palette: 'cool, deep, high-contrast — true black, emerald, deep red, navy, icy white. avoid: muted earth tones, warm beige.' },
  { value: 'true-winter',   label: 'true winter',   group: 'winter', palette: 'cool, clear, high-contrast — true red, royal blue, black, pure white, magenta. avoid: muted/dusty tones, warm gold.' },
  { value: 'bright-winter', label: 'bright winter', group: 'winter', palette: 'cool, bright, high-contrast — fuchsia, ice blue, true green, black, white. avoid: muted or warm earthy tones.' },
]

export const COLOR_SEASON_MAP: Record<ColorSeason, typeof COLOR_SEASONS[number]> =
  Object.fromEntries(COLOR_SEASONS.map(s => [s.value, s])) as Record<ColorSeason, typeof COLOR_SEASONS[number]>
