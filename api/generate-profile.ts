import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { outfits = [], items = [] } = req.body ?? {}

  if (outfits.length === 0) {
    return res.status(400).json({ error: 'No outfit data provided' })
  }

  // Summarise outfit history for the prompt
  const itemMap: Record<string, { name: string; category: string; color: string | null; brand: string | null }> = {}
  for (const item of items) itemMap[item.id] = item

  const outfitLines = outfits.slice(0, 30).map((o: {
    date_worn: string
    occasion?: string | null
    rating?: number | null
    notes?: string | null
    outfit_items?: { item_id: string }[]
  }) => {
    const pieces = (o.outfit_items ?? [])
      .map(oi => itemMap[oi.item_id])
      .filter(Boolean)
      .map(i => `${i.category}${i.color ? ` (${i.color})` : ''}${i.brand ? ` by ${i.brand}` : ''}`)
      .join(', ')
    return `- ${o.date_worn}${o.occasion ? ` [${o.occasion}]` : ''}: ${pieces || 'no pieces recorded'}${o.rating ? ` · rated ${o.rating}/5` : ''}${o.notes ? ` · "${o.notes}"` : ''}`
  }).join('\n')

  const prompt = `You are analysing someone's outfit history to write a concise personal style profile.

Here are their recent outfits:
${outfitLines}

Write a first-person style profile (2–4 sentences, max 300 characters) that captures:
- The occasions they dress for
- Their colour and category preferences
- Any patterns in brands, formality, or mood

Be specific and grounded in what the data actually shows. Do not be generic. Write in the person's voice, as if they wrote it themselves. Output only the profile text, no preamble.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const description = (message.content[0] as { type: string; text: string }).text.trim()
  return res.status(200).json({ description })
}
