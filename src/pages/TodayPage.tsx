import { motion } from 'motion/react'
import { rise } from '../design/rise'
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOutfits } from '../hooks/useOutfits'
import { useItems } from '../hooks/useItems'
import { getLocation, getCurrentWeather, type WeatherData } from '../lib/weather'
import { getLogReminderEnabled } from '../lib/settings'
import { outfitTitle } from '../lib/outfitTitle'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { T, fS, fM, V4Icon, Btn, Disp, Body, SecH, V4Card, Ph, outfitTone } from '../design/kit'
import { R } from '../design/radii'
import Collage from '../design/Collage'

const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function dstr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Monday-start week containing `base`.
function weekDates(base: Date): Date[] {
  const day = base.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(base)
  monday.setDate(base.getDate() + mondayOffset)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

// Last `n` months (oldest first, current month last) as {label, prefix} pairs.
function trailingMonths(base: Date, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() - (n - 1 - i), 1)
    return {
      label: d.toLocaleDateString('en-US', { month: 'short' }).toLowerCase(),
      prefix: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    }
  })
}

export default function TodayPage() {
  const navigate = useNavigate()
  const { outfits, loading } = useOutfits()
  const { items } = useItems()
  const { isDesktop } = useBreakpoint()
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    getLocation().then(({ lat, lon }) => getCurrentWeather(lat, lon)).then(setWeather).catch(() => {})
  }, [])

  const now = new Date()
  const today = dstr(now)
  const todayOutfit = outfits.find(o => o.date_worn === today)
  const week = useMemo(() => weekDates(now), [today])
  const months = useMemo(() => trailingMonths(now, 6), [today])

  const monthCounts = months.map(m => outfits.filter(o => o.date_worn.startsWith(m.prefix)).length)
  const currentMonthCount = monthCounts[monthCounts.length - 1]
  const priorMonths = monthCounts.slice(0, -1).filter((_, i) => months[i].prefix !== months[months.length - 1].prefix)
  const priorAvg = priorMonths.length > 0 ? priorMonths.reduce((a, b) => a + b, 0) / priorMonths.length : null
  const trendLabel = priorAvg == null ? null
    : currentMonthCount < priorAvg * 0.7 ? 'quieter than usual'
    : currentMonthCount > priorAvg * 1.3 ? 'busier than usual'
    : 'about the same'

  const collageItems = (itemIds: string[]) => itemIds
    .map(id => items.find(i => i.id === id))
    .filter((i): i is NonNullable<typeof i> => !!i)
    .map(i => ({ id: i.id, name: i.name, category: i.category, signedImageUrl: i.signedImageUrl }))


  const weatherLine = weather && `${weather.conditions.toLowerCase()}, ${weather.temp_c}°`
  const monthShortLabel = now.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()
  const gutter = isDesktop ? 0 : 22
  // every section is separated by a single line under it, no boxes
  const boxStyle: React.CSSProperties = { borderBottom: `1px solid ${T.line}`, paddingBottom: 18 }

  // weather and date: their own small container, separate from the header and from the outfit
  const dateLine = `${DOW[now.getDay()]} ${String(now.getDate()).padStart(2, '0')} ${monthShortLabel}`
  const Head = (
    <div style={{ padding: `0 ${gutter}px` }}>
      <V4Card fill="transparent" pad={0} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: `1px solid ${T.line}`, paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <V4Icon n="sun" s={18} w={1.7} c={T.cocoa} />
          <span style={{ fontFamily: fS, fontSize: 14, color: T.ink }}>{weatherLine ?? 'weather not loaded'}</span>
        </div>
        <span style={{ fontFamily: fS, fontSize: 13, color: T.g500 }}>{dateLine}</span>
      </V4Card>
    </div>
  )

  const WeekStrip = (
    <div style={{ padding: `0 ${gutter}px` }}><div style={boxStyle}>
      <SecH right="month" onRightClick={() => navigate('/outfits')}>this week</SecH>
      <div style={{ display: 'flex', gap: 8 }}>
        {week.map((d, i) => {
          const ds = dstr(d)
          const isToday = ds === today
          const outfit = outfits.find(o => o.date_worn === ds)
          return (
            <motion.button
              key={i}
              {...rise(i, 8)}
              onClick={() => outfit ? navigate(`/outfits/${outfit.id}`) : navigate('/outfits/new', { state: { date: ds } })}
              style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <span style={{ fontFamily: fS, fontSize: 12, color: isToday ? T.cocoa : T.g400, fontWeight: isToday ? 600 : 400 }}>{DOW[(i + 1) % 7]}</span>
              <div style={{ borderRadius: R.sm, width: '100%', aspectRatio: '3/4', overflow: 'hidden', background: T.white, boxShadow: isToday ? `0 0 0 2px ${T.cocoa}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.g200 }}>
                {outfit ? <Ph tone={outfitTone(outfit.id)} /> : <V4Icon n="plus" s={15} w={1.8} />}
              </div>
              <span style={{ fontFamily: fS, fontSize: 12.5, color: isToday ? T.cocoa : T.g400, fontWeight: isToday ? 600 : 400 }}>{String(d.getDate()).padStart(2, '0')}</span>
            </motion.button>
          )
        })}
      </div>
    </div></div>
  )

  const hasTrend = currentMonthCount > 0 || (priorAvg ?? 0) > 0
  const TrendCard = hasTrend ? (
    <div style={{ padding: `0 ${gutter}px` }}>
      <V4Card fill="transparent" pad={0} style={{ borderBottom: `1px solid ${T.line}`, paddingBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <Body s={13.5} c={T.g500}>{currentMonthCount} in {months[months.length - 1].label}</Body>
            {trendLabel && <Disp s={17} w={400} style={{ marginTop: 4 }}>{trendLabel}</Disp>}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 38 }}>
            {monthCounts.map((c, i) => {
              const max = Math.max(...monthCounts, 1)
              return <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.5, delay: 0.2 + i * 0.06, ease: [0.22, 1, 0.36, 1] }} style={{ width: 7, height: `${Math.max((c / max) * 100, 4)}%`, background: i === monthCounts.length - 1 ? T.cocoa : T.peach, transformOrigin: 'bottom' }} />
            })}
          </div>
        </div>
      </V4Card>
    </div>
  ) : null

  // a sideways rail of outfit collages, used for past outfits
  const railStyle: React.CSSProperties = { display: 'flex', alignItems: 'stretch', gap: 12, overflowX: 'auto', margin: `0 -${gutter}px`, padding: `0 ${gutter}px 4px` }
  const railH = isDesktop ? 220 : 200

  const pastOutfits = outfits.filter(o => o.date_worn !== today).sort((a, b) => b.date_worn.localeCompare(a.date_worn)).slice(0, 8)
  const PastOutfitsBlock = pastOutfits.length > 0 ? (
    <div style={{ padding: `0 ${gutter}px` }}><div style={boxStyle}>
      <SecH right="calendar" onRightClick={() => navigate('/outfits')}>past</SecH>
      <div style={railStyle}>
        {pastOutfits.map((o, i) => {
          const d = new Date(o.date_worn + 'T00:00:00')
          return (
            <motion.button key={o.id} {...rise(i)} whileTap={{ scale: 0.97 }} onClick={() => navigate(`/outfits/${o.id}`)} style={{ flexShrink: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <Collage items={collageItems(o.item_ids)} maxSmall={4} height={railH} />
              <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g400, marginTop: 'auto', paddingTop: 8 }}>{DOW[d.getDay()]} {o.date_worn.slice(8, 10)}</div>
            </motion.button>
          )
        })}
      </div>
    </div></div>
  ) : null

  if (loading) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  }

  const showEveningReminder = now.getHours() >= 21 && getLogReminderEnabled()
  const EveningReminder = showEveningReminder && !todayOutfit && (
    <div style={{ padding: `0 ${gutter}px` }}>
      <V4Card fill={T.peach} pad={14} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <V4Icon n="cal" s={18} w={1.7} c={T.ink} />
        <Body s={13.5} c={T.ink} style={{ flex: 1 }}>not logged today</Body>
        <button onClick={() => navigate('/outfits/new', { state: { date: today } })} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: fS, fontSize: 13, fontWeight: 600, color: T.ink }}>log</button>
      </V4Card>
    </div>
  )

  let Hero: React.ReactNode
  if (todayOutfit) {
    const handleRepeat = () => navigate('/outfits/new', { state: { preselectedIds: todayOutfit.item_ids, occasion: todayOutfit.occasion ?? '', date: today } })
    Hero = (
      <div style={{ padding: `0 ${gutter}px` }}>
        <V4Card fill="transparent" pad={0} style={{ borderBottom: `1px solid ${T.line}`, paddingBottom: 18 }}>
          <motion.button {...rise(0)} onClick={() => navigate(`/outfits/${todayOutfit.id}`)} aria-label="open outfit" style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
            <Collage items={collageItems(todayOutfit.item_ids)} />
          </motion.button>
          <Disp s={21} style={{ marginTop: 14 }}>{outfitTitle(todayOutfit.item_ids, items, 'outfit')}</Disp>
          {todayOutfit.occasion && <Body s={13.5} style={{ marginTop: 4 }}>{todayOutfit.occasion}</Body>}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <Btn kind="quiet" icon="repeat" flex={1} onClick={handleRepeat}>repeat</Btn>
            <Btn kind="peach" icon="spark" flex={1} onClick={() => navigate('/suggest')}>suggest</Btn>
          </div>
        </V4Card>
      </div>
    )
  } else {
    Hero = (
      <div style={{ padding: `0 ${gutter}px` }}>
        <V4Card fill={T.white} pad={24}>
          <img src="/brand/wave.png" alt="" style={{ width: 84, display: 'block', marginBottom: 16 }} />
          <Disp s={24}>nothing on today yet</Disp>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Btn flex={1} icon="plus" onClick={() => navigate('/outfits/new', { state: { date: today } })}>log</Btn>
            <Btn flex={1} kind="peach" icon="spark" onClick={() => navigate('/suggest')}>suggest</Btn>
          </div>
        </V4Card>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 32, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
      {Head}
      {isDesktop ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 6fr)', gap: 48, alignItems: 'start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 20 }}>{EveningReminder}{Hero}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 36 }}>{WeekStrip}{TrendCard}{PastOutfitsBlock}</div>
        </div>
      ) : (
        <>
          {EveningReminder}
          {Hero}
          {WeekStrip}
          {TrendCard}
          {PastOutfitsBlock}
        </>
      )}
    </div>
  )
}
