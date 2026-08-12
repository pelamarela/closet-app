import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useOutfitMutations } from '../hooks/useOutfitMutations'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { AppBar, SectionLabel, Icon, MonoKV, MONO, UI, INK, RULE, BLUSH, ACCENT } from '../components/ui'
import type { Outfit, Item } from '../types/database'
import ItemCollage from '../components/ItemCollage'
import PieceRow from '../components/PieceRow'
import Spinner from '../components/Spinner'
import FixedBar from '../components/FixedBar'
import LogOutfitButton from '../components/LogOutfitButton'

type ItemWithMeta = Item & { signedImageUrl: string | null; wearCount: number }
type RawOutfit = Outfit & { outfit_items: { item_id: string }[] }

export default function OutfitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { deleteOutfit } = useOutfitMutations()
  const { isDesktop } = useBreakpoint()

  const [outfit, setOutfit] = useState<Outfit | null>(null)
  const [items, setItems] = useState<ItemWithMeta[]>([])
  const [outfitImageUrl, setOutfitImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !user) return
    async function load() {
      setLoading(true)
      const { data: raw } = await supabase
        .from('outfits').select('*, outfit_items(item_id)').eq('id', id!).eq('user_id', user!.id).single<RawOutfit>()
      if (!raw) { setLoading(false); return }

      setOutfit(raw)
      const itemIds: string[] = (raw.outfit_items ?? []).map(oi => oi.item_id)

      if (raw.image_url) {
        const { data: s } = await supabase.storage.from('item-photos').createSignedUrl(raw.image_url, 3600)
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
    setDeleting(true); setDeleteError(null)
    try { await deleteOutfit(id); navigate('/outfits') }
    catch (e) { setDeleting(false); setDeleteError(e instanceof Error ? e.message : 'Delete failed') }
  }

  const handleRepeat = () => {
    navigate('/outfits/new', {
      state: {
        preselectedIds: items.map(i => i.id),
        occasion: outfit?.occasion ?? '',
        date: new Date().toISOString().slice(0, 10),
      },
    })
  }

  if (loading) return <Spinner />

  if (!outfit) return <div style={{ padding: '20px', fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.5)' }}>Not found.</div>

  const dateStr = outfit.date_worn
  const d = new Date(dateStr + 'T00:00:00')
  const dow = ['sun','mon','tue','wed','thu','fri','sat'][d.getDay()]

  const clothingItems = items.filter(i => i.category !== 'fragrance')
  const fragranceItems = items.filter(i => i.category === 'fragrance')

  // ── Items collage ────────────────────────────────────────────────────────────
  const Collage = (
    <div style={{ position: 'relative' }}>
      <ItemCollage items={items} />
      {!outfitImageUrl && outfit.weather && (
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 2, background: '#fff', padding: '4px 6px' }}>
          <MonoKV k="temp" v={`${outfit.weather.temp_c}°`} />
          <MonoKV k="cond" v={outfit.weather.conditions} />
          {outfit.rating && <MonoKV k="rate" v={`${outfit.rating}/5`} accent />}
        </div>
      )}
    </div>
  )

  // ── Title + meta ─────────────────────────────────────────────────────────────
  const TitleBlock = (
    <div>
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
  )

  // ── Pieces list ──────────────────────────────────────────────────────────────
  const PiecesList = items.length > 0 ? (
    <div style={{ marginTop: isDesktop ? 24 : 0 }}>
      <SectionLabel>pieces ({clothingItems.length})</SectionLabel>
      {clothingItems.map(item => (
        <PieceRow key={item.id} item={item} right={`worn ${item.wearCount}×`} />
      ))}
      {fragranceItems.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <SectionLabel>fragrance ({fragranceItems.length})</SectionLabel>
          {fragranceItems.map(item => (
            <PieceRow key={item.id} item={item} right={`worn ${item.wearCount}×`} />
          ))}
        </div>
      )}
    </div>
  ) : null

  return (
    <div style={{ paddingBottom: isDesktop ? 40 : 100 }}>
      {deleteError && (
        <div style={{ padding: '8px 20px', fontFamily: MONO, fontSize: 10, color: ACCENT, background: 'rgba(156,85,68,0.07)' }}>
          {deleteError}
        </div>
      )}
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

      {isDesktop ? (
        /* Desktop: 2-column */
        <div style={{ display: 'grid', gridTemplateColumns: '55% 45%', gap: 0, margin: '20px 20px 0', alignItems: 'start' }}>
          {/* Left: collage + optional outfit photo */}
          <div style={{ minWidth: 0, paddingRight: 28 }}>
            {Collage}
            {outfitImageUrl && (
              <div style={{ marginTop: 16, width: '100%', aspectRatio: '5/4', border: RULE, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                <img src={outfitImageUrl} alt="Outfit" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {outfit.weather && (
                  <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 2, background: '#fff', padding: '4px 6px' }}>
                    <MonoKV k="temp" v={`${outfit.weather.temp_c}°`} />
                    <MonoKV k="cond" v={outfit.weather.conditions} />
                    {outfit.rating && <MonoKV k="rate" v={`${outfit.rating}/5`} accent />}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Right: title + pieces */}
          <div style={{ minWidth: 0 }}>
            {TitleBlock}
            {PiecesList}
            <div style={{ marginTop: 24 }}>
              <LogOutfitButton full onClick={handleRepeat}>Repeat outfit</LogOutfitButton>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile: stacked */
        <>
          <div style={{ padding: '20px 20px 0' }}>{TitleBlock}</div>
          <div style={{ padding: '16px 20px 0' }}>{Collage}</div>
          {PiecesList && <div style={{ padding: '20px 20px 0' }}>{PiecesList}</div>}
          {outfitImageUrl && (
            <div style={{ padding: '20px 20px 0' }}>
              <div style={{ width: '100%', aspectRatio: '5/4', border: RULE, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                <img src={outfitImageUrl} alt="Outfit" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {outfit.weather && (
                  <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 2, background: '#fff', padding: '4px 6px' }}>
                    <MonoKV k="temp" v={`${outfit.weather.temp_c}°`} />
                    <MonoKV k="cond" v={outfit.weather.conditions} />
                    {outfit.rating && <MonoKV k="rate" v={`${outfit.rating}/5`} accent />}
                  </div>
                )}
              </div>
            </div>
          )}
          <FixedBar>
            <LogOutfitButton full onClick={handleRepeat}>Repeat outfit</LogOutfitButton>
          </FixedBar>
        </>
      )}
    </div>
  )
}
