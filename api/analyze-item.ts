import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { image_base64, media_type } = req.body as {
    image_base64: string
    media_type?: string
  }

  if (!image_base64) return res.status(400).json({ error: 'image_base64 required' })

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      temperature: 0,
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
  "category": "top | bottom | one-piece | outerwear | shoes | accessory",
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
Use "outerwear" for jackets and coats.`,
          },
        ],
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}'
    // Strip markdown code fences if Claude adds them
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(clean)
    return res.status(200).json(parsed)
  } catch (err) {
    console.error('analyze-item error:', err)
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Analysis failed' })
  }
}
