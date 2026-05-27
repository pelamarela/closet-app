import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Camera, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useItemMutations } from '../hooks/useItemMutations'
import RatingPicker from '../components/RatingPicker'
import type { ItemFormData } from '../hooks/useItems'
import type { Category } from '../types/database'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'dress', label: 'Dress' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessory', label: 'Accessory' },
]

const EMPTY: ItemFormData = {
  name: '', category: 'top', subcategory: '', color: '',
  pattern: '', material: '', warmth: 3, formality: 3, brand: '',
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

  const set = (k: keyof ItemFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }) as ItemFormData)

  const imagePreview = imageFile ? URL.createObjectURL(imageFile) : existingImageUrl

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-stone-400" size={24} />
      </div>
    )
  }

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between z-10">
        <button onClick={() => navigate('/wardrobe')} className="p-1 -ml-1">
          <ArrowLeft size={20} className="text-stone-600" />
        </button>
        <h1 className="font-semibold text-stone-800">{isEdit ? 'Edit item' : 'Add item'}</h1>
        {isEdit ? (
          <button onClick={handleArchive} disabled={saving} className="text-sm text-red-500 font-medium disabled:opacity-40">
            Archive
          </button>
        ) : <div className="w-14" />}
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {/* Photo */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-video bg-stone-100 rounded-2xl overflow-hidden flex items-center justify-center relative"
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="bg-white/80 rounded-full p-2">
                  <Camera size={18} className="text-stone-700" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-stone-400">
              <Camera size={28} />
              <span className="text-sm">Add photo</span>
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => setImageFile(e.target.files?.[0] ?? null)}
        />

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Black linen blazer"
            className="w-full border border-stone-300 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Category *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, category: c.value }))}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  form.category === c.value
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Warmth & Formality */}
        <RatingPicker
          value={form.warmth}
          onChange={v => setForm(f => ({ ...f, warmth: v }))}
          label="Warmth"
          hint="1 = light · 5 = heavy"
        />
        <RatingPicker
          value={form.formality}
          onChange={v => setForm(f => ({ ...f, formality: v }))}
          label="Formality"
          hint="1 = casual · 5 = formal"
        />

        {/* Optional text fields */}
        <div>
          <p className="text-sm font-medium text-stone-700 mb-2">Details <span className="text-stone-400 font-normal">(optional)</span></p>
          <div className="grid grid-cols-2 gap-3">
            {([
              ['color', 'Color', 'e.g. Navy'],
              ['brand', 'Brand', 'e.g. Zara'],
              ['subcategory', 'Subcategory', 'e.g. Blazer'],
              ['material', 'Material', 'e.g. Linen'],
              ['pattern', 'Pattern', 'e.g. Striped'],
            ] as [keyof ItemFormData, string, string][]).map(([key, label, placeholder]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-stone-500 mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key] as string}
                  onChange={set(key)}
                  placeholder={placeholder}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>

      {/* Save button — fixed above bottom nav */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pb-2 bg-gradient-to-t from-stone-50 pt-4">
        <button
          onClick={handleSubmit}
          disabled={saving || !form.name.trim()}
          className="w-full bg-stone-800 text-white rounded-xl py-3.5 font-medium disabled:opacity-40 flex items-center justify-center gap-2 active:scale-98 transition-transform"
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add to wardrobe'}
        </button>
      </div>
    </div>
  )
}
