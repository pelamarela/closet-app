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

  const textBlock = message.content.find(b => b.type === 'text')
  const profile = textBlock ? textBlock.text.trim() : ''
  return res.json({ profile })
}
