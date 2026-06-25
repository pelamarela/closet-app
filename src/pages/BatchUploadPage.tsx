import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { compressImage } from '../lib/imageUtils'
import { takeBatchFiles } from '../lib/batchState'
import { useItemMutations } from '../hooks/useItemMutations'
import { useItems } from '../hooks/useItems'
import { useBreakpoint } from '../hooks/useBreakpoint'
import RatingPicker from '../components/RatingPicker'
import { SectionLabel, UButton, Icon, MONO, UI, INK, RULE } from '../components/ui'
import type { Category } from '../types/database'
import FixedBar from '../components/FixedBar'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'top',        label: 'top' },
  { value: 'bottom',     label: 'btm' },
  { value: 'one-piece',  label: '1pc' },
  { value: 'outerwear',  label: 'otw' },
  { value: 'shoes',      label: 'shoe' },
  { value: 'accessory',  label: 'acc' },
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
  isDuplicate?: boolean
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

const VALID_CATEGORIES = new Set<Category>(['top', 'bottom', 'one-piece', 'outerwear', 'shoes', 'accessory'])

function toCategory(raw: string | undefined): Category {
  if (raw && VALID_CATEGORIES.has(raw as Category)) return raw as Category
  return 'top'
}

export default function BatchUploadPage() {
  const navigate = useNavigate()
  const { addItem } = useItemMutations()
  const { items: existingItems } = useItems()
  const { isDesktop } = useBreakpoint()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<Stage>('pick')

  // Consume files passed from WardrobePage via batchState
  useEffect(() => {
    const files = takeBatchFiles()
    if (files.length) processFiles(files)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [current, setCurrent] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [savedCount, setSavedCount] = useState(0)
  const [analyzeProgress, setAnalyzeProgress] = useState({ done: 0, total: 0 })

  // Extract meaningful name from filenames like "shop-block_0000s_0004_adidas-sl72-red (2).png"
  const parseName = (file: File): string => {
    const base = file.name.replace(/\.[^.]+$/, '')
    const segments = base.split('_')
    const meaningful = segments[segments.length - 1]
    return meaningful
      .replace(/\s*\(\d+\)\s*$/, '')  // strip " (2)", " (3)" etc
      .replace(/\s+\d+$/, '')            // strip trailing " 2", " 3" etc
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim()
  }

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const checkDuplicate = (name: string) =>
    existingItems.some(item => normalize(item.name) === normalize(name))

  const COLORS = new Set(['red','blue','black','white','green','brown','grey','gray','yellow','pink','purple','orange','beige','navy','cream','nude','camel','tan','ivory','khaki','olive','burgundy'])

  const parseColor = (name: string): string => {
    const words = name.toLowerCase().split(' ')
    return words.find(w => COLORS.has(w)) ?? ''
  }

  const parseBrand = (name: string): string => name.split(' ')[0] ?? ''

  const processFiles = useCallback(async (files: File[]) => {
    const initial: Draft[] = files.map(file => {
      const name = parseName(file)
      return {
        file,
        preview: URL.createObjectURL(file),
        name,
        isDuplicate: checkDuplicate(name),
        category: 'top' as Category,
        warmth: 3,
        formality: 3,
        color: parseColor(name),
        brand: parseBrand(name),
        material: '',
        pattern: '',
        subcategory: '',
      }
    })
    setDrafts(initial)
    setCurrent(0)
    setAnalyzeProgress({ done: 0, total: files.length })
    setStage('analyzing')

    // Analyze all images in parallel (max 5 concurrent), AI fills category/warmth/formality
    const CONCURRENCY = 5
    const enriched = [...initial]
    let done = 0

    for (let i = 0; i < files.length; i += CONCURRENCY) {
      const batch = files.slice(i, i + CONCURRENCY)
      const results = await Promise.all(batch.map(analyzeImage))
      results.forEach((result, j) => {
        const idx = i + j
        const base = enriched[idx]
        enriched[idx] = {
          ...base,
          // Filename takes priority for name/brand/color; AI fills the rest
          category:    toCategory(result.category as string),
          warmth:      typeof result.warmth === 'number' ? result.warmth : base.warmth,
          formality:   typeof result.formality === 'number' ? result.formality : base.formality,
          subcategory: result.subcategory ?? base.subcategory,
          material:    result.material ?? base.material,
          // Only override brand/color from AI if filename didn't provide them
          brand:       base.brand || (result.brand ?? ''),
          color:       base.color || (result.color ?? ''),
          isDuplicate: checkDuplicate(result.name ?? base.name),
        }
        done++
        setAnalyzeProgress({ done, total: files.length })
      })
      setDrafts([...enriched])
    }

    // Count duplicates after analysis
    const dupeCount = enriched.filter(d => d.isDuplicate).length
    if (dupeCount > 0) setError(`${dupeCount} item${dupeCount > 1 ? 's' : ''} may already be in your closet — marked in red`)
    setStage('fill')
  }, [])


  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    await processFiles(files)
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
    let saved = 0
    const failed: string[] = []

    for (const draft of drafts) {
      try {
        // Pass raw file — addItem → uploadImage handles compression internally
        await addItem(
          {
            name: draft.name.trim(), category: draft.category,
            warmth: draft.warmth, formality: draft.formality, sport: false,
            subcategory: draft.subcategory, color: draft.color,
            pattern: draft.pattern, material: draft.material, brand: draft.brand,
          },
          draft.file,
        )
        saved++
        setSavedCount(saved)
      } catch (err) {
        failed.push(draft.name)
        setSavedCount(s => s) // trigger re-render for progress
      }
    }

    if (failed.length > 0) {
      setError(`${failed.length} item${failed.length > 1 ? 's' : ''} failed to save: ${failed.join(', ')}`)
    }
    setSavedCount(saved)
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
        <UButton icon="spark" onClick={() => fileInputRef.current?.click()}>Choose photos</UButton>
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
          // AI is reading your photos
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
        <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.55)', marginBottom: error ? 12 : 28 }}>
          {savedCount} item{savedCount !== 1 ? 's' : ''} added to your closet.
        </div>
        {error && (
          <div style={{ fontFamily: MONO, fontSize: 10, color: '#9C5544', marginBottom: 20, maxWidth: 320 }}>
            {error}
          </div>
        )}
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

  const PhotoPanel = (
    <div style={{ width: '100%', aspectRatio: isDesktop ? '3/4' : '4/3', borderRadius: 3, overflow: 'hidden', border: RULE }}>
      <img src={draft.preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )

  const FormPanel = (
    <>
      <SectionLabel right="required *">attributes</SectionLabel>

      {/* Name */}
      <div style={{ padding: '12px 0', borderBottom: RULE }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>name <span style={{ color: '#9C5544' }}>*</span></span>
          {draft.isDuplicate && (
            <span style={{ background: '#9C5544', color: '#fff', fontFamily: MONO, fontSize: 8, padding: '2px 6px', letterSpacing: '0.06em' }}>
              already in closet
            </span>
          )}
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
    </>
  )

  const NavButtons = (
    <>
      {current > 0 ? (
        <UButton variant="ghost" onClick={() => setCurrent(c => c - 1)} style={{ flex: 1 }}>
          ← Back
        </UButton>
      ) : (
        <UButton variant="ghost" onClick={handleSkip} style={{ flex: 1 }}>
          Skip
        </UButton>
      )}
      {draft.isDuplicate && current < drafts.length - 1 && (
        <UButton variant="ghost" onClick={handleSkip} style={{ flex: 1, color: '#9C5544' }}>
          Skip duplicate
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
    </>
  )

  return (
    <div style={{ paddingBottom: isDesktop ? 40 : 100 }}>
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
        <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.06em' }}>
          // pre-filled by AI · review and correct
        </div>
      </div>

      {isDesktop ? (
        <div style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: 0, margin: '16px 20px 0', alignItems: 'start' }}>
          <div style={{ paddingRight: 24, position: 'sticky', top: 'var(--safe-t, 0)' }}>
            {PhotoPanel}
          </div>
          <div>
            {FormPanel}
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {NavButtons}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: '12px 20px 0' }}>{PhotoPanel}</div>
          <div style={{ padding: '16px 20px 0' }}>{FormPanel}</div>
          <FixedBar>{NavButtons}</FixedBar>
        </>
      )}
    </div>
  )
}
