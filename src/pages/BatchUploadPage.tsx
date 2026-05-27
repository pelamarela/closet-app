import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Images, Loader2 } from 'lucide-react'
import { compressImage } from '../lib/imageUtils'
import { useItemMutations } from '../hooks/useItemMutations'
import RatingPicker from '../components/RatingPicker'
import type { Category } from '../types/database'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'dress', label: 'Dress' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessory', label: 'Accessory' },
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
      <div className="pb-6">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3 z-10">
          <button onClick={() => navigate('/wardrobe')} className="p-1 -ml-1">
            <ArrowLeft size={20} className="text-stone-600" />
          </button>
          <h1 className="font-semibold text-stone-800">Batch upload</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-5">
            <Images className="text-stone-400" size={32} />
          </div>
          <h2 className="font-semibold text-stone-800 mb-2">Select multiple photos</h2>
          <p className="text-stone-400 text-sm mb-8">
            Choose photos from your library. You'll fill in the details for each one.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-stone-800 text-white px-6 py-3 rounded-xl font-medium"
          >
            Choose photos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
        </div>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center">
        <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mb-5">
          <Check className="text-white" size={32} />
        </div>
        <h2 className="text-xl font-semibold text-stone-800 mb-2">All done!</h2>
        <p className="text-stone-500 text-sm mb-8">{savedCount} items added to your wardrobe.</p>
        <button
          onClick={() => navigate('/wardrobe')}
          className="bg-stone-800 text-white px-6 py-3 rounded-xl font-medium"
        >
          View wardrobe
        </button>
      </div>
    )
  }

  if (stage === 'saving') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center">
        <Loader2 className="animate-spin text-stone-400 mb-4" size={32} />
        <p className="text-stone-600 font-medium">Saving {savedCount + 1} of {drafts.length}…</p>
      </div>
    )
  }

  const draft = drafts[current]

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between z-10">
        <button onClick={() => navigate('/wardrobe')} className="p-1 -ml-1">
          <ArrowLeft size={20} className="text-stone-600" />
        </button>
        <span className="font-semibold text-stone-800">
          {current + 1} <span className="text-stone-400 font-normal">of {drafts.length}</span>
        </span>
        <div className="w-6" />
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-stone-100">
        <div
          className="h-full bg-stone-800 transition-all"
          style={{ width: `${((current + 1) / drafts.length) * 100}%` }}
        />
      </div>

      <div className="p-4 space-y-5">
        {/* Photo */}
        <div className="w-full aspect-video bg-stone-100 rounded-2xl overflow-hidden">
          <img src={draft.preview} alt="Preview" className="w-full h-full object-cover" />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Name *</label>
          <input
            type="text"
            value={draft.name}
            onChange={e => update('name', e.target.value)}
            placeholder="e.g. Black linen blazer"
            className="w-full border border-stone-300 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
            autoFocus
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
                onClick={() => update('category', c.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  draft.category === c.value ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <RatingPicker
          value={draft.warmth}
          onChange={v => update('warmth', v)}
          label="Warmth"
          hint="1 = light · 5 = heavy"
        />
        <RatingPicker
          value={draft.formality}
          onChange={v => update('formality', v)}
          label="Formality"
          hint="1 = casual · 5 = formal"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pb-6 pt-4 bg-gradient-to-t from-stone-50 from-80%">
        <div className="flex gap-3">
          {current > 0 && (
            <button
              onClick={() => setCurrent(c => c - 1)}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-stone-300 text-stone-700 font-medium"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}
          {current < drafts.length - 1 ? (
            <button
              onClick={() => canAdvance && setCurrent(c => c + 1)}
              disabled={!canAdvance}
              className="flex-1 flex items-center justify-center gap-2 bg-stone-800 text-white py-3.5 rounded-xl font-medium disabled:opacity-40"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSaveAll}
              disabled={!canAdvance}
              className="flex-1 flex items-center justify-center gap-2 bg-stone-800 text-white py-3.5 rounded-xl font-medium disabled:opacity-40"
            >
              <Check size={16} />
              Save all {drafts.length} items
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
