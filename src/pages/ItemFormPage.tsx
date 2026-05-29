import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useItemMutations } from '../hooks/useItemMutations'
import RatingPicker from '../components/RatingPicker'
import { SectionLabel, UButton, MONO, UI, INK, RULE } from '../components/ui'
import { takeSingleFile } from '../lib/batchState'
import type { ItemFormData } from '../hooks/useItems'
import type { Category } from '../types/database'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'top', label: 'top' },
  { value: 'bottom', label: 'btm' },
  { value: 'one-piece', label: '1pc' },
  { value: 'outerwear', label: 'otw' },
  { value: 'shoes', label: 'shoe' },
  { value: 'accessory',  label: 'acc' },
]

const EMPTY: ItemFormData = {
  name: '', category: 'top', subcategory: '', color: '',
  pattern: '', material: '', warmth: 3, formality: 3, brand: '',
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  mono,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  mono?: boolean
}) {
  return (
    <div style={{ padding: '12px 0', borderBottom: RULE }}>
      <div style={{
        fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
      }}>
        {label}{required && <span style={{ color: '#9C5544', marginLeft: 3 }}>*</span>}
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          fontFamily: mono ? MONO : UI,
          fontSize: mono ? 12 : 15,
          fontWeight: 500,
          color: value ? INK : 'rgba(0,0,0,0.35)',
          background: 'none', border: 'none', outline: 'none', padding: 0,
        }}
      />
    </div>
  )
}

export default function ItemFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem, updateItem, archiveItem } = useItemMutations()

  const [form, setForm] = useState<ItemFormData>(EMPTY)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [loadingItem, setLoadingItem] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEdit || !user) return
    supabase.from('items').select('*').eq('id', id).eq('user_id', user.id).single()
      .then(async ({ data }) => {
        if (!data) { setLoadingItem(false); return }
        setForm({
          name: data.name,
          category: data.category as Category,
          subcategory: data.subcategory ?? '',
          color: data.color ?? '',
          pattern: data.pattern ?? '',
          material: data.material ?? '',
          warmth: data.warmth,
          formality: data.formality,
          brand: data.brand ?? '',
        })
        if (data.image_url) {
          const { data: s } = await supabase.storage
            .from('item-photos').createSignedUrl(data.image_url, 3600)
          setExistingImageUrl(s?.signedUrl ?? null)
        }
        setLoadingItem(false)
      })
  }, [id, isEdit, user])

  useEffect(() => {
    if (isEdit) return
    const file = takeSingleFile()
    if (file) {
      setImageFile(file)
      const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_.]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase())
      setForm(f => ({ ...f, name }))
    }
  }, [isEdit])

  const set = (k: keyof ItemFormData) => (v: string) =>
    setForm(f => ({ ...f, [k]: v }) as ItemFormData)

  const nameFromFile = (file: File) =>
    file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[-_.]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, c => c.toUpperCase())

  const imagePreview = imageFile ? URL.createObjectURL(imageFile) : existingImageUrl

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)
    try {
      if (isEdit && id) {
        await updateItem(id, form, imageFile ?? undefined)
      } else {
        await addItem(form, imageFile ?? undefined)
      }
      navigate('/wardrobe')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!id || !confirm('Archive this item? It will be hidden from your wardrobe.')) return
    setSaving(true)
    try {
      await archiveItem(id)
      navigate('/wardrobe')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  if (loadingItem) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
        <Loader2 className="animate-spin" size={20} style={{ color: 'rgba(0,0,0,0.3)' }} />
      </div>
    )
  }

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
            Closet
          </button>
          {isEdit && (
            <button
              onClick={handleArchive}
              disabled={saving}
              style={{
                fontFamily: MONO, fontSize: 9.5, color: '#9C5544',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                opacity: saving ? 0.4 : 1,
              }}
            >
              archive
            </button>
          )}
        </div>
        <div style={{ borderTop: RULE, marginTop: 12 }} />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Page title */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ fontFamily: UI, fontSize: 24, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            {isEdit ? 'Edit item' : 'Add an item'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
            {isEdit ? 'update details · save changes' : 'compress · save · sync'}
          </div>
        </div>

        {/* Photo uploader */}
        <div style={{ padding: '16px 20px 0' }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%', aspectRatio: '4/3',
              border: imagePreview ? RULE : '1.5px dashed rgba(0,0,0,0.25)',
              borderRadius: 3, overflow: 'hidden',
              background: '#fff',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              position: 'relative', cursor: 'pointer',
            }}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    border: '1px solid rgba(255,255,255,0.7)', borderRadius: 2,
                    padding: '6px 12px',
                    fontFamily: MONO, fontSize: 9, color: '#fff',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>change photo</div>
                </div>
              </>
            ) : (
              <>
                <div style={{
                  width: 40, height: 40, border: RULE, borderRadius: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ color: INK }}>
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </div>
                <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 500, color: INK }}>Tap to add a photo</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)' }}>max 1200px · ~300 KB · JPEG</div>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0] ?? null
              setImageFile(file)
              if (file && !form.name.trim()) {
                setForm(f => ({ ...f, name: nameFromFile(file) }))
              }
            }}
          />
        </div>

        {/* Attributes */}
        <div style={{ padding: '20px 20px 0' }}>
          <SectionLabel right="required *">attributes</SectionLabel>

          <Field label="name" value={form.name} onChange={set('name')} placeholder="e.g. Black linen blazer" required />

          {/* Category picker */}
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
                  onClick={() => setForm(f => ({ ...f, category: c.value }))}
                  style={{
                    padding: '3px 10px', borderRadius: 2,
                    border: `1px solid ${form.category === c.value ? INK : 'rgba(0,0,0,0.15)'}`,
                    background: form.category === c.value ? INK : 'transparent',
                    color: form.category === c.value ? '#fff' : 'rgba(0,0,0,0.55)',
                    fontFamily: MONO, fontSize: 10, cursor: 'pointer',
                    letterSpacing: '0.04em',
                  }}
                >{c.label}</button>
              ))}
            </div>
          </div>

          <RatingPicker value={form.warmth} onChange={v => setForm(f => ({ ...f, warmth: v }))} label="Warmth" hint="1 = light · 5 = heavy" />
          <RatingPicker value={form.formality} onChange={v => setForm(f => ({ ...f, formality: v }))} label="Formality" hint="1 = casual · 5 = formal" />

          <Field label="color" value={form.color} onChange={set('color')} placeholder="white, navy, black…" mono />
          <Field label="brand" value={form.brand} onChange={set('brand')} placeholder="e.g. Toteme" mono />
          <Field label="material" value={form.material} onChange={set('material')} placeholder="cotton, wool, silk…" mono />
          <Field label="pattern" value={form.pattern} onChange={set('pattern')} placeholder="solid, stripe, floral…" mono />
          <Field label="subcategory" value={form.subcategory} onChange={set('subcategory')} placeholder="e.g. blazer, midi skirt…" mono />
        </div>

        {error && (
          <div style={{ padding: '12px 20px', fontFamily: MONO, fontSize: 10, color: '#9C5544' }}>{error}</div>
        )}
      </form>

      {/* Footer actions */}
      <div style={{
        position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: '#F7F6F5', borderTop: RULE,
        padding: '12px 20px',
        display: 'flex', gap: 8,
      }}>
        <UButton variant="ghost" onClick={() => navigate('/wardrobe')} style={{ flex: 1 }}>
          Cancel
        </UButton>
        <UButton
          onClick={() => handleSubmit()}
          disabled={saving || !form.name.trim()}
          style={{ flex: 1.6 }}
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add to closet'}
        </UButton>
      </div>
    </div>
  )
}
