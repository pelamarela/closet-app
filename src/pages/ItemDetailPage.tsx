import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useItemMutations } from '../hooks/useItemMutations'
import { AppBar, SectionLabel, Icon, MONO, UI, INK, RULE } from '../components/ui'
import type { Item } from '../types/database'

type ItemWithStats = Item & {
  signedImageUrl: string | null
  wearCount: number
  lastWorn: string | null
  firstWorn: string | null
  avgPerMonth: number
}

type PairedItem = {
  id: string
  name: string
  category: string
  signedImageUrl: string | null
  count: number
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { archiveItem } = useItemMutations()
  const [item, setItem] = useState<ItemWithStats | null>(null)
  const [pairings, setPairings] = useState<PairedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !user) return
    async function load() {
      setLoading(true)

      const { data: itemData } = await supabase
        .from('items').select('*').eq('id', id!).eq('user_id', user!.id).single()
      if (!itemData) { setLoading(false); return }

      let signedImageUrl: string | null = null
      if (itemData.image_url) {
        const { data: s } = await supabase.storage.from('item-photos').createSignedUrl(itemData.image_url, 3600)
        signedImageUrl = s?.signedUrl ?? null
      }

      const { data: wearRows } = await supabase
        .from('outfit_items').select('outfit_id, outfits(date_worn)').eq('item_id', id!)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dates = (wearRows as any[] ?? []).map((r: any) => r.outfits?.date_worn).filter(Boolean) as string[]
      const wearCount = dates.length
      const sorted = [...dates].sort()
      const lastWorn = sorted[sorted.length - 1] ?? null
      const firstWorn = sorted[0] ?? null
      let avgPerMonth = 0
      if (firstWorn && wearCount > 0) {
        const first = new Date(firstWorn)
        const now = new Date()
        const months = (now.getFullYear() - first.getFullYear()) * 12 + (now.getMonth() - first.getMonth()) + 1
        avgPerMonth = Math.round((wearCount / months) * 10) / 10
      }

      setItem({ ...itemData, signedImageUrl, wearCount, lastWorn, firstWorn, avgPerMonth })

      // Load pairings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const outfitIds = (wearRows as any[] ?? []).map((r: any) => r.outfit_id).filter(Boolean) as string[]
      if (outfitIds.length > 0) {
        const { data: coItems } = await supabase
          .from('outfit_items').select('item_id').in('outfit_id', outfitIds).neq('item_id', id!)

        const freq: Record<string, number> = {}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(coItems as any[] ?? []).forEach((r: any) => {
          freq[r.item_id] = (freq[r.item_id] ?? 0) + 1
        })

        const topIds = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => id)
        if (topIds.length > 0) {
          const { data: pairedData } = await supabase.from('items').select('*').in('id', topIds)
          const paths = (pairedData ?? []).filter(i => i.image_url).map(i => i.image_url as string)
          const urlMap: Record<string, string> = {}
          if (paths.length > 0) {
            const { data: signed } = await supabase.storage.from('item-photos').createSignedUrls(paths, 3600)
            signed?.forEach(({ path, signedUrl }) => { if (path && signedUrl) urlMap[path] = signedUrl })
          }
          setPairings(
            (pairedData ?? []).map(p => ({
              id: p.id, name: p.name, category: p.category,
              signedImageUrl: p.image_url ? (urlMap[p.image_url] ?? null) : null,
              count: freq[p.id] ?? 0,
            }))
          )
        }
      }
      setLoading(false)
    }
    load()
  }, [id, user])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>loading…</span>
      </div>
    )
  }

  if (!item) {
    return <div style={{ padding: '20px', fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.5)' }}>Item not found.</div>
  }

  const attrs: [string, string | null | number][] = [
    ['category',    item.category],
    ['subcategory', item.subcategory],
    ['color',       item.color],
    ['material',    item.material],
    ['pattern',     item.pattern],
    ['brand',       item.brand],
    ['warmth',      `${item.warmth} / 5`],
    ['formality',   `${item.formality} / 5`],
    ['added',       item.created_at.slice(0, 10)],
  ]

  return (
    <div style={{ paddingBottom: 40 }}>
      <AppBar
        title="Closet"
        back
        onBack={() => navigate('/wardrobe')}
        right={
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <button
              onClick={() => navigate(`/wardrobe/${id}/edit`)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK, padding: 4 }}
            >
              <Icon name="edit" size={17} stroke={1.4} />
            </button>
            <button
              onClick={async () => { await archiveItem(id!); navigate('/wardrobe') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.45)', padding: 4 }}
            >
              <Icon name="archive" size={17} stroke={1.4} />
            </button>
          </div>
        }
      />

      {/* Hero image */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          width: '100%', aspectRatio: '1/1',
          border: RULE, borderRadius: 3, overflow: 'hidden', position: 'relative',
        }}>
          {item.signedImageUrl ? (
            <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 14px, #DCD9D3 14px 28px)' }} />
          )}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
            <span style={{
              fontFamily: MONO, fontSize: 9.5, background: INK, color: '#fff',
              padding: '3px 6px', borderRadius: 2, letterSpacing: '0.04em',
            }}>{item.category}</span>
            <span style={{
              fontFamily: MONO, fontSize: 9.5, background: '#fff', color: INK,
              padding: '3px 6px', borderRadius: 2, border: RULE, letterSpacing: '0.04em',
            }}>active</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: '16px 20px 0' }}>
        {item.brand && (
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {item.brand}
          </div>
        )}
        <div style={{ fontFamily: UI, fontSize: 26, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 4, lineHeight: 1.05 }}>
          {item.name}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ margin: '14px 20px 0', border: RULE, borderRadius: 4, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          ['worn',        item.wearCount > 0 ? `${item.wearCount}×` : '—'],
          ['last',        item.lastWorn ?? '—'],
          ['first',       item.firstWorn ?? '—'],
          ['avg / mo',    item.avgPerMonth > 0 ? String(item.avgPerMonth) : '—'],
        ].map(([l, v], i) => (
          <div key={i} style={{ padding: '10px 8px', borderRight: i < 3 ? RULE : 'none' }}>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</div>
            <div style={{ fontFamily: UI, fontSize: 15, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Attributes */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right={
          <button onClick={() => navigate(`/wardrobe/${id}/edit`)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', padding: 0 }}>
            edit ›
          </button>
        }>attributes</SectionLabel>
        <div style={{ borderTop: RULE }}>
          {attrs.filter(([, v]) => v !== null && v !== '' && v !== undefined).map(([k, v], i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '7px 0', borderBottom: RULE,
              fontFamily: MONO, fontSize: 11,
            }}>
              <span style={{ color: 'rgba(0,0,0,0.5)' }}>{k}</span>
              <span style={{ color: INK, fontWeight: 500 }}>{String(v)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pairings */}
      {pairings.length > 0 && (
        <div style={{ padding: '20px 20px 0' }}>
          <SectionLabel right={<span style={{ cursor: 'pointer' }} onClick={() => navigate('/outfits')}>see outfits ›</span>}>often worn with</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {pairings.map(p => (
              <button
                key={p.id}
                onClick={() => navigate(`/wardrobe/${p.id}`)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: '100%', aspectRatio: '3/4', position: 'relative', border: RULE, overflow: 'hidden' }}>
                  {p.signedImageUrl ? (
                    <img src={p.signedImageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 10px, #DCD9D3 10px 20px)' }} />
                  )}
                </div>
                <div style={{ marginTop: 4, fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.55)' }}>{p.count}× together</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
