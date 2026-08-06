import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Vercel does not bundle cross-file imports for api/*.ts on this project
// (ESM "type": "module" + per-file transpile, no dependency resolution) —
// this must stay inlined rather than imported from a shared module.
async function requireUser(req: VercelRequest): Promise<boolean> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return false
  const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)
  const { data, error } = await supabase.auth.getUser(authHeader.slice(7))
  return !error && !!data.user
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!(await requireUser(req))) return res.status(401).json({ error: 'Unauthorized' })

  const { image_base64, media_type } = req.body as {
    image_base64: string
    media_type?: string
  }

  if (!image_base64) return res.status(400).json({ error: 'image_base64 required' })

  const responseSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      category: { type: 'string', enum: ['top', 'bottom', 'one-piece', 'outerwear', 'shoes', 'accessory', 'fragrance'] },
      color: { type: 'string' },
      subcategory: { type: 'string' },
      warmth: { type: 'integer' },
      formality: { type: 'integer' },
      brand: { type: 'string' },
      material: { type: 'string' },
    },
    required: ['name', 'category', 'color', 'subcategory', 'warmth', 'formality', 'brand', 'material'],
    additionalProperties: false,
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      temperature: 0,
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
          {
            type: 'text',
            text: `Analyze this clothing item photo. Return ONLY a JSON object — no markdown, no explanation — with exactly these fields:
{
  "name": "descriptive name, e.g. Black Linen Blazer or Adidas Samba White",
  "category": "top | bottom | one-piece | outerwear | shoes | accessory | fragrance",
  "color": "primary color in 1-2 words, lowercase",
  "subcategory": "specific type e.g. blazer/midi skirt/sneaker/tote/jumpsuit/co-ord (for one-piece: specify dress/jumpsuit/co-ord)",
  "warmth": 1-5,
  "formality": 1-5,
  "brand": "brand name if visible on item, else empty string",
  "material": "e.g. cotton, wool, leather — if determinable, else empty string"
}
Warmth: 1=very light/summer, 3=mid-season, 5=very heavy/winter.
Formality: 1=gym/casual, 3=smart casual, 5=black tie.
Use "one-piece" for dresses, jumpsuits, co-ords, and matching sets.
Use "outerwear" for jackets and coats.
Use "fragrance" for perfumes, colognes, eau de parfum/toilette bottles.`,
          },
        ],
      }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    const text = textBlock ? textBlock.text.trim() : '{}'
    // Strip markdown code fences if Claude adds them
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(clean)
    return res.status(200).json(parsed)
  } catch (err) {
    console.error('analyze-item error:', err)
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Analysis failed' })
  }
}
