import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type WardrobeItem = {
  id: string
  name: string
  category: string
  subcategory?: string | null
  color?: string | null
}

type PairingItem = { id: string; name: string; reason: string }

type AnalysisResult = {
  verdict: 'buy' | 'maybe' | 'skip'
  style_match: number
  pros: string[]
  concerns: string[]
  style_analysis: string
  closet_compatibility: string
  pairing_items: PairingItem[]
  outfit_ideas: string[]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { image_base64, media_type, items, style_profile } = req.body as {
    image_base64: string
    media_type?: string
    items: WardrobeItem[]
    style_profile: string
  }

  if (!image_base64) return res.status(400).json({ error: 'image_base64 required' })

  const itemList = items.length
    ? items.map(i =>
        `ID:${i.id} | ${i.name}${i.color ? ` (${i.color})` : ''} | ${i.category}${i.subcategory ? `/${i.subcategory}` : ''}`
      ).join('\n')
    : 'No items in wardrobe yet.'

  const prompt = `You are a personal stylist analyzing a potential clothing purchase for your client.

STYLE PROFILE:
${style_profile || 'No style profile provided — use what you can infer from the wardrobe.'}

EXISTING WARDROBE (${items.length} items):
${itemList}

Look at the clothing item in the image and return a JSON analysis. Be specific, honest, and practical.

Return ONLY a JSON object with exactly these fields:
{
  "verdict": "buy" | "maybe" | "skip",
  "style_match": <integer 0-100>,
  "pros": ["<3-5 word reason it works>", ...],
  "concerns": ["<3-5 word concern>", ...],
  "style_analysis": "<2-3 sentences: does this item fit her aesthetic, vibe, and personal style? Reference her style profile specifically.>",
  "closet_compatibility": "<2-3 sentences: how versatile is this with her existing wardrobe? How many items does it work with?>",
  "pairing_items": [
    { "id": "<exact item id from wardrobe>", "name": "<item name>", "reason": "<why these work together in 1 sentence>" }
  ],
  "outfit_ideas": [
    "<specific outfit: item + 2-3 wardrobe pieces by name, describe the vibe>"
  ]
}

Rules:
- style_match: score 0-100 based on three specific questions: (1) Does this item match her style profile — her aesthetic, colours, silhouettes? (2) How many items in her existing wardrobe does it actually pair with — concretely count them? (3) Does it fill a genuine gap or duplicate something she already has? A low answer on any of these should pull the score down significantly. Do not default to a high number — if the wardrobe context is thin or the item is a poor fit, score accordingly.
- verdict is derived from style_match: 80+ = "buy", 50-79 = "maybe", below 50 = "skip"
- pros: 3-5 short bullets (≤5 words each) — why it works: style, versatility, gap it fills
- concerns: 0-3 short bullets (≤5 words each) — honest issues; empty array [] if none
- pairing_items: pick 3-5 of the best matches from the wardrobe using exact IDs — skip if wardrobe is empty
- outfit_ideas: 2-3 complete looks using this new piece + existing wardrobe items by name
- Be honest — if it doesn't work, say so clearly`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: (media_type ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
              data: image_base64,
            },
          },
          { type: 'text', text: prompt },
        ],
      }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}'
    const clean = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed: AnalysisResult = JSON.parse(clean)

    // Ensure pairing_items only references valid IDs
    const validIds = new Set(items.map(i => i.id))
    parsed.pairing_items = (parsed.pairing_items ?? []).filter(p => validIds.has(p.id))

    // Guard against the model omitting fields or returning an out-of-enum verdict
    const safe: AnalysisResult = {
      verdict: (['buy', 'maybe', 'skip'] as const).includes(parsed.verdict) ? parsed.verdict : 'maybe',
      style_match: typeof parsed.style_match === 'number' ? parsed.style_match : 0,
      pros: parsed.pros ?? [],
      concerns: parsed.concerns ?? [],
      style_analysis: parsed.style_analysis ?? '',
      closet_compatibility: parsed.closet_compatibility ?? '',
      pairing_items: parsed.pairing_items,
      outfit_ideas: parsed.outfit_ideas ?? [],
    }

    return res.status(200).json(safe)
  } catch (err) {
    console.error('analyze-purchase error:', err)
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Analysis failed' })
  }
}
