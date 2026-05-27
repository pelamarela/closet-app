import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Sparkles, Loader2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { getLocation, getCurrentWeather, type WeatherData } from '../lib/weather'

const OCCASION_PRESETS = ['Casual', 'Work', 'Date night', 'Weekend', 'Formal event', 'Gym']

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
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 text-sm text-stone-700">
        <span className="font-medium">My style</span>
        {open ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-stone-100">
          <p className="text-xs text-stone-400 mt-3 mb-2">Describe your style — Claude uses this to tailor suggestions.</p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. I prefer minimal, classic pieces in neutral tones. I lean towards relaxed silhouettes but like to look polished."
            rows={4}
            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
          />
          <button onClick={save} disabled={saving} className="mt-2 bg-stone-800 text-white text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-40">
            {saving ? 'Saving…' : 'Save'}
          </button>
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
    <div className="border border-stone-200 rounded-2xl overflow-hidden">
      <div className={`grid gap-0.5 ${outfitItems.length === 1 ? 'grid-cols-1' : outfitItems.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {outfitItems.slice(0, 3).map((item, i) => (
          <div key={i} className="aspect-square bg-stone-100">
            {item.signedImageUrl
              ? <img src={item.signedImageUrl} alt={item.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs p-2 text-center">{item.name}</div>
            }
          </div>
        ))}
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {outfitItems.map((item, i) => (
            <span key={i} className="bg-stone-100 text-stone-700 text-xs px-2.5 py-1 rounded-full">{item.name}</span>
          ))}
        </div>
        <p className="text-stone-500 text-sm mb-4">{suggestion.reasoning}</p>
        <button
          onClick={() => onLog(suggestion.item_ids)}
          className="w-full bg-stone-800 text-white rounded-xl py-2.5 text-sm font-medium"
        >
          Log this outfit
        </button>
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
    <div className="p-4 pb-24 space-y-5">
      <h2 className="text-xl font-semibold text-stone-800">Outfit suggestions</h2>

      {user && <StyleProfileEditor userId={user.id} />}

      {/* Weather strip */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-stone-100 rounded-xl px-4 py-3 flex items-center gap-2">
          <MapPin size={16} className="text-stone-400 flex-shrink-0" />
          {weatherLoading ? (
            <span className="text-stone-400 text-sm">Getting weather…</span>
          ) : weather ? (
            <span className="text-stone-700 text-sm">{weather.temp_c}°C · {weather.conditions}</span>
          ) : (
            <span className="text-stone-400 text-sm">{weatherError ?? 'No weather data'}</span>
          )}
        </div>
        <button onClick={fetchWeather} disabled={weatherLoading} className="p-2.5 bg-stone-100 rounded-xl text-stone-500 disabled:opacity-40">
          <RefreshCw size={16} className={weatherLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Occasion */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Occasion</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {OCCASION_PRESETS.map(o => (
            <button
              key={o}
              onClick={() => setOccasion(prev => prev === o ? '' : o)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                occasion === o ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={occasion}
          onChange={e => setOccasion(e.target.value)}
          placeholder="Or type a custom occasion…"
          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
        />
      </div>

      <button
        onClick={handleSuggest}
        disabled={loading || !occasion.trim() || !weather}
        className="w-full bg-stone-800 text-white rounded-xl py-3.5 font-medium disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 size={18} className="animate-spin" />Getting suggestions…</>
          : <><Sparkles size={18} />Suggest an outfit</>
        }
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-stone-500">{suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''} for {occasion}</p>
          {suggestions.map((s, i) => (
            <SuggestionCard key={i} suggestion={s} itemMap={itemMap} onLog={handleLog} />
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-stone-400 text-sm text-center py-4">Add items to your wardrobe first.</p>
      )}
    </div>
  )
}
