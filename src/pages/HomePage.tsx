import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useOutfits } from '../hooks/useOutfits'
import { useItems } from '../hooks/useItems'
import { getLocation, getCurrentWeather, type WeatherData } from '../lib/weather'
import { TopBar, SectionLabel, UButton, Icon, MONO, UI, RULE, outfitTitle } from '../components/ui'
import { outfitPalette } from '../lib/outfitPalette'

const DOW = ['sun','mon','tue','wed','thu','fri','sat']

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function HomePage() {
  const navigate = useNavigate()
  const { outfits, loading } = useOutfits()
  const { isDesktop } = useBreakpoint()
  const { items } = useItems()
  const [weather, setWeather] = useState<WeatherData | null>(null)

  const today = todayStr()
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

  return (
    <div style={{ paddingBottom: isDesktop ? 40 : 160 }}>
      <TopBar
        title={<>
          closet
          <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', marginLeft: 4 }}>v0.1</span>
        </>}
        meta={dateLabel}
      />

      {/* Today hero */}
      <div style={{ padding: '24px 20px 0' }}>
        <SectionLabel>today</SectionLabel>
        {loading ? (
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>loading…</div>
        ) : todayOutfit ? (
          <button
            onClick={() => navigate(`/outfits/${todayOutfit.id}`)}
            style={{
              width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            }}
          >
            <div style={{ fontFamily: UI, fontSize: 32, lineHeight: 1.05, fontWeight: 500, letterSpacing: '-0.025em' }}>
              {outfitTitle(todayOutfit.item_ids, items, todayOutfit.occasion || 'Outfit logged.')}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)', marginTop: 8 }}>
              {todayOutfit.item_ids.length} pieces · tap to view ›
            </div>
          </button>
        ) : (
          <div style={{ fontFamily: UI, fontSize: 38, lineHeight: 1.02, fontWeight: 500, letterSpacing: '-0.025em' }}>
            You haven't<br />logged today.
          </div>
        )}
      </div>

      {/* Weather + stats */}
      <div style={{
        margin: '28px 20px 0',
        border: RULE, borderRadius: 4,
        display: 'grid', gridTemplateColumns: '1fr 1fr',
      }}>
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

      {/* Recent log */}
      {recent.length > 0 && (
        <div style={{ padding: '24px 20px 0' }}>
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
              <div style={{ flex: 1 }}>
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
        </div>
      )}

      {/* Empty state CTA */}
      {!loading && items.length === 0 && (
        <div style={{ padding: '32px 20px 0', textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            // start here
          </div>
          <UButton icon="plus" onClick={() => navigate('/wardrobe/new')}>Add your first item</UButton>
        </div>
      )}

      {!isDesktop && (
        <div style={{
          position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 700,
          background: '#F7F6F5', borderTop: RULE,
          padding: '12px 20px', display: 'flex', gap: 8, zIndex: 25,
        }}>
          <UButton icon="plus" full style={{ flex: 1 }} onClick={() => navigate('/outfits/new')}>Log outfit</UButton>
          <UButton variant="secondary" icon="spark" style={{ width: 120 }} onClick={() => navigate('/suggest')}>Suggest</UButton>
        </div>
      )}
    </div>
  )
}
