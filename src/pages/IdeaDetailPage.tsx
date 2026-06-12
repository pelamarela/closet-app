import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useIdeaMutations } from '../hooks/useIdeaMutations'
import { AppBar, SectionLabel, UButton, Icon, MONO, UI, INK, RULE } from '../components/ui'
import { catLabel } from '../lib/categoryLabel'
import type { OutfitIdea, Item } from '../types/database'

type ItemWithImage = Item & { signedImageUrl: string | null }

export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { deleteIdea } = useIdeaMutations()

  const [idea, setIdea] = useState<OutfitIdea | null>(null)
  const [items, setItems] = useState<ItemWithImage[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

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

      // Preserve the order from idea_items
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
    setDeleting(true)
    try { await deleteIdea(id); navigate('/ideas') }
    catch { setDeleting(false) }
  }

  const handleLog = () => {
    navigate('/outfits/new', { state: { preselectedIds: items.map(i => i.id), occasion: idea?.occasion ?? '' } })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>loading…</span>
    </div>
  )

  if (!idea) return <div style={{ padding: '20px', fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.5)' }}>Not found.</div>

  const SMALL_CAT = new Set(['shoes', 'accessory'])
  const main = items.filter(i => !SMALL_CAT.has(i.category))
  const small = items.filter(i => SMALL_CAT.has(i.category))
  const m = main.length, s = small.length, total = m + s
  const G = 3

  const cell = (item: ItemWithImage, pos = 'center', style: React.CSSProperties = {}) => (
    <div key={item.id} style={{ overflow: 'hidden', background: '#ECEAE6', ...style }}>
      {item.signedImageUrl
        ? <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block' }} />
        : <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 10px, #DCD9D3 10px 20px)' }} />
      }
    </div>
  )

  const renderCollage = () => {
    if (total === 0) return <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 14px, #DCD9D3 14px 28px)' }} />
    if (total === 1) return cell(items[0], m > 0 ? 'top center' : 'center', { height: '100%' })

    if (m === 0 || s === 0 || total === 2) {
      const all = [...main, ...small]
      const pos = m > 0 ? 'top center' : 'center'
      const cols = 2
      const rows = Math.ceil(all.length / cols)
      return (
        <div style={{ display: 'grid', height: '100%', gap: G, gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {all.map((item, i) => cell(item, pos, {
            minHeight: 0,
            ...(all.length % 2 !== 0 && i === all.length - 1 ? { gridColumn: '1 / -1' } : {}),
          }))}
        </div>
      )
    }

    let leftPct: number
    if (m === 1) leftPct = s >= 5 ? 75 : 60
    else if (m === 2) leftPct = s <= 1 ? 65 : s === 2 ? 50 : 60
    else leftPct = s <= 1 ? 68 : 63

    return (
      <div style={{ display: 'flex', height: '100%', gap: G }}>
        <div style={{ flex: `0 0 ${leftPct}%`, display: 'flex', flexDirection: 'column', gap: G }}>
          {main.map(item => cell(item, 'top center', { flex: 1, minHeight: 0 }))}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: G, gridTemplateColumns: '1fr', gridTemplateRows: `repeat(${s}, 1fr)` }}>
          {small.map(item => cell(item, 'center', { minHeight: 0 }))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <AppBar
        title="Ideas"
        back
        onBack={() => navigate('/ideas')}
        right={
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.45)', padding: 4, opacity: deleting ? 0.4 : 1 }}
          >
            <Icon name="trash" size={16} stroke={1.4} />
          </button>
        }
      />

      {/* Title block */}
      <div style={{ padding: '20px 20px 0' }}>
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

      {/* Collage */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ width: '100%', aspectRatio: '5/4', border: RULE, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
          {renderCollage()}
        </div>
      </div>

      {/* AI reasoning */}
      {idea.reasoning && (
        <div style={{ padding: '20px 20px 0' }}>
          <SectionLabel right="reasoning">claude</SectionLabel>
          <div style={{ border: RULE, background: '#fff', padding: 14, fontFamily: UI, fontSize: 13, lineHeight: 1.55, color: 'rgba(0,0,0,0.78)' }}>
            {idea.reasoning}
          </div>
        </div>
      )}

      {/* Pieces */}
      {items.length > 0 && (
        <div style={{ padding: '20px 20px 0' }}>
          <SectionLabel>pieces ({items.length})</SectionLabel>
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(`/wardrobe/${item.id}`)}
              style={{
                width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                display: 'grid', gridTemplateColumns: '34px 1fr 14px',
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
                  {catLabel(item.category)}{item.color ? ` · ${item.color}` : ''}
                </div>
              </div>
              <Icon name="forward" size={12} stroke={1.2} />
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{
        position: 'fixed', bottom: 'var(--nav-h)', left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 700,
        background: '#F7F6F5', borderTop: RULE,
        padding: '12px 20px', zIndex: 25,
      }}>
        <UButton full icon="hanger" onClick={handleLog}>Log this outfit</UButton>
      </div>
    </div>
  )
}
