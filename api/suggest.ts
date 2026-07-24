import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Vercel does not bundle cross-file imports for api/*.ts on this project
// (ESM "type": "module" + per-file transpile, no dependency resolution) —
// this must stay inlined rather than imported from a shared module.
const COLOR_SEASON_PALETTES: Record<string, { label: string; palette: string }> = {
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

function colorSeasonBlock(colorSeason?: string | null): string {
  if (!colorSeason) return ''
  const entry = COLOR_SEASON_PALETTES[colorSeason]
  if (!entry) return ''
  return `\nCLIENT'S COLOR SEASON: ${entry.label} — ${entry.palette}\n`
}

function warmthRange(tempC: number): [number, number] {
  if (tempC < 5)  return [4, 5]
  if (tempC < 12) return [3, 5]
  if (tempC < 18) return [2, 4]
  if (tempC < 24) return [1, 3]
  return [1, 2]
}

// Bootstrap default — only used until a user has logged enough outfits under a
// given occasion for us to learn what that occasion actually means to *them*.
// Keyword guesses are a poor proxy for that (e.g. "work" is casual for some people,
// formal for others) so this must stay a fallback, never the primary signal.
function genericFormalityRange(occasion: string): [number, number] | null {
  const o = occasion.toLowerCase()
  if (/casual|weekend|home|relax|sport|gym|errands/.test(o)) return [1, 2]
  if (/work|office|business|meeting|conference/.test(o))      return [3, 4]
  if (/dinner|gala|wedding|formal|event|party|date/.test(o))  return [3, 5]
  return null
}

const isOnePiece = (cat: string) => cat === 'one-piece'

type Item = {
  id: string; name: string; category: string; subcategory?: string | null
  color?: string | null; warmth: number; formality: number; sport?: boolean
}
type RecentOutfit = { date: string; occasion?: string | null; item_names: string[] }
type OccasionHistoryEntry = { date: string; item_names: string[] }
type FeedbackEntry = { item_names: string[]; feedback: 'up' | 'down'; occasion?: string | null }
type AnchorItem = { id: string; name: string; category: string; subcategory?: string | null; color?: string | null }
type RequestBody = {
  occasion: string; weather: { temp_c: number; conditions: string }
  items: Item[]; style_profile: string; recent_outfits: RecentOutfit[]
  feedback_history?: FeedbackEntry[]
  previously_shown?: string[][]
  anchor_item?: AnchorItem
  color_season?: string | null
  use_color_season?: boolean
  constants?: string[]
  formality?: number | null
  occasion_history?: OccasionHistoryEntry[]
}
type Suggestion = { item_ids: string[]; reasoning: string }

// A user has logged "enough" outfits under this exact occasion for their own
// history to outrank the generic keyword guess.
const OCCASION_HISTORY_THRESHOLD = 3
const FORMULA_THRESHOLD = 3

function learnedFormalityRange(occasionHistory: OccasionHistoryEntry[], items: Item[]): [number, number] | null {
  if (occasionHistory.length < OCCASION_HISTORY_THRESHOLD) return null
  const formalityByName = new Map<string, number[]>()
  for (const item of items) {
    const key = item.name.trim().toLowerCase()
    const arr = formalityByName.get(key) ?? []
    arr.push(item.formality)
    formalityByName.set(key, arr)
  }
  const samples: number[] = []
  for (const entry of occasionHistory) {
    for (const name of entry.item_names) {
      const vals = formalityByName.get(name.trim().toLowerCase())
      if (vals) samples.push(...vals)
    }
  }
  if (!samples.length) return null
  return [Math.max(1, Math.min(...samples) - 1), Math.min(5, Math.max(...samples) + 1)]
}

type FormalitySource = 'explicit' | 'learned' | 'generic' | 'none'

function resolveFormalityRange(
  occasion: string,
  explicitFormality: number | null | undefined,
  occasionHistory: OccasionHistoryEntry[],
  items: Item[],
): { range: [number, number] | null; source: FormalitySource } {
  if (typeof explicitFormality === 'number') {
    return { range: [Math.max(1, explicitFormality - 1), Math.min(5, explicitFormality + 1)], source: 'explicit' }
  }
  if (occasion) {
    const learned = learnedFormalityRange(occasionHistory, items)
    if (learned) return { range: learned, source: 'learned' }
    const generic = genericFormalityRange(occasion)
    if (generic) return { range: generic, source: 'generic' }
  }
  return { range: null, source: 'none' }
}

// Combinations the user already wears often and confidently for this occasion —
// surfaced as a known fact instead of asking Claude to re-infer the pattern from
// raw history on every call.
function detectFormulas(feedback: FeedbackEntry[], occasion: string): { item_names: string[]; count: number }[] {
  const occasionKey = occasion.trim().toLowerCase()
  const groups = new Map<string, { item_names: string[]; count: number }>()
  for (const f of feedback) {
    if (f.feedback !== 'up' || !f.item_names.length) continue
    if (occasionKey && (f.occasion ?? '').trim().toLowerCase() !== occasionKey) continue
    const key = [...f.item_names].map(n => n.toLowerCase()).sort().join('||')
    const g = groups.get(key) ?? { item_names: f.item_names, count: 0 }
    g.count++
    groups.set(key, g)
  }
  return [...groups.values()].filter(g => g.count >= FORMULA_THRESHOLD)
}

// Higher formality → longer no-repeat window (a repeated formal outfit is more
// likely to be noticed); low/no formality signal → short window.
function repeatWindowDays(range: [number, number] | null): number {
  if (!range) return 14
  const mid = (range[0] + range[1]) / 2
  return Math.round(7 + mid * 7)
}

function findRepeat(occasionHistory: OccasionHistoryEntry[], candidateNames: string[], windowDays: number): string | null {
  if (!occasionHistory.length || !candidateNames.length) return null
  const cutoff = Date.now() - windowDays * 86400000
  const candidateSet = new Set(candidateNames)
  for (const entry of occasionHistory) {
    const t = new Date(entry.date).getTime()
    if (Number.isNaN(t) || t < cutoff) continue
    const set = new Set(entry.item_names)
    if (set.size === candidateSet.size && [...set].every(n => candidateSet.has(n))) return entry.date
  }
  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const {
    occasion, weather, items, style_profile, recent_outfits, feedback_history, previously_shown, anchor_item,
    color_season, use_color_season, constants, formality, occasion_history,
  } = req.body as RequestBody
  if (!items?.length) return res.status(400).json({ error: 'No items provided' })

  const occasionHistory = occasion_history ?? []
  const [wMin, wMax] = warmthRange(weather.temp_c)
  const { range: fRange, source: formalitySource } = resolveFormalityRange(occasion ?? '', formality, occasionHistory, items)
  const isSportOccasion = /sport|gym|workout|fitness|exercise|running/.test((occasion ?? '').toLowerCase())

  const filtered = items.filter(item => {
    if (item.warmth < wMin || item.warmth > wMax) return false
    if (fRange && (item.formality < fRange[0] || item.formality > fRange[1])) return false
    if (item.sport && !isSportOccasion) return false
    return true
  })

  const canForm = (pool: Item[]) => {
    const cats = pool.map(i => i.category)
    const hasShoes = cats.includes('shoes')
    return hasShoes && (cats.some(isOnePiece) || (cats.includes('top') && cats.includes('bottom')))
  }
  const nonSport = isSportOccasion ? items : items.filter(i => !i.sport)
  const candidates = canForm(filtered) ? filtered : nonSport

  // Hard-exclude previously shown core items (tops/bottoms/one-pieces) so Claude
  // is forced to explore the rest of the wardrobe on each regen.
  // Shoes/outerwear/accessories stay available — fewer options there.
  // Anchor item is always kept in pool regardless of exclusion rules.
  const REGEN_EXCLUDE = new Set(['top', 'bottom', 'one-piece'])
  const shownIds = new Set((previously_shown ?? []).flat())
  const fresh = candidates.filter(i =>
    i.id === anchor_item?.id || !shownIds.has(i.id) || !REGEN_EXCLUDE.has(i.category)
  )
  const pool = canForm(fresh) ? fresh : candidates

  // Ensure anchor item is always in the pool even if it was filtered by warmth/formality
  if (anchor_item && !pool.some(i => i.id === anchor_item.id)) {
    const anchorFull = items.find(i => i.id === anchor_item.id)
    if (anchorFull) pool.push(anchorFull)
  }

  // Shuffle so Claude doesn't anchor on the same list order
  const shuffled = [...pool].sort(() => Math.random() - 0.5)

  const itemList = shuffled.map(i =>
    `ID:${i.id} | ${i.name}${i.color ? ` (${i.color})` : ''} | ${i.category}${i.subcategory ? `/${i.subcategory}` : ''} | warmth:${i.warmth} formality:${i.formality}`
  ).join('\n')

  const historyText = recent_outfits.length
    ? recent_outfits.slice(0, 20).map(o =>
        `${o.date}${o.occasion ? ` (${o.occasion})` : ''}: ${o.item_names.join(', ')}`
      ).join('\n')
    : 'None yet'

  const liked   = (feedback_history ?? []).filter(f => f.feedback === 'up')
  const disliked = (feedback_history ?? []).filter(f => f.feedback === 'down')
  const feedbackText = (liked.length || disliked.length)
    ? [
        liked.length   ? `Liked (lean into these combinations):\n${liked.map(f => `- ${f.occasion ? `(${f.occasion}) ` : ''}${f.item_names.join(', ')}`).join('\n')}` : '',
        disliked.length ? `Disliked (avoid these combinations):\n${disliked.map(f => `- ${f.occasion ? `(${f.occasion}) ` : ''}${f.item_names.join(', ')}`).join('\n')}` : '',
      ].filter(Boolean).join('\n\n')
    : 'No feedback yet'

  const anchorBlock = anchor_item
    ? `\nANCHOR ITEM: The user wants to wear "${anchor_item.name}"${anchor_item.color ? ` (${anchor_item.color})` : ''} — ${anchor_item.category}${anchor_item.subcategory ? `/${anchor_item.subcategory}` : ''} · ID:${anchor_item.id}\nYou MUST include this item (ID:${anchor_item.id}) in every outfit. Your job is to suggest complementary pieces that work specifically with this item — consider its colour, formality, and silhouette when choosing what to pair it with.\n`
    : ''

  const colorBlock = use_color_season !== false ? colorSeasonBlock(color_season) : ''

  const constantsBlock = constants?.length
    ? `\nALWAYS-WORN PIECES (already part of every look — don't need to be chosen or replaced, but you may still add complementary wardrobe pieces on top): ${constants.join(', ')}\n`
    : ''

  const formalityNote = formalitySource === 'learned'
    ? `\nFORMALITY: Based on ${occasionHistory.length} outfits this person has actually logged for "${occasion}", that occasion sits at formality ${fRange![0]}–${fRange![1]} for them specifically — trust this over any generic assumption about what "${occasion}" is supposed to look like.\n`
    : formalitySource === 'explicit'
      ? `\nFORMALITY: The user explicitly asked for formality level ${formality} out of 5 for this request.\n`
      : formalitySource === 'generic' && fRange
        ? `\nFORMALITY: No logged history yet for "${occasion}" — using a general default range (${fRange[0]}–${fRange[1]}) as a starting point, not a fixed assumption.\n`
        : ''

  const formulas = detectFormulas(feedback_history ?? [], occasion ?? '')
  const formulaBlock = formulas.length
    ? `\nKNOWN FORMULA${formulas.length > 1 ? 'S' : ''} (combinations this person already wears often and confidently for this occasion — lead with one of these if the pieces are in the available list below):\n${formulas.map(f => `- ${f.item_names.join(', ')} (worn ${f.count}+ times, always thumbs up)`).join('\n')}\n`
    : ''

  const occasionHistoryBlock = occasion && occasionHistory.length
    ? `\nPAST OUTFITS FOR "${occasion}":\n${occasionHistory.slice(0, 15).map(o => `${o.date}: ${o.item_names.join(', ')}`).join('\n')}\n`
    : ''

  const sparseBlock = pool.length < 5
    ? `\nNote: only ${pool.length} wardrobe item(s) fit this occasion/weather/formality combination. If nothing here truly makes a good outfit, say so plainly in the reasoning and explain what's missing — don't force a mismatched combination just to fill the slot. Only use items from the list below; never suggest buying anything.\n`
    : ''

  const prompt = `You are a personal stylist. Suggest 1–3 outfit combinations from the items listed.

OCCASION: ${occasion || 'unspecified'}
WEATHER: ${weather.temp_c}°C, ${weather.conditions}
STYLE NOTES: ${style_profile || 'No style profile set'}
${colorBlock}${constantsBlock}${anchorBlock}${formalityNote}${formulaBlock}${occasionHistoryBlock}${sparseBlock}
AVAILABLE ITEMS:
${itemList}

OUTFIT HISTORY (use to understand her style patterns and avoid recent repeats):
${historyText}

PAST SUGGESTION FEEDBACK (thumbs up/down on previous AI suggestions — prioritise this signal):
${feedbackText}

Rules:
- Study the outfit history to understand her colour palette, silhouette preferences, and what she pairs together
- Use the feedback to guide combinations: reinforce liked item pairings, avoid disliked ones
- Only use items from the list above (exact IDs)
- Every outfit MUST include exactly ONE pair of shoes — never two
- Valid outfit structures: (top + bottom + shoes) OR (one-piece + shoes)
- Never combine a one-piece with a separate top or bottom
- Never include two tops, two bottoms, or two one-pieces
- Outerwear and accessories are optional additions
- Vary the suggestions — don't repeat the same item across all outfits${anchor_item ? '\n- Every suggestion MUST include the anchor item ID:' + anchor_item.id : ''}${colorBlock ? '\n- Favor combinations whose colours sit within the client\'s color season palette; avoid combinations built around a clear clash' : ''}${constantsBlock ? '\n- Assume the always-worn pieces are present in every outfit — don\'t suggest wardrobe items that duplicate them' : ''}
- Be concrete and honest in your reasoning: reference the actual colours/silhouette/material at play rather than generic praise; if nothing in the available items truly works for this occasion, say so plainly instead of forcing enthusiasm
- Keep reasoning to 1–2 sentences${anchor_item ? '; explain why the chosen pieces complement the anchor item' : ''}

Respond with JSON only, no markdown fences:
{"suggestions":[{"item_ids":["id1","id2"],"reasoning":"..."}]}`

  const responseSchema = {
    type: 'object',
    properties: {
      suggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            item_ids: { type: 'array', items: { type: 'string' } },
            reasoning: { type: 'string' },
          },
          required: ['item_ids', 'reasoning'],
          additionalProperties: false,
        },
      },
    },
    required: ['suggestions'],
    additionalProperties: false,
  }

  let message
  try {
    message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      output_config: { format: { type: 'json_schema', schema: responseSchema } },
      messages: [{ role: 'user', content: prompt }],
    })
  } catch (err) {
    console.error('suggest error:', err)
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Suggestion failed' })
  }

  const textBlock = message.content.find(b => b.type === 'text')
  const raw = textBlock ? textBlock.text : ''
  const text = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  let suggestions: Suggestion[] = []
  try {
    const parsed = JSON.parse(text)
    suggestions = parsed.suggestions ?? []
  } catch {
    return res.status(500).json({ error: 'Failed to parse suggestions', raw })
  }

  const idToItem = new Map(pool.map(i => [i.id, i]))

  const count = (cats: string[], cat: string) => cats.filter(c => c === cat).length

  const isValidOutfit = (ids: string[]) => {
    const cats = ids.map(id => idToItem.get(id)?.category ?? '')
    // Must have exactly one pair of shoes
    if (count(cats, 'shoes') !== 1) return false
    // No duplicate bottoms or tops
    if (count(cats, 'bottom') > 1) return false
    if (count(cats, 'top') > 1) return false
    // No duplicate one-pieces
    if (count(cats, 'one-piece') > 1) return false
    // Can't mix one-piece with top or bottom
    if (cats.some(isOnePiece) && (cats.includes('top') || cats.includes('bottom'))) return false
    // Must have valid base: one-piece OR top+bottom
    if (cats.some(isOnePiece)) return true
    return cats.includes('top') && cats.includes('bottom')
  }

  const safe = suggestions
    .map(s => ({ ...s, item_ids: s.item_ids.filter(id => idToItem.has(id)) }))
    .filter(s => isValidOutfit(s.item_ids))
    .filter(s => !anchor_item || s.item_ids.includes(anchor_item.id))

  // Belt-and-suspenders repeat check: even though the prompt already sees past
  // outfits for this occasion, flag it explicitly if a suggestion still lands on
  // an exact repeat within the formality-scaled window, rather than blocking it.
  const windowDays = repeatWindowDays(fRange)
  const withRepeatNotes = safe.map(s => {
    if (!occasion) return s
    const names = s.item_ids.map(id => idToItem.get(id)?.name).filter((n): n is string => !!n)
    const repeatDate = findRepeat(occasionHistory, names, windowDays)
    if (!repeatDate) return s
    return { ...s, reasoning: `You wore this exact combination for "${occasion}" on ${repeatDate} — here it is again, but consider mixing it up if you want something fresh. ${s.reasoning}` }
  })

  return res.json({ suggestions: withRepeatNotes })
}
