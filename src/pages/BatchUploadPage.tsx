import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { compressImage } from '../lib/imageUtils'
import { apiFetch } from '../lib/apiFetch'
import { takeBatchFiles } from '../lib/batchState'
import { useItemMutations } from '../hooks/useItemMutations'
import { useItems } from '../hooks/useItems'
import { catLabel } from '../lib/categoryLabel'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { T, fS, fM, dotted, V4Bar, V4Icon, Btn, Pill, Row4, Disp, Body, Mono, CONTENT_MAX_W } from '../design/kit'
import type { Category } from '../types/database'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'top', label: catLabel('top') },
  { value: 'bottom', label: catLabel('bottom') },
  { value: 'one-piece', label: catLabel('one-piece') },
  { value: 'outerwear', label: catLabel('outerwear') },
  { value: 'shoes', label: catLabel('shoes') },
  { value: 'accessory', label: catLabel('accessory') },
  { value: 'fragrance', label: catLabel('fragrance') },
]

interface Draft {
  file: File; preview: string; name: string; category: Category
  warmth: number; formality: number; sport: boolean; color: string; brand: string
  material: string; pattern: string; subcategory: string; isDuplicate?: boolean
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
    const res = await apiFetch('/api/analyze-item', { image_base64: data, media_type })
    if (!res.ok) throw new Error('API error')
    return await res.json()
  } catch { return {} }
}

const VALID_CATEGORIES = new Set<Category>(['top', 'bottom', 'one-piece', 'outerwear', 'shoes', 'accessory', 'fragrance'])
function toCategory(raw: string | undefined): Category {
  return raw && VALID_CATEGORIES.has(raw as Category) ? raw as Category : 'top'
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g500, marginBottom: 6 }}>{label}</div>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', fontFamily: fS, fontSize: 15, color: T.ink, background: 'none', border: 'none', outline: 'none', borderBottom: `1px solid ${T.line}`, padding: '4px 0 8px' }}
      />
    </div>
  )
}

function DotPicker({ value, onChange, n = 5, tone = T.cocoa }: { value: number; onChange: (v: number) => void; n?: number; tone?: string }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: n }, (_, i) => i + 1).map(n2 => (
        <button key={n2} type="button" onClick={() => onChange(n2)} style={{ flex: 1, height: 36, background: n2 <= value ? tone : 'transparent', boxShadow: `inset 0 0 0 1px ${n2 <= value ? tone : T.g200}`, border: 'none', cursor: 'pointer', fontFamily: fM, fontSize: 11, fontWeight: 700, color: n2 <= value ? '#fff' : T.g400 }}>{n2}</button>
      ))}
    </div>
  )
}

export default function BatchUploadPage() {
  const navigate = useNavigate()
  const { addItem } = useItemMutations()
  const { items: existingItems } = useItems()
  const { isDesktop } = useBreakpoint()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<Stage>('pick')
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
      .replace(/\s*\(\d+\)\s*$/, '')
      .replace(/\s+\d+$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim()
  }

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const checkDuplicate = (name: string) => existingItems.some(item => normalize(item.name) === normalize(name))

  const COLORS = new Set(['red', 'blue', 'black', 'white', 'green', 'brown', 'grey', 'gray', 'yellow', 'pink', 'purple', 'orange', 'beige', 'navy', 'cream', 'nude', 'camel', 'tan', 'ivory', 'khaki', 'olive', 'burgundy'])
  const parseColor = (name: string): string => name.toLowerCase().split(' ').find(w => COLORS.has(w)) ?? ''
  const parseBrand = (name: string): string => name.split(' ')[0] ?? ''

  const processFiles = useCallback(async (files: File[]) => {
    const initial: Draft[] = files.map(file => {
      const name = parseName(file)
      return {
        file, preview: URL.createObjectURL(file), name, isDuplicate: checkDuplicate(name),
        category: 'top' as Category, warmth: 3, formality: 3, sport: false,
        color: parseColor(name), brand: parseBrand(name), material: '', pattern: '', subcategory: '',
      }
    })
    setDrafts(initial)
    setCurrent(0)
    setAnalyzeProgress({ done: 0, total: files.length })
    setStage('analyzing')

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
          category: toCategory(result.category as string),
          warmth: typeof result.warmth === 'number' ? result.warmth : base.warmth,
          formality: typeof result.formality === 'number' ? result.formality : base.formality,
          subcategory: result.subcategory ?? base.subcategory,
          material: result.material ?? base.material,
          brand: base.brand || (result.brand ?? ''),
          color: base.color || (result.color ?? ''),
          isDuplicate: checkDuplicate(result.name ?? base.name),
        }
        done++
        setAnalyzeProgress({ done, total: files.length })
      })
      setDrafts([...enriched])
    }

    const dupeCount = enriched.filter(d => d.isDuplicate).length
    if (dupeCount > 0) setError(`${dupeCount} item${dupeCount > 1 ? 's' : ''} may already be in your closet — marked below`)
    setStage('fill')
  }, [checkDuplicate, parseColor])

  useEffect(() => {
    const files = takeBatchFiles()
    if (files.length) processFiles(files)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
        await addItem(
          {
            name: draft.name.trim(), category: draft.category,
            warmth: draft.warmth, formality: draft.formality, sport: draft.sport,
            subcategory: draft.subcategory, color: draft.color,
            pattern: draft.pattern, material: draft.material, brand: draft.brand,
          },
          draft.file,
        )
        saved++
        setSavedCount(saved)
      } catch { failed.push(draft.name) }
    }
    if (failed.length > 0) setError(`${failed.length} item${failed.length > 1 ? 's' : ''} failed to save: ${failed.join(', ')}`)
    setSavedCount(saved)
    setStage('done')
  }

  const fileInput = (
    <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
  )

  const centered = { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100svh', padding: '0 28px', textAlign: 'center' as const }

  if (stage === 'pick') {
    return (
      <div style={centered}>
        {fileInput}
        <Btn icon="spark" onClick={() => fileInputRef.current?.click()}>Choose photos</Btn>
      </div>
    )
  }

  if (stage === 'analyzing') {
    const pct = analyzeProgress.total > 0 ? (analyzeProgress.done / analyzeProgress.total) * 100 : 0
    return (
      <div style={{ ...dotted, minHeight: '100svh' }}>
        <V4Bar />
        <div style={{ padding: '40px 40px 0' }}>
          <img src="/brand/wave.png" alt="" style={{ width: 100, display: 'block', marginBottom: 24 }} />
          <Disp s={26}>Reading your photos.</Disp>
          <div style={{ marginTop: 28, maxWidth: 280 }}>
            <div style={{ width: '100%', height: 2, background: T.g200, marginBottom: 14 }}>
              <div style={{ height: '100%', background: T.ink, width: `${pct}%`, transition: 'width .3s' }} />
            </div>
            <Body s={14}>{analyzeProgress.done} of {analyzeProgress.total} analyzed…</Body>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'saving') {
    const pct = drafts.length > 0 ? (savedCount / drafts.length) * 100 : 0
    return (
      <div style={{ ...dotted, minHeight: '100svh' }}>
        <V4Bar />
        <div style={{ padding: '40px 40px 0' }}>
          <img src="/brand/wave.png" alt="" style={{ width: 100, display: 'block', marginBottom: 24 }} />
          <Disp s={26}>Adding to your closet.</Disp>
          <div style={{ marginTop: 28, maxWidth: 280 }}>
            <div style={{ width: '100%', height: 2, background: T.g200, marginBottom: 14 }}>
              <div style={{ height: '100%', background: T.ink, width: `${pct}%`, transition: 'width .3s' }} />
            </div>
            <Body s={14}>saving {Math.min(savedCount + 1, drafts.length)} of {drafts.length}…</Body>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <div style={centered}>
        <div style={{ width: 56, height: 56, background: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <V4Icon n="check" s={24} w={2.2} c="#fff" />
        </div>
        <Disp s={24} style={{ marginBottom: 8 }}>All done.</Disp>
        <Body s={13} style={{ marginBottom: error ? 12 : 28 }}>{savedCount} item{savedCount !== 1 ? 's' : ''} added to your closet.</Body>
        {error && <Body s={12} c={T.roseDeep} style={{ marginBottom: 20, maxWidth: 320 }}>{error}</Body>}
        <Btn onClick={() => navigate('/wardrobe')}>View wardrobe</Btn>
      </div>
    )
  }

  const draft = drafts[current]
  const progress = ((current + 1) / drafts.length) * 100

  const PhotoBlock = (
    <div style={{ width: '100%', overflow: 'hidden', boxShadow: `inset 0 0 0 1px ${T.line}`, ...(isDesktop ? {} : { aspectRatio: '4/3' }) }}>
      <img src={draft.preview} alt="" style={isDesktop ? { width: '100%', height: 'auto', display: 'block' } : { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )

  const FormBlock = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g500 }}>Name</div>
        {draft.isDuplicate && <Mono s={9.5} c={T.roseDeep} style={{ textTransform: 'uppercase' }}>already in closet</Mono>}
      </div>
      <input
        type="text" value={draft.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Black linen blazer" autoFocus
        style={{ width: '100%', fontFamily: fS, fontSize: 15, color: T.ink, background: 'none', border: 'none', outline: 'none', borderBottom: `1px solid ${T.line}`, padding: '4px 0 8px' }}
      />

      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g500, marginBottom: 8 }}>Category</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CATEGORIES.map(c => <Pill key={c.value} s="sm" on={draft.category === c.value} onClick={() => update('category', c.value)}>{c.label}</Pill>)}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g500 }}>Warmth</div>
          <Mono s={11}>1 = light · 5 = heavy</Mono>
        </div>
        <DotPicker value={draft.warmth} onChange={v => update('warmth', v)} />
      </div>
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g500 }}>Formality</div>
          <Mono s={11}>1 = casual · 5 = formal</Mono>
        </div>
        <DotPicker value={draft.formality} onChange={v => update('formality', v)} tone={T.roseDeep} />
      </div>
      <Row4
        label="Sport / gym only" sub="Excluded from everyday outfit suggestions"
        value={draft.sport ? 'On' : 'Off'} chev={false}
        onClick={() => update('sport', !draft.sport)}
      />

      <div style={{ marginTop: 14 }}>
        <Field label="Colour" value={draft.color} onChange={v => update('color', v)} placeholder="white, navy, black…" />
        <Field label="Brand" value={draft.brand} onChange={v => update('brand', v)} placeholder="e.g. Toteme" />
        <Field label="Material" value={draft.material} onChange={v => update('material', v)} placeholder="cotton, wool, silk…" />
        <Field label="Pattern" value={draft.pattern} onChange={v => update('pattern', v)} placeholder="solid, stripe, floral…" />
        <Field label="Subcategory" value={draft.subcategory} onChange={v => update('subcategory', v)} placeholder="e.g. blazer, midi skirt…" />
      </div>

      {error && <Body s={12} c={T.roseDeep}>{error}</Body>}
    </>
  )

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '16px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate('/wardrobe')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: fS, fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: T.ink }}>
            <V4Icon n="back" s={16} w={1.6} /> Cancel
          </button>
          <Mono s={11}>{current + 1} / {drafts.length}</Mono>
        </div>
        <div style={{ height: 2, background: T.g200, marginTop: 12 }}>
          <div style={{ height: '100%', background: T.ink, width: `${progress}%`, transition: 'width .2s' }} />
        </div>
      </div>

      {isDesktop ? (
        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 44, alignItems: 'start', padding: '18px 22px 0' }}>
          <div style={{ position: 'sticky', top: 20 }}>{PhotoBlock}</div>
          <div>{FormBlock}</div>
        </div>
      ) : (
        <>
          <div style={{ padding: '18px 22px 0' }}>{PhotoBlock}</div>
          <div style={{ padding: '22px 22px 0' }}>{FormBlock}</div>
        </>
      )}

      <div style={{ position: 'fixed', bottom: 'var(--v3-sticky-bottom)', left: 'var(--v3-sidenav-w)', right: 0, padding: '14px 22px 20px', background: 'rgba(247,246,245,.96)', backdropFilter: 'blur(10px)', borderTop: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: CONTENT_MAX_W, margin: '0 auto', display: 'flex', gap: 10 }}>
          {current > 0 ? (
            <Btn kind="quiet" flex={1} onClick={() => setCurrent(c => c - 1)}>Back</Btn>
          ) : (
            <Btn kind="quiet" flex={1} onClick={handleSkip}>Skip</Btn>
          )}
          {current < drafts.length - 1 ? (
            <Btn flex={1.6} disabled={!canAdvance} onClick={() => canAdvance && setCurrent(c => c + 1)}>Next</Btn>
          ) : (
            <Btn flex={1.6} disabled={!canAdvance} onClick={handleSaveAll}>Save all {drafts.length}</Btn>
          )}
        </div>
      </div>
    </div>
  )
}
