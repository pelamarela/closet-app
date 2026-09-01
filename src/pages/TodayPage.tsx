import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOutfits } from '../hooks/useOutfits'
import { useItems } from '../hooks/useItems'
import { useIdeas } from '../hooks/useIdeas'
import { getLocation, getCurrentWeather, type WeatherData } from '../lib/weather'
import { getLogReminderEnabled } from '../lib/settings'
import { outfitTitle } from '../lib/outfitTitle'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { T, fS, fM, dotted, V4Icon, Btn, RoundBtn, Disp, Body, Mono, SecH, V4Card, Ph, outfitTone, Divider } from '../design/kit'
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

  const wearCountById = useMemo(() => {
    const map: Record<string, number> = {}
    for (const o of outfits) for (const id of o.item_ids) map[id] = (map[id] ?? 0) + 1
    return map
  }, [outfits])

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


  const weatherLine = weather && `${weather.conditions.charAt(0).toUpperCase()}${weather.conditions.slice(1)} — ${weather.temp_c}°.`
  const monthShortLabel = now.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()

  const WeatherHead = isDesktop ? (
    <div style={{ padding: '4px 0 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <V4Icon n="sun" s={18} w={1.7} c={T.cocoa} />
        <Mono s={12} c={T.cocoa}>{DOW[now.getDay()]} {String(now.getDate()).padStart(2, '0')} {monthShortLabel}</Mono>
      </div>
      <Disp s={40}>{weatherLine ?? 'Today.'}</Disp>
    </div>
  ) : (
    <div style={{ padding: '4px 22px 0' }}>
      <Disp s={30}>Today.</Disp>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '14px 0 7px' }}>
        <V4Icon n="sun" s={16} w={1.7} c={T.cocoa} />
        <Mono s={11.5} c={T.cocoa}>{DOW[now.getDay()]} {String(now.getDate()).padStart(2, '0')} {monthShortLabel}</Mono>
      </div>
      {weatherLine && <Disp s={26}>{weatherLine}</Disp>}
    </div>
  )

  const WeekStrip = (
    <div style={{ padding: isDesktop ? 0 : '0 22px' }}>
      <SecH right={isDesktop ? monthShortLabel : 'Month'} onRightClick={() => navigate('/outfits')}>This week</SecH>
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
                {outfit ? <Ph tone={outfitTone(outfit.id)} /> : (
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

  const hasTrend = currentMonthCount > 0 || (priorAvg ?? 0) > 0

  // Peach trend card, sized to sit inside the desktop This-week card
  // (which already has its own padding) rather than the page gutter.
  const TrendCard = hasTrend ? (
    <div style={{ marginTop: 18 }}>
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

  const MonthTrend = hasTrend ? (
    <div style={{ padding: '18px 22px 0' }}>
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

  // Compact sidebar list, desktop only — a handful of recently logged
  // outfits, styled like the Saved-for-later rows below it.
  const pastOutfits = outfits.filter(o => o.date_worn !== today).sort((a, b) => b.date_worn.localeCompare(a.date_worn)).slice(0, 4)
  const PastOutfitsBlock = pastOutfits.length > 0 ? (
    <div style={{ padding: '18px 0 0' }}>
      <SecH right="Calendar" onRightClick={() => navigate('/outfits')}>Past outfits</SecH>
      {pastOutfits.map((o, i, arr) => {
        const d = new Date(o.date_worn + 'T00:00:00')
        return (
          <button
            key={o.id} onClick={() => navigate(`/outfits/${o.id}`)}
            style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 13, padding: '10px 0', background: 'none', border: 'none', borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ width: 38, height: 47, flexShrink: 0, position: 'relative' }}><Collage items={collageItems(o.item_ids)} fill /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{outfitTitle(o.item_ids, items, 'Outfit')}</div>
              <Mono s={10.5} style={{ marginTop: 2 }}>{DOW[d.getDay()]} {o.date_worn.slice(8, 10)}{o.occasion ? ` · ${o.occasion}` : ''}</Mono>
            </div>
            <V4Icon n="next" s={16} w={1.7} c={T.g400} />
          </button>
        )
      })}
    </div>
  ) : null

  if (loading) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  }

  const IdeasBlock = ideas.length > 0 && (
    <div style={{ padding: isDesktop ? '18px 0 0' : '18px 22px 0' }}>
      <SecH right="Ideas" onRightClick={() => navigate('/ideas')}>Saved for later</SecH>
      {isDesktop ? (
        <div style={{ maxHeight: 260, overflowY: 'auto' }}>
          {ideas.map((idea, i, arr) => (
            <button
              key={idea.id} onClick={() => navigate(`/ideas/${idea.id}`)}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 13, padding: '10px 0', background: 'none', border: 'none', borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: 38, height: 47, flexShrink: 0, position: 'relative' }}>
                <Collage items={collageItems(idea.item_ids)} fill />
                <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 1px ${T.line}`, pointerEvents: 'none' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{outfitTitle(idea.item_ids, items, idea.occasion ?? 'Idea')}</div>
                <Mono s={10.5} style={{ marginTop: 2 }}>{idea.occasion ? `${idea.occasion} · ` : ''}saved {new Date(idea.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toLowerCase()}</Mono>
              </div>
              <V4Icon n="next" s={16} w={1.7} c={T.g400} />
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          {ideas.slice(0, 3).map(idea => (
            <button key={idea.id} onClick={() => navigate(`/ideas/${idea.id}`)} style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: '100%', aspectRatio: '3/4', position: 'relative' }}>
                <Collage items={collageItems(idea.item_ids)} fill />
                <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 1px ${T.line}`, pointerEvents: 'none' }} />
              </div>
              <Body s={12} style={{ marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{outfitTitle(idea.item_ids, items, idea.occasion ?? 'Idea')}</Body>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  if (todayOutfit) {
    const time = new Date(todayOutfit.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const todayItems = todayOutfit.item_ids.map(id => items.find(i => i.id === id)).filter((i): i is NonNullable<typeof i> => !!i)
    const handleRepeat = () => navigate('/outfits/new', { state: { preselectedIds: todayOutfit.item_ids, occasion: todayOutfit.occasion ?? '', date: today } })

    const DesktopMain = (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 42fr) minmax(220px, 58fr)', gap: 26 }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => navigate(`/outfits/${todayOutfit.id}`)} style={{ display: 'block', width: '100%', aspectRatio: '340 / 400', background: 'none', border: 'none', padding: 0, cursor: 'pointer', position: 'relative' }}>
            <Collage items={collageItems(todayOutfit.item_ids)} fill />
          </button>
          {todayOutfit.occasion && (
            <div style={{ position: 'absolute', top: 14, left: 14, height: 30, display: 'inline-flex', alignItems: 'center', padding: '0 13px', background: 'rgba(247,246,245,.94)', fontFamily: fS, fontSize: 12.5, fontWeight: 600, textTransform: 'capitalize', pointerEvents: 'none' }}>{todayOutfit.occasion}</div>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <Disp s={26}>{outfitTitle(todayOutfit.item_ids, items, 'Outfit logged.')}</Disp>
          <Body s={14} style={{ marginTop: 6 }}>{todayOutfit.item_ids.length} pieces · logged at {time}</Body>
          <div style={{ marginTop: 22 }}>
            {todayItems.map((item, i) => (
              <button
                key={item.id} onClick={() => navigate(`/wardrobe/${item.id}`)}
                style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 13, padding: '11px 0', background: 'none', border: 'none', borderBottom: i < todayItems.length - 1 ? `1px solid ${T.line}` : 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ flex: 1, minWidth: 0, fontFamily: fS, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                <Mono s={10.5} style={{ flexShrink: 0 }}>{item.category}</Mono>
                <Mono s={11} c={T.cocoa} style={{ fontWeight: 700, flexShrink: 0 }}>{wearCountById[item.id] ?? 0}×</Mono>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <Btn kind="quiet" icon="repeat" onClick={handleRepeat}>Wear again</Btn>
          </div>
        </div>
      </div>
    )

    const MobileMain = (
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
          <RoundBtn icon="next" onClick={() => navigate(`/outfits/${todayOutfit.id}`)} />
        </div>
      </div>
    )
    const SidebarBlock = (
      <V4Card pad={18}>
        {PastOutfitsBlock}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.line}` }}>{IdeasBlock}</div>
      </V4Card>
    )
    const ThisWeekCard = (
      <div style={{ marginTop: 30 }}>
        <V4Card pad={22}>
          {WeekStrip}
          {TrendCard}
        </V4Card>
      </div>
    )
    return (
      <div style={{ paddingBottom: 32 }}>
        {WeatherHead}
        {isDesktop ? (
          <div style={{ padding: '30px 22px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 58fr) minmax(200px, 42fr)', gap: 52, alignItems: 'start' }}>
              <div>
                <V4Card pad={24} style={{ overflow: 'hidden' }}>{DesktopMain}</V4Card>
                {ThisWeekCard}
              </div>
              {SidebarBlock}
            </div>
          </div>
        ) : (
          <>
            {MobileMain}
            <Divider />
            <div style={{ padding: '18px 0 0' }}>{WeekStrip}</div>
            {MonthTrend && <Divider />}
            {MonthTrend}
            {IdeasBlock && <Divider />}
            {IdeasBlock}
          </>
        )}
      </div>
    )
  }

  const showEveningReminder = now.getHours() >= 21 && getLogReminderEnabled()

  const EmptyMain = (
    <div style={{ padding: isDesktop ? '20px 0 0' : '20px 22px 0' }}>
      <div style={{ ...dotted, padding: '30px 24px 26px', border: `1px solid ${T.line}` }}>
        <img src="/brand/wave.png" alt="" style={{ width: 92, display: 'block', marginBottom: 18, opacity: .95 }} />
        <Disp s={22}>Nothing on today yet.</Disp>
        <Body s={14} style={{ marginTop: 8, maxWidth: 280 }}>
          You can log it yourself or I can pull something together from your closet.
        </Body>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          <Btn full icon="cal" onClick={() => navigate('/outfits/new', { state: { date: today } })}>Log what I'm wearing</Btn>
          <Btn full kind="peach" icon="spark" onClick={() => navigate('/suggest')}>Suggest three looks</Btn>
        </div>
      </div>
    </div>
  )

  const EveningReminder = showEveningReminder && (
    <div style={{ padding: isDesktop ? '16px 0 0' : '16px 22px 0' }}>
      <V4Card fill={T.peach} shadow={false} pad={14} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <V4Icon n="cal" s={18} w={1.7} c={T.cocoa} />
        <Body s={13.5} c={T.cocoa} style={{ flex: 1 }}>Haven't logged today — quick, before you forget?</Body>
        <button onClick={() => navigate('/outfits/new', { state: { date: today } })} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: fS, fontSize: 13, fontWeight: 600, color: T.ink }}>Log</button>
      </V4Card>
    </div>
  )

  const EmptySidebar = (
    <V4Card pad={18}>
      {PastOutfitsBlock}
      <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.line}` }}>{IdeasBlock}</div>
    </V4Card>
  )
  const EmptyThisWeekCard = (
    <div style={{ marginTop: 30 }}>
      <V4Card pad={22}>
        {WeekStrip}
        {TrendCard}
      </V4Card>
    </div>
  )

  return (
    <div style={{ paddingBottom: 32 }}>
      {WeatherHead}
      {isDesktop ? (
        <div style={{ padding: '30px 22px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 58fr) minmax(200px, 42fr)', gap: 52, alignItems: 'start' }}>
            <div>
              {EveningReminder}
              {EmptyMain}
              {EmptyThisWeekCard}
            </div>
            {EmptySidebar}
          </div>
        </div>
      ) : (
        <>
          {EveningReminder}
          {EmptyMain}
          <Divider />
          <div style={{ padding: '18px 0 0' }}>{WeekStrip}</div>
          {MonthTrend && <Divider />}
          {MonthTrend}
          {IdeasBlock && <Divider />}
          {IdeasBlock}
        </>
      )}
    </div>
  )
}
