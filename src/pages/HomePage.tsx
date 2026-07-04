import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useOutfits } from '../hooks/useOutfits'
import { useItems } from '../hooks/useItems'
import { getLocation, getCurrentWeather, type WeatherData } from '../lib/weather'
import { getOccasionPresets } from '../lib/occasionPresets'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { TopBar, SectionLabel, UButton, Icon, MONO, UI, INK, RULE, ACCENT, outfitTitle } from '../components/ui'
import { outfitPalette } from '../lib/outfitPalette'
import QuickActions from '../components/QuickActions'
import FixedBar from '../components/FixedBar'
import AddItemButton from '../components/AddItemButton'
import LogOutfitButton from '../components/LogOutfitButton'
import ItemCollage from '../components/ItemCollage'

type TodaySuggestion = { item_ids: string[]; reasoning: string }

const DOW = ['sun','mon','tue','wed','thu','fri','sat'] // indexed by getDay() — Sun=0

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { outfits, loading } = useOutfits()
  const { items } = useItems()
  const { isDesktop } = useBreakpoint()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [suggestion, setSuggestion] = useState<TodaySuggestion | null>(null)
  const [suggestOccasion, setSuggestOccasion] = useState<string | null>(null)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestError, setSuggestError] = useState<string | null>(null)

  const today = todayStr()
  const topOccasion = useMemo(() => getOccasionPresets(outfits)[0] ?? 'casual', [outfits])
  const now = new Date()
  const dateLabel = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} · ${DOW[now.getDay()]}`

  const todayOutfit = outfits.find(o => o.date_worn === today)
  const monthPrefix = today.slice(0, 7)
  const monthOutfits = outfits.filter(o => o.date_worn.startsWith(monthPrefix))
  const prevMonthPrefix = (() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })()
  const prevMonthCount = outfits.filter(o => o.date_worn.startsWith(prevMonthPrefix)).length
  const monthDelta = monthOutfits.length - prevMonthCount
  const recent = outfits.slice(0, 3)

  useEffect(() => {
    getLocation()
      .then(({ lat, lon }) => getCurrentWeather(lat, lon))
      .then(setWeather)
      .catch(() => {})
  }, [])

  const handleSuggestToday = async () => {
    if (!user || !weather) return
    setSuggestLoading(true); setSuggestError(null)
    try {
      const { data: profileData } = await supabase
        .from('style_profile').select('description').eq('user_id', user.id).single()

      const recent_outfits = outfits.slice(0, 7).map(o => ({
        date: o.date_worn, occasion: o.occasion,
        item_names: o.item_ids.map(id => items.find(i => i.id === id)?.name ?? '').filter(Boolean),
      }))

      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: topOccasion, weather,
          items: items.map(({ id, name, category, subcategory, color, warmth, formality, sport }) =>
            ({ id, name, category, subcategory, color, warmth, formality, sport })),
          style_profile: profileData?.description ?? '',
          recent_outfits,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Suggestion failed')
      const incoming: TodaySuggestion[] = data.suggestions ?? []
      if (incoming.length === 0) throw new Error('No valid outfits found — try Suggest for more options.')
      setSuggestion(incoming[0])
      setSuggestOccasion(topOccasion)
    } catch (e) {
      setSuggestError(e instanceof Error ? e.message : 'Something went wrong')
    }
    setSuggestLoading(false)
  }

  const TodayHeroBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', height: isDesktop ? '100%' : undefined }}>
      <SectionLabel>today</SectionLabel>
      {loading ? (
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>loading…</div>
      ) : todayOutfit ? (
        <button
          onClick={() => navigate(`/outfits/${todayOutfit.id}`)}
          style={{
            width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            display: 'flex', alignItems: isDesktop ? 'stretch' : 'center', gap: 16,
            flex: isDesktop ? 1 : undefined, minHeight: 0,
          }}
        >
          <div style={{ flex: isDesktop ? '0 0 20%' : 1, minWidth: 0 }}>
            <ItemCollage
              items={todayOutfit.item_ids
                .map(id => items.find(i => i.id === id))
                .filter((i): i is NonNullable<typeof i> => !!i)}
              aspectRatio="1/1"
              fill={isDesktop}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {todayOutfit.occasion && (
              <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                {todayOutfit.occasion}
              </div>
            )}
            <div style={{ fontFamily: UI, fontSize: 26, lineHeight: 1.05, fontWeight: 500, letterSpacing: '-0.025em' }}>
              {outfitTitle(todayOutfit.item_ids, items, todayOutfit.occasion || 'Outfit logged.')}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)', marginTop: 6 }}>
              {todayOutfit.item_ids.length} pieces · tap to view ›
            </div>
          </div>
        </button>
      ) : (
        <div style={{ fontFamily: UI, fontSize: 38, lineHeight: 1.02, fontWeight: 500, letterSpacing: '-0.025em' }}>
          You haven't<br />logged today.
        </div>
      )}
    </div>
  )

  const TodaysPickBlock = !loading && !todayOutfit && items.length > 0 ? (
    <div style={{ border: RULE, borderRadius: 4, padding: 16 }}>
      {!suggestion ? (
        <>
          <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            today's pick
          </div>
          <div style={{ fontFamily: UI, fontSize: 15, fontWeight: 500, color: INK, marginTop: 6, letterSpacing: '-0.01em' }}>
            What should you wear{weather ? ` at ${weather.temp_c}°` : ''}?
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)', marginTop: 4 }}>
            based on your "{topOccasion}" days
          </div>
          {suggestError && (
            <div style={{ fontFamily: MONO, fontSize: 9.5, color: ACCENT, marginTop: 8 }}>{suggestError}</div>
          )}
          <div style={{ marginTop: 12 }}>
            <UButton full icon="spark" disabled={suggestLoading || !weather} onClick={handleSuggestToday}>
              {suggestLoading ? 'Thinking…' : 'Suggest an outfit'}
            </UButton>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            today's pick · {suggestOccasion}
          </div>
          <div style={{ marginTop: 10 }}>
            <ItemCollage
              items={suggestion.item_ids
                .map(id => items.find(i => i.id === id))
                .filter((i): i is NonNullable<typeof i> => !!i)}
              aspectRatio="16/7"
            />
          </div>
          <div style={{ fontFamily: UI, fontSize: 12.5, color: 'rgba(0,0,0,0.65)', marginTop: 10, fontStyle: 'italic' }}>
            "{suggestion.reasoning}"
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <LogOutfitButton
              style={{ flex: 1.6 }}
              onClick={() => navigate('/outfits/new', { state: { preselectedIds: suggestion.item_ids, occasion: suggestOccasion ?? '', date: today } })}
            >
              Log this outfit
            </LogOutfitButton>
            <UButton
              variant="ghost"
              style={{ flex: 1 }}
              onClick={() => navigate('/suggest', { state: { occasion: suggestOccasion ?? '' } })}
            >
              More
            </UButton>
          </div>
        </>
      )}
    </div>
  ) : null

  const WeatherStatsBlock = (
    <div style={{ border: RULE, borderRadius: 4, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ padding: 14, borderRight: RULE }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>weather</div>
        {weather ? (
          <>
            <div style={{ fontFamily: UI, fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1 }}>
              {weather.temp_c}°
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
              {weather.conditions}
            </div>
          </>
        ) : (
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', marginTop: 6 }}>—</div>
        )}
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>this month</div>
        <div style={{
          fontFamily: UI, fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1,
          display: 'flex', alignItems: 'baseline', gap: 6,
        }}>
          {monthOutfits.length}
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)' }}>outfits</span>
        </div>
        {prevMonthCount > 0 && (
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
            {monthDelta >= 0 ? '+' : ''}{monthDelta} vs last month
          </div>
        )}
      </div>
    </div>
  )

  const RecentBlock = recent.length > 0 ? (
    <>
      <SectionLabel right={<span onClick={() => navigate('/outfits')} style={{ cursor: 'pointer' }}>{outfits.length} total ›</span>}>recent</SectionLabel>
      {recent.map((o, i) => (
        <button
          key={o.id}
          onClick={() => navigate(`/outfits/${o.id}`)}
          style={{
            width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 12,
            paddingTop: 10, paddingBottom: 10,
            borderTop: i === 0 ? RULE : 'none',
            borderBottom: RULE,
          }}
        >
          <div style={{
            width: 34, height: 42, borderRadius: 2, overflow: 'hidden', border: RULE, flexShrink: 0,
            background: (() => { const [a,b] = outfitPalette(o.id); return `repeating-linear-gradient(135deg, ${a} 0 10px, ${b} 10px 20px)`; })(),
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: UI, fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em', textTransform: 'capitalize' }}>
              {outfitTitle(o.item_ids, items, o.occasion || 'outfit')}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>
              {o.date_worn} · {o.item_ids.length} pieces
              {o.weather ? ` · ${o.weather.temp_c}°` : ''}
            </div>
          </div>
          <Icon name="forward" size={14} stroke={1.2} />
        </button>
      ))}
    </>
  ) : null

  return (
    <div style={{ paddingBottom: 160 }}>
      <TopBar
        title={<>
          closet
          <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', marginLeft: 4 }}>v2.1.0</span>
        </>}
        meta={dateLabel}
      />

      {/* Onboarding checklist — fades once wardrobe + logging history are established */}
      {!loading && (items.length === 0 || outfits.length < 5) && (
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            // start here
          </div>
          <div style={{ fontFamily: UI, fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 16 }}>
            {items.length === 0 ? 'Welcome to your closet.' : "Let's get you dialed in."}
          </div>

          <div style={{ borderTop: RULE }}>
            {/* Step 1 — upload pieces */}
            <div style={{ padding: '14px 0', borderBottom: RULE, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 20, height: 20, flexShrink: 0, borderRadius: '50%',
                border: items.length > 0 ? 'none' : '1px solid rgba(0,0,0,0.25)',
                background: items.length > 0 ? INK : 'none',
                color: items.length > 0 ? '#fff' : 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: MONO, fontSize: 9.5,
              }}>
                {items.length > 0 ? <Icon name="check" size={11} stroke={2.2} /> : '01'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: UI, fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em', color: INK }}>
                  Upload your pieces
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)', marginTop: 3 }}>
                  {items.length > 0 ? `${items.length} added · the more you add, the better suggestions get` : 'The more you add, the better suggestions get'}
                </div>
                {items.length === 0 && (
                  <div style={{ marginTop: 10 }}><AddItemButton>Add your first item</AddItemButton></div>
                )}
              </div>
            </div>

            {/* Step 2 — log outfits */}
            <div style={{ padding: '14px 0', borderBottom: RULE, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 20, height: 20, flexShrink: 0, borderRadius: '50%',
                border: outfits.length >= 5 ? 'none' : '1px solid rgba(0,0,0,0.25)',
                background: outfits.length >= 5 ? INK : 'none',
                color: outfits.length >= 5 ? '#fff' : 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: MONO, fontSize: 9.5,
              }}>
                {outfits.length >= 5 ? <Icon name="check" size={11} stroke={2.2} /> : '02'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: UI, fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em', color: INK }}>
                  Log a few outfits
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)', marginTop: 3 }}>
                  {outfits.length}/5 logged · at least 5–10 for accurate suggestions
                </div>
                {items.length > 0 && outfits.length < 5 && (
                  <div style={{ marginTop: 10 }}>
                    <LogOutfitButton>Log an outfit</LogOutfitButton>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3 — try suggest/shop */}
            <div style={{ padding: '14px 0', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 20, height: 20, flexShrink: 0, borderRadius: '50%',
                border: '1px solid rgba(0,0,0,0.25)',
                color: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: MONO, fontSize: 9.5,
              }}>03</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: UI, fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em', color: INK }}>
                  Try Suggest or Shop
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)', marginTop: 3 }}>
                  See what the AI puts together once you've got data to work with
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today hero + Recent — one aligned row on desktop, shared row height */}
      {isDesktop ? (
        <div style={{ display: 'grid', gridTemplateColumns: '70% 30%', gap: 32, margin: '24px 20px 0' }}>
          <div>{TodayHeroBlock}</div>
          <div style={{ paddingRight: 16 }}>{RecentBlock}</div>
        </div>
      ) : (
        <div style={{ padding: '24px 20px 0' }}>{TodayHeroBlock}</div>
      )}

      {/* Today's pick — full width */}
      {TodaysPickBlock && <div style={{ margin: '20px 20px 0' }}>{TodaysPickBlock}</div>}

      {/* Weather + stats — full width */}
      <div style={{ margin: '28px 20px 0' }}>{WeatherStatsBlock}</div>

      {/* Recent — mobile only; shown alongside Today hero on desktop above */}
      {!isDesktop && RecentBlock && (
        <div style={{ padding: '24px 20px 0' }}>{RecentBlock}</div>
      )}

      <FixedBar><QuickActions /></FixedBar>
    </div>
  )
}
