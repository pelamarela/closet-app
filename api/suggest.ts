import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Pre-filter helpers ───────────────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

type Item = {
  id: string
  name: string
  category: string
  subcategory?: string | null
  color?: string | null
  warmth: number
  formality: number
}

type RecentOutfit = {
  date: string
  occasion?: string | null
  item_names: string[]
}

type RequestBody = {
  occasion: string
  weather: { temp_c: number; conditions: string }
  items: Item[]
  style_profile: string
  recent_outfits: RecentOutfit[]
}

type Suggestion = {
  item_ids: string[]
  reasoning: string
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { occasion, weather, items, style_profile, recent_outfits } = req.body as RequestBody

  if (!items?.length) return res.status(400).json({ error: 'No items provided' })

  // Pre-filter by warmth and formality
  const [wMin, wMax] = warmthRange(weather.temp_c)
  const fRange = formalityRange(occasion)

  const filtered = items.filter(item => {
    if (item.warmth < wMin || item.warmth > wMax) return false
    if (fRange && (item.formality < fRange[0] || item.formality > fRange[1])) return false
    return true
  })

  // Fall back to all items if filter is too restrictive
  const candidates = filtered.length >= 3 ? filtered : items

  const itemList = candidates.map(i =>
    `ID:${i.id} | ${i.name}${i.color ? ` (${i.color})` : ''} | ${i.category}${i.subcategory ? `/${i.subcategory}` : ''} | warmth:${i.warmth} formality:${i.formality}`
  ).join('\n')

  const historyText = recent_outfits.length
    ? recent_outfits.slice(0, 7).map(o =>
        `${o.date}${o.occasion ? ` (${o.occasion})` : ''}: ${o.item_names.join(', ')}`
      ).join('\n')
    : 'None yet'

  const prompt = `You are a personal stylist. Suggest 1–3 outfit combinations from the items listed.

OCCASION: ${occasion || 'unspecified'}
WEATHER: ${weather.temp_c}°C, ${weather.conditions}
STYLE NOTES: ${style_profile || 'No style profile set'}

AVAILABLE ITEMS:
${itemList}

RECENT OUTFIT HISTORY (avoid repeating recent combinations):
${historyText}

Rules:
- Only use items from the list above (use the exact IDs)
- Each outfit needs at least a top or dress, and a bottom (unless it's a dress)
- Add shoes and outerwear where they exist and are appropriate
- Vary the suggestions — don't repeat the same item across all outfits
- Keep reasoning to 1–2 sentences

Respond with JSON only, no markdown:
{"suggestions":[{"item_ids":["id1","id2"],"reasoning":"..."}]}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  let suggestions: Suggestion[] = []
  try {
    const parsed = JSON.parse(text)
    suggestions = parsed.suggestions ?? []
  } catch {
    return res.status(500).json({ error: 'Failed to parse suggestions', raw: text })
  }

  // Validate that all returned IDs actually exist in our candidate set
  const validIds = new Set(candidates.map(i => i.id))
  const safe = suggestions.map(s => ({
    ...s,
    item_ids: s.item_ids.filter(id => validIds.has(id)),
  })).filter(s => s.item_ids.length > 0)

  return res.json({ suggestions: safe })
}
