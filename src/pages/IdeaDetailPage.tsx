import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useIdeaMutations } from '../hooks/useIdeaMutations'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { AppBar, SectionLabel, Icon, MONO, UI, INK, ACCENT } from '../components/ui'
import type { OutfitIdea, Item } from '../types/database'
import ItemCollage from '../components/ItemCollage'
import PieceRow from '../components/PieceRow'
import Spinner from '../components/Spinner'
import FixedBar from '../components/FixedBar'
import TextBlock from '../components/TextBlock'
import LogOutfitButton from '../components/LogOutfitButton'

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
      const { data: raw } = await supabase
        .from('outfit_ideas')
        .select('*, idea_items(item_id)')
        .eq('id', id!)
        .eq('user_id', user!.id)
        .single()

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

  const handleLog = () => {
    navigate('/outfits/new', { state: { preselectedIds: items.map(i => i.id), occasion: idea?.occasion ?? '' } })
  }

  if (loading) return <Spinner />

  if (!idea) return <div style={{ padding: '20px', fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.5)' }}>Not found.</div>

  const Collage = <ItemCollage items={items} />

  const TitleBlock = (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        // idea · saved {new Date(idea.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
      <div style={{ fontFamily: UI, fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 8, lineHeight: 1.05 }}>
        {idea.occasion ? `${idea.occasion}.` : 'Outfit idea.'}
      </div>
      {idea.notes && (
        <div style={{ fontFamily: UI, fontSize: 13, color: 'rgba(0,0,0,0.6)', marginTop: 10, fontStyle: 'italic' }}>"{idea.notes}"</div>
      )}
    </div>
  )

  const ReasoningBlock = idea.reasoning ? (
    <div style={{ marginTop: 20 }}>
      <SectionLabel right="reasoning">AI</SectionLabel>
      <TextBlock>{idea.reasoning}</TextBlock>
    </div>
  ) : null

  const PiecesList = items.length > 0 ? (
    <div style={{ marginTop: 20 }}>
      <SectionLabel>pieces ({items.length})</SectionLabel>
      {items.map(item => <PieceRow key={item.id} item={item} />)}
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
        title="Ideas"
        back
        onBack={() => navigate('/ideas')}
        right={
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <button
              onClick={() => navigate(`/ideas/${id}/edit`)}
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
        <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', margin: '20px 20px 0', alignItems: 'start', overflow: 'hidden' }}>
          <div style={{ minWidth: 0, paddingRight: 28 }}>
            {Collage}
          </div>
          <div style={{ minWidth: 0 }}>
            {TitleBlock}
            {ReasoningBlock}
            {PiecesList}
            <div style={{ marginTop: 24 }}>
              <LogOutfitButton full onClick={handleLog}>Log this outfit</LogOutfitButton>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: '20px 20px 0' }}>{TitleBlock}</div>
          <div style={{ padding: '16px 20px 0' }}>{Collage}</div>
          {ReasoningBlock && <div style={{ padding: '20px 20px 0' }}>{ReasoningBlock}</div>}
          {PiecesList && <div style={{ padding: '20px 20px 0' }}>{PiecesList}</div>}
          <FixedBar>
            <LogOutfitButton full onClick={handleLog}>Log this outfit</LogOutfitButton>
          </FixedBar>
        </>
      )}
    </div>
  )
}
