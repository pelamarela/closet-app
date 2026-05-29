import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import { useOutfitMutations } from '../hooks/useOutfitMutations'
import { AppBar, SectionLabel, UButton, Icon, MonoTag, MONO, UI, INK, RULE, CREAM } from '../components/ui'
import type { Category } from '../types/database'

const OCCASION_PRESETS = ['casual', 'work', 'date night', 'weekend', 'formal', 'gym']

const CLOSET_FILTERS: { value: 'all' | Category; label: string }[] = [
  { value: 'all',       label: 'all' },
  { value: 'top',       label: 'top' },
  { value: 'bottom',    label: 'btm' },
  { value: 'outerwear', label: 'otw' },
  { value: 'shoes',     label: 'shoe' },
  { value: 'accessory', label: 'acc' },
  { value: 'one-piece', label: '1pc' },
]

function today() { return new Date().toISOString().slice(0, 10) }

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
  const [closetFilter, setClosetFilter] = useState<'all' | Category>('all')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleItem = (id: string) =>
    setSelectedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const handleSave = async () => {
    if (selectedIds.size === 0) { setError('Select at least one item.'); return }
    setSaving(true); setError(null)
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

  const selectedCount = selectedIds.size
  const filteredItems = closetFilter === 'all' ? items : items.filter(i => i.category === closetFilter)

  return (
    <div style={{ paddingBottom: 120 }}>
      <AppBar
        title="Log outfit"
        back
        onBack={() => navigate(-1)}
      />

      {/* Date */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>date</SectionLabel>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{
            fontFamily: UI, fontSize: 15, fontWeight: 500, color: INK,
            background: 'none', border: 'none', outline: 'none',
            borderBottom: RULE, paddingBottom: 6, cursor: 'pointer', width: '100%',
          }}
        />
      </div>

      {/* Occasion — tags only */}
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

      {/* Pieces: selected items + closet picker in one scrollable container */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right={selectedCount > 0 ? `${selectedCount} selected` : undefined}>pieces</SectionLabel>

        <div style={{
          border: RULE, borderRadius: 4, overflow: 'hidden', marginTop: 10,
        }}>
          {/* Selected items — horizontal scroll strip */}
          {selectedCount > 0 && (
            <div style={{ padding: '12px 12px 0', borderBottom: RULE }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                // selected
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 12 }}>
                {Array.from(selectedIds).map(sid => {
                  const item = items.find(i => i.id === sid)
                  if (!item) return null
                  return (
                    <div key={sid} style={{ position: 'relative', flexShrink: 0, width: 64 }}>
                      <div style={{
                        width: 64, height: 80, overflow: 'hidden', border: `2px solid ${INK}`, borderRadius: 2,
                      }}>
                        {item.signedImageUrl ? (
                          <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: `repeating-linear-gradient(135deg, ${CREAM} 0 8px, #E8D3BD 8px 16px)` }} />
                        )}
                      </div>
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        fontFamily: MONO, fontSize: 7.5, background: INK, color: '#fff',
                        padding: '2px 4px', textAlign: 'center',
                      }}>{item.category}</div>
                      <button
                        onClick={() => toggleItem(sid)}
                        style={{
                          position: 'absolute', top: -6, right: -6,
                          width: 18, height: 18, borderRadius: '50%',
                          background: INK, color: '#fff', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, lineHeight: 1, padding: 0,
                        }}
                      >×</button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Closet picker */}
          <div style={{ padding: '12px' }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              // pick from closet
            </div>
            {/* Category filter tabs */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 10 }}>
              {CLOSET_FILTERS.map(f => (
                <button key={f.value} onClick={() => setClosetFilter(f.value)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
                  <MonoTag filled={closetFilter === f.value}>{f.label}</MonoTag>
                </button>
              ))}
            </div>
            {/* Item grid — scrollable */}
            {itemsLoading ? (
              <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', padding: '16px 0' }}>loading…</div>
            ) : filteredItems.length === 0 ? (
              <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', padding: '16px 0' }}>no items</div>
            ) : (
              <div style={{
                maxHeight: 300, overflowY: 'auto', scrollbarWidth: 'none',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                  {filteredItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <div style={{
                        width: '100%', aspectRatio: '3/4',
                        border: selectedIds.has(item.id) ? `2px solid ${INK}` : RULE,
                        position: 'relative', overflow: 'hidden', borderRadius: 2,
                      }}>
                        {item.signedImageUrl ? (
                          <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: `repeating-linear-gradient(135deg, ${CREAM} 0 8px, #E8D3BD 8px 16px)` }} />
                        )}
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          fontFamily: MONO, fontSize: 7.5,
                          background: 'rgba(255,255,255,0.88)', padding: '2px 4px',
                        }}>{item.category}</div>
                        {selectedIds.has(item.id) && (
                          <div style={{
                            position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                          }}>
                            <Icon name="check" size={20} stroke={2.5} />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
            borderBottom: RULE, padding: '6px 0', marginTop: 8,
            resize: 'none',
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
            background: 'none', cursor: 'pointer', marginTop: 8,
            padding: '24px 0',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          {imageFile ? (
            <span style={{ color: INK, textTransform: 'none', letterSpacing: 0 }}>{imageFile.name} ✓</span>
          ) : (
            <>
              <Icon name="camera" size={18} stroke={1.4} />
              tap to add photo
            </>
          )}
        </button>
      </div>

      {/* Fixed bottom bar — always above fold */}
      <div style={{
        position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: '#F7F6F5', borderTop: RULE,
        padding: '12px 20px', zIndex: 20,
      }}>
        {error && <div style={{ fontFamily: MONO, fontSize: 10, color: '#9C5544', marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <UButton variant="secondary" onClick={() => navigate(-1)} style={{ flex: 1 }}>Cancel</UButton>
          <UButton icon="check" disabled={saving || selectedIds.size === 0} onClick={handleSave} style={{ flex: 2 }}>
            {saving ? 'Saving…' : 'Log outfit'}
          </UButton>
        </div>
      </div>
    </div>
  )
}
