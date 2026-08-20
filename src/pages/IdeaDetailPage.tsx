import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useIdeaMutations } from '../hooks/useIdeaMutations'
import type { OutfitIdea, Item } from '../types/database'
import { outfitTitle } from '../lib/outfitTitle'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { T, fS, fM, V4Icon, V4Bar, Btn, Disp, Body, Mono, SecH, V4Card } from '../design/kit'
import Collage from '../design/Collage'

type ItemWithImage = Item & { signedImageUrl: string | null }

export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { deleteIdea } = useIdeaMutations()
  const { isDesktop } = useBreakpoint()

  const [idea, setIdea] = useState<OutfitIdea | null>(null)
  const [items, setItems] = useState<ItemWithImage[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !user) return
    async function load() {
      setLoading(true)
      const { data: raw } = await supabase.from('outfit_ideas').select('*, idea_items(item_id)').eq('id', id!).eq('user_id', user!.id).single()
      if (!raw) { setLoading(false); return }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setIdea(raw as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const itemIds: string[] = ((raw as any).idea_items ?? []).map((ii: { item_id: string }) => ii.item_id)
      if (itemIds.length === 0) { setLoading(false); return }

      const { data: itemData } = await supabase.from('items').select('*').in('id', itemIds)
      const paths = (itemData ?? []).filter(i => i.image_url).map(i => i.image_url as string)
      const urlMap: Record<string, string> = {}
      if (paths.length > 0) {
        const { data: signed } = await supabase.storage.from('item-photos').createSignedUrls(paths, 3600)
        signed?.forEach(({ path, signedUrl }) => { if (path && signedUrl) urlMap[path] = signedUrl })
      }
      const ordered = itemIds
        .map(iid => (itemData ?? []).find(i => i.id === iid))
        .filter((i): i is Item => !!i)
        .map(item => ({ ...item, signedImageUrl: item.image_url ? (urlMap[item.image_url] ?? null) : null }))
      setItems(ordered)
      setLoading(false)
    }
    load()
  }, [id, user])

  const handleDelete = async () => {
    if (!id || !confirm('Delete this idea?')) return
    setDeleting(true); setDeleteError(null)
    try { await deleteIdea(id); navigate('/ideas') }
    catch (e) { setDeleting(false); setDeleteError(e instanceof Error ? e.message : 'Delete failed') }
  }
  const handleLog = () => navigate('/outfits/new', { state: { preselectedIds: items.map(i => i.id), occasion: idea?.occasion ?? '' } })

  if (loading) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  }
  if (!idea) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>Not found.</div>
  }

  const collageItems = items.map(i => ({ id: i.id, name: i.name, category: i.category, signedImageUrl: i.signedImageUrl }))
  const savedLabel = new Date(idea.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toLowerCase()

  const PhotoBlock = (
    <div style={{ width: '100%', aspectRatio: isDesktop ? '3/4' : '4/3' }}><Collage items={collageItems} fill /></div>
  )

  const InfoBlock = (
    <>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          {idea.occasion && <Mono s={11} c={T.cocoa} style={{ textTransform: 'uppercase' }}>{idea.occasion}</Mono>}
          <Mono s={11}>saved {savedLabel}{idea.reasoning ? ' · suggested' : ''}</Mono>
        </div>
        <Disp s={25}>{outfitTitle(items.map(i => i.id), items, 'Outfit idea.')}</Disp>
      </div>
      {(idea.reasoning || idea.notes) && (
        <div style={{ marginTop: 18 }}>
          <V4Card fill={T.peachSoft} shadow={false} pad={16}>
            {idea.reasoning ? (
              <>
                <div style={{ fontFamily: fS, fontSize: 12, fontWeight: 600, color: T.cocoa, marginBottom: 5 }}>Why I kept it</div>
                <Body s={14} c={T.g700}>{idea.reasoning}</Body>
              </>
            ) : (
              <Body s={14} c={T.g700}>{idea.notes}</Body>
            )}
          </V4Card>
        </div>
      )}
      {items.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <SecH right={`${items.length} pieces`}>In this look</SecH>
          {items.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '9px 0', borderBottom: i < items.length - 1 ? `1px solid ${T.line}` : 'none' }}>
              <div style={{ width: 36, height: 45, flexShrink: 0, overflow: 'hidden', background: T.g200 }}>
                {item.signedImageUrl && <img src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: fS, fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                <div style={{ marginTop: 2 }}><Mono s={10.5}>{item.category}</Mono></div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 24 }}>
        <Btn full icon="check" onClick={handleLog}>Wear it today</Btn>
      </div>
    </>
  )

  return (
    <div style={{ paddingBottom: 40 }}>
      {deleteError && <div style={{ padding: '8px 22px', fontFamily: fM, fontSize: 10, color: T.roseDeep, background: T.roseSoft }}>{deleteError}</div>}
      <V4Bar
        back title="Ideas" onBack={() => navigate('/ideas')}
        right={<>
          <button onClick={() => navigate(`/ideas/${id}/edit`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, padding: 4, display: 'flex' }}><V4Icon n="pen" s={20} w={1.6} /></button>
          <button onClick={handleDelete} disabled={deleting} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, padding: 4, display: 'flex', opacity: deleting ? 0.4 : 1 }}><V4Icon n="trash" s={19} w={1.6} /></button>
        </>}
      />
      {isDesktop ? (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 44, alignItems: 'start', padding: '10px 0 0' }}>
          <div style={{ position: 'sticky', top: 'calc(var(--v3-header-h) + 20px)' }}>{PhotoBlock}</div>
          <div>{InfoBlock}</div>
        </div>
      ) : (
        <>
          <div style={{ padding: '8px 22px 0' }}>{PhotoBlock}</div>
          <div style={{ padding: '18px 22px 0' }}>{InfoBlock}</div>
        </>
      )}
    </div>
  )
}
