import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { apiFetch } from '../lib/apiFetch'
import { useAuth } from '../hooks/useAuth'
import { useItemMutations } from '../hooks/useItemMutations'
import { peekSingleFile, clearSingleFile } from '../lib/batchState'
import { catLabel } from '../lib/categoryLabel'
import { useBreakpoint } from '../hooks/useBreakpoint'
import type { ItemFormData } from '../hooks/useItems'
import type { Category } from '../types/database'
import { T, fS, fM, V4Icon, V4Bar, Btn, Pill, Row4, Disp, Body, Mono, SecH, CONTENT_MAX_W } from '../design/kit'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'top', label: catLabel('top') },
  { value: 'bottom', label: catLabel('bottom') },
  { value: 'one-piece', label: catLabel('one-piece') },
  { value: 'outerwear', label: catLabel('outerwear') },
  { value: 'shoes', label: catLabel('shoes') },
  { value: 'accessory', label: catLabel('accessory') },
  { value: 'fragrance', label: catLabel('fragrance') },
]

const EMPTY: ItemFormData = {
  name: '', category: 'top', subcategory: '', color: '',
  pattern: '', material: '', warmth: 3, formality: 3, sport: false, brand: '',
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

export default function ItemFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem, updateItem, archiveItem } = useItemMutations()
  const { isDesktop } = useBreakpoint()

  const [preloadedFile] = useState<File | null>(() => isEdit ? null : peekSingleFile())
  const [form, setForm] = useState<ItemFormData>(() => {
    const f = isEdit ? null : peekSingleFile()
    if (!f) return EMPTY
    const name = f.name.replace(/\.[^.]+$/, '').replace(/[-_.]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase())
    return { ...EMPTY, name }
  })
  const [imageFile, setImageFile] = useState<File | null>(() => isEdit ? null : peekSingleFile())
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [loadingItem, setLoadingItem] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseName = (file: File) => {
    const base = file.name.replace(/\.[^.]+$/, '')
    const seg = base.split('_').pop() ?? base
    return seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim()
  }
  const COLORS = new Set(['red', 'blue', 'black', 'white', 'green', 'brown', 'grey', 'gray', 'yellow', 'pink', 'purple', 'orange', 'beige', 'navy', 'cream', 'nude', 'camel', 'tan', 'ivory', 'khaki', 'olive', 'burgundy'])
  const parseColor = (name: string) => name.toLowerCase().split(' ').find(w => COLORS.has(w)) ?? ''
  const VALID_CATS = new Set(['top', 'bottom', 'one-piece', 'outerwear', 'shoes', 'accessory', 'fragrance'])
  const toCategory = (raw: string): Category => VALID_CATS.has(raw) ? raw as Category : 'top'

  const analyzePhoto = async (file: File) => {
    setAnalyzing(true); setAnalyzeError(null)
    try {
      const compressed = await import('../lib/imageUtils').then(m => m.compressImage(file))
      const reader = new FileReader()
      const { data, mediaType } = await new Promise<{ data: string; mediaType: string }>((resolve, reject) => {
        reader.onload = () => {
          const r = reader.result as string
          resolve({ data: r.split(',')[1], mediaType: r.split(';')[0].slice(5) })
        }
        reader.onerror = reject
        reader.readAsDataURL(compressed)
      })
      const res = await apiFetch('/api/analyze-item', { image_base64: data, media_type: mediaType })
      if (!res.ok) return
      const ai = await res.json()
      const name = parseName(file)
      setForm(prev => ({
        ...prev,
        name: prev.name || name,
        category: toCategory(ai.category),
        color: prev.color || parseColor(name) || ai.color || '',
        brand: prev.brand || parseName(file).split(' ')[0] || ai.brand || '',
        subcategory: ai.subcategory || prev.subcategory,
        material: ai.material || prev.material,
        warmth: typeof ai.warmth === 'number' ? ai.warmth : prev.warmth,
        formality: typeof ai.formality === 'number' ? ai.formality : prev.formality,
      }))
    } catch { setAnalyzeError('AI analysis unavailable — fill in manually') } finally {
      setAnalyzing(false)
    }
  }

  useEffect(() => {
    if (!isEdit || !user) return
    supabase.from('items').select('*').eq('id', id).eq('user_id', user.id).single()
      .then(async ({ data }) => {
        if (!data) { setLoadingItem(false); return }
        setForm({
          name: data.name, category: data.category as Category,
          subcategory: data.subcategory ?? '', color: data.color ?? '',
          pattern: data.pattern ?? '', material: data.material ?? '',
          warmth: data.warmth, formality: data.formality, sport: data.sport ?? false, brand: data.brand ?? '',
        })
        if (data.image_url) {
          const { data: s } = await supabase.storage.from('item-photos').createSignedUrl(data.image_url, 3600)
          setExistingImageUrl(s?.signedUrl ?? null)
        }
        setLoadingItem(false)
      })
  }, [id, isEdit, user])

  useEffect(() => {
    if (!preloadedFile) return
    clearSingleFile()
    async function analyze() {
      try {
        const { compressImage } = await import('../lib/imageUtils')
        const compressed = await compressImage(preloadedFile!)
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve((reader.result as string).split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(compressed)
        })
        const res = await apiFetch('/api/analyze-item', { image_base64: base64, media_type: 'image/jpeg' })
        if (!res.ok) return
        const ai = await res.json()
        setForm(f => ({
          ...f,
          ...(ai.category ? { category: ai.category } : {}),
          ...(ai.color ? { color: ai.color } : {}),
          ...(ai.brand ? { brand: ai.brand } : {}),
          ...(ai.material ? { material: ai.material } : {}),
          ...(ai.pattern ? { pattern: ai.pattern } : {}),
          ...(ai.subcategory ? { subcategory: ai.subcategory } : {}),
        }))
      } catch { setAnalyzeError('AI analysis unavailable — fill in manually') }
    }
    analyze()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (k: keyof ItemFormData) => (v: string) => setForm(f => ({ ...f, [k]: v }) as ItemFormData)
  const imagePreview = imageFile ? URL.createObjectURL(imageFile) : existingImageUrl

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    setSaving(true); setError(null)
    try {
      if (isEdit && id) await updateItem(id, form, imageFile ?? undefined)
      else await addItem(form, imageFile ?? undefined)
      navigate('/wardrobe')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!id || !confirm('Archive this item? It will be hidden from your wardrobe.')) return
    setSaving(true)
    try { await archiveItem(id); navigate('/wardrobe') }
    catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong'); setSaving(false) }
  }

  if (loadingItem) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  }

  const PhotoBlock = (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0] ?? null; setImageFile(f); if (f) analyzePhoto(f) }} />
      <button
        type="button" onClick={() => fileInputRef.current?.click()}
        style={{
          width: '100%', border: 'none', padding: 0, cursor: 'pointer', position: 'relative', overflow: 'hidden',
          boxShadow: imagePreview ? `inset 0 0 0 1px ${T.line}` : 'none', background: imagePreview ? 'none' : T.white,
          ...(isDesktop && imagePreview ? {} : { aspectRatio: '4/3' }),
        }}
      >
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="" style={isDesktop ? { width: '100%', height: 'auto', display: 'block' } : { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ height: 34, display: 'inline-flex', alignItems: 'center', padding: '0 14px', background: 'rgba(247,246,245,.94)', fontFamily: fS, fontSize: 13, fontWeight: 600, color: T.ink }}>{analyzing ? 'Analyzing…' : 'Change photo'}</span>
            </div>
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', border: `1.5px dashed ${T.g200}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <V4Icon n="cam" s={26} w={1.4} c={T.g400} />
            <Body s={13.5} c={T.ink}>Tap to add a photo</Body>
            <Mono s={10}>max 1200px · ~300 KB · JPEG</Mono>
            {analyzing && <Body s={12} c={T.cocoa} style={{ marginTop: 4 }}>Analyzing with AI…</Body>}
          </div>
        )}
      </button>
      {analyzeError && <Body s={12} c={T.roseDeep} style={{ marginTop: 8 }}>{analyzeError}</Body>}
    </>
  )

  const FormBlock = (
    <>
      <SecH>Attributes</SecH>
      <Field label="Name" value={form.name} onChange={set('name')} placeholder="e.g. Black linen blazer" />
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g500, marginBottom: 8 }}>Category</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CATEGORIES.map(c => <Pill key={c.value} s="sm" on={form.category === c.value} onClick={() => setForm(f => ({ ...f, category: c.value }))}>{c.label}</Pill>)}
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g500 }}>Warmth</div>
          <Mono s={11}>1 = light · 5 = heavy</Mono>
        </div>
        <DotPicker value={form.warmth} onChange={v => setForm(f => ({ ...f, warmth: v }))} />
      </div>
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g500 }}>Formality</div>
          <Mono s={11}>1 = casual · 5 = formal</Mono>
        </div>
        <DotPicker value={form.formality} onChange={v => setForm(f => ({ ...f, formality: v }))} tone={T.roseDeep} />
      </div>
      <Row4
        label="Sport / gym only" sub="Excluded from everyday outfit suggestions"
        value={form.sport ? 'On' : 'Off'} chev={false}
        onClick={() => setForm(f => ({ ...f, sport: !f.sport }))}
      />
      <div style={{ marginTop: 6 }}>
        <Field label="Colour" value={form.color} onChange={set('color')} placeholder="white, navy, black…" />
        <Field label="Brand" value={form.brand} onChange={set('brand')} placeholder="e.g. Toteme" />
        <Field label="Material" value={form.material} onChange={set('material')} placeholder="cotton, wool, silk…" />
        <Field label="Pattern" value={form.pattern} onChange={set('pattern')} placeholder="solid, stripe, floral…" />
        <Field label="Subcategory" value={form.subcategory} onChange={set('subcategory')} placeholder="e.g. blazer, midi skirt…" />
      </div>
    </>
  )

  return (
    <div style={{ paddingBottom: 100 }}>
      <V4Bar
        back title="Closet" onBack={() => navigate('/wardrobe')}
        right={isEdit ? <button onClick={handleArchive} disabled={saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.g400, display: 'flex', opacity: saving ? .4 : 1 }}><V4Icon n="archive" s={19} w={1.6} /></button> : undefined}
      />
      <div style={{ padding: '4px 22px 0' }}>
        <Disp s={24}>{isEdit ? 'Edit item' : 'Add an item'}</Disp>
      </div>
      {isDesktop ? (
        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 44, alignItems: 'start', padding: '18px 22px 0' }}>
          <div style={{ position: 'sticky', top: 20 }}>{PhotoBlock}</div>
          <div>{FormBlock}</div>
        </div>
      ) : (
        <>
          <div style={{ padding: '18px 22px 0' }}>{PhotoBlock}</div>
          <div style={{ padding: '26px 22px 0' }}>{FormBlock}</div>
        </>
      )}
      <div style={{ position: 'fixed', bottom: 'var(--v3-sticky-bottom)', left: 'var(--v3-sidenav-w)', right: 0, padding: '14px 22px 20px', background: 'rgba(247,246,245,.96)', backdropFilter: 'blur(10px)', borderTop: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: CONTENT_MAX_W, margin: '0 auto', display: 'flex', gap: 10 }}>
          {error && <Body s={12} c={T.roseDeep} style={{ position: 'absolute', top: -26, left: 0 }}>{error}</Body>}
          <Btn kind="quiet" flex={1} onClick={() => navigate('/wardrobe')}>Cancel</Btn>
          <Btn flex={1.6} icon="check" disabled={saving || !form.name.trim()} onClick={handleSubmit}>{saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add to closet'}</Btn>
        </div>
      </div>
    </div>
  )
}
