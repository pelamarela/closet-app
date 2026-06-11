import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

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
  color?: string | null; warmth: number; formality: number
}
type RecentOutfit = { date: string; occasion?: string | null; item_names: string[] }
type RequestBody = {
  occasion: string; weather: { temp_c: number; conditions: string }
  items: Item[]; style_profile: string; recent_outfits: RecentOutfit[]
}
type Suggestion = { item_ids: string[]; reasoning: string }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { occasion, weather, items, style_profile, recent_outfits } = req.body as RequestBody
  if (!items?.length) return res.status(400).json({ error: 'No items provided' })

  const [wMin, wMax] = warmthRange(weather.temp_c)
  const fRange = formalityRange(occasion)

  const filtered = items.filter(item => {
    if (item.warmth < wMin || item.warmth > wMax) return false
    if (fRange && (item.formality < fRange[0] || item.formality > fRange[1])) return false
    return true
  })

  const canForm = (pool: Item[]) => {
    const cats = pool.map(i => i.category)
    const hasShoes = cats.includes('shoes')
    return hasShoes && (cats.some(isOnePiece) || (cats.includes('top') && cats.includes('bottom')))
  }
  const candidates = canForm(filtered) ? filtered : items

  const itemList = candidates.map(i =>
    `ID:${i.id} | ${i.name}${i.color ? ` (${i.color})` : ''} | ${i.category}${i.subcategory ? `/${i.subcategory}` : ''} | warmth:${i.warmth} formality:${i.formality}`
  ).join('\n')

  const historyText = recent_outfits.length
    ? recent_outfits.slice(0, 20).map(o =>
        `${o.date}${o.occasion ? ` (${o.occasion})` : ''}: ${o.item_names.join(', ')}`
      ).join('\n')
    : 'None yet'

  const prompt = `You are a personal stylist. Suggest 1–3 outfit combinations from the items listed.

OCCASION: ${occasion || 'unspecified'}
WEATHER: ${weather.temp_c}°C, ${weather.conditions}
STYLE NOTES: ${style_profile || 'No style profile set'}

AVAILABLE ITEMS:
${itemList}

OUTFIT HISTORY (use to understand her style patterns and avoid recent repeats):
${historyText}

Rules:
- Study the outfit history to understand her colour palette, silhouette preferences, and what she pairs together
- Only use items from the list above (exact IDs)
- Every outfit MUST include shoes — no exceptions
- Valid outfit structures: (top + bottom + shoes) OR (one-piece + shoes)
- Outerwear and accessories are optional additions
- Vary the suggestions — don't repeat the same item across all outfits
- Keep reasoning to 1–2 sentences

Respond with JSON only, no markdown fences:
{"suggestions":[{"item_ids":["id1","id2"],"reasoning":"..."}]}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const text = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  let suggestions: Suggestion[] = []
  try {
    const parsed = JSON.parse(text)
    suggestions = parsed.suggestions ?? []
  } catch {
    return res.status(500).json({ error: 'Failed to parse suggestions', raw })
  }

  const idToItem = new Map(candidates.map(i => [i.id, i]))

  const isCompleteOutfit = (ids: string[]) => {
    const cats = ids.map(id => idToItem.get(id)?.category ?? '')
    const hasShoes = cats.includes('shoes')
    if (!hasShoes) return false
    if (cats.some(isOnePiece)) return true
    return cats.includes('top') && cats.includes('bottom')
  }

  const safe = suggestions
    .map(s => ({ ...s, item_ids: s.item_ids.filter(id => idToItem.has(id)) }))
    .filter(s => isCompleteOutfit(s.item_ids))

  return res.json({ suggestions: safe })
}
