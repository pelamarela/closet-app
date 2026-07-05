import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import { colorSeasonBlock } from './lib/colorSeasons'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function warmthRange(tempC: number): [number, number] {
  if (tempC < 5)  return [4, 5]
  if (tempC < 12) return [3, 5]
  if (tempC < 18) return [2, 4]
  if (tempC < 24) return [1, 3]
  return [1, 2]
}

function formalityRange(occasion: string): [number, number] | null {
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
}
type Suggestion = { item_ids: string[]; reasoning: string }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const {
    occasion, weather, items, style_profile, recent_outfits, feedback_history, previously_shown, anchor_item,
    color_season, use_color_season, constants,
  } = req.body as RequestBody
  if (!items?.length) return res.status(400).json({ error: 'No items provided' })

  const [wMin, wMax] = warmthRange(weather.temp_c)
  const fRange = formalityRange(occasion)
  const isSportOccasion = /sport|gym|workout|fitness|exercise|running/.test(occasion.toLowerCase())

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

  const prompt = `You are a personal stylist. Suggest 1–3 outfit combinations from the items listed.

OCCASION: ${occasion || 'unspecified'}
WEATHER: ${weather.temp_c}°C, ${weather.conditions}
STYLE NOTES: ${style_profile || 'No style profile set'}
${colorBlock}${constantsBlock}${anchorBlock}
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

  return res.json({ suggestions: safe })
}
