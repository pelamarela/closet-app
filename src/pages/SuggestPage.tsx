import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { apiFetch } from '../lib/apiFetch'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { getLocation, getCurrentWeather, type WeatherData } from '../lib/weather'
import { getOccasionPresets } from '../lib/occasionPresets'
import { useIdeaMutations } from '../hooks/useIdeaMutations'
import { T, fS, V4Icon, V4Bar, Btn, RoundBtn, Pill, ItemTile, Disp, Body, Mono, SecH, V4Card, Dots, dotted } from '../design/kit'
import Collage from '../design/Collage'

type Suggestion = { item_ids: string[]; reasoning: string }
type View = 'brief' | 'loading' | 'result' | 'error'

const ANCHOR_CATS = [
  { value: 'all', label: 'All' }, { value: 'top', label: 'Tops' }, { value: 'bottom', label: 'Bottoms' },
  { value: 'one-piece', label: 'One-piece' }, { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' }, { value: 'accessory', label: 'Bags' },
]

const LOADING_STEPS = ['Checking the weather', 'Reading your style profile', 'Choosing from your closet']

export default function SuggestPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { items } = useItems()
  const { outfits } = useOutfits()
  const navState = location.state as { occasion?: string } | null

  const [view, setView] = useState<View>('brief')
  const [occasion, setOccasion] = useState(navState?.occasion ?? '')
  const [chosenFormality, setChosenFormality] = useState<number | null>(null)
  const [showFormality, setShowFormality] = useState(false)
  const [anchorItemId, setAnchorItemId] = useState<string | null>(null)
  const [anchorFilterCat, setAnchorFilterCat] = useState('all')
  const [showAnchorPicker, setShowAnchorPicker] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loadingStep, setLoadingStep] = useState(0)

  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedOption, setSelectedOption] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState(false)
  const [saveIdeaError, setSaveIdeaError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<('up' | 'down' | null)[]>([])
  const [feedbackIds, setFeedbackIds] = useState<string[]>([])
  const [previousSuggestions, setPreviousSuggestions] = useState<string[][]>([])

  const { saveIdea } = useIdeaMutations()
  const occasionPresets = useMemo(() => getOccasionPresets(outfits), [outfits])

  useEffect(() => {
    getLocation().then(({ lat, lon }) => getCurrentWeather(lat, lon)).then(setWeather).catch(() => {})
  }, [])

  const handleSuggest = async () => {
    if (!occasion.trim() && chosenFormality == null) { setError('Choose an occasion or a formality level.'); return }
    if (!weather) { setError('Weather data needed — try again in a moment.'); return }
    setView('loading'); setLoadingStep(0); setError(null)
    const stepTimers = [setTimeout(() => setLoadingStep(1), 900), setTimeout(() => setLoadingStep(2), 1900)]

    const alreadyShown = [...previousSuggestions, ...suggestions.map(s => s.item_ids)]
    setPreviousSuggestions(alreadyShown)

    const { data: profileData } = await supabase.from('style_profile').select('description').eq('user_id', user!.id).single()

    const recent_outfits = outfits.slice(0, 7).map(o => ({
      date: o.date_worn, occasion: o.occasion,
      item_names: o.item_ids.map(id => items.find(i => i.id === id)?.name ?? '').filter(Boolean),
    }))
    const occasionKey = occasion.trim().toLowerCase()
    const occasion_history = occasionKey
      ? outfits.filter(o => o.occasion?.trim().toLowerCase() === occasionKey).map(o => ({
          date: o.date_worn, item_names: o.item_ids.map(id => items.find(i => i.id === id)?.name ?? '').filter(Boolean),
        }))
      : []
    const { data: feedbackRows } = await supabase
      .from('suggestion_feedback').select('item_ids, feedback, occasion').eq('user_id', user!.id)
      .order('created_at', { ascending: false }).limit(30)
    const feedback_history = (feedbackRows ?? []).map(f => ({
      item_names: f.item_ids.map((id: string) => items.find(i => i.id === id)?.name).filter(Boolean) as string[],
      feedback: f.feedback as 'up' | 'down', occasion: f.occasion,
    })).filter(f => f.item_names.length > 0)

    try {
      const anchorItem = anchorItemId ? items.find(i => i.id === anchorItemId) : null
      const res = await apiFetch('/api/suggest', {
        occasion: occasion.trim(), weather,
        items: items.filter(i => i.category !== 'fragrance').map(({ id, name, category, subcategory, color, warmth, formality, sport }) =>
          ({ id, name, category, subcategory, color, warmth, formality, sport })),
        style_profile: profileData?.description ?? '',
        constants: [],
        recent_outfits, feedback_history, formality: chosenFormality, occasion_history,
        previously_shown: alreadyShown,
        anchor_item: anchorItem ? { id: anchorItem.id, name: anchorItem.name, category: anchorItem.category, subcategory: anchorItem.subcategory, color: anchorItem.color } : undefined,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Suggestion failed')
      const incoming = data.suggestions ?? []
      if (incoming.length === 0) throw new Error('No valid outfits found — try a different anchor item or occasion.')
      setSuggestions(incoming)
      setSelectedOption(0)
      setFeedback(incoming.map(() => null))
      setFeedbackIds(incoming.map(() => crypto.randomUUID()))
      setView('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setView('error')
    }
    stepTimers.forEach(clearTimeout)
  }

  const handleLog = (itemIds: string[]) => navigate('/outfits/new', { state: { preselectedIds: itemIds, occasion } })

  const handleSaveIdea = async (itemIds: string[], reasoning: string) => {
    setSaveIdeaError(null)
    try {
      await saveIdea(occasion, reasoning, itemIds)
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2000)
    } catch (e) {
      setSaveIdeaError(e instanceof Error ? e.message : 'Failed to save idea')
      setTimeout(() => setSaveIdeaError(null), 4000)
    }
  }

  const handleFeedback = async (optionIndex: number, value: 'up' | 'down') => {
    const next = value === feedback[optionIndex] ? null : value
    setFeedback(prev => prev.map((f, i) => i === optionIndex ? next : f))
    if (!user) return
    const suggestion = suggestions[optionIndex]
    if (!suggestion) return
    if (next === null) {
      await supabase.from('suggestion_feedback').delete().eq('id', feedbackIds[optionIndex])
    } else {
      await supabase.from('suggestion_feedback').upsert({ id: feedbackIds[optionIndex], user_id: user.id, occasion: occasion.trim() || null, item_ids: suggestion.item_ids, feedback: next })
    }
  }

  const collageItems = (itemIds: string[]) => itemIds
    .map(id => items.find(i => i.id === id))
    .filter((i): i is NonNullable<typeof i> => !!i)
    .map(i => ({ id: i.id, name: i.name, category: i.category, signedImageUrl: i.signedImageUrl }))

  const anchorItem = anchorItemId ? items.find(i => i.id === anchorItemId) : null

  // ── Loading ───────────────────────────────────────────────────────────────
  if (view === 'loading') {
    return (
      <div style={{ ...dotted, minHeight: '70vh' }}>
        <V4Bar right={<button onClick={() => setView('brief')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, display: 'flex' }}><V4Icon n="close" s={22} w={1.8} /></button>} />
        <div style={{ padding: '40px 40px 0' }}>
          <img src="/brand/wave.png" alt="" style={{ width: 100, display: 'block', marginBottom: 24 }} />
          <Disp s={26}>Having a look through your closet.</Disp>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 15 }}>
            {LOADING_STEPS.map((label, i) => {
              const done = i < loadingStep
              const active = i === loadingStep
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: done || active ? 1 : .4 }}>
                  <div style={{ width: 20, height: 20, background: done ? T.ink : 'transparent', border: done ? 'none' : `1.5px solid ${T.g200}`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {done && <V4Icon n="check" s={11} w={2.8} />}
                  </div>
                  <Body s={14} c={done ? T.ink : T.g500}>{label}</Body>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (view === 'error') {
    return (
      <div style={{ ...dotted, minHeight: '70vh' }}>
        <V4Bar right={<button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, display: 'flex' }}><V4Icon n="close" s={22} w={1.8} /></button>} />
        <div style={{ padding: '40px 40px 0' }}>
          <div style={{ width: 50, height: 50, background: T.peachSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}><V4Icon n="close" s={22} w={1.8} c={T.cocoa} /></div>
          <Disp s={26}>Couldn't put those looks together.</Disp>
          <Body s={14} style={{ marginTop: 10, maxWidth: 300 }}>{error ?? "Something went wrong — your answers are still here, nothing's lost."}</Body>
          <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Btn full icon="spark" onClick={handleSuggest}>Try again</Btn>
            <Btn full kind="quiet" onClick={() => setView('brief')}>Back to brief</Btn>
          </div>
        </div>
      </div>
    )
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (view === 'result' && suggestions.length > 0) {
    const current = suggestions[selectedOption]
    const currentItems = current.item_ids.map(id => items.find(i => i.id === id)).filter((i): i is NonNullable<typeof i> => !!i)

    return (
      <div style={{ paddingBottom: 40 }}>
        <V4Bar back title="Brief" onBack={() => setView('brief')} right={<Mono s={11.5}>{selectedOption + 1} / {suggestions.length}</Mono>} />
        <div style={{ padding: '8px 22px 0', position: 'relative' }}>
          <div style={{ width: '100%', aspectRatio: '4/3' }}><Collage items={collageItems(current.item_ids)} fill /></div>
          {occasion && <div style={{ position: 'absolute', top: 22, left: 30, height: 29, display: 'inline-flex', alignItems: 'center', padding: '0 12px', background: 'rgba(247,246,245,.94)', fontFamily: fS, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{occasion}</div>}
        </div>
        {suggestions.length > 1 && (
          <div style={{ padding: '16px 22px 0', display: 'flex', justifyContent: 'center' }}><Dots n={suggestions.length} i={selectedOption} /></div>
        )}
        {suggestions.length > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: '14px 22px 0' }}>
            {suggestions.map((_, i) => <Pill key={i} on={i === selectedOption} s="sm" onClick={() => setSelectedOption(i)}>Look {i + 1}</Pill>)}
          </div>
        )}
        <div style={{ padding: '16px 22px 0' }}>
          <Disp s={22}>{occasion ? `${occasion.charAt(0).toUpperCase()}${occasion.slice(1)}${weather ? `, ${weather.temp_c}°` : ''}.` : weather ? `${weather.temp_c}° and ${weather.conditions}.` : 'Your look.'}</Disp>
          {anchorItem && <Mono s={10} style={{ display: 'block', marginTop: 6 }}>built around: {anchorItem.name}</Mono>}
        </div>
        <div style={{ padding: '16px 22px 0' }}>
          {currentItems.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < currentItems.length - 1 ? `1px solid ${T.line}` : 'none' }}>
              <div style={{ width: 34, height: 42, flexShrink: 0, overflow: 'hidden', background: T.g200 }}>
                {item.signedImageUrl && <img src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </div>
              <div style={{ flex: 1, fontFamily: fS, fontSize: 14 }}>{item.name}</div>
              <Mono s={10.5}>{item.category}</Mono>
            </div>
          ))}
        </div>
        <div style={{ padding: '18px 22px 0' }}>
          <V4Card fill={T.peachSoft} shadow={false} pad={16}><Body s={14} c={T.g700}>{current.reasoning}</Body></V4Card>
        </div>
        <div style={{ padding: '16px 22px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Mono s={10}>rate this suggestion</Mono>
          <div style={{ flex: 1, borderTop: `1px dashed ${T.g200}` }} />
          <button onClick={() => handleFeedback(selectedOption, 'up')} style={{ width: 34, height: 34, background: feedback[selectedOption] === 'up' ? T.ink : 'transparent', border: `1px solid ${feedback[selectedOption] === 'up' ? T.ink : T.g200}`, color: feedback[selectedOption] === 'up' ? '#fff' : T.g400, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><V4Icon n="thumbs-up" s={15} w={1.7} /></button>
          <button onClick={() => handleFeedback(selectedOption, 'down')} style={{ width: 34, height: 34, background: feedback[selectedOption] === 'down' ? T.ink : 'transparent', border: `1px solid ${feedback[selectedOption] === 'down' ? T.ink : T.g200}`, color: feedback[selectedOption] === 'down' ? '#fff' : T.g400, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><V4Icon n="thumbs-down" s={15} w={1.7} /></button>
        </div>
        <div style={{ padding: '20px 22px 0', display: 'flex', gap: 10, alignItems: 'center' }}>
          <RoundBtn icon="bookmark" tone="peach" onClick={() => handleSaveIdea(current.item_ids, current.reasoning)} />
          <Btn flex={1} icon="check" onClick={() => handleLog(current.item_ids)}>Wear this today</Btn>
        </div>
        {(savedMsg || saveIdeaError) && <Body s={12} c={saveIdeaError ? T.roseDeep : T.cocoa} style={{ padding: '10px 22px 0', textAlign: 'center' }}>{saveIdeaError ?? 'Saved to ideas ✓'}</Body>}
        <div style={{ padding: '16px 22px 0', textAlign: 'center' }}>
          <button onClick={handleSuggest} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 13.5, color: T.cocoa, textDecoration: 'underline' }}>Try three different ones</button>
        </div>
      </div>
    )
  }

  // ── Brief ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: 100 }}>
      <V4Bar right={<button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, display: 'flex' }}><V4Icon n="close" s={22} w={1.8} /></button>} />
      <div style={{ padding: '4px 22px 0' }}>
        <Disp s={25}>Where are you<br />off to?</Disp>
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <V4Card fill={T.peach} shadow={false} pad={14} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <V4Icon n="sun" s={18} w={1.7} c={T.cocoa} />
          <Body s={13.5} c={T.cocoa}>{weather ? `${weather.temp_c}° and ${weather.conditions} — I'll factor that in.` : 'Checking the weather…'}</Body>
        </V4Card>
      </div>
      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {occasionPresets.map(o => <Pill key={o} on={occasion === o} s="lg" onClick={() => setOccasion(prev => prev === o ? '' : o)}>{o}</Pill>)}
        </div>
        <input
          type="text" value={occasionPresets.includes(occasion) ? '' : occasion} onChange={e => setOccasion(e.target.value)}
          placeholder="or type your own…"
          style={{ width: '100%', fontFamily: fS, fontSize: 14, color: T.ink, background: 'none', border: 'none', outline: 'none', borderBottom: `1px solid ${T.line}`, padding: '10px 0 6px', marginTop: 10 }}
        />
      </div>
      <div style={{ padding: '20px 22px 0' }}>
        <button onClick={() => setShowFormality(v => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: fS, fontSize: 13, color: T.cocoa }}>
          {chosenFormality != null ? `Formality: ${chosenFormality}/5` : 'Set a formality level instead'}<V4Icon n="caret" s={13} w={2} style={showFormality ? { transform: 'rotate(180deg)' } : undefined} />
        </button>
        {showFormality && (
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <Pill key={n} s="sm" on={chosenFormality != null && n <= chosenFormality} onClick={() => setChosenFormality(prev => prev === n ? null : n)}>{n}</Pill>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: '24px 22px 0' }}>
        <SecH right={showAnchorPicker ? 'Hide' : 'Optional'} onRightClick={() => setShowAnchorPicker(v => !v)}>Start from a piece</SecH>
        {anchorItem ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: T.ink, color: '#fff' }}>
            <div style={{ width: 40, height: 50, flexShrink: 0, overflow: 'hidden' }}>{anchorItem.signedImageUrl && <img src={anchorItem.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}</div>
            <Mono s={11} style={{ flex: 1 }}>{anchorItem.name}</Mono>
            <button onClick={() => setAnchorItemId(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}><V4Icon n="close" s={16} w={2} /></button>
          </div>
        ) : showAnchorPicker ? (
          <>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10 }}>
              {ANCHOR_CATS.map(c => <Pill key={c.value} s="sm" on={anchorFilterCat === c.value} onClick={() => setAnchorFilterCat(c.value)}>{c.label}</Pill>)}
            </div>
            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {items.filter(i => i.category !== 'fragrance' && (anchorFilterCat === 'all' || i.category === anchorFilterCat)).map(item => (
                  <ItemTile key={item.id} src={item.signedImageUrl} alt={item.name} sel={anchorItemId === item.id} onClick={() => setAnchorItemId(item.id)} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <button onClick={() => setShowAnchorPicker(true)} style={{ width: 60, height: 74, border: `1.5px dashed ${T.g200}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.g400 }}><V4Icon n="plus" s={18} w={1.7} /></button>
        )}
      </div>
      <div style={{ position: 'fixed', bottom: 'var(--nav-h)', left: 0, right: 0, padding: '14px 22px 20px', background: 'rgba(247,246,245,.96)', backdropFilter: 'blur(10px)', borderTop: `1px solid ${T.line}` }}>
        {error && <Body s={12.5} c={T.roseDeep} style={{ marginBottom: 8 }}>{error}</Body>}
        <Body s={12} c={T.g500} style={{ marginBottom: 10 }}>Using how you actually dress, and the weather.</Body>
        <Btn full icon="spark" disabled={(!occasion.trim() && chosenFormality == null) || !weather || items.length === 0} onClick={handleSuggest}>Put together three looks</Btn>
      </div>
    </div>
  )
}
