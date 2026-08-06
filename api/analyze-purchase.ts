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

  const { image_base64, media_type, items, style_profile, color_season } = req.body as {
    image_base64: string
    media_type?: string
    items: WardrobeItem[]
    style_profile: string
    color_season?: string | null
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
${colorSeasonBlock(color_season)}
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
- style_match: score 0-100 based on three specific questions: (1) Does this item match her style profile — her aesthetic, colours, silhouettes? (2) How many items in her existing wardrobe does it actually pair with — concretely count them? (3) Does it fill a genuine gap or duplicate something she already has? A low answer on any of these should pull the score down significantly. Do not default to a high number — if the wardrobe context is thin or the item is a poor fit, score accordingly.${color_season ? '\n- If a color season is provided, weigh whether the item\'s color sits within that palette — a clear mismatch (e.g. a muted-palette client considering a neon/icy-bright piece) should pull style_match down and be named as a concern; mention the color-season fit explicitly in style_analysis.' : ''}
- verdict is derived from style_match: 80+ = "buy", 50-79 = "maybe", below 50 = "skip"
- pros: 3-5 short bullets (≤5 words each) — why it works: style, versatility, gap it fills
- concerns: 0-3 short bullets (≤5 words each) — honest issues; empty array [] if none
- pairing_items: pick 3-5 of the best matches from the wardrobe using exact IDs — skip if wardrobe is empty
- outfit_ideas: 2-3 complete looks using this new piece + existing wardrobe items by name
- Be honest — if it doesn't work, say so clearly`

  const responseSchema = {
    type: 'object',
    properties: {
      verdict: { type: 'string', enum: ['buy', 'maybe', 'skip'] },
      style_match: { type: 'integer' },
      pros: { type: 'array', items: { type: 'string' } },
      concerns: { type: 'array', items: { type: 'string' } },
      style_analysis: { type: 'string' },
      closet_compatibility: { type: 'string' },
      pairing_items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            reason: { type: 'string' },
          },
          required: ['id', 'name', 'reason'],
          additionalProperties: false,
        },
      },
      outfit_ideas: { type: 'array', items: { type: 'string' } },
    },
    required: ['verdict', 'style_match', 'pros', 'concerns', 'style_analysis', 'closet_compatibility', 'pairing_items', 'outfit_ideas'],
    additionalProperties: false,
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2048,
      thinking: { type: 'disabled' },
      output_config: { format: { type: 'json_schema', schema: responseSchema } },
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

    const textBlock = response.content.find(b => b.type === 'text')
    const raw = textBlock ? textBlock.text.trim() : '{}'
    const clean = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed: AnalysisResult = JSON.parse(clean)

    // Ensure pairing_items only references valid IDs
    const validIds = new Set(items.map(i => i.id))
    parsed.pairing_items = (parsed.pairing_items ?? []).filter(p => validIds.has(p.id))

    // Derive verdict from style_match directly (per the prompt's own rule) instead of
    // trusting the model's separate verdict field, so the label always matches the score.
    const styleMatch = typeof parsed.style_match === 'number' ? parsed.style_match : 0
    const safe: AnalysisResult = {
      verdict: styleMatch >= 80 ? 'buy' : styleMatch >= 50 ? 'maybe' : 'skip',
      style_match: styleMatch,
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
