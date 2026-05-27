import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOutfits } from '../hooks/useOutfits'
import type { OutfitWithItems } from '../hooks/useOutfits'
import { SectionLabel, MONO, UI, INK, RULE } from '../components/ui'

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function firstDayOfMonth(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su']

function OutfitRow({ outfit, onClick }: { outfit: OutfitWithItems; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        display: 'grid', gridTemplateColumns: '34px 1fr 60px 14px',
        alignItems: 'center', gap: 12,
        padding: '8px 0',
        background: 'none', border: 'none', borderBottom: RULE, cursor: 'pointer',
      }}
    >
      {/* Thumbnail */}
      <div style={{ height: 42, borderRadius: 2, overflow: 'hidden', border: RULE, flexShrink: 0 }}>
        {outfit.image_url ? (
          <div style={{ width: '100%', height: '100%', background: '#DCD9D3' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'repeating-linear-gradient(135deg, #ECEAE6 0 8px, #DCD9D3 8px 16px)',
          }} />
        )}
      </div>

      {/* Meta */}
      <div>
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 500, letterSpacing: '-0.005em', color: INK }}>
          {outfit.occasion || 'outfit'}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>
          {outfit.date_worn} · {outfit.item_ids.length} pieces
        </div>
      </div>

      {/* Wear count */}
      <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', textAlign: 'right' }}>
        {outfit.rating ? `${outfit.rating}/5` : ''}
      </div>

      {/* Arrow */}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  )
}

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

  const outfitDates = new Set(outfits.map(o => o.date_worn))
  const firstDay = firstDayOfMonth(viewYear, viewMonth)
  const totalDays = daysInMonth(viewYear, viewMonth)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]

  const toDateStr = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const visibleOutfits = selectedDate
    ? outfits.filter(o => o.date_worn === selectedDate)
    : outfits.filter(o => o.date_worn.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`))

  const monthOutfits = outfits.filter(o => o.date_worn.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`))

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>loading…</span>
      </div>
    )
  }

  if (outfits.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ borderTop: RULE, marginBottom: 32 }} />
        <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          // outfit-log
        </div>
        <div style={{ fontFamily: UI, fontSize: 26, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: 8 }}>
          No outfits<br />logged yet.
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)', marginBottom: 28 }}>
          Start building your outfit history.
        </div>
        <button
          onClick={() => navigate('/outfits/new')}
          style={{
            height: 48, padding: '0 20px',
            background: INK, color: '#fff',
            border: 'none', borderRadius: 4,
            fontFamily: UI, fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Log your first outfit
        </button>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* AppBar */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 6 }}>
              <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>
            </svg>
            Outfit Log
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.55)' }}>
            {outfits.length} total
          </div>
        </div>
        <div style={{ borderTop: RULE, marginTop: 12 }} />
      </div>

      {/* Month navigator */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 0',
      }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: INK }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6"/>
          </svg>
        </button>
        <div style={{ fontFamily: MONO, fontSize: 11, color: INK, letterSpacing: '0.04em' }}>
          {MONTH_FULL[viewMonth]} {viewYear}
          <span style={{ color: 'rgba(0,0,0,0.4)', marginLeft: 8 }}>{monthOutfits.length} outfits</span>
        </div>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: INK }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div style={{ padding: '10px 20px 0' }}>
        {/* Day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {DAY_LABELS.map(d => (
            <div key={d} style={{
              textAlign: 'center', fontFamily: MONO, fontSize: 9,
              color: 'rgba(0,0,0,0.4)', padding: '4px 0',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>{d}</div>
          ))}
        </div>
        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0' }}>
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
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '3px 0', background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                <span style={{
                  width: 30, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 2,
                  background: isSelected ? INK : (isToday ? 'rgba(0,0,0,0.07)' : 'transparent'),
                  color: isSelected ? '#fff' : INK,
                  fontFamily: MONO, fontSize: 11,
                  fontWeight: isToday ? 600 : 400,
                  border: hasOutfit && !isSelected ? '1px solid rgba(0,0,0,0.15)' : 'none',
                }}>
                  {day}
                </span>
                <span style={{
                  width: 4, height: 4, borderRadius: '50%', marginTop: 2,
                  background: hasOutfit ? (isSelected ? '#fff' : '#DFAFA1') : 'transparent',
                }} />
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ borderTop: RULE, margin: '16px 20px 0' }} />

      {/* Outfit list */}
      <div style={{ padding: '16px 20px 0' }}>
        <SectionLabel right={`${visibleOutfits.length} shown`}>
          {selectedDate
            ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
            : MONTH_NAMES[viewMonth]}
        </SectionLabel>

        {visibleOutfits.length === 0 ? (
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', padding: '16px 0' }}>
            no outfits this {selectedDate ? 'day' : 'month'}
          </div>
        ) : (
          <div>
            {visibleOutfits.map(o => (
              <OutfitRow key={o.id} outfit={o} onClick={() => navigate(`/outfits/${o.id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/outfits/new')}
        style={{
          position: 'fixed', bottom: 100, right: 16,
          width: 52, height: 52,
          background: INK, color: '#fff',
          border: 'none', borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          zIndex: 30,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  )
}
