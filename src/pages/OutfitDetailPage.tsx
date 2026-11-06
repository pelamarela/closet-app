import { motion } from 'motion/react'
import { rise } from '../design/rise'
import { SafeImg } from '../design/SafeImg'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useOutfitMutations } from '../hooks/useOutfitMutations'
import type { Outfit, Item } from '../types/database'
import { outfitTitle } from '../lib/outfitTitle'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { T, fS, fM, V4Icon, V4Bar, Btn, Pill, Disp, Body, V4Card } from '../design/kit'
import { catLabel } from '../lib/categoryLabel'
import { R } from '../design/radii'
import Collage from '../design/Collage'

type ItemWithMeta = Item & { signedImageUrl: string | null; wearCount: number }
type RawOutfit = Outfit & { outfit_items: { item_id: string }[] }

const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

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
        })).sort((a, b) => itemIds.indexOf(a.id) - itemIds.indexOf(b.id))
      )
      setLoading(false)
    }
    load()
  }, [id, user])

  const handleDelete = async () => {
    if (!id || !confirm('delete this outfit?')) return
    setDeleting(true); setDeleteError(null)
    try { await deleteOutfit(id); navigate('/outfits') }
    catch (e) { setDeleting(false); setDeleteError(e instanceof Error ? e.message : 'delete failed') }
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

  if (loading) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  }
  if (!outfit) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>not found.</div>
  }

  const d = new Date(outfit.date_worn + 'T00:00:00')
  const dow = DOW[d.getDay()]
  const dateLabel = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toLowerCase()
  const collageItems = items.map(i => ({ id: i.id, name: i.name, category: i.category, signedImageUrl: i.signedImageUrl }))

  // Always show both: the item collage (what was actually worn, piece by
  // piece — includes things a photo wouldn't capture, like fragrance) and,
  // if there is one, the real photo underneath it — never one instead of the other.
  const CollageBlock = (
    <div style={{ width: '100%', position: 'relative' }}>
      <Collage items={collageItems} />
    </div>
  )
  const PhotoBlock = outfitImageUrl ? (
    <div style={{ borderRadius: R.sm, overflow: 'hidden', width: '100%', aspectRatio: isDesktop ? '3/4' : '4/3', position: 'relative', marginTop: 16 }}>
      <img src={outfitImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  ) : null

  // pieces worn on the body and shoes are rows; accessories and the like are a small strip of tiles
  const GARMENT_OR_SHOES = new Set(['top', 'bottom', 'one-piece', 'outerwear', 'shoes'])
  const ORDER: Record<string, number> = { 'one-piece': 0, top: 0, bottom: 1, outerwear: 2, shoes: 3 }
  const rowItems = items.filter(i => GARMENT_OR_SHOES.has(i.category)).sort((x, y) => (ORDER[x.category] ?? 9) - (ORDER[y.category] ?? 9))
  const smallItems = items.filter(i => !GARMENT_OR_SHOES.has(i.category))

  const InfoBlock = (
    <>
      <div>
        <Disp s={isDesktop ? 36 : 28}>{outfitTitle(items.map(i => i.id), items, 'outfit')}</Disp>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <Pill s="sm" on>{dow} {dateLabel}</Pill>
          {outfit.occasion && <Pill s="sm">{outfit.occasion}</Pill>}
        </div>
      </div>
      {outfit.weather && (
        <div style={{ marginTop: 18 }}>
          <V4Card fill={T.white} pad={15} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <V4Icon n="sun" s={18} w={1.7} c={T.ink} />
            <Body s={13} c={T.ink}>{outfit.weather.temp_c}°, {outfit.weather.conditions}{outfit.rating ? `, ${outfit.rating}/5` : ''}</Body>
          </V4Card>
        </div>
      )}
      {items.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            {[...rowItems, ...smallItems].map((item, i) => (
              <motion.button
                key={item.id}
                {...rise(i + 2)}
                onClick={() => navigate(`/wardrobe/${item.id}`)}
                style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 14, padding: 8, background: T.white, border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: 48, height: 60, flexShrink: 0, overflow: 'hidden', background: T.line }}>
                  {item.signedImageUrl && <SafeImg src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: fS, fontSize: 14.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  <div style={{ fontFamily: fS, fontSize: 13, color: T.g500, marginTop: 2 }}>{catLabel(item.category)}, {item.wearCount}×</div>
                </div>
                <V4Icon n="next" s={16} w={1.8} c={T.g400} />
              </motion.button>
            ))}
          </div>
        </div>
      )}
      {outfit.notes && (
        <div style={{ marginTop: 20 }}>
          <V4Card pad={16}><Body s={14} c={T.ink}>{outfit.notes}</Body></V4Card>
        </div>
      )}
    </>
  )

  return (
    <div style={{ paddingBottom: 120 }}>
      {deleteError && (
        <div style={{ padding: '8px 22px', fontFamily: fM, fontSize: 10, color: T.roseDeep, background: T.roseSoft }}>{deleteError}</div>
      )}
      <V4Bar
        back title="month" onBack={() => navigate('/outfits')}
        right={<>
          <button onClick={() => navigate(`/outfits/${id}/edit`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, padding: 4, display: 'flex' }}><V4Icon n="pen" s={20} w={1.6} /></button>
          <button onClick={handleDelete} disabled={deleting} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, padding: 4, display: 'flex', opacity: deleting ? 0.4 : 1 }}><V4Icon n="trash" s={19} w={1.6} /></button>
        </>}
      />
      {isDesktop ? (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 44, alignItems: 'start', padding: '10px 0 0' }}>
          <div style={{ position: 'sticky', top: 'calc(var(--v3-header-h) + 20px)' }}>{CollageBlock}{PhotoBlock}</div>
          <div>{InfoBlock}</div>
        </div>
      ) : (
        <>
          <div style={{ padding: '8px 22px 0' }}>{CollageBlock}{PhotoBlock}</div>
          <div style={{ padding: '18px 22px 0' }}>{InfoBlock}</div>
        </>
      )}
      {/* pinned above the bottom bar, same as the suggest and shop buttons */}
      <div style={{ position: 'fixed', bottom: 'var(--v3-sticky-bottom)', left: 'var(--v3-sidenav-w)', right: 0, padding: '0 22px max(0px, calc(24px - var(--v3-sticky-bottom)))', zIndex: 20, pointerEvents: 'none' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', pointerEvents: 'auto' }}>
          <Btn full icon="repeat" onClick={handleRepeat}>repeat</Btn>
        </div>
      </div>
    </div>
  )
}
