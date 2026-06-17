import { useState, useRef, useEffect } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useItems } from '../hooks/useItems'
import { useOutfitMutations } from '../hooks/useOutfitMutations'
import { AppBar, SectionLabel, UButton, Icon, MONO, UI, INK, RULE } from '../components/ui'
import Spinner from '../components/Spinner'
import FixedBar from '../components/FixedBar'
import OccasionPicker from '../components/OccasionPicker'
import SelectableItemGrid from '../components/SelectableItemGrid'

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



  if (loadingEdit) return <Spinner />

  // ── Shared pieces ────────────────────────────────────────────────────────────

  const ItemGrid = (
    <div>
      {itemsLoading ? (
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', padding: '16px 0' }}>loading…</div>
      ) : items.length === 0 ? (
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', padding: '16px 0' }}>no items in wardrobe yet</div>
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
  )

  const FormFields = (
    <>
      {/* Date */}
      <div style={{ marginBottom: 20 }}>
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
      <div style={{ marginBottom: 20 }}>
        <SectionLabel>occasion</SectionLabel>
        <OccasionPicker value={occasion} onChange={setOccasion} presets={OCCASION_PRESETS} showCustomInput={false} />
      </div>

      {/* Rating */}
      <div style={{ marginBottom: 20 }}>
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
      <div style={{ marginBottom: 20 }}>
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
      <div style={{ marginBottom: 20 }}>
        <SectionLabel right="optional">photo</SectionLabel>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={e => setImageFile(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%', border: '1.5px dashed rgba(0,0,0,0.22)',
            background: 'none', cursor: 'pointer', padding: '28px 0',
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
    </>
  )

  const SaveBar = (
    <>
      {error && <div style={{ fontFamily: MONO, fontSize: 10, color: '#9C5544', marginBottom: 8 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <UButton variant="secondary" onClick={() => navigate(-1)} style={{ flex: 1 }}>Cancel</UButton>
        <UButton icon="check" disabled={saving || selectedIds.size === 0} onClick={handleSave} style={{ flex: 2 }}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save outfit'}
        </UButton>
      </div>
    </>
  )

  return (
    <div style={{ paddingBottom: isDesktop ? 40 : 180 }}>
      <AppBar
        title={isEdit ? 'Edit outfit' : 'Log an outfit'}
        back
        onBack={() => navigate(-1)}
      />

      {isDesktop ? (
        <div style={{
          display: 'grid', gridTemplateColumns: '58% 42%',
          margin: '0 20px',
          height: 'calc(100dvh - 56px - var(--nav-h))',
          overflow: 'hidden',
          alignItems: 'start',
        }}>
          {/* Left: item picker — scrolls independently */}
          <div style={{ minWidth: 0, paddingRight: 28, paddingTop: 20, height: '100%', overflowY: 'auto' }}>
            {ItemGrid}
          </div>
          {/* Right: form fields + save — fully visible, no scroll needed */}
          <div style={{ minWidth: 0, paddingTop: 20, height: '100%', overflowY: 'auto' }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.06em', marginBottom: 20 }}>
              {isEdit ? 'edit items · update context · save' : 'pick items · add context · save'}
            </div>
            {FormFields}
            {SaveBar}
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: '12px 20px 0' }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.06em' }}>
              {isEdit ? 'edit items · update context · save' : 'pick items · add context · save'}
            </div>
          </div>
          <div style={{ padding: '20px 20px 0' }}>{ItemGrid}</div>
          <div style={{ padding: '20px 20px 0' }}>{FormFields}</div>
          <FixedBar>{SaveBar}</FixedBar>
        </>
      )}
    </div>
  )
}
