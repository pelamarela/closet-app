import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, BookOpen } from 'lucide-react'
import { useOutfits } from '../hooks/useOutfits'
import type { OutfitWithItems } from '../hooks/useOutfits'

// ─── Calendar helpers ────────────────────────────────────────────────────────

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function firstDayOfMonth(year: number, month: number) {
  // 0=Sun→6, shift so Mon=0
  return (new Date(year, month, 1).getDay() + 6) % 7
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su']

// ─── Outfit card ─────────────────────────────────────────────────────────────

function OutfitCard({ outfit, onClick }: { outfit: OutfitWithItems; onClick: () => void }) {
  const date = new Date(outfit.date_worn + 'T00:00:00')
  const label = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <button onClick={onClick} className="w-full text-left flex items-center gap-3 py-3 border-b border-stone-100 last:border-0">
      <div className="w-12 h-12 rounded-xl bg-stone-100 flex-shrink-0 overflow-hidden">
        {outfit.image_url ? (
          <div className="w-full h-full bg-stone-200" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
            {outfit.item_ids.length}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-stone-800 text-sm font-medium">{label}</p>
        {outfit.occasion && <p className="text-stone-500 text-xs truncate">{outfit.occasion}</p>}
        <p className="text-stone-400 text-xs">{outfit.item_ids.length} item{outfit.item_ids.length !== 1 ? 's' : ''}</p>
      </div>
      {outfit.rating && (
        <span className="text-xs text-stone-400 flex-shrink-0">{'★'.repeat(outfit.rating)}</span>
      )}
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OutfitsPage() {
  const navigate = useNavigate()
  const { outfits, loading } = useOutfits()

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelectedDate(null)
  }

  // Build set of dates that have outfits in this month
  const outfitDates = new Set(outfits.map(o => o.date_worn))

  const firstDay = firstDayOfMonth(viewYear, viewMonth)
  const totalDays = daysInMonth(viewYear, viewMonth)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]

  const toDateStr = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  // Filter outfits for list below calendar
  const visibleOutfits = selectedDate
    ? outfits.filter(o => o.date_worn === selectedDate)
    : outfits.filter(o => o.date_worn.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`))

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-stone-400 text-sm">Loading…</div>
  }

  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="text-stone-300" size={28} />
        </div>
        <h3 className="font-medium text-stone-800 mb-1">No outfits logged yet</h3>
        <p className="text-stone-400 text-sm mb-6">Start building your outfit history</p>
        <button
          onClick={() => navigate('/outfits/new')}
          className="bg-stone-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
        >
          Log your first outfit
        </button>
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* Month navigator */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={prevMonth} className="p-1.5 text-stone-500">
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold text-stone-800">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="p-1.5 text-stone-500">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="px-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-xs text-stone-400 py-1">{d}</div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />
            const ds = toDateStr(day)
            const hasOutfit = outfitDates.has(ds)
            const isSelected = selectedDate === ds
            const isToday = ds === now.toISOString().slice(0, 10)
            return (
              <button
                key={ds}
                onClick={() => setSelectedDate(prev => prev === ds ? null : ds)}
                className="flex flex-col items-center py-1"
              >
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ${
                  isSelected ? 'bg-stone-800 text-white' :
                  isToday ? 'bg-stone-100 text-stone-800 font-semibold' :
                  'text-stone-700'
                }`}>
                  {day}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${hasOutfit ? (isSelected ? 'bg-white' : 'bg-stone-400') : 'bg-transparent'}`} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Outfit list */}
      <div className="mt-4 px-4">
        <p className="text-xs text-stone-400 mb-2">
          {selectedDate
            ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
            : `${MONTH_NAMES[viewMonth]} ${viewYear}`}
          {' · '}{visibleOutfits.length} outfit{visibleOutfits.length !== 1 ? 's' : ''}
        </p>

        {visibleOutfits.length === 0 ? (
          <p className="text-stone-400 text-sm py-4">No outfits this {selectedDate ? 'day' : 'month'}.</p>
        ) : (
          <div>
            {visibleOutfits.map(o => (
              <OutfitCard key={o.id} outfit={o} onClick={() => navigate(`/outfits/${o.id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/outfits/new')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
