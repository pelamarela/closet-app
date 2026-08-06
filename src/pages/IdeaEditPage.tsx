import { useState, useEffect } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useItems } from '../hooks/useItems'
import { useIdeaMutations } from '../hooks/useIdeaMutations'
import { AppBar, SectionLabel, UButton, MONO, UI, INK, RULE } from '../components/ui'
import Spinner from '../components/Spinner'
import FixedBar from '../components/FixedBar'
import OccasionPicker from '../components/OccasionPicker'
import SelectableItemGrid from '../components/SelectableItemGrid'

const OCCASION_PRESETS = ['studio', 'dinner', 'gallery', 'weekend', 'client', 'errands']

export default function IdeaEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { items, loading: itemsLoading } = useItems()
  const { updateIdea } = useIdeaMutations()
  const { isDesktop } = useBreakpoint()

  const [occasion, setOccasion] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [initialSelectedIds, setInitialSelectedIds] = useState<Set<string>>(new Set())
  const [filterCat, setFilterCat] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data: raw } = await supabase
        .from('outfit_ideas')
        .select('*, idea_items(item_id)')
        .eq('id', id!)
        .single()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = raw as any
      if (!d) { setLoading(false); return }
      setOccasion(d.occasion ?? '')
      setNotes(d.notes ?? '')
      const ids = (d.idea_items ?? []).map((ii: { item_id: string }) => ii.item_id)
      setSelectedIds(new Set(ids))
      setInitialSelectedIds(new Set(ids))
      setLoading(false)
    }
    load()
  }, [id])

  const toggleItem = (itemId: string) =>
    setSelectedIds(s => { const n = new Set(s); if (n.has(itemId)) n.delete(itemId); else n.add(itemId); return n })

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

  if (loading) return <Spinner />

  const SaveButtons = (
    <>
      {error && <div style={{ fontFamily: MONO, fontSize: 10, color: '#9C5544', marginBottom: 8 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <UButton variant="secondary" onClick={() => navigate(`/ideas/${id}`)} style={{ flex: 1 }}>Cancel</UButton>
        <UButton icon="check" disabled={saving || selectedIds.size === 0} onClick={handleSave} style={{ flex: 2 }}>
          {saving ? 'Saving…' : 'Save changes'}
        </UButton>
      </div>
    </>
  )

  return (
    <div style={{ paddingBottom: isDesktop ? 40 : 180 }}>
      <AppBar title="Edit idea" back onBack={() => navigate(`/ideas/${id}`)} />

      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.06em' }}>
          edit items · update context · save
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>occasion</SectionLabel>
        <OccasionPicker value={occasion} onChange={setOccasion} presets={OCCASION_PRESETS} />
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {itemsLoading ? (
          <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', padding: '16px 0' }}>loading…</div>
        ) : (
          <SelectableItemGrid
            items={items}
            selected={selectedIds}
            onToggle={toggleItem}
            initialSelected={initialSelectedIds}
            filterCat={filterCat}
            onFilterCat={setFilterCat}
            scrollable
          />
        )}
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>notes</SectionLabel>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="anything to remember about this idea?"
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            fontFamily: UI, fontSize: 13,
            color: notes ? INK : 'rgba(0,0,0,0.35)',
            background: 'none', border: 'none', outline: 'none',
            borderBottom: RULE, padding: '6px 0', resize: 'none',
          }}
        />
      </div>

      {isDesktop ? (
        <div style={{ padding: '20px 20px 0' }}>{SaveButtons}</div>
      ) : (
        <FixedBar column>{SaveButtons}</FixedBar>
      )}
    </div>
  )
}
