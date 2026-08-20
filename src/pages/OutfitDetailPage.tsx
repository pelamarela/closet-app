import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useOutfitMutations } from '../hooks/useOutfitMutations'
import type { Outfit, Item } from '../types/database'
import { outfitTitle } from '../components/ui'
import { T, fS, fM, V4Icon, V4Bar, Btn, Disp, Body, Mono, SecH, V4Card } from '../design/kit'
import Collage from '../design/Collage'

type ItemWithMeta = Item & { signedImageUrl: string | null; wearCount: number }
type RawOutfit = Outfit & { outfit_items: { item_id: string }[] }

const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

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

  if (loading) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  }
  if (!outfit) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>Not found.</div>
  }

  const d = new Date(outfit.date_worn + 'T00:00:00')
  const dow = DOW[d.getDay()]
  const dateLabel = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toLowerCase()
  const collageItems = items.map(i => ({ id: i.id, name: i.name, category: i.category, signedImageUrl: i.signedImageUrl }))

  return (
    <div style={{ paddingBottom: 40 }}>
      {deleteError && (
        <div style={{ padding: '8px 22px', fontFamily: fM, fontSize: 10, color: T.roseDeep, background: T.roseSoft }}>{deleteError}</div>
      )}
      <V4Bar
        back title="Month" onBack={() => navigate('/outfits')}
        right={<>
          <button onClick={() => navigate(`/outfits/${id}/edit`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, padding: 4, display: 'flex' }}><V4Icon n="pen" s={20} w={1.6} /></button>
          <button onClick={handleDelete} disabled={deleting} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, padding: 4, display: 'flex', opacity: deleting ? 0.4 : 1 }}><V4Icon n="trash" s={19} w={1.6} /></button>
        </>}
      />
      <div style={{ padding: '8px 22px 0' }}>
        <div style={{ width: '100%', aspectRatio: '4/3', position: 'relative' }}>
          {outfitImageUrl ? (
            <img src={outfitImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <Collage items={collageItems} fill />
          )}
        </div>
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          {outfit.occasion && <Mono s={11} c={T.cocoa} style={{ textTransform: 'uppercase' }}>{outfit.occasion}</Mono>}
          <Mono s={11}>{dateLabel} · {dow}</Mono>
        </div>
        <Disp s={25}>{outfitTitle(items.map(i => i.id), items, 'Outfit.')}</Disp>
        <Body s={13} style={{ marginTop: 5 }}>{items.length} piece{items.length === 1 ? '' : 's'}</Body>
      </div>
      {outfit.weather && (
        <div style={{ padding: '18px 22px 0' }}>
          <V4Card fill={T.peachSoft} shadow={false} pad={15} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <V4Icon n="sun" s={18} w={1.7} c={T.cocoa} />
            <Body s={13} c={T.cocoa}>{outfit.weather.temp_c}° and {outfit.weather.conditions} that day.{outfit.rating && ` Rated ${outfit.rating}/5.`}</Body>
          </V4Card>
        </div>
      )}
      <div style={{ padding: '18px 22px 0' }}>
        <Btn full icon="repeat" onClick={handleRepeat}>Wear again</Btn>
      </div>
      {items.length > 0 && (
        <div style={{ padding: '26px 22px 0' }}>
          <SecH right={`${items.length} pieces`}>In this look</SecH>
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => navigate(`/wardrobe/${item.id}`)}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 13, padding: '9px 0', background: 'none', border: 'none', borderBottom: i < items.length - 1 ? `1px solid ${T.line}` : 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: 36, height: 45, flexShrink: 0, overflow: 'hidden', background: T.g200 }}>
                {item.signedImageUrl && <img src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: fS, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ marginTop: 2 }}><Mono s={10.5}>{item.category}</Mono></div>
              </div>
              <Mono s={11} c={T.cocoa} style={{ fontWeight: 700 }}>{item.wearCount}×</Mono>
            </button>
          ))}
        </div>
      )}
      {outfit.notes && (
        <div style={{ padding: '20px 22px 0' }}>
          <V4Card pad={16}>
            <div style={{ fontFamily: fS, fontSize: 12, fontWeight: 600, color: T.g400, marginBottom: 5 }}>Note</div>
            <Body s={14}>{outfit.notes}</Body>
          </V4Card>
        </div>
      )}
    </div>
  )
}
