import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOutfits } from '../hooks/useOutfits'
import type { OutfitWithItems } from '../hooks/useOutfits'
import { TopBar, UButton, Icon, MONO, UI, INK, RULE, RULE_DASHED } from '../components/ui'

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function firstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay() }

const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS = ['sun','mon','tue','wed','thu','fri','sat']

function calcStreak(outfits: OutfitWithItems[]): number {
  const dates = new Set(outfits.map(o => o.date_worn))
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const s = d.toISOString().slice(0, 10)
    if (dates.has(s)) streak++
    else if (i > 0) break
  }
  return streak
}

function topOccasion(outfits: OutfitWithItems[]): string {
  const freq: Record<string, number> = {}
  outfits.forEach(o => { if (o.occasion) freq[o.occasion] = (freq[o.occasion] ?? 0) + 1 })
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
}

// Deterministic palette from outfit id — gives consistent variety across the grid
const PALETTES = [
  ['#E8D4C0','#D4BEA8'], // cream (default)
  ['#1A1A1A','#2C2C2C'], // black
  ['#D4A898','#C49080'], // blush
  ['#C8C4BC','#B4B0A8'], // stone
  ['#C4B49C','#B0A088'], // tan
  ['#B8C4C0','#A4B0AC'], // sage
]
function outfitPalette(id: string): string[] {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return PALETTES[hash % PALETTES.length]
}

function OutfitThumb({ outfit, small }: { outfit?: OutfitWithItems; small?: boolean }) {
  const [a, b] = outfit ? outfitPalette(outfit.id) : PALETTES[0]
  const sz = small ? 8 : 10
  return (
    <div style={{
      width: '100%', height: '100%',
      background: `repeating-linear-gradient(135deg, ${a} 0 ${sz}px, ${b} ${sz}px ${sz * 2}px)`,
    }} />
  )
}

export default function OutfitsPage() {
  const navigate = useNavigate()
  const { outfits, loading } = useOutfits()
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [libView, setLibView] = useState<'list' | 'grid'>('list')

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

  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
  const outfitsByDate: Record<string, OutfitWithItems[]> = {}
  outfits.forEach(o => {
    if (!outfitsByDate[o.date_worn]) outfitsByDate[o.date_worn] = []
    outfitsByDate[o.date_worn].push(o)
  })

  const firstDay = firstDayOfMonth(viewYear, viewMonth)
  const totalDays = daysInMonth(viewYear, viewMonth)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const toDateStr = (day: number) => `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const todayStr = now.toISOString().slice(0, 10)

  const monthOutfits = outfits.filter(o => o.date_worn.startsWith(monthPrefix))
  const loggedDays = new Set(monthOutfits.map(o => o.date_worn)).size
  const streak = calcStreak(outfits)
  const topOcc = topOccasion(monthOutfits)

  const visibleOutfits = selectedDate
    ? (outfitsByDate[selectedDate] ?? [])
    : monthOutfits

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>loading…</span>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 160 }}>
      <TopBar title="Calendar" />

      {/* Month nav */}
      <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {viewYear}
          </div>
          <div style={{ fontFamily: UI, fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1, marginTop: 4 }}>
            {MONTH_FULL[viewMonth]}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11, paddingBottom: 4 }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.4)', padding: 0 }}>
            ‹ {MONTH_SHORT[viewMonth === 0 ? 11 : viewMonth - 1].toLowerCase()}
          </button>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.4)', padding: 0 }}>
            {MONTH_SHORT[viewMonth === 11 ? 0 : viewMonth + 1].toLowerCase()} ›
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ margin: '14px 20px 0', border: RULE, borderRadius: 4, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        {[
          ['logged', `${loggedDays} days`],
          ['streak', `${streak} days`],
          ['top occ', topOcc],
        ].map(([k, v], i) => (
          <div key={i} style={{ padding: 10, borderRight: i < 2 ? RULE : 'none' }}>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</div>
            <div style={{ fontFamily: UI, fontSize: 15, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Day headers */}
      <div style={{
        margin: '20px 20px 0',
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.45)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        paddingBottom: 6, borderBottom: RULE,
      }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{ textAlign: 'center' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ margin: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderRight: RULE, borderBottom: RULE }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`} style={{ aspectRatio: '1/1.05', borderLeft: RULE, borderTop: RULE, background: 'transparent', opacity: 0.35 }} />
          const ds = toDateStr(day)
          const dayOutfits = outfitsByDate[ds] ?? []
          const hasOutfit = dayOutfits.length > 0
          const isSelected = selectedDate === ds
          const isToday = ds === todayStr
          return (
            <button
              key={ds}
              onClick={() => setSelectedDate(prev => prev === ds ? null : ds)}
              style={{
                aspectRatio: '1/1.05',
                background: isSelected ? INK : (isToday ? '#F2E1D0' : 'transparent'),
                position: 'relative', padding: 4,
                cursor: 'pointer', border: 'none',
                borderLeft: RULE, borderTop: RULE,
              }}
            >
              <div style={{
                fontFamily: MONO, fontSize: 9.5,
                color: isSelected ? '#fff' : (isToday ? INK : 'rgba(0,0,0,0.65)'),
                fontWeight: isToday ? 600 : 400,
                position: 'relative', zIndex: 1,
              }}>{String(day).padStart(2, '0')}</div>
              {hasOutfit && (
                <div style={{ position: 'absolute', left: 4, right: 4, bottom: 4, top: 18, overflow: 'hidden' }}>
                  <OutfitThumb outfit={dayOutfits[0]} small />
                </div>
              )}
              {!hasOutfit && !isToday && day <= now.getDate() && viewYear === now.getFullYear() && viewMonth === now.getMonth() && (
                <div style={{
                  position: 'absolute', left: '50%', top: '60%',
                  transform: 'translate(-50%, -50%)',
                  width: 3, height: 3,
                  background: 'rgba(0,0,0,0.15)',
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Library section */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flex: 1 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
              // {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : MONTH_FULL[viewMonth]}
            </div>
            <div style={{ flex: 1, borderTop: RULE_DASHED }} />
            <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>{visibleOutfits.length}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginLeft: 12, fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)' }}>
            <button
              onClick={() => setLibView('list')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: libView === 'list' ? INK : 'rgba(0,0,0,0.4)', borderBottom: libView === 'list' ? `1px solid ${INK}` : 'none', paddingBottom: 2, fontFamily: MONO, fontSize: 10 }}
            >list</button>
            <span style={{ color: 'rgba(0,0,0,0.3)' }}>·</span>
            <button
              onClick={() => setLibView('grid')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: libView === 'grid' ? INK : 'rgba(0,0,0,0.4)', borderBottom: libView === 'grid' ? `1px solid ${INK}` : 'none', paddingBottom: 2, fontFamily: MONO, fontSize: 10 }}
            >grid</button>
          </div>
        </div>

        {visibleOutfits.length === 0 ? (
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', padding: '16px 0' }}>
            no outfits {selectedDate ? 'this day' : 'this month'}
          </div>
        ) : libView === 'list' ? (
          /* List view */
          <div style={{ borderTop: RULE }}>
            {visibleOutfits.map((o) => {
              const d = new Date(o.date_worn + 'T00:00:00')
              return (
                <button
                  key={o.id}
                  onClick={() => navigate(`/outfits/${o.id}`)}
                  style={{
                    width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    display: 'grid', gridTemplateColumns: '50px 48px 1fr 14px',
                    gap: 12, alignItems: 'center',
                    paddingTop: 12, paddingBottom: 12, borderBottom: RULE,
                  }}
                >
                  <div style={{ fontFamily: MONO }}>
                    <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1 }}>{String(d.getDate()).padStart(2,'0')}</div>
                    <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.5)', marginTop: 3, letterSpacing: '0.04em' }}>
                      {MONTH_SHORT[d.getMonth()].toLowerCase()} · {DAY_LABELS[d.getDay()]}
                    </div>
                  </div>
                  <div style={{ width: 48, height: 60, borderRadius: 2, overflow: 'hidden', border: RULE, flexShrink: 0 }}>
                    <OutfitThumb outfit={o} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Geist, Inter, system-ui', fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                      {o.occasion || 'outfit'}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)' }}>
                      <span>{o.item_ids.length} pieces</span>
                      {o.weather && <><span>·</span><span>{o.weather.temp_c}°</span></>}
                      {o.rating && <><span>·</span><span style={{ color: '#9C5544' }}>{'★'.repeat(o.rating)}{'·'.repeat(5 - o.rating)}</span></>}
                    </div>
                  </div>
                  <Icon name="forward" size={12} stroke={1.2} />
                </button>
              )
            })}
          </div>
        ) : (
          /* Grid view */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {visibleOutfits.map(o => {
              const d = new Date(o.date_worn + 'T00:00:00')
              return (
                <button
                  key={o.id}
                  onClick={() => navigate(`/outfits/${o.id}`)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ width: '100%', aspectRatio: '3/4', border: RULE, position: 'relative', overflow: 'hidden' }}>
                    <OutfitThumb outfit={o} />
                    <div style={{
                      position: 'absolute', top: 6, left: 6,
                      fontFamily: MONO, fontSize: 9.5, fontWeight: 600,
                      background: '#fff', padding: '2px 5px', color: INK,
                    }}>{String(d.getDate()).padStart(2,'0')}</div>
                    <div style={{
                      position: 'absolute', top: 6, right: 6,
                      fontFamily: MONO, fontSize: 8,
                      color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.45)',
                      padding: '2px 4px', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>{MONTH_SHORT[d.getMonth()].toLowerCase()}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div style={{
        position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: '#F7F6F5', borderTop: RULE,
        padding: '12px 20px', zIndex: 25,
      }}>
        <UButton full icon="hanger" onClick={() => navigate('/outfits/new')}>Log outfit</UButton>
      </div>
    </div>
  )
}
