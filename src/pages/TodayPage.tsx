import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOutfits } from '../hooks/useOutfits'
import { useItems } from '../hooks/useItems'
import { useIdeas } from '../hooks/useIdeas'
import { useIdeaMutations } from '../hooks/useIdeaMutations'
import { getLocation, getCurrentWeather, type WeatherData } from '../lib/weather'
import { outfitTitle } from '../components/ui'
import { T, fS, fM, dotted, V4Icon, Btn, RoundBtn, Disp, Body, Mono, SecH, V4Card } from '../design/kit'
import Collage from '../design/Collage'

const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const DOW_SHORT = ['m', 't', 'w', 't', 'f', 's', 's']

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
  const { ideas } = useIdeas()
  const { saveIdea } = useIdeaMutations()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [saved, setSaved] = useState(false)

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
    : currentMonthCount < priorAvg * 0.7 ? 'Quieter than usual.'
    : currentMonthCount > priorAvg * 1.3 ? 'Busier than usual.'
    : 'About the same as usual.'

  const collageItems = (itemIds: string[]) => itemIds
    .map(id => items.find(i => i.id === id))
    .filter((i): i is NonNullable<typeof i> => !!i)
    .map(i => ({ id: i.id, name: i.name, category: i.category, signedImageUrl: i.signedImageUrl }))

  const handleSaveToday = async () => {
    if (!todayOutfit) return
    await saveIdea(todayOutfit.occasion ?? '', todayOutfit.notes ?? '', todayOutfit.item_ids)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const WeatherHead = (
    <div style={{ padding: '18px 22px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
        <V4Icon n="sun" s={16} w={1.7} c={T.cocoa} />
        <Mono s={11.5} c={T.cocoa}>{DOW[now.getDay()]} {String(now.getDate()).padStart(2, '0')} {now.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()}</Mono>
      </div>
      <Disp s={26}>
        {weather ? `${weather.conditions.charAt(0).toUpperCase()}${weather.conditions.slice(1)} — ${weather.temp_c}°.` : 'Checking the weather…'}
      </Disp>
    </div>
  )

  const WeekStrip = (
    <div style={{ padding: '0 22px' }}>
      <SecH right="Month" onRightClick={() => navigate('/outfits')}>This week</SecH>
      <div style={{ display: 'flex', gap: 7 }}>
        {week.map((d, i) => {
          const ds = dstr(d)
          const isToday = ds === today
          const outfit = outfits.find(o => o.date_worn === ds)
          return (
            <button
              key={i}
              onClick={() => outfit ? navigate(`/outfits/${outfit.id}`) : navigate('/outfits/new', { state: { date: ds } })}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <Mono s={10.5} c={isToday ? T.ink : T.g400} style={{ fontWeight: isToday ? 700 : 400, textTransform: 'uppercase' }}>{DOW_SHORT[i]}</Mono>
              <div style={{ width: '100%', aspectRatio: '3/4', overflow: 'hidden', boxShadow: isToday ? `inset 0 0 0 2px ${T.ink}` : `inset 0 0 0 1px ${T.line}` }}>
                {outfit ? <Collage items={collageItems(outfit.item_ids)} border={false} /> : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.g200 }}><V4Icon n="plus" s={15} w={1.8} /></div>
                )}
              </div>
              <Mono s={10} c={isToday ? T.ink : T.g400} style={{ fontWeight: isToday ? 700 : 400 }}>{String(d.getDate()).padStart(2, '0')}</Mono>
            </button>
          )
        })}
      </div>
    </div>
  )

  const MonthTrend = currentMonthCount > 0 || (priorAvg ?? 0) > 0 ? (
    <div style={{ padding: '24px 22px 0' }}>
      <V4Card fill={T.peachSoft} shadow={false} pad={16}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <Body s={13.5} c={T.cocoa}>{currentMonthCount} outfit{currentMonthCount === 1 ? '' : 's'} logged in {months[months.length - 1].label}</Body>
            {trendLabel && <Disp s={17} w={400} style={{ marginTop: 4 }}>{trendLabel}</Disp>}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 38 }}>
            {monthCounts.map((c, i) => {
              const max = Math.max(...monthCounts, 1)
              return <div key={i} style={{ width: 7, height: `${Math.max((c / max) * 100, 4)}%`, background: i === monthCounts.length - 1 ? T.cocoa : T.peachDeep }} />
            })}
          </div>
        </div>
      </V4Card>
    </div>
  ) : null

  if (loading) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  }

  if (todayOutfit) {
    const time = new Date(todayOutfit.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    return (
      <div style={{ paddingBottom: 32 }}>
        {WeatherHead}
        <div style={{ padding: '20px 22px 0' }}>
          <button onClick={() => navigate(`/outfits/${todayOutfit.id}`)} style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '100%', aspectRatio: '4/3' }}><Collage items={collageItems(todayOutfit.item_ids)} fill /></div>
              {todayOutfit.occasion && (
                <div style={{ position: 'absolute', top: 14, left: 14, height: 30, display: 'inline-flex', alignItems: 'center', padding: '0 13px', background: 'rgba(247,246,245,.94)', fontFamily: fS, fontSize: 12.5, fontWeight: 600, textTransform: 'capitalize' }}>{todayOutfit.occasion}</div>
              )}
            </div>
          </button>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, marginTop: 16 }}>
            <div style={{ minWidth: 0 }}>
              <Disp s={21}>{outfitTitle(todayOutfit.item_ids, items, 'Outfit logged.')}</Disp>
              <Body s={13} style={{ marginTop: 5 }}>{todayOutfit.item_ids.length} pieces · logged at {time}</Body>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <RoundBtn icon="bookmark" onClick={handleSaveToday} tone={saved ? 'peach' : 'quiet'} />
              <RoundBtn icon="next" onClick={() => navigate(`/outfits/${todayOutfit.id}`)} />
            </div>
          </div>
        </div>
        <div style={{ padding: '26px 0 0' }}>{WeekStrip}</div>
        {MonthTrend}
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 32 }}>
      {WeatherHead}
      <div style={{ padding: '20px 22px 0' }}>
        <div style={{ ...dotted, padding: '30px 24px 26px', border: `1px solid ${T.line}` }}>
          <img src="/brand/wave.png" alt="" style={{ width: 92, display: 'block', marginBottom: 18, opacity: .95 }} />
          <Disp s={22}>Nothing on today yet.</Disp>
          <Body s={14} style={{ marginTop: 8, maxWidth: 280 }}>
            Tell me what you put on{items.length > 0 ? `, or I can pull something together from the ${items.length} pieces you own` : ''}.
          </Body>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
            <Btn full icon="cal" onClick={() => navigate('/outfits/new', { state: { date: today } })}>Log what I'm wearing</Btn>
            <Btn full kind="peach" icon="spark" onClick={() => navigate('/suggest')}>Suggest three looks</Btn>
          </div>
        </div>
      </div>
      <div style={{ padding: '26px 0 0' }}>{WeekStrip}</div>
      {MonthTrend}
      {ideas.length > 0 && (
        <div style={{ padding: '24px 22px 0' }}>
          <SecH right="Ideas" onRightClick={() => navigate('/ideas')}>Saved for later</SecH>
          <div style={{ display: 'flex', gap: 10 }}>
            {ideas.slice(0, 3).map(idea => (
              <button key={idea.id} onClick={() => navigate(`/ideas/${idea.id}`)} style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '100%', aspectRatio: '3/4' }}><Collage items={collageItems(idea.item_ids)} /></div>
                <Body s={12} style={{ marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{outfitTitle(idea.item_ids, items, idea.occasion ?? 'Idea')}</Body>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
