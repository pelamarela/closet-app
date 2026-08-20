import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOutfits, type OutfitWithItems } from '../hooks/useOutfits'
import { useItems } from '../hooks/useItems'
import { outfitTitle } from '../components/ui'
import { calcStreak } from '../lib/streak'
import { T, fS, fM, V4Icon, V4Bar, RoundBtn, Disp, Body, Mono, SecH } from '../design/kit'
import Collage from '../design/Collage'

const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW_SHORT = ['m', 't', 'w', 't', 'f', 's', 's']

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function firstDayOfMonth(y: number, m: number) { return (new Date(y, m, 1).getDay() + 6) % 7 }

function topOccasions(outfits: OutfitWithItems[], n = 2): string[] {
  const freq: Record<string, number> = {}
  outfits.forEach(o => { if (o.occasion) freq[o.occasion] = (freq[o.occasion] ?? 0) + 1 })
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k)
}

export default function MonthPage() {
  const navigate = useNavigate()
  const { outfits, loading } = useOutfits()
  const { items } = useItems()
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) } else setViewMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) } else setViewMonth(m => m + 1)
    setSelectedDate(null)
  }

  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
  const outfitsByDate: Record<string, OutfitWithItems[]> = {}
  outfits.forEach(o => { (outfitsByDate[o.date_worn] ??= []).push(o) })

  const firstDay = firstDayOfMonth(viewYear, viewMonth)
  const totalDays = daysInMonth(viewYear, viewMonth)
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)]
  const toDateStr = (day: number) => `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const todayStr = now.toISOString().slice(0, 10)

  const monthOutfits = outfits.filter(o => o.date_worn.startsWith(monthPrefix)).sort((a, b) => b.date_worn.localeCompare(a.date_worn))
  const loggedDays = new Set(monthOutfits.map(o => o.date_worn)).size
  const streak = calcStreak(outfits)
  const topOcc = topOccasions(monthOutfits)

  const visibleOutfits = selectedDate ? (outfitsByDate[selectedDate] ?? []) : monthOutfits

  const collageItems = (itemIds: string[]) => itemIds
    .map(id => items.find(i => i.id === id))
    .filter((i): i is NonNullable<typeof i> => !!i)
    .map(i => ({ id: i.id, name: i.name, category: i.category, signedImageUrl: i.signedImageUrl }))

  if (loading) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  }

  return (
    <div style={{ paddingBottom: 32 }}>
      <V4Bar back title="Today" onBack={() => navigate('/')} />
      <div style={{ padding: '10px 22px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <Mono s={11.5} c={T.cocoa}>{viewYear}</Mono>
          <Disp s={30} style={{ marginTop: 4 }}>{MONTH_FULL[viewMonth]}</Disp>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <RoundBtn icon="back" onClick={prevMonth} />
          <RoundBtn icon="next" onClick={nextMonth} />
        </div>
      </div>
      <div style={{ padding: '10px 22px 0' }}>
        <Body s={14}>
          {loggedDays} day{loggedDays === 1 ? '' : 's'} logged{streak > 1 ? `, a ${streak}-day streak going` : ''}.
          {topOcc.length > 0 && (
            <>
              {' '}Mostly{' '}
              {topOcc.map((o, i) => (
                <span key={o}>
                  {i > 0 && ' and '}
                  <span style={{ color: T.ink, fontWeight: 500 }}>{o}</span>
                </span>
              ))}.
            </>
          )}
        </Body>
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
          {DOW_SHORT.map((d, i) => <div key={i} style={{ textAlign: 'center' }}><Mono s={10} style={{ textTransform: 'uppercase' }}>{d}</Mono></div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
          {cells.map((day, i) => {
            if (day == null) return <div key={`b${i}`} />
            const ds = toDateStr(day)
            const dayOutfits = outfitsByDate[ds] ?? []
            const isToday = ds === todayStr
            const isSelected = selectedDate === ds
            return (
              <button
                key={ds}
                onClick={() => setSelectedDate(prev => prev === ds ? null : ds)}
                style={{
                  position: 'relative', aspectRatio: '3/4', overflow: 'hidden', padding: 0, cursor: 'pointer',
                  background: dayOutfits.length ? 'none' : T.white,
                  boxShadow: isSelected ? `inset 0 0 0 2px ${T.ink}` : (dayOutfits.length ? 'none' : `inset 0 0 0 1px ${T.line}`),
                }}
              >
                {dayOutfits.length > 0 && <Collage items={collageItems(dayOutfits[0].item_ids)} border={false} />}
                {dayOutfits.length > 0 && <div style={{ position: 'absolute', top: 2, left: 2, width: 16, height: 13, background: 'rgba(247,246,245,.9)' }} />}
                <div style={{ position: 'absolute', top: 3, left: 4, fontFamily: fM, fontSize: 9.5, fontWeight: isToday ? 700 : 400, color: dayOutfits.length ? 'rgba(0,0,0,.7)' : T.g400 }}>{day}</div>
              </button>
            )
          })}
        </div>
      </div>
      <div style={{ padding: '26px 22px 0' }}>
        <SecH right={selectedDate ? 'Clear' : `All ${outfits.length}`} onRightClick={() => selectedDate ? setSelectedDate(null) : navigate('/settings/stats')}>
          {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : `Logged in ${MONTH_FULL[viewMonth]}`}
        </SecH>
        {visibleOutfits.length === 0 ? (
          <Body s={13} style={{ padding: '10px 0' }}>No outfits {selectedDate ? 'this day' : 'this month'}.</Body>
        ) : visibleOutfits.map((o, i) => {
          const d = new Date(o.date_worn + 'T00:00:00')
          const dow = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()]
          return (
            <button
              key={o.id}
              onClick={() => navigate(`/outfits/${o.id}`)}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 13, padding: '9px 0', background: 'none', border: 'none', borderBottom: i < visibleOutfits.length - 1 ? `1px solid ${T.line}` : 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: 38, height: 48, flexShrink: 0 }}><Collage items={collageItems(o.item_ids)} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: fS, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{outfitTitle(o.item_ids, items, 'Outfit')}</div>
                <div style={{ marginTop: 2 }}><Mono s={11}>{o.date_worn.slice(8, 10)} {dow}{o.occasion ? ` · ${o.occasion}` : ''} · {o.item_ids.length} pieces</Mono></div>
              </div>
              <V4Icon n="next" s={16} w={1.7} c={T.g400} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
