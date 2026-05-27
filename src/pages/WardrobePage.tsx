import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Shirt, Images, X } from 'lucide-react'
import { useItems } from '../hooks/useItems'
import ItemCard from '../components/ItemCard'
import type { Category } from '../types/database'

const FILTERS: { value: 'all' | Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'top', label: 'Tops' },
  { value: 'bottom', label: 'Bottoms' },
  { value: 'dress', label: 'Dresses' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessory', label: 'Accessories' },
]

export default function WardrobePage() {
  const navigate = useNavigate()
  const { items, loading, error } = useItems()
  const [filter, setFilter] = useState<'all' | Category>('all')
  const [fabOpen, setFabOpen] = useState(false)

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400 text-sm">
        Loading wardrobe…
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-red-600 text-sm">{error}</div>
  }

  return (
    <div className="pb-6">
      {/* Category filter */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {items.length > 0 && (
        <p className="px-4 text-xs text-stone-400 mb-3">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
        </p>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
            <Shirt className="text-stone-300" size={28} />
          </div>
          <h3 className="font-medium text-stone-800 mb-1">Your wardrobe is empty</h3>
          <p className="text-stone-400 text-sm mb-6">Start adding items to build your digital closet</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/wardrobe/new')}
              className="bg-stone-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
            >
              Add one
            </button>
            <button
              onClick={() => navigate('/wardrobe/batch')}
              className="bg-stone-100 text-stone-700 px-5 py-2.5 rounded-xl text-sm font-medium"
            >
              Add multiple
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-stone-400 text-sm">
          No {FILTERS.find(f => f.value === filter)?.label.toLowerCase()} yet
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 px-4">
          {filtered.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => navigate(`/wardrobe/${item.id}/edit`)}
            />
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="fixed bottom-20 right-4 flex flex-col items-end gap-2">
          {fabOpen && (
            <>
              <button
                onClick={() => { setFabOpen(false); navigate('/wardrobe/batch') }}
                className="flex items-center gap-2 bg-white text-stone-800 border border-stone-200 shadow-md px-4 py-2.5 rounded-full text-sm font-medium"
              >
                <Images size={16} />
                Add multiple
              </button>
              <button
                onClick={() => { setFabOpen(false); navigate('/wardrobe/new') }}
                className="flex items-center gap-2 bg-white text-stone-800 border border-stone-200 shadow-md px-4 py-2.5 rounded-full text-sm font-medium"
              >
                <Plus size={16} />
                Add one
              </button>
            </>
          )}
          <button
            onClick={() => setFabOpen(o => !o)}
            className="w-14 h-14 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            {fabOpen ? <X size={22} /> : <Plus size={24} />}
          </button>
        </div>
      )}
    </div>
  )
}
