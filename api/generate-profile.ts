import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { outfits, items } = req.body as {
    outfits: Array<{ date: string; occasion?: string | null; item_ids: string[] }>
    items: Array<{ id: string; name: string; category: string; color?: string | null; brand?: string | null; subcategory?: string | null }>
  }

  if (!outfits?.length) return res.status(400).json({ error: 'No outfits provided' })

  const itemMap = new Map(items.map(i => [i.id, i]))

  const outfitSummaries = outfits.slice(0, 40).map(o => {
    const pieces = o.item_ids
      .map(id => itemMap.get(id))
      .filter(Boolean)
      .map(i => `${i!.name}${i!.color ? ` (${i!.color})` : ''}`)
      .join(', ')
    return `${o.date}${o.occasion ? ` — ${o.occasion}` : ''}: ${pieces}`
  }).join('\n')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Analyze these outfit logs and write a concise personal style profile (3-5 sentences). Focus on: recurring colours/silhouettes, preferred brands if visible, how formality shifts by occasion, and any patterns in what gets worn together. Write in first person as if the person wrote it themselves. No headers, no bullet points — flowing prose only.

OUTFIT HISTORY:
${outfitSummaries}`,
    }],
  })

  const profile = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  return res.json({ profile })
}
