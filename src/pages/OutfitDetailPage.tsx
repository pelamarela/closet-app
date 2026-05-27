import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useOutfitMutations } from '../hooks/useOutfitMutations'
import { SectionLabel, MONO, UI, INK, RULE } from '../components/ui'
import type { Outfit, Item } from '../types/database'

type ItemWithMeta = Item & {
  signedImageUrl: string | null
  wearCount: number
  lastWorn: string | null
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

      if (raw.image_url) {
        const { data: s } = await supabase.storage.from('item-photos').createSignedUrl(raw.image_url, 3600)
        setOutfitImageUrl(s?.signedUrl ?? null)
      }

      if (itemIds.length === 0) { setLoading(false); return }

      const { data: itemData } = await supabase.from('items').select('*').in('id', itemIds)

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
        <Loader2 className="animate-spin" size={20} style={{ color: 'rgba(0,0,0,0.3)' }} />
      </div>
    )
  }

  if (!outfit) {
    return <div style={{ padding: '20px', fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.5)' }}>Outfit not found.</div>
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* AppBar */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/outfits')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: UI, fontSize: 13, fontWeight: 600,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: INK,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6"/>
            </svg>
            Library
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(0,0,0,0.35)', padding: 4,
              opacity: deleting ? 0.4 : 1,
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div style={{ borderTop: RULE, marginTop: 12 }} />
      </div>

      {/* Title block */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          display: 'flex', alignItems: 'baseline', gap: 8,
        }}>
          {outfit.date_worn}
          {outfit.occasion && (
            <>
              <div style={{ width: 4, height: 4, background: '#DFAFA1', display: 'inline-block' }} />
              {outfit.occasion}
            </>
          )}
        </div>
        <div style={{
          fontFamily: UI, fontSize: 26, fontWeight: 500,
          letterSpacing: '-0.025em', marginTop: 6, lineHeight: 1.05,
        }}>
          {outfit.occasion || 'Outfit'}
          {outfit.occasion && '.'}
        </div>
        {outfit.rating && (
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)', marginTop: 8 }}>
            rated {outfit.rating} / 5
          </div>
        )}
        {outfit.notes && (
          <div style={{
            fontFamily: UI, fontSize: 13, color: 'rgba(0,0,0,0.6)',
            marginTop: 10, fontStyle: 'italic',
          }}>"{outfit.notes}"</div>
        )}
      </div>

      {/* Hero image or item grid */}
      <div style={{ padding: '16px 20px 0' }}>
        {outfitImageUrl ? (
          <img
            src={outfitImageUrl}
            alt="Outfit"
            style={{ width: '100%', aspectRatio: '5/4', objectFit: 'cover', borderRadius: 3, border: RULE, display: 'block' }}
          />
        ) : items.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: items.length === 1 ? '1fr' : 'repeat(2, 1fr)',
            gap: 3, borderRadius: 3, overflow: 'hidden', border: RULE,
          }}>
            {items.slice(0, 4).map(item => (
              <div key={item.id} style={{ aspectRatio: '1/1', background: '#ECEAE6', overflow: 'hidden' }}>
                {item.signedImageUrl
                  ? <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 10px, #DCD9D3 10px 20px)' }} />
                }
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Pieces table */}
      {items.length > 0 && (
        <div style={{ padding: '20px 20px 0' }}>
          <SectionLabel>pieces ({items.length})</SectionLabel>

          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '34px 1fr 60px 14px',
                alignItems: 'center', gap: 12,
                padding: '8px 0', borderBottom: RULE,
              }}
            >
              <div style={{ height: 42, borderRadius: 2, overflow: 'hidden', border: RULE }}>
                {item.signedImageUrl
                  ? <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 8px, #DCD9D3 8px 16px)' }} />
                }
              </div>

              <div>
                <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 500, letterSpacing: '-0.005em', color: INK }}>
                  {item.name}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>
                  {item.id.slice(0, 6)} · {item.category}{item.color ? ` · ${item.color}` : ''}
                </div>
              </div>

              <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.45)', textAlign: 'right' }}>
                worn {item.wearCount}×
              </div>

              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(0,0,0,0.2)' }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
