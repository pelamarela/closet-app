import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Trash2, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useOutfitMutations } from '../hooks/useOutfitMutations'
import type { Outfit, Item } from '../types/database'

type ItemWithMeta = Item & {
  signedImageUrl: string | null
  wearCount: number
  lastWorn: string | null
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function OutfitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { deleteOutfit } = useOutfitMutations()

  const [outfit, setOutfit] = useState<Outfit | null>(null)
  const [items, setItems] = useState<ItemWithMeta[]>([])
  const [outfitImageUrl, setOutfitImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id || !user) return

    async function load() {
      setLoading(true)

      // Fetch outfit + item IDs
      const { data: outfitData } = await supabase
        .from('outfits')
        .select('*, outfit_items(item_id)')
        .eq('id', id!)
        .eq('user_id', user!.id)
        .single()

      if (!outfitData) { setLoading(false); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = outfitData as any
      setOutfit(raw)

      const itemIds: string[] = (raw.outfit_items ?? []).map((oi: { item_id: string }) => oi.item_id)

      // Signed URL for outfit photo
      if (raw.image_url) {
        const { data: s } = await supabase.storage.from('item-photos').createSignedUrl(raw.image_url, 3600)
        setOutfitImageUrl(s?.signedUrl ?? null)
      }

      if (itemIds.length === 0) { setLoading(false); return }

      // Fetch item details
      const { data: itemData } = await supabase
        .from('items')
        .select('*')
        .in('id', itemIds)

      // Fetch wear counts + last worn for each item
      const { data: wearData } = await supabase
        .from('outfit_items')
        .select('item_id, outfits(date_worn)')
        .in('item_id', itemIds)

      const wearMap: Record<string, { count: number; lastWorn: string | null }> = {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wearData as any[] ?? []).forEach((row: any) => {
        const iid = row.item_id
        const date = row.outfits?.date_worn ?? null
        if (!wearMap[iid]) wearMap[iid] = { count: 0, lastWorn: null }
        wearMap[iid].count++
        if (date && (!wearMap[iid].lastWorn || date > wearMap[iid].lastWorn!)) {
          wearMap[iid].lastWorn = date
        }
      })

      // Signed URLs for item photos
      const paths = (itemData ?? []).filter(i => i.image_url).map(i => i.image_url as string)
      const signedUrlMap: Record<string, string> = {}
      if (paths.length > 0) {
        const { data: signed } = await supabase.storage.from('item-photos').createSignedUrls(paths, 3600)
        signed?.forEach(({ path, signedUrl }) => { if (path && signedUrl) signedUrlMap[path] = signedUrl })
      }

      setItems(
        (itemData ?? []).map(item => ({
          ...item,
          signedImageUrl: item.image_url ? (signedUrlMap[item.image_url] ?? null) : null,
          wearCount: wearMap[item.id]?.count ?? 0,
          lastWorn: wearMap[item.id]?.lastWorn ?? null,
        }))
      )
      setLoading(false)
    }

    load()
  }, [id, user])

  const handleDelete = async () => {
    if (!id || !confirm('Delete this outfit? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteOutfit(id)
      navigate('/outfits')
    } catch {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-stone-400" size={24} />
      </div>
    )
  }

  if (!outfit) {
    return <div className="p-4 text-stone-500 text-sm">Outfit not found.</div>
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between z-10">
        <button onClick={() => navigate('/outfits')} className="p-1 -ml-1">
          <ArrowLeft size={20} className="text-stone-600" />
        </button>
        <h1 className="font-semibold text-stone-800">Outfit</h1>
        <button onClick={handleDelete} disabled={deleting} className="p-1 text-red-400 disabled:opacity-40">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Outfit photo or item grid preview */}
        {outfitImageUrl ? (
          <img src={outfitImageUrl} alt="Outfit" className="w-full aspect-video object-cover rounded-2xl" />
        ) : items.length > 0 ? (
          <div className={`grid gap-1 rounded-2xl overflow-hidden ${items.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {items.slice(0, 4).map(item => (
              <div key={item.id} className="aspect-square bg-stone-100">
                {item.signedImageUrl
                  ? <img src={item.signedImageUrl} alt={item.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">{item.name}</div>
                }
              </div>
            ))}
          </div>
        ) : null}

        {/* Meta */}
        <div>
          <p className="text-stone-500 text-sm">{formatDate(outfit.date_worn)}</p>
          {outfit.occasion && (
            <p className="text-stone-800 font-medium mt-0.5">{outfit.occasion}</p>
          )}
          {outfit.rating && (
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: outfit.rating }).map((_, i) => (
                <Star key={i} size={14} className="text-stone-600 fill-stone-600" />
              ))}
              {Array.from({ length: 5 - outfit.rating }).map((_, i) => (
                <Star key={i} size={14} className="text-stone-300" />
              ))}
            </div>
          )}
          {outfit.notes && (
            <p className="text-stone-600 text-sm mt-3 italic">"{outfit.notes}"</p>
          )}
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-stone-700 mb-3">Items ({items.length})</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                    {item.signedImageUrl
                      ? <img src={item.signedImageUrl} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-800 text-sm font-medium truncate">{item.name}</p>
                    <p className="text-stone-400 text-xs mt-0.5">
                      Worn {item.wearCount}×
                      {item.lastWorn && ` · last on ${new Date(item.lastWorn + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
