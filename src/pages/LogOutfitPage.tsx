import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useItems } from '../hooks/useItems'
import { useOutfitMutations } from '../hooks/useOutfitMutations'
import { SectionLabel, UButton, MONO, UI, INK, RULE } from '../components/ui'

const OCCASION_PRESETS = ['casual', 'work', 'date night', 'weekend', 'formal', 'gym']

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function LogOutfitPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const navState = location.state as { preselectedIds?: string[]; occasion?: string } | null
  const { items, loading: itemsLoading } = useItems()
  const { logOutfit } = useOutfitMutations()

  const [date, setDate] = useState(today())
  const [occasion, setOccasion] = useState(navState?.occasion ?? '')
  const [rating, setRating] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(navState?.preselectedIds ?? []))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleItem = (id: string) =>
    setSelectedIds(s => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (selectedIds.size === 0) { setError('Select at least one item.'); return }
    setSaving(true)
    setError(null)
    try {
      const id = await logOutfit(
        { date_worn: date, occasion, rating, notes },
        Array.from(selectedIds),
        imageFile ?? undefined,
      )
      navigate(`/outfits/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* AppBar */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/outfits')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: UI, fontSize: 13, fontWeight: 600,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: INK,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6"/>
            </svg>
            Cancel
          </button>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'new outfit'}
          </div>
        </div>
        <div style={{ borderTop: RULE, marginTop: 12 }} />
      </div>

      {/* Page title */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ fontFamily: UI, fontSize: 24, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
          Log an outfit
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
          pick items · add context · save
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Date */}
        <div style={{ padding: '12px 0', borderBottom: RULE }}>
          <div style={{
            fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
          }}>
            date <span style={{ color: '#9C5544' }}>*</span>
          </div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              fontFamily: MONO, fontSize: 13, fontWeight: 500, color: INK,
              background: 'none', border: 'none', outline: 'none', padding: 0,
              width: '100%',
            }}
          />
        </div>

        {/* Occasion */}
        <div style={{ padding: '12px 0', borderBottom: RULE }}>
          <div style={{
            fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
          }}>
            occasion
          </div>
          <input
            type="text"
            value={occasion}
            onChange={e => setOccasion(e.target.value)}
            placeholder="e.g. work, dinner, weekend…"
            style={{
              width: '100%', fontFamily: UI, fontSize: 15, fontWeight: 500,
              color: occasion ? INK : 'rgba(0,0,0,0.35)',
              background: 'none', border: 'none', outline: 'none', padding: 0,
            }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {OCCASION_PRESETS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setOccasion(p)}
                style={{
                  padding: '2px 8px', borderRadius: 2,
                  border: `1px solid ${occasion === p ? INK : 'rgba(0,0,0,0.15)'}`,
                  background: occasion === p ? INK : 'transparent',
                  color: occasion === p ? '#fff' : 'rgba(0,0,0,0.55)',
                  fontFamily: MONO, fontSize: 9, cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Item picker */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right={selectedIds.size > 0 ? `${selectedIds.size} selected` : undefined}>
          items
        </SectionLabel>

        {itemsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <Loader2 className="animate-spin" size={20} style={{ color: 'rgba(0,0,0,0.3)' }} />
          </div>
        ) : items.length === 0 ? (
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', padding: '16px 0' }}>
            no items in your wardrobe yet
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {items.map(item => {
              const selected = selectedIds.has(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  style={{
                    position: 'relative', aspectRatio: '3/4',
                    border: `${selected ? 2 : 1}px solid ${selected ? INK : 'rgba(0,0,0,0.10)'}`,
                    borderRadius: 3, overflow: 'hidden',
                    background: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  {item.signedImageUrl ? (
                    <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      background: 'repeating-linear-gradient(135deg, #ECEAE6 0 10px, #DCD9D3 10px 20px)',
                    }} />
                  )}

                  {/* Category label */}
                  <div style={{
                    position: 'absolute', top: 4, left: 4,
                    fontFamily: MONO, fontSize: 8,
                    background: '#fff', color: INK, padding: '1px 4px',
                    letterSpacing: '0.04em',
                  }}>{item.category}</div>

                  {/* Check overlay */}
                  {selected && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(10,10,10,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{
                        width: 22, height: 22, background: INK, borderRadius: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5 9-11"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Rating */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ padding: '12px 0', borderBottom: RULE }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
          }}>
            <span>rating</span>
            <span style={{ color: INK }}>{rating ? `${rating} / 5` : 'none'}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(prev => prev === n ? null : n)}
                style={{
                  flex: 1, height: 28,
                  border: `1px solid ${rating && n <= rating ? INK : 'rgba(0,0,0,0.15)'}`,
                  background: rating && n <= rating ? INK : 'transparent',
                  color: rating && n <= rating ? '#fff' : 'rgba(0,0,0,0.35)',
                  borderRadius: 2, cursor: 'pointer',
                  fontFamily: MONO, fontSize: 11, fontWeight: 600,
                }}
              >{n}</button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ padding: '12px 0', borderBottom: RULE }}>
          <div style={{
            fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
          }}>
            notes
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="how did you feel wearing this?"
            rows={3}
            style={{
              width: '100%', fontFamily: UI, fontSize: 13, color: INK,
              background: 'none', border: 'none', outline: 'none', padding: 0,
              resize: 'none',
            }}
          />
        </div>

        {/* Outfit photo */}
        <div style={{ padding: '12px 0', borderBottom: RULE }}>
          <div style={{
            fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
          }}>
            photo (optional)
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%', aspectRatio: '4/3',
              border: imagePreview ? RULE : '1.5px dashed rgba(0,0,0,0.2)',
              borderRadius: 3, overflow: 'hidden',
              background: imagePreview ? 'none' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', cursor: 'pointer',
            }}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Outfit" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, display: 'block' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(0,0,0,0.3)' }}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
                <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)' }}>tap to add photo</span>
              </div>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        </div>
      </div>

      {error && (
        <div style={{ padding: '0 20px 12px', fontFamily: MONO, fontSize: 10, color: '#9C5544' }}>{error}</div>
      )}

      {/* Footer */}
      <div style={{
        position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: '#F7F6F5', borderTop: RULE,
        padding: '12px 20px',
        display: 'flex', gap: 8,
      }}>
        <UButton variant="ghost" onClick={() => navigate('/outfits')} style={{ flex: 1 }}>
          Cancel
        </UButton>
        <UButton
          onClick={handleSave}
          disabled={saving || selectedIds.size === 0}
          style={{ flex: 1.6 }}
        >
          {saving ? 'Saving…' : 'Save outfit'}
        </UButton>
      </div>
    </div>
  )
}
