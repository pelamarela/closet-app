import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { getLocation, getCurrentWeather, type WeatherData } from '../lib/weather'
import { AppBar, SectionLabel, MonoTag, UButton, Icon, MONO, UI, INK, RULE, ACCENT } from '../components/ui'

const OCCASION_PRESETS = ['studio', 'dinner', 'gallery', 'weekend', 'client', 'errands']
type Suggestion = { item_ids: string[]; reasoning: string }

export default function SuggestPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items } = useItems()
  const { outfits } = useOutfits()

  const [view, setView] = useState<'input' | 'result'>('input')
  const [occasion, setOccasion] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [avoidRecent, setAvoidRecent] = useState(true)
  const [coldLayer, setColdLayer] = useState(true)
  const [profile, setProfile] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedOption, setSelectedOption] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState<number | null>(null)

  const fetchWeather = async () => {
    setWeatherLoading(true); setWeatherError(null)
    try {
      const { lat, lon } = await getLocation()
      setWeather(await getCurrentWeather(lat, lon))
    } catch (e) {
      setWeatherError(e instanceof Error ? e.message : 'Could not get weather')
    }
    setWeatherLoading(false)
  }

  useEffect(() => { fetchWeather() }, [])
  useEffect(() => {
    if (!user) return
    supabase.from('style_profile').select('description').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data.description) })
  }, [user])

  const handleSuggest = async () => {
    if (!occasion.trim()) { setError('Choose an occasion first.'); return }
    if (!weather) { setError('Weather data needed.'); return }
    setLoading(true); setError(null); setSuggestions([]); setSelectedOption(0)
    const t0 = Date.now()

    const { data: profileData } = await supabase
      .from('style_profile').select('description').eq('user_id', user!.id).single()

    const recent_outfits = outfits.slice(0, 7).map(o => ({
      date: o.date_worn, occasion: o.occasion,
      item_names: o.item_ids.map(id => items.find(i => i.id === id)?.name ?? '').filter(Boolean),
    }))

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: occasion.trim(), weather,
          items: items.map(({ id, name, category, subcategory, color, warmth, formality }) =>
            ({ id, name, category, subcategory, color, warmth, formality })),
          style_profile: profileData?.description ?? '',
          recent_outfits,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Suggestion failed')
      setSuggestions(data.suggestions ?? [])
      setElapsed(Math.round((Date.now() - t0) / 100) / 10)
      setView('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
    setLoading(false)
  }

  const handleLog = (itemIds: string[]) => {
    navigate('/outfits/new', { state: { preselectedIds: itemIds, occasion } })
  }

  const itemMap = new Map(
    items.map(i => [i.id, { name: i.name, category: i.category, signedImageUrl: i.signedImageUrl }])
  )

  const currentSuggestion = suggestions[selectedOption]

  // ── Result view ──────────────────────────────────────────────────────────────
  if (view === 'result' && suggestions.length > 0) {
    const outfitItems = (currentSuggestion?.item_ids ?? [])
      .map(id => itemMap.get(id))
      .filter((x): x is NonNullable<typeof x> => !!x)

    return (
      <div style={{ paddingBottom: 100 }}>
        <AppBar
          title="Brief"
          back
          onBack={() => setView('input')}
          meta={elapsed !== null ? `${elapsed}s · claude haiku` : undefined}
        />

        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            // suggestion {String(selectedOption + 1).padStart(2, '0')} of {String(suggestions.length).padStart(2, '0')}
          </div>
          <div style={{ fontFamily: UI, fontSize: 24, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 6, lineHeight: 1.1 }}>
            For {occasion} · {weather ? `${weather.temp_c}° ${weather.conditions}.` : '—'}
          </div>
        </div>

        {/* Option tabs */}
        {suggestions.length > 1 && (
          <div style={{ padding: '14px 20px 0', display: 'flex', gap: 6 }}>
            {suggestions.map((_, n) => (
              <button
                key={n}
                onClick={() => setSelectedOption(n)}
                style={{
                  flex: 1, border: `1px solid ${n === selectedOption ? INK : 'rgba(0,0,0,0.15)'}`,
                  background: n === selectedOption ? INK : 'transparent',
                  color: n === selectedOption ? '#fff' : 'rgba(0,0,0,0.55)',
                  padding: '8px 0', textAlign: 'center',
                  fontFamily: MONO, fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >option {n + 1}</button>
            ))}
          </div>
        )}

        {/* Outfit thumbnails */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(outfitItems.length, 5)}, 1fr)`, gap: 6 }}>
            {outfitItems.map((item, i) => (
              <div key={i} style={{ position: 'relative', border: RULE, aspectRatio: '3/4', overflow: 'hidden' }}>
                {item.signedImageUrl ? (
                  <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 8px, #DCD9D3 8px 16px)' }} />
                )}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  fontFamily: MONO, fontSize: 7.5, background: 'rgba(255,255,255,0.9)',
                  padding: '2px 4px', textAlign: 'center', letterSpacing: '0.04em',
                }}>{item.category}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reasoning */}
        <div style={{ padding: '20px 20px 0' }}>
          <SectionLabel right="reasoning">claude</SectionLabel>
          <div style={{
            border: RULE, background: '#fff', padding: 14,
            fontFamily: UI, fontSize: 13, lineHeight: 1.55, color: 'rgba(0,0,0,0.78)',
          }}>
            {currentSuggestion?.reasoning}
          </div>
        </div>

        {/* Pieces list */}
        <div style={{ padding: '20px 20px 0' }}>
          <SectionLabel right={`${outfitItems.length} pieces`}>pieces</SectionLabel>
          <div style={{ borderTop: RULE }}>
            {(currentSuggestion?.item_ids ?? []).map((id, i) => {
              const item = itemMap.get(id)
              if (!item) return null
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '60px 1fr 56px',
                  gap: 12, alignItems: 'center',
                  padding: '7px 0', borderBottom: RULE,
                  fontFamily: MONO, fontSize: 10,
                }}>
                  <span style={{ color: 'rgba(0,0,0,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{id.slice(0, 6)}</span>
                  <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 500, letterSpacing: '-0.005em', color: INK }}>{item.name}</span>
                  <span style={{ color: 'rgba(0,0,0,0.5)', textAlign: 'right' }}>{item.category}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430,
          background: '#F7F6F5', borderTop: RULE,
          padding: '12px 20px', display: 'flex', gap: 8, zIndex: 10,
        }}>
          <UButton variant="ghost" style={{ flex: 1 }} icon="spark" onClick={handleSuggest} disabled={loading}>
            {loading ? '…' : 'Regen'}
          </UButton>
          <UButton style={{ flex: 1.6 }} icon="check" onClick={() => handleLog(currentSuggestion?.item_ids ?? [])}>
            Log this outfit
          </UButton>
        </div>
      </div>
    )
  }

  // ── Input view ───────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: 100 }}>
      <AppBar
        title={<><Icon name="spark" size={16} stroke={1.6} /> Suggest</>}
        meta="hybrid · code + claude"
        right={
          <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.4)', padding: 4 }}>
            <Icon name="user" size={17} stroke={1.4} />
          </button>
        }
      />

      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          // what should i wear?
        </div>
        <div style={{ fontFamily: UI, fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 8, lineHeight: 1.1 }}>
          Set the brief.
        </div>
      </div>

      {/* Occasion */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right="required *">occasion</SectionLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {OCCASION_PRESETS.map(o => (
            <button key={o} onClick={() => setOccasion(prev => prev === o ? '' : o)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <MonoTag filled={occasion === o}>{o}</MonoTag>
            </button>
          ))}
        </div>
        <input
          type="text"
          value={OCCASION_PRESETS.includes(occasion) ? '' : occasion}
          onChange={e => setOccasion(e.target.value)}
          placeholder="or type custom…"
          style={{
            width: '100%', fontFamily: UI, fontSize: 14, fontWeight: 500,
            color: INK, background: 'none', border: 'none', outline: 'none',
            borderBottom: RULE, padding: '6px 0',
          }}
        />
      </div>

      {/* Weather */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right="auto · open-meteo">weather</SectionLabel>
        <div style={{ border: RULE, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div style={{ padding: 12, borderRight: RULE }}>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>temp</div>
            <div style={{ fontFamily: UI, fontSize: 17, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 4 }}>
              {weatherLoading ? '…' : weather ? `${weather.temp_c}°` : weatherError ? '—' : '—'}
            </div>
          </div>
          <div style={{ padding: 12, borderRight: RULE }}>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>cond</div>
            <div style={{ fontFamily: UI, fontSize: 17, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 4 }}>
              {weatherLoading ? '…' : weather?.conditions ?? '—'}
            </div>
          </div>
          <div style={{ padding: 12 }}>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>items</div>
            <div style={{ fontFamily: UI, fontSize: 17, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 4 }}>{items.length}</div>
          </div>
        </div>
        {weatherError && (
          <div style={{ fontFamily: MONO, fontSize: 9, color: ACCENT, marginTop: 6 }}>{weatherError}</div>
        )}
      </div>

      {/* Constraints */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>constraints</SectionLabel>
        <div style={{ borderTop: RULE }}>
          {([
            ['avoid worn this week', avoidRecent, () => setAvoidRecent(v => !v)],
            ['use cold-layer rule (+1)', coldLayer, () => setColdLayer(v => !v)],
          ] as [string, boolean, () => void][]).map(([label, on, toggle], i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: RULE,
              fontFamily: MONO, fontSize: 11,
            }}>
              <span style={{ color: INK }}>{label}</span>
              <button
                onClick={toggle}
                style={{
                  padding: '2px 7px',
                  background: on ? INK : 'transparent',
                  color: on ? '#fff' : 'rgba(0,0,0,0.45)',
                  border: `1px solid ${on ? INK : 'rgba(0,0,0,0.15)'}`,
                  fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase',
                  fontFamily: MONO, cursor: 'pointer',
                }}
              >{on ? 'on' : 'off'}</button>
            </div>
          ))}
        </div>
      </div>

      {/* Style profile preview */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right={
          <button onClick={() => navigate('/settings/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', padding: 0 }}>
            edit ›
          </button>
        }>style profile · in use</SectionLabel>
        <div style={{
          border: RULE, padding: 12,
          fontFamily: UI, fontSize: 12, lineHeight: 1.5, color: 'rgba(0,0,0,0.65)',
          maxHeight: 60, overflow: 'hidden', position: 'relative',
        }}>
          {profile || <span style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.35)' }}>No style profile set — add one for better suggestions.</span>}
          {profile && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(transparent, #F7F6F5)' }} />
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: '#F7F6F5', borderTop: RULE,
        padding: '12px 20px', zIndex: 10,
      }}>
        {error && <div style={{ fontFamily: MONO, fontSize: 10, color: ACCENT, marginBottom: 8 }}>{error}</div>}
        {items.length === 0 && (
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', textAlign: 'center', marginBottom: 8 }}>
            add items to your wardrobe first
          </div>
        )}
        <UButton
          full icon="spark"
          disabled={loading || !occasion.trim() || !weather || items.length === 0}
          onClick={handleSuggest}
        >
          {loading ? 'Getting suggestions…' : 'Suggest 3 outfits'}
        </UButton>
      </div>
    </div>
  )
}
