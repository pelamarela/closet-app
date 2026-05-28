import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import { useOutfitMutations } from '../hooks/useOutfitMutations'
import { AppBar, SectionLabel, MonoTag, UButton, Icon, MONO, UI, INK, RULE, RULE_DASHED } from '../components/ui'
import type { Category } from '../types/database'

const OCCASION_PRESETS = ['casual', 'work', 'dinner', 'gallery', 'weekend', 'errands']
const SLOT_CATS: { key: Category; label: string }[] = [
  { key: 'outerwear', label: 'outerwear' },
  { key: 'top',       label: 'top' },
  { key: 'dress',     label: 'dress' },
  { key: 'bottom',    label: 'bottom' },
  { key: 'shoes',     label: 'shoes' },
  { key: 'accessory', label: 'accessory' },
]
const PICKER_CATS: { value: Category; label: string }[] = [
  { value: 'top',       label: 'top' },
  { value: 'bottom',    label: 'btm' },
  { value: 'outerwear', label: 'coat' },
  { value: 'shoes',     label: 'shoe' },
  { value: 'accessory', label: 'acc' },
  { value: 'dress',     label: 'dress' },
]

function today() { return new Date().toISOString().slice(0, 10) }

export default function LogOutfitPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const navState = location.state as { preselectedIds?: string[]; occasion?: string } | null
  const { items, loading: itemsLoading } = useItems()
  const { logOutfit } = useOutfitMutations()

  const [date] = useState(today())
  const now = new Date()
  const dateLabel = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} · ${ ['sun','mon','tue','wed','thu','fri','sat'][now.getDay()]}`

  const [occasion, setOccasion] = useState(navState?.occasion ?? '')
  const [rating, setRating] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(navState?.preselectedIds ?? []))
  const [pickerCat, setPickerCat] = useState<Category>('top')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleItem = (id: string) =>
    setSelectedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
  }

  const handleSave = async () => {
    if (selectedIds.size === 0) { setError('Select at least one item.'); return }
    setSaving(true); setError(null)
    try {
      const id = await logOutfit(
        { date_worn: date, occasion: occasion || null, rating, notes: notes || null },
        Array.from(selectedIds),
        imageFile ?? undefined,
      )
      navigate(`/outfits/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  const selectedItems = items.filter(i => selectedIds.has(i.id))
  const pickerItems = items.filter(i => i.category === pickerCat)
  const filledCount = selectedIds.size

  return (
    <div style={{ paddingBottom: 320 }}>
      <AppBar
        title="Cancel"
        back
        onBack={() => navigate(-1)}
        meta={dateLabel}
      />

      {/* Title */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ fontFamily: UI, fontSize: 24, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
          Log today's outfit
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
          {filledCount} of {SLOT_CATS.length} categories
        </div>
      </div>

      {/* Occasion chips */}
      <div style={{ padding: '14px 20px 0' }}>
        <SectionLabel>context</SectionLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {OCCASION_PRESETS.map(o => (
            <button key={o} onClick={() => setOccasion(prev => prev === o ? '' : o)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <MonoTag filled={occasion === o}>{o}</MonoTag>
            </button>
          ))}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={OCCASION_PRESETS.includes(occasion) ? '' : occasion}
              onChange={e => setOccasion(e.target.value)}
              placeholder="+ custom"
              style={{
                width: 80, fontFamily: MONO, fontSize: 9.5,
                letterSpacing: '0.04em', textTransform: 'lowercase',
                padding: '3px 6px', border: '1px solid rgba(0,0,0,0.15)',
                background: 'transparent', color: INK, borderRadius: 2,
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Selected items strip */}
      <div style={{ padding: '14px 20px 0' }}>
        <SectionLabel right={`${filledCount} / ${SLOT_CATS.length}`}>pieces</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
          {SLOT_CATS.map((slot) => {
            const slotItems = selectedItems.filter(i => i.category === slot.key)
            const filled = slotItems.length > 0
            return (
              <div
                key={slot.key}
                style={{
                  border: filled ? RULE : '1.5px dashed rgba(0,0,0,0.22)',
                  background: filled ? '#fff' : 'transparent',
                  borderRadius: 3, aspectRatio: '3/4',
                  position: 'relative', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                {filled ? (
                  <>
                    {slotItems[0].signedImageUrl ? (
                      <img src={slotItems[0].signedImageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg, #ECEAE6 0 8px, #DCD9D3 8px 16px)' }} />
                    )}
                    <div style={{
                      position: 'absolute', top: 4, left: 4,
                      fontFamily: MONO, fontSize: 7.5, background: '#fff', padding: '1px 4px', zIndex: 1,
                    }}>{slot.label}</div>
                    <button
                      onClick={() => toggleItem(slotItems[0].id)}
                      style={{
                        position: 'absolute', top: 4, right: 4,
                        width: 16, height: 16, background: 'rgba(0,0,0,0.5)', color: '#fff',
                        fontFamily: MONO, fontSize: 10, lineHeight: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer', padding: 0, zIndex: 1,
                      }}
                    >×</button>
                  </>
                ) : (
                  <button
                    onClick={() => setPickerCat(slot.key as Category)}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                      fontFamily: MONO, fontSize: 8.5, color: 'rgba(0,0,0,0.4)',
                      background: 'none', border: 'none', cursor: 'pointer', width: '100%',
                    }}
                  >
                    <Icon name="plus" size={14} stroke={1.4} />
                    {slot.label}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Rating */}
      <div style={{ padding: '14px 20px 0' }}>
        <SectionLabel>rating</SectionLabel>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              onClick={() => setRating(prev => prev === n ? null : n)}
              style={{
                flex: 1, height: 32,
                border: `1px solid ${rating !== null && n <= rating ? INK : 'rgba(0,0,0,0.15)'}`,
                background: rating !== null && n <= rating ? INK : 'transparent',
                color: rating !== null && n <= rating ? '#fff' : 'rgba(0,0,0,0.35)',
                borderRadius: 2,
                fontFamily: MONO, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >{n}</button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div style={{ padding: '14px 20px 0' }}>
        <SectionLabel>notes</SectionLabel>
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="any notes about today's outfit…"
          style={{
            width: '100%', fontFamily: UI, fontSize: 13, color: notes ? INK : 'rgba(0,0,0,0.35)',
            background: 'none', border: 'none', outline: 'none', borderBottom: RULE,
            padding: '6px 0',
          }}
        />
      </div>

      {/* Photo */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />

      {/* Picker + save — single fixed panel above nav */}
      <div style={{
        position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, zIndex: 10,
      }}>
        {/* Item picker */}
        <div style={{ background: '#fff', borderTop: RULE, padding: '12px 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              // pick from closet
            </div>
            <div style={{ flex: 1, borderTop: RULE_DASHED }} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {PICKER_CATS.map(c => (
              <button key={c.value} onClick={() => setPickerCat(c.value)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
                <MonoTag filled={pickerCat === c.value}>{c.label}</MonoTag>
              </button>
            ))}
          </div>
          {itemsLoading ? (
            <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)' }}>loading…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5, overflow: 'hidden', maxHeight: 70 }}>
              {pickerItems.slice(0, 8).map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  style={{
                    aspectRatio: '3/4', border: selectedIds.has(item.id) ? `1.5px solid ${INK}` : RULE,
                    padding: 0, background: 'none', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    borderRadius: 2,
                  }}
                >
                  {item.signedImageUrl ? (
                    <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 5px, #DCD9D3 5px 10px)' }} />
                  )}
                  {selectedIds.has(item.id) && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name="check" size={12} stroke={2} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save button */}
        <div style={{ background: '#F7F6F5', borderTop: RULE, padding: '12px 20px 12px' }}>
          {error && <div style={{ fontFamily: MONO, fontSize: 10, color: '#9C5544', marginBottom: 8 }}>{error}</div>}
          <UButton full icon="check" disabled={saving || selectedIds.size === 0} onClick={handleSave}>
            {saving ? 'Saving…' : 'Log this outfit'}
          </UButton>
        </div>
      </div>
    </div>
  )
}
