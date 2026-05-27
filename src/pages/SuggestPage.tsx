import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { getLocation, getCurrentWeather, type WeatherData } from '../lib/weather'
import { SectionLabel, MonoTag, UButton, MONO, UI, INK, RULE } from '../components/ui'

const OCCASION_PRESETS = ['casual', 'work', 'date night', 'weekend', 'formal', 'gym']

type Suggestion = { item_ids: string[]; reasoning: string }

// ─── Style profile editor ─────────────────────────────────────────────────────

function StyleProfileEditor({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    supabase.from('style_profile').select('description').eq('user_id', userId).single()
      .then(({ data }) => { if (data) setText(data.description); setLoaded(true) })
  }, [userId])

  const save = async () => {
    setSaving(true)
    await supabase.from('style_profile').upsert(
      { user_id: userId, description: text },
      { onConflict: 'user_id' }
    )
    setSaving(false)
    setOpen(false)
  }

  if (!loaded) return null

  return (
    <div style={{ border: RULE, borderRadius: 3, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}
      >
        <span>// my style profile</span>
        <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.3)' }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: RULE }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', margin: '10px 0 8px', lineHeight: 1.5 }}>
            describe your style — Claude uses this to tailor suggestions
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. I prefer minimal, classic pieces in neutral tones. I lean towards relaxed silhouettes but like to look polished."
            rows={4}
            style={{
              width: '100%', border: RULE, borderRadius: 3,
              padding: '8px 10px', fontFamily: UI, fontSize: 12,
              color: INK, background: '#fff', outline: 'none', resize: 'none',
            }}
          />
          <UButton onClick={save} disabled={saving} style={{ marginTop: 8 }}>
            {saving ? 'Saving…' : 'Save style'}
          </UButton>
        </div>
      )}
    </div>
  )
}

// ─── Suggestion card ──────────────────────────────────────────────────────────

function SuggestionCard({
  suggestion,
  itemMap,
  onLog,
}: {
  suggestion: Suggestion
  itemMap: Map<string, { name: string; category: string; signedImageUrl: string | null }>
  onLog: (ids: string[]) => void
}) {
  const outfitItems = suggestion.item_ids
    .map(id => itemMap.get(id))
    .filter((x): x is { name: string; category: string; signedImageUrl: string | null } => !!x)

  return (
    <div style={{ border: RULE, borderRadius: 3, overflow: 'hidden' }}>
      {/* Item thumbnails */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(outfitItems.length, 4)}, 1fr)`,
        gap: 2,
      }}>
        {outfitItems.slice(0, 4).map((item, i) => (
          <div key={i} style={{ aspectRatio: '3/4', background: '#ECEAE6', overflow: 'hidden', position: 'relative' }}>
            {item.signedImageUrl
              ? <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 10px, #DCD9D3 10px 20px)' }} />
            }
            <div style={{
              position: 'absolute', bottom: 4, left: 4,
              fontFamily: MONO, fontSize: 7.5,
              background: 'rgba(255,255,255,0.9)', color: INK,
              padding: '1px 4px',
            }}>{item.category}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 14px' }}>
        {/* Item name tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          {outfitItems.map((item, i) => (
            <MonoTag key={i}>{item.name}</MonoTag>
          ))}
        </div>

        {/* Reasoning */}
        <div style={{
          fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          lineHeight: 1.6, marginBottom: 12,
        }}>
          {suggestion.reasoning}
        </div>

        <UButton onClick={() => onLog(suggestion.item_ids)} style={{ width: '100%' }}>
          Log this outfit
        </UButton>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SuggestPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items } = useItems()
  const { outfits } = useOutfits()

  const [occasion, setOccasion] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = async () => {
    setWeatherLoading(true)
    setWeatherError(null)
    try {
      const { lat, lon } = await getLocation()
      const w = await getCurrentWeather(lat, lon)
      setWeather(w)
    } catch (e) {
      setWeatherError(e instanceof Error ? e.message : 'Could not get weather')
    }
    setWeatherLoading(false)
  }

  useEffect(() => { fetchWeather() }, [])

  const handleSuggest = async () => {
    if (!occasion.trim()) { setError('Choose an occasion first.'); return }
    if (!weather) { setError('Weather is needed for suggestions.'); return }
    setLoading(true)
    setError(null)
    setSuggestions([])

    const { data: profileData } = await supabase
      .from('style_profile').select('description').eq('user_id', user!.id).single()

    const recent_outfits = outfits.slice(0, 7).map(o => ({
      date: o.date_worn,
      occasion: o.occasion,
      item_names: o.item_ids.map(id => items.find(i => i.id === id)?.name ?? '').filter(Boolean),
    }))

    const payload = {
      occasion: occasion.trim(),
      weather,
      items: items.map(({ id, name, category, subcategory, color, warmth, formality }) =>
        ({ id, name, category, subcategory, color, warmth, formality })
      ),
      style_profile: profileData?.description ?? '',
      recent_outfits,
    }

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Suggestion failed')
      setSuggestions(data.suggestions ?? [])
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

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* AppBar */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 6 }}>
              <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/>
            </svg>
            Suggest
          </div>
        </div>
        <div style={{ borderTop: RULE, marginTop: 12 }} />
      </div>

      <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Style profile */}
        {user && <StyleProfileEditor userId={user.id} />}

        {/* Weather strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          border: RULE, borderRadius: 3,
        }}>
          <div style={{ padding: '12px 14px', borderRight: RULE }}>
            <div style={{
              fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
            }}>weather</div>
            {weatherLoading ? (
              <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>loading…</div>
            ) : weather ? (
              <>
                <div style={{ fontFamily: UI, fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {weather.temp_c}°
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
                  {weather.conditions}
                </div>
              </>
            ) : (
              <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>
                {weatherError ?? 'unavailable'}
              </div>
            )}
          </div>
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{
              fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
            }}>closet</div>
            <div style={{ fontFamily: UI, fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {items.length}
              <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', marginLeft: 5 }}>items</span>
            </div>
            <button
              onClick={fetchWeather}
              disabled={weatherLoading}
              style={{
                marginTop: 8,
                fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
                background: 'none', border: RULE, borderRadius: 2,
                padding: '3px 8px', cursor: 'pointer',
                opacity: weatherLoading ? 0.4 : 1,
                alignSelf: 'flex-start',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              ↻ refresh
            </button>
          </div>
        </div>

        {/* Occasion */}
        <div style={{ border: RULE, borderRadius: 3 }}>
          <div style={{ padding: '12px 14px', borderBottom: RULE }}>
            <div style={{
              fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
            }}>occasion</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {OCCASION_PRESETS.map(o => (
                <button
                  key={o}
                  onClick={() => setOccasion(prev => prev === o ? '' : o)}
                  style={{
                    padding: '3px 10px', borderRadius: 2,
                    border: `1px solid ${occasion === o ? INK : 'rgba(0,0,0,0.15)'}`,
                    background: occasion === o ? INK : 'transparent',
                    color: occasion === o ? '#fff' : 'rgba(0,0,0,0.55)',
                    fontFamily: MONO, fontSize: 9.5, cursor: 'pointer',
                    letterSpacing: '0.04em',
                  }}
                >{o}</button>
              ))}
            </div>
            <input
              type="text"
              value={occasion}
              onChange={e => setOccasion(e.target.value)}
              placeholder="or type custom occasion…"
              style={{
                width: '100%', fontFamily: UI, fontSize: 14, fontWeight: 500,
                color: occasion ? INK : 'rgba(0,0,0,0.35)',
                background: 'none', border: 'none', outline: 'none', padding: 0,
              }}
            />
          </div>
        </div>

        {/* Suggest button */}
        <UButton
          onClick={handleSuggest}
          disabled={loading || !occasion.trim() || !weather}
          style={{ width: '100%' }}
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" style={{ marginRight: 6 }} />Getting suggestions…</>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/>
              </svg>
              Suggest an outfit
            </>
          )}
        </UButton>

        {error && (
          <div style={{ fontFamily: MONO, fontSize: 10, color: '#9C5544' }}>{error}</div>
        )}

        {/* Results */}
        {suggestions.length > 0 && (
          <div>
            <SectionLabel right={`${suggestions.length} option${suggestions.length > 1 ? 's' : ''}`}>
              suggestions · {occasion}
            </SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {suggestions.map((s, i) => (
                <SuggestionCard key={i} suggestion={s} itemMap={itemMap} onLog={handleLog} />
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', textAlign: 'center', padding: '16px 0' }}>
            add items to your wardrobe first
          </div>
        )}
      </div>
    </div>
  )
}
