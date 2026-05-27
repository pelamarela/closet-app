import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Camera, Check, Loader2 } from 'lucide-react'
import { useItems } from '../hooks/useItems'
import { useOutfitMutations } from '../hooks/useOutfitMutations'
import RatingPicker from '../components/RatingPicker'

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
    <div className="pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between z-10">
        <button onClick={() => navigate('/outfits')} className="p-1 -ml-1">
          <ArrowLeft size={20} className="text-stone-600" />
        </button>
        <h1 className="font-semibold text-stone-800">Log outfit</h1>
        <div className="w-6" />
      </div>

      <div className="p-4 space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-stone-300 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        {/* Occasion */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Occasion <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={occasion}
            onChange={e => setOccasion(e.target.value)}
            placeholder="e.g. Work, Date night, Casual"
            className="w-full border border-stone-300 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        {/* Item picker */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <label className="text-sm font-medium text-stone-700">Items *</label>
            {selectedIds.size > 0 && (
              <span className="text-xs text-stone-500">{selectedIds.size} selected</span>
            )}
          </div>

          {itemsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-stone-400" size={24} />
            </div>
          ) : items.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-6">No items in your wardrobe yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {items.map(item => {
                const selected = selectedIds.has(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selected ? 'border-stone-800' : 'border-transparent'
                    }`}
                  >
                    {item.signedImageUrl ? (
                      <img src={item.signedImageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-stone-100 flex items-center justify-center text-xs text-stone-400 p-1 text-center">
                        {item.name}
                      </div>
                    )}
                    {selected && (
                      <div className="absolute inset-0 bg-stone-800/30 flex items-center justify-center">
                        <div className="w-6 h-6 bg-stone-800 rounded-full flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      </div>
                    )}
                    {!selected && item.signedImageUrl && (
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 px-1.5 pb-1">
                        <p className="text-white text-[10px] truncate">{item.name}</p>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Rating */}
        <RatingPicker
          value={rating ?? 0}
          onChange={v => setRating(prev => prev === v ? null : v)}
          label="Rating"
          hint="optional"
        />

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Notes <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="How did you feel wearing this?"
            rows={3}
            className="w-full border border-stone-300 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
          />
        </div>

        {/* Outfit photo */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Outfit photo <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-video bg-stone-100 rounded-2xl overflow-hidden flex items-center justify-center"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Outfit" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-stone-400">
                <Camera size={24} />
                <span className="text-sm">Add photo</span>
              </div>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {/* Save */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pb-6 pt-4 bg-gradient-to-t from-stone-50 from-80%">
        <button
          onClick={handleSave}
          disabled={saving || selectedIds.size === 0}
          className="w-full bg-stone-800 text-white rounded-xl py-3.5 font-medium disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save outfit'}
        </button>
      </div>
    </div>
  )
}
