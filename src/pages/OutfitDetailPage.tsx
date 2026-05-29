import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useOutfitMutations } from '../hooks/useOutfitMutations'
import { AppBar, SectionLabel, Icon, MonoKV, MONO, UI, INK, RULE, BLUSH } from '../components/ui'
import type { Outfit, Item } from '../types/database'

type ItemWithMeta = Item & { signedImageUrl: string | null; wearCount: number }

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
      const { data: raw } = await supabase
        .from('outfits').select('*, outfit_items(item_id)').eq('id', id!).eq('user_id', user!.id).single()
      if (!raw) { setLoading(false); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setOutfit(raw as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const itemIds: string[] = ((raw as any).outfit_items ?? []).map((oi: { item_id: string }) => oi.item_id)

      if ((raw as any).image_url) {
        const { data: s } = await supabase.storage.from('item-photos').createSignedUrl((raw as any).image_url, 3600)
        setOutfitImageUrl(s?.signedUrl ?? null)
      }

      if (itemIds.length === 0) { setLoading(false); return }

      const { data: itemData } = await supabase.from('items').select('*').in('id', itemIds)
      const { data: wearData } = await supabase.from('outfit_items').select('item_id').in('item_id', itemIds)
      const wearCount: Record<string, number> = {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wearData as any[] ?? []).forEach((r: any) => { wearCount[r.item_id] = (wearCount[r.item_id] ?? 0) + 1 })

      const paths = (itemData ?? []).filter(i => i.image_url).map(i => i.image_url as string)
      const urlMap: Record<string, string> = {}
      if (paths.length > 0) {
        const { data: signed } = await supabase.storage.from('item-photos').createSignedUrls(paths, 3600)
        signed?.forEach(({ path, signedUrl }) => { if (path && signedUrl) urlMap[path] = signedUrl })
      }

      setItems(
        (itemData ?? []).map(item => ({
          ...item,
          signedImageUrl: item.image_url ? (urlMap[item.image_url] ?? null) : null,
          wearCount: wearCount[item.id] ?? 0,
        }))
      )
      setLoading(false)
    }
    load()
  }, [id, user])

  const handleDelete = async () => {
    if (!id || !confirm('Delete this outfit?')) return
    setDeleting(true)
    try { await deleteOutfit(id); navigate('/outfits') }
    catch { setDeleting(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>loading…</span>
    </div>
  )

  if (!outfit) return <div style={{ padding: '20px', fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.5)' }}>Not found.</div>

  const dateStr = outfit.date_worn
  const d = new Date(dateStr + 'T00:00:00')
  const dow = ['sun','mon','tue','wed','thu','fri','sat'][d.getDay()]

  return (
    <div style={{ paddingBottom: 40 }}>
      <AppBar
        title="Library"
        back
        onBack={() => navigate('/outfits')}
        right={
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <button
              onClick={() => navigate(`/outfits/${id}/edit`)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK, padding: 4 }}
            >
              <Icon name="edit" size={17} stroke={1.4} />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.45)', padding: 4, opacity: deleting ? 0.4 : 1 }}
            >
              <Icon name="trash" size={16} stroke={1.4} />
            </button>
          </div>
        }
      />

      {/* Title block */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8,
          fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {dateStr} · {dow}
          {outfit.occasion && (
            <>
              <div style={{ width: 4, height: 4, background: BLUSH, display: 'inline-block', flexShrink: 0 }} />
              {outfit.occasion}
            </>
          )}
        </div>
        <div style={{ fontFamily: UI, fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 8, lineHeight: 1.05 }}>
          {outfit.occasion ? `${outfit.occasion}.` : 'Outfit.'}
        </div>
        {outfit.notes && (
          <div style={{ fontFamily: UI, fontSize: 13, color: 'rgba(0,0,0,0.6)', marginTop: 10, fontStyle: 'italic' }}>"{outfit.notes}"</div>
        )}
      </div>

      {/* Hero */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{
          width: '100%', aspectRatio: '5/4',
          border: RULE, borderRadius: 3, overflow: 'hidden', position: 'relative',
        }}>
          {outfitImageUrl ? (
            <img src={outfitImageUrl} alt="Outfit" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : items.length > 0 ? (() => {
            const SMALL_CAT = new Set(['shoes', 'accessory']);
            const main = items.filter(i => !SMALL_CAT.has(i.category));
            const small = items.filter(i => SMALL_CAT.has(i.category));
            const m = main.length, s = small.length;
            const total = m + s;
            const G = 3;

            const cell = (item: typeof items[0], pos = 'center', style: React.CSSProperties = {}) => (
              <div key={item.id} style={{ overflow: 'hidden', background: '#ECEAE6', ...style }}>
                {item.signedImageUrl
                  ? <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 10px, #DCD9D3 10px 20px)' }} />
                }
              </div>
            );

            // 1 item: single full-width cell
            if (total === 1) return cell(items[0], m > 0 ? 'top center' : 'center', { height: '100%' });

            // All same category OR total=2 (any split): even 2-col grid
            if (m === 0 || s === 0 || total === 2) {
              const all = [...main, ...small];
              const pos = m > 0 ? 'top center' : 'center';
              const cols = 2;
              const rows = Math.ceil(all.length / cols);
              return (
                <div style={{ display: 'grid', height: '100%', gap: G, gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
                  {all.map((item, i) => cell(item, pos, all.length % 2 !== 0 && i === all.length - 1 ? { gridColumn: '1 / -1' } : {}))}
                </div>
              );
            }

            // Mixed main + secondary → two-pane layout
            // leftPct and rCols per sketch + generalised rules for unlisted combos
            let leftPct: number;
            let rCols: number;
            if (m === 1) {
              // 1 main (one-piece, outerwear, etc.)
              // s=4 → 2×2 right (40% right, 2-col); s=5 → wider main (75%), 1-col; s=6+ → 2-col again
              leftPct = s === 5 ? 75 : 60;
              rCols   = s === 4 || s >= 6 ? 2 : 1;
            } else if (m === 2) {
              // 2 mains (top + bottom)
              leftPct = s <= 1 ? 65 : s === 2 ? 50 : s >= 5 ? 57 : 60;
              rCols   = s >= 5 ? 2 : 1;
            } else {
              // 3+ mains
              leftPct = s <= 1 ? 68 : s >= 5 ? 57 : 63;
              rCols   = s >= 5 ? 2 : 1;
            }
            const rRows = Math.ceil(s / rCols);

            return (
              <div style={{ display: 'flex', height: '100%', gap: G }}>
                <div style={{ flex: `0 0 ${leftPct}%`, display: 'flex', flexDirection: 'column', gap: G }}>
                  {main.map(item => cell(item, 'top center', { flex: 1, minHeight: 0 }))}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: G, gridTemplateColumns: `repeat(${rCols}, 1fr)`, gridTemplateRows: `repeat(${rRows}, 1fr)` }}>
                  {small.map((item, i) => cell(item, 'center',
                    rCols > 1 && s % rCols !== 0 && i === s - 1 ? { gridColumn: '1 / -1' } : {}
                  ))}
                </div>
              </div>
            );
          })() : (
            <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 14px, #DCD9D3 14px 28px)' }} />
          )}

          {/* Weather overlay */}
          {outfit.weather && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              display: 'flex', flexDirection: 'column', gap: 2,
              background: '#fff', padding: '4px 6px',
            }}>
              <MonoKV k="temp" v={`${outfit.weather.temp_c}°`} />
              <MonoKV k="cond" v={outfit.weather.conditions} />
              {outfit.rating && <MonoKV k="rate" v={`${outfit.rating}/5`} accent />}
            </div>
          )}
        </div>
      </div>

      {/* Pieces */}
      {items.length > 0 && (
        <div style={{ padding: '20px 20px 0' }}>
          <SectionLabel>pieces ({items.length})</SectionLabel>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/wardrobe/${item.id}`)}
              style={{
                width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                display: 'grid', gridTemplateColumns: '34px 1fr 60px 14px',
                alignItems: 'center', gap: 12,
                paddingTop: 8, paddingBottom: 8, borderBottom: RULE,
              }}
            >
              <div style={{ height: 42, borderRadius: 2, overflow: 'hidden', border: RULE }}>
                {item.signedImageUrl
                  ? <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 8px, #DCD9D3 8px 16px)' }} />
                }
              </div>
              <div>
                <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 500, letterSpacing: '-0.005em', color: INK }}>{item.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>
                  {item.category}{item.color ? ` · ${item.color}` : ''}
                </div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.45)', textAlign: 'right' }}>
                worn {item.wearCount}×
              </div>
              <Icon name="forward" size={12} stroke={1.2} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
