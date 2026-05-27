import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { compressImage } from '../lib/imageUtils'
import { useItemMutations } from '../hooks/useItemMutations'
import RatingPicker from '../components/RatingPicker'
import { SectionLabel, UButton, MONO, UI, INK, RULE } from '../components/ui'
import type { Category } from '../types/database'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'top', label: 'top' },
  { value: 'bottom', label: 'btm' },
  { value: 'dress', label: 'dress' },
  { value: 'outerwear', label: 'coat' },
  { value: 'shoes', label: 'shoe' },
  { value: 'accessory', label: 'acc' },
]

interface Draft {
  file: File
  preview: string
  name: string
  category: Category
  warmth: number
  formality: number
}

type Stage = 'pick' | 'fill' | 'saving' | 'done'

export default function BatchUploadPage() {
  const navigate = useNavigate()
  const { addItem } = useItemMutations()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<Stage>('pick')
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [current, setCurrent] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [savedCount, setSavedCount] = useState(0)

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const newDrafts: Draft[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: '',
      category: 'top',
      warmth: 3,
      formality: 3,
    }))
    setDrafts(newDrafts)
    setCurrent(0)
    setStage('fill')
  }

  const update = (field: keyof Draft, value: unknown) => {
    setDrafts(ds => ds.map((d, i) => i === current ? { ...d, [field]: value } : d))
  }

  const canAdvance = drafts[current]?.name.trim().length > 0

  const handleSaveAll = async () => {
    setStage('saving')
    setError(null)
    let count = 0
    for (const draft of drafts) {
      try {
        const compressed = await compressImage(draft.file)
        await addItem(
          { name: draft.name.trim(), category: draft.category, warmth: draft.warmth, formality: draft.formality, subcategory: '', color: '', pattern: '', material: '', brand: '' },
          compressed,
        )
        count++
        setSavedCount(count)
      } catch (err) {
        setError(`Failed on "${draft.name}": ${err instanceof Error ? err.message : 'unknown error'}`)
        setStage('fill')
        return
      }
    }
    setStage('done')
  }

  if (stage === 'pick') {
    return (
      <div style={{ paddingBottom: 24 }}>
        {/* AppBar */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/wardrobe')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: UI, fontSize: 13, fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: INK,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6"/>
              </svg>
              Closet
            </button>
          </div>
          <div style={{ borderTop: RULE, marginTop: 12 }} />
        </div>

        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            // batch-upload
          </div>
          <div style={{ fontFamily: UI, fontSize: 26, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: 8 }}>
            Add multiple<br />items at once.
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)', marginBottom: 28 }}>
            Select photos · fill in details · save all
          </div>
          <UButton onClick={() => fileInputRef.current?.click()}>
            Choose photos
          </UButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFiles}
          />
        </div>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '100svh', padding: '0 24px', textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, background: INK, borderRadius: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5 9-11"/>
          </svg>
        </div>
        <div style={{ fontFamily: UI, fontSize: 24, fontWeight: 500, letterSpacing: '-0.025em', marginBottom: 8 }}>
          All done.
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.55)', marginBottom: 28 }}>
          {savedCount} items added to your closet.
        </div>
        <UButton onClick={() => navigate('/wardrobe')}>
          View wardrobe
        </UButton>
      </div>
    )
  }

  if (stage === 'saving') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '100svh', padding: '0 24px', textAlign: 'center',
      }}>
        <Loader2 className="animate-spin" size={24} style={{ color: 'rgba(0,0,0,0.3)', marginBottom: 16 }} />
        <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.55)' }}>
          saving {savedCount + 1} of {drafts.length}…
        </div>
      </div>
    )
  }

  const draft = drafts[current]
  const progress = ((current + 1) / drafts.length) * 100

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* AppBar */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/wardrobe')}
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
            step {current + 1} / {drafts.length}
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: 2, background: 'rgba(0,0,0,0.08)', marginTop: 12, borderRadius: 1 }}>
          <div style={{ height: '100%', background: INK, width: `${progress}%`, transition: 'width 0.2s', borderRadius: 1 }} />
        </div>
      </div>

      {/* Photo */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 3, overflow: 'hidden', border: RULE }}>
          <img src={draft.preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right="required *">attributes</SectionLabel>

        {/* Name */}
        <div style={{ padding: '12px 0', borderBottom: RULE }}>
          <div style={{
            fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
          }}>
            name <span style={{ color: '#9C5544' }}>*</span>
          </div>
          <input
            type="text"
            value={draft.name}
            onChange={e => update('name', e.target.value)}
            placeholder="e.g. Black linen blazer"
            autoFocus
            style={{
              width: '100%', fontFamily: UI, fontSize: 15, fontWeight: 500,
              color: draft.name ? INK : 'rgba(0,0,0,0.35)',
              background: 'none', border: 'none', outline: 'none', padding: 0,
            }}
          />
        </div>

        {/* Category */}
        <div style={{ padding: '12px 0', borderBottom: RULE }}>
          <div style={{
            fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
          }}>
            category <span style={{ color: '#9C5544' }}>*</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => update('category', c.value)}
                style={{
                  padding: '3px 10px', borderRadius: 2,
                  border: `1px solid ${draft.category === c.value ? INK : 'rgba(0,0,0,0.15)'}`,
                  background: draft.category === c.value ? INK : 'transparent',
                  color: draft.category === c.value ? '#fff' : 'rgba(0,0,0,0.55)',
                  fontFamily: MONO, fontSize: 10, cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >{c.label}</button>
            ))}
          </div>
        </div>

        <RatingPicker value={draft.warmth} onChange={v => update('warmth', v)} label="Warmth" hint="1 = light · 5 = heavy" />
        <RatingPicker value={draft.formality} onChange={v => update('formality', v)} label="Formality" hint="1 = casual · 5 = formal" />

        {error && (
          <div style={{ padding: '12px 0', fontFamily: MONO, fontSize: 10, color: '#9C5544' }}>{error}</div>
        )}
      </div>

      {/* Footer actions */}
      <div style={{
        position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: '#F7F6F5', borderTop: RULE,
        padding: '12px 20px',
        display: 'flex', gap: 8,
      }}>
        {current > 0 && (
          <UButton variant="ghost" onClick={() => setCurrent(c => c - 1)} style={{ flex: 1 }}>
            ← Back
          </UButton>
        )}
        {current < drafts.length - 1 ? (
          <UButton
            onClick={() => canAdvance && setCurrent(c => c + 1)}
            disabled={!canAdvance}
            style={{ flex: current > 0 ? 1.6 : 1, width: current > 0 ? undefined : '100%' }}
          >
            Next →
          </UButton>
        ) : (
          <UButton
            onClick={handleSaveAll}
            disabled={!canAdvance}
            style={{ flex: current > 0 ? 1.6 : 1, width: current > 0 ? undefined : '100%' }}
          >
            Save all {drafts.length} items
          </UButton>
        )}
      </div>
    </div>
  )
}
