import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'node:crypto'

// Read-only feed of the newest outfit for the pelamarela landing page.
// The closet data is private, so this uses the service key and is guarded by a
// shared token (LANDING_TOKEN) instead of a user session. It returns item photos
// as short-lived signed links; the landing downloads and keeps its own copies.
// Stays one file on purpose: Vercel does not bundle cross-file imports for api/*.ts.

const ORDER = ['one-piece', 'top', 'bottom', 'outerwear', 'shoes', 'accessory', 'fragrance']

function tokenOk(req: VercelRequest): boolean {
  const expected = process.env.LANDING_TOKEN
  const header = req.headers.authorization
  if (!expected || !header?.startsWith('Bearer ')) return false
  const a = Buffer.from(header.slice(7))
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' })
  if (!tokenOk(req)) return res.status(401).json({ error: 'unauthorized' })

  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return res.status(500).json({ error: 'server is not configured' })
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  // "latest added" means the newest row, not the newest date worn
  let query = supabase
    .from('outfits')
    .select('id, date_worn, created_at, outfit_items(item_id)')
    .order('created_at', { ascending: false })
    .limit(1)
  if (process.env.LANDING_USER_ID) query = query.eq('user_id', process.env.LANDING_USER_ID)
  const { data: outfits, error } = await query
  if (error) return res.status(500).json({ error: 'could not read outfits' })

  const outfit = outfits?.[0]
  if (!outfit) return res.status(200).json({ outfit: null, items: [] })

  const ids = (outfit.outfit_items ?? []).map((o: { item_id: string }) => o.item_id)
  const { data: rows, error: itemsError } = await supabase
    .from('items')
    .select('id, category, image_url')
    .in('id', ids)
  if (itemsError) return res.status(500).json({ error: 'could not read items' })

  const withPhoto = (rows ?? []).filter((r) => r.image_url)
  const paths = withPhoto.map((r) => r.image_url as string)
  const { data: signed } = paths.length
    ? await supabase.storage.from('item-photos').createSignedUrls(paths, 300)
    : { data: [] }
  const urlOf = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]))

  const items = withPhoto
    .map((r) => ({ id: r.id, category: r.category, photo: r.image_url as string, url: urlOf.get(r.image_url as string) ?? null }))
    .filter((i) => i.url)
    .sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category))

  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({
    outfit: { id: outfit.id, date_worn: outfit.date_worn, created_at: outfit.created_at },
    items,
  })
}
