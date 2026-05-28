import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { compressImage } from '../lib/imageUtils'
import { useItemMutations } from '../hooks/useItemMutations'
import RatingPicker from '../components/RatingPicker'
import { SectionLabel, UButton, Icon, MONO, UI, INK, RULE } from '../components/ui'
import type { Category } from '../types/database'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'top',       label: 'top' },
  { value: 'bottom',    label: 'btm' },
  { value: 'dress',     label: 'dress' },
  { value: 'outerwear', label: 'coat' },
  { value: 'shoes',     label: 'shoe' },
  { value: 'accessory', label: 'acc' },
]

interface Draft {
  file: File
  preview: string
  name: string
  category: Category
  warmth: number
  formality: number
  color: string
  brand: string
  material: string
  pattern: string
  subcategory: string
}

type Stage = 'pick' | 'analyzing' | 'fill' | 'saving' | 'done'

async function toBase64(file: File): Promise<{ data: string; media_type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const [header, data] = result.split(',')
      const media_type = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
      resolve({ data, media_type })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function analyzeImage(file: File): Promise<Partial<Draft>> {
  try {
    const compressed = await compressImage(file)
    const { data, media_type } = await toBase64(compressed)
    const res = await fetch('/api/analyze-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: data, media_type }),
    })
    if (!res.ok) throw new Error('API error')
    return await res.json()
  } catch {
    return {}
  }
}

const VALID_CATEGORIES = new Set<Category>(['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'])

function toCategory(raw: string | undefined): Category {
  if (raw && VALID_CATEGORIES.has(raw as Category)) return raw as Category
  return 'top'
}

export default function BatchUploadPage() {
  const navigate = useNavigate()
  const { addItem } = useItemMutations()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<Stage>('pick')

  useEffect(() => { fileInputRef.current?.click() }, [])
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [current, setCurrent] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [savedCount, setSavedCount] = useState(0)
  const [analyzeProgress, setAnalyzeProgress] = useState({ done: 0, total: 0 })

  const nameFromFile = (file: File) =>
    file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[-_.]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, c => c.toUpperCase())

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    // Build initial drafts from file names
    const initial: Draft[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: nameFromFile(file),
      category: 'top',
      warmth: 3,
      formality: 3,
      color: '',
      brand: '',
      material: '',
      pattern: '',
      subcategory: '',
    }))
    setDrafts(initial)
    setCurrent(0)
    setAnalyzeProgress({ done: 0, total: files.length })
    setStage('analyzing')

    // Analyze all images in parallel (max 5 concurrent)
    const CONCURRENCY = 5
    const enriched = [...initial]
    let done = 0

    for (let i = 0; i < files.length; i += CONCURRENCY) {
      const batch = files.slice(i, i + CONCURRENCY)
      const results = await Promise.all(batch.map(analyzeImage))
      results.forEach((result, j) => {
        const idx = i + j
        enriched[idx] = {
          ...enriched[idx],
          name: result.name ?? enriched[idx].name,
          category: toCategory(result.category as string),
          color: result.color ?? '',
          subcategory: result.subcategory ?? '',
          warmth: typeof result.warmth === 'number' ? result.warmth : 3,
          formality: typeof result.formality === 'number' ? result.formality : 3,
          brand: result.brand ?? '',
          material: result.material ?? '',
        }
        done++
        setAnalyzeProgress({ done, total: files.length })
      })
      setDrafts([...enriched])
    }

    setStage('fill')
  }

  const handleSkip = () => {
    if (drafts.length === 1) { navigate('/wardrobe'); return }
    setDrafts(ds => ds.filter((_, i) => i !== current))
    setCurrent(c => Math.min(c, drafts.length - 2))
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
          {
            name: draft.name.trim(), category: draft.category,
            warmth: draft.warmth, formality: draft.formality,
            subcategory: draft.subcategory, color: draft.color,
            pattern: draft.pattern, material: draft.material, brand: draft.brand,
          },
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

  // ── Pick — just the hidden input; dialog opens automatically on mount ────────
  // The input is always rendered so useEffect can click it immediately.
  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      style={{ display: 'none' }}
      onChange={handleFiles}
    />
  )

  if (stage === 'pick') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100svh', gap: 12,
      }}>
        {fileInput}
        {/* Fallback if browser blocks auto-open */}
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>opening file picker…</div>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ fontFamily: MONO, fontSize: 10, color: INK, background: 'none', border: `1px solid ${INK}`, padding: '6px 14px', cursor: 'pointer' }}
        >
          tap here if nothing opened
        </button>
      </div>
    )
  }

  // ── Analyzing ────────────────────────────────────────────────────────────────
  if (stage === 'analyzing') {
    const pct = analyzeProgress.total > 0 ? (analyzeProgress.done / analyzeProgress.total) * 100 : 0
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100svh', padding: '0 32px', textAlign: 'center',
      }}>
        <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
          // claude is reading your photos
        </div>
        <div style={{ width: '100%', height: 2, background: 'rgba(0,0,0,0.08)', borderRadius: 1, marginBottom: 14 }}>
          <div style={{ height: '100%', background: INK, width: `${pct}%`, transition: 'width 0.3s', borderRadius: 1 }} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.55)' }}>
          {analyzeProgress.done} of {analyzeProgress.total} analyzed…
        </div>
      </div>
    )
  }

  // ── Done ─────────────────────────────────────────────────────────────────────
  if (stage === 'done') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100svh', padding: '0 24px', textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, background: INK, borderRadius: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        }}>
          <Icon name="check" size={24} stroke={2.5} />
        </div>
        <div style={{ fontFamily: UI, fontSize: 24, fontWeight: 500, letterSpacing: '-0.025em', marginBottom: 8 }}>
          All done.
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.55)', marginBottom: 28 }}>
          {savedCount} items added to your closet.
        </div>
        <UButton onClick={() => navigate('/wardrobe')}>View wardrobe</UButton>
      </div>
    )
  }

  // ── Saving ───────────────────────────────────────────────────────────────────
  if (stage === 'saving') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100svh', padding: '0 24px', textAlign: 'center',
      }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.55)', marginBottom: 16 }}>
          saving {savedCount + 1} of {drafts.length}…
        </div>
        <div style={{ width: 200, height: 2, background: 'rgba(0,0,0,0.08)', borderRadius: 1 }}>
          <div style={{ height: '100%', background: INK, width: `${((savedCount) / drafts.length) * 100}%`, transition: 'width 0.3s', borderRadius: 1 }} />
        </div>
      </div>
    )
  }

  // ── Fill / review wizard ─────────────────────────────────────────────────────
  const draft = drafts[current]
  const progress = ((current + 1) / drafts.length) * 100

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
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
            <Icon name="back" size={16} stroke={1.6} /> Cancel
          </button>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>
            {current + 1} / {drafts.length}
          </div>
        </div>
        <div style={{ height: 2, background: 'rgba(0,0,0,0.08)', marginTop: 12, borderRadius: 1 }}>
          <div style={{ height: '100%', background: INK, width: `${progress}%`, transition: 'width 0.2s', borderRadius: 1 }} />
        </div>
        {/* AI badge */}
        <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.06em' }}>
          // pre-filled by claude · review and correct
        </div>
      </div>

      {/* Photo */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 3, overflow: 'hidden', border: RULE }}>
          <img src={draft.preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: '16px 20px 0' }}>
        <SectionLabel right="required *">attributes</SectionLabel>

        {/* Name */}
        <div style={{ padding: '12px 0', borderBottom: RULE }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
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
          <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            category <span style={{ color: '#9C5544' }}>*</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => update('category', c.value)}
                style={{
                  padding: '3px 10px', borderRadius: 2, cursor: 'pointer',
                  border: `1px solid ${draft.category === c.value ? INK : 'rgba(0,0,0,0.15)'}`,
                  background: draft.category === c.value ? INK : 'transparent',
                  color: draft.category === c.value ? '#fff' : 'rgba(0,0,0,0.55)',
                  fontFamily: MONO, fontSize: 10, letterSpacing: '0.04em',
                }}
              >{c.label}</button>
            ))}
          </div>
        </div>

        <RatingPicker value={draft.warmth} onChange={v => update('warmth', v)} label="Warmth" hint="1 = light · 5 = heavy" />
        <RatingPicker value={draft.formality} onChange={v => update('formality', v)} label="Formality" hint="1 = casual · 5 = formal" />

        {([
          ['color',       'white, navy, black…',      draft.color],
          ['brand',       'e.g. Toteme',               draft.brand],
          ['material',    'cotton, wool, silk…',       draft.material],
          ['pattern',     'solid, stripe, floral…',    draft.pattern],
          ['subcategory', 'e.g. blazer, midi skirt…',  draft.subcategory],
        ] as [keyof Draft, string, string][]).map(([field, placeholder, value]) => (
          <div key={field} style={{ padding: '12px 0', borderBottom: RULE }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {field}
            </div>
            <input
              type="text"
              value={value}
              onChange={e => update(field, e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%', fontFamily: MONO, fontSize: 12, fontWeight: 500,
                color: value ? INK : 'rgba(0,0,0,0.35)',
                background: 'none', border: 'none', outline: 'none', padding: 0,
              }}
            />
          </div>
        ))}

        {error && (
          <div style={{ padding: '12px 0', fontFamily: MONO, fontSize: 10, color: '#9C5544' }}>{error}</div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: '#F7F6F5', borderTop: RULE,
        padding: '12px 20px',
        display: 'flex', gap: 8,
      }}>
        {current > 0 ? (
          <UButton variant="ghost" onClick={() => setCurrent(c => c - 1)} style={{ flex: 1 }}>
            ← Back
          </UButton>
        ) : (
          <UButton variant="ghost" onClick={handleSkip} style={{ flex: 1 }}>
            Skip
          </UButton>
        )}
        {current < drafts.length - 1 ? (
          <UButton onClick={() => canAdvance && setCurrent(c => c + 1)} disabled={!canAdvance} style={{ flex: 1.6 }}>
            Next →
          </UButton>
        ) : (
          <UButton onClick={handleSaveAll} disabled={!canAdvance} style={{ flex: 1.6 }}>
            Save all {drafts.length} items
          </UButton>
        )}
      </div>
    </div>
  )
}
