import { useState, useRef, useEffect } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useItems } from '../hooks/useItems'
import type { Category } from '../types/database'
import { useOutfitMutations } from '../hooks/useOutfitMutations'
import { AppBar, SectionLabel, UButton, Icon, MONO, UI, INK, RULE } from '../components/ui'
import { catLabel } from '../lib/categoryLabel'

const OCCASION_PRESETS = ['casual', 'work', 'date night', 'weekend', 'formal', 'gym']

function today() { return new Date().toISOString().slice(0, 10) }

export default function LogOutfitPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id: editId } = useParams<{ id?: string }>()
  const isEdit = !!editId
  const navState = location.state as { preselectedIds?: string[]; occasion?: string; date?: string } | null
  const { items, loading: itemsLoading } = useItems()
  const { logOutfit, updateOutfit } = useOutfitMutations()
  const { isDesktop } = useBreakpoint()

  const [date, setDate] = useState(navState?.date ?? today())
  const [occasion, setOccasion] = useState(navState?.occasion ?? '')
  const [rating, setRating] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(navState?.preselectedIds ?? []))
  const [initialSelectedIds, setInitialSelectedIds] = useState<Set<string>>(new Set(navState?.preselectedIds ?? []))
  const [filterCat, setFilterCat] = useState<string>('all')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loadingEdit, setLoadingEdit] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEdit || !editId) return
    async function load() {
      const { data } = await supabase
        .from('outfits')
        .select('*, outfit_items(item_id)')
        .eq('id', editId!)
        .single()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = data as any
      if (!d) { setLoadingEdit(false); return }
      setDate(d.date_worn)
      setOccasion(d.occasion ?? '')
      setRating(d.rating ?? null)
      setNotes(d.notes ?? '')
      const ids = (d.outfit_items ?? []).map((oi: { item_id: string }) => oi.item_id)
      setSelectedIds(new Set(ids))
      setInitialSelectedIds(new Set(ids))
      setLoadingEdit(false)
    }
    load()
  }, [editId, isEdit])

  const toggleItem = (id: string) =>
    setSelectedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const handleSave = async () => {
    if (selectedIds.size === 0) { setError('Select at least one item.'); return }
    setSaving(true); setError(null)
    try {
      if (isEdit && editId) {
        await updateOutfit(editId, { date_worn: date, occasion, rating, notes }, Array.from(selectedIds), imageFile ?? undefined)
        navigate(`/outfits/${editId}`)
      } else {
        const id = await logOutfit({ date_worn: date, occasion, rating, notes }, Array.from(selectedIds), imageFile ?? undefined)
        navigate(`/outfits/${id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  const selectedCount = selectedIds.size

  if (loadingEdit) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>loading…</span>
    </div>
  )

  return (
    <div style={{ paddingBottom: isDesktop ? 40 : 180 }}>
      <AppBar
        title={isEdit ? 'Edit outfit' : 'Log an outfit'}
        back
        onBack={() => navigate(-1)}
      />

      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.06em' }}>
          {isEdit ? 'edit items · update context · save' : 'pick items · add context · save'}
        </div>
      </div>

      {/* Date */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>date</SectionLabel>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{
            fontFamily: UI, fontSize: 16, fontWeight: 500, color: INK,
            background: 'none', border: 'none', outline: 'none',
            borderBottom: RULE, paddingBottom: 6, cursor: 'pointer', width: '100%',
          }}
        />
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
      </div>

      {/* Items grid */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right={selectedCount > 0 ? `${selectedCount} selected` : undefined}>items</SectionLabel>
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
        ) : items.length === 0 ? (
          <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', padding: '16px 0' }}>no items in wardrobe yet</div>
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

      {/* Rating */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right={rating === null ? 'none' : undefined}>rating</SectionLabel>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              onClick={() => setRating(prev => prev === n ? null : n)}
              style={{
                flex: 1, height: 36,
                border: `1px solid ${rating !== null && n <= rating ? INK : 'rgba(0,0,0,0.15)'}`,
                background: rating !== null && n <= rating ? INK : 'transparent',
                color: rating !== null && n <= rating ? '#fff' : 'rgba(0,0,0,0.35)',
                borderRadius: 2, fontFamily: MONO, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >{n}</button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>notes</SectionLabel>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="how did you feel wearing this?"
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

      {/* Photo */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right="optional">photo</SectionLabel>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={e => setImageFile(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%', border: '1.5px dashed rgba(0,0,0,0.22)',
            background: 'none', cursor: 'pointer', padding: '32px 0',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          {imageFile ? (
            <span style={{ color: INK, textTransform: 'none', letterSpacing: 0 }}>{imageFile.name} ✓</span>
          ) : (
            <><Icon name="camera" size={18} stroke={1.4} />tap to add photo</>
          )}
        </button>
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
          <UButton variant="secondary" onClick={() => navigate(-1)} style={{ flex: 1 }}>Cancel</UButton>
          <UButton icon="check" disabled={saving || selectedIds.size === 0} onClick={handleSave} style={{ flex: 2 }}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save outfit'}
          </UButton>
        </div>
      </div>
    </div>
  )
}
