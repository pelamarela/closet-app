import { useState, useEffect } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useItems } from '../hooks/useItems'
import { useIdeaMutations } from '../hooks/useIdeaMutations'
import { AppBar, SectionLabel, UButton, Icon, MONO, UI, INK, RULE } from '../components/ui'
import { catLabel } from '../lib/categoryLabel'
import type { Category } from '../types/database'

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
    setSelectedIds(s => { const n = new Set(s); n.has(itemId) ? n.delete(itemId) : n.add(itemId); return n })

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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>loading…</span>
    </div>
  )

  return (
    <div style={{ paddingBottom: isDesktop ? 40 : 180 }}>
      <AppBar title="Edit idea" back onBack={() => navigate(`/ideas/${id}`)} />

      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.06em' }}>
          edit items · update context · save
        </div>
      </div>

      {/* Occasion */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>occasion</SectionLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {OCCASION_PRESETS.map(o => (
            <button
              key={o}
              onClick={() => setOccasion(prev => prev === o ? '' : o)}
              style={{
                fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.04em',
                padding: '5px 10px', cursor: 'pointer',
                border: `1px solid ${occasion === o ? INK : 'rgba(0,0,0,0.15)'}`,
                background: occasion === o ? INK : 'transparent',
                color: occasion === o ? '#fff' : INK,
                borderRadius: 2,
              }}
            >{o}</button>
          ))}
        </div>
        <input
          type="text"
          value={OCCASION_PRESETS.includes(occasion) ? '' : occasion}
          onChange={e => setOccasion(e.target.value)}
          placeholder="or type custom…"
          style={{
            marginTop: 10, width: '100%',
            fontFamily: UI, fontSize: 16, fontWeight: 500,
            color: INK, background: 'none', border: 'none', outline: 'none',
            borderBottom: RULE, padding: '6px 0',
          }}
        />
      </div>

      {/* Items grid */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right={selectedIds.size > 0 ? `${selectedIds.size} selected` : undefined}>items</SectionLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {(['all', 'top', 'bottom', 'one-piece', 'outerwear', 'shoes', 'accessory'] as const).map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{
              fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.04em', padding: '3px 8px',
              border: `1px solid ${filterCat === cat ? INK : 'rgba(0,0,0,0.15)'}`,
              background: filterCat === cat ? INK : 'transparent',
              color: filterCat === cat ? '#fff' : INK,
              borderRadius: 2, cursor: 'pointer',
            }}>
              {cat === 'all' ? 'all' : catLabel(cat)}
            </button>
          ))}
        </div>
        {itemsLoading ? (
          <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', padding: '16px 0' }}>loading…</div>
        ) : (
          <div style={{ maxHeight: '38vh', overflowY: 'auto', overflowX: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(130px, 1fr))' : 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
              {items.filter(item => filterCat === 'all' || item.category === (filterCat as Category)).sort((a, b) => Number(!initialSelectedIds.has(a.id)) - Number(!initialSelectedIds.has(b.id))).map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <div style={{
                    width: '100%', aspectRatio: '3/4',
                    border: selectedIds.has(item.id) ? `2px solid ${INK}` : RULE,
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {item.signedImageUrl ? (
                      <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 8px, #DCD9D3 8px 16px)' }} />
                    )}
                    <div style={{
                      position: 'absolute', top: 4, left: 4,
                      fontFamily: MONO, fontSize: 7.5,
                      background: 'rgba(255,255,255,0.9)', padding: '1px 4px',
                    }}>{catLabel(item.category)}</div>
                    {selectedIds.has(item.id) && (
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.38)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                      }}>
                        <Icon name="check" size={22} stroke={2.5} />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
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

      {/* Bottom bar */}
      <div style={isDesktop ? {
        padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 8,
      } : {
        position: 'fixed', bottom: 'var(--nav-h)', left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 700,
        background: '#F7F6F5', borderTop: RULE,
        padding: '12px 20px', zIndex: 20,
      }}>
        {error && <div style={{ fontFamily: MONO, fontSize: 10, color: '#9C5544', marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <UButton variant="secondary" onClick={() => navigate(`/ideas/${id}`)} style={{ flex: 1 }}>Cancel</UButton>
          <UButton icon="check" disabled={saving || selectedIds.size === 0} onClick={handleSave} style={{ flex: 2 }}>
            {saving ? 'Saving…' : 'Save changes'}
          </UButton>
        </div>
      </div>
    </div>
  )
}
