import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { useIdeaMutations } from '../hooks/useIdeaMutations'
import { getOccasionPresets } from '../lib/occasionPresets'
import { T, fS, fM, V4Bar, Btn, Pill, ItemTile, Body, SecH } from '../design/kit'

const CATS: { value: string; label: string }[] = [
  { value: 'all', label: 'all' },
  { value: 'top', label: 'top' },
  { value: 'bottom', label: 'btm' },
  { value: 'one-piece', label: '1pc' },
  { value: 'outerwear', label: 'otw' },
  { value: 'shoes', label: 'shoe' },
  { value: 'accessory', label: 'acc' },
  { value: 'fragrance', label: 'frag' },
]

export default function IdeaEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { items, loading: itemsLoading } = useItems()
  const { outfits } = useOutfits()
  const { updateIdea } = useIdeaMutations()

  const [occasion, setOccasion] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filterCat, setFilterCat] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const occasionPresets = useMemo(() => getOccasionPresets(outfits), [outfits])

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data: raw } = await supabase.from('outfit_ideas').select('*, idea_items(item_id)').eq('id', id!).single()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = raw as any
      if (!d) { setLoading(false); return }
      setOccasion(d.occasion ?? '')
      setNotes(d.notes ?? '')
      setSelectedIds(new Set((d.idea_items ?? []).map((ii: { item_id: string }) => ii.item_id)))
      setLoading(false)
    }
    load()
  }, [id])

  const toggleItem = (itemId: string) => setSelectedIds(s => { const n = new Set(s); if (n.has(itemId)) n.delete(itemId); else n.add(itemId); return n })
  const picked = items.filter(i => selectedIds.has(i.id)).sort((a, b) => b.created_at.localeCompare(a.created_at))
  const gridItems = items
    .filter(i => filterCat === 'all' || i.category === filterCat)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  const handleSave = async () => {
    if (selectedIds.size === 0) { setError('Select at least one item.'); return }
    setSaving(true); setError(null)
    try {
      await updateIdea(id!, occasion, Array.from(selectedIds), notes)
      navigate(`/ideas/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <V4Bar back title="Edit idea" onBack={() => navigate(`/ideas/${id}`)} />

      <div style={{ padding: '18px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 600 }}>{selectedIds.size} piece{selectedIds.size === 1 ? '' : 's'}</div>
          {selectedIds.size > 0 && <button onClick={() => setSelectedIds(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 13, color: T.cocoa }}>Clear</button>}
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {picked.map(item => (
            <div key={item.id} style={{ position: 'relative', width: 60, height: 74, flexShrink: 0, overflow: 'hidden', background: T.g200 }}>
              {item.signedImageUrl && <img src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
            </div>
          ))}
          {picked.length === 0 && <Body s={13}>Nothing selected yet.</Body>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '18px 22px 0', overflowX: 'auto' }}>
        {CATS.map(c => <Pill key={c.value} on={filterCat === c.value} s="sm" onClick={() => setFilterCat(c.value)}>{c.label}</Pill>)}
      </div>
      <div style={{ padding: '16px 22px 0' }}>
        {itemsLoading ? (
          <Body s={13}>loading…</Body>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 8 }}>
            {gridItems.map(item => (
              <ItemTile key={item.id} src={item.signedImageUrl} alt={item.name} sel={selectedIds.has(item.id)} onClick={() => toggleItem(item.id)} />
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '26px 22px 0' }}>
        <SecH>What for</SecH>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {occasionPresets.map(o => <Pill key={o} on={occasion === o} tone="peach" onClick={() => setOccasion(prev => prev === o ? '' : o)}>{o}</Pill>)}
        </div>
        <input
          type="text" value={occasionPresets.includes(occasion) ? '' : occasion} onChange={e => setOccasion(e.target.value)}
          placeholder="or type your own…"
          style={{ width: '100%', fontFamily: fS, fontSize: 14, color: T.ink, background: 'none', border: 'none', outline: 'none', borderBottom: `1px solid ${T.line}`, padding: '10px 0 6px', marginTop: 10 }}
        />
      </div>

      <div style={{ padding: '22px 22px 0' }}>
        <SecH right="Optional">Notes</SecH>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)} placeholder="anything to remember about this idea?" rows={3}
          style={{ width: '100%', boxSizing: 'border-box', minHeight: 62, background: T.white, boxShadow: `inset 0 0 0 1px ${T.line}`, padding: 15, fontFamily: fS, fontSize: 14, color: T.ink, border: 'none', outline: 'none', resize: 'none' }}
        />
      </div>

      <div style={{ position: 'fixed', bottom: 'var(--v3-sticky-bottom)', left: 'var(--v3-sidenav-w)', right: 0, padding: '14px 22px 20px', background: 'rgba(247,246,245,.96)', backdropFilter: 'blur(10px)', borderTop: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {error && <Body s={12} c={T.roseDeep} style={{ marginBottom: 8 }}>{error}</Body>}
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn kind="quiet" flex={1} onClick={() => navigate(`/ideas/${id}`)}>Cancel</Btn>
            <Btn flex={1.6} icon="check" disabled={saving || selectedIds.size === 0} onClick={handleSave}>{saving ? 'Saving…' : 'Save changes'}</Btn>
          </div>
        </div>
      </div>
    </div>
  )
}
