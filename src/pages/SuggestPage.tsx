import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { getLocation, getCurrentWeather, type WeatherData } from '../lib/weather'
import { TopBar, AppBar, SectionLabel, MonoTag, UButton, Icon, MONO, UI, INK, RULE, ACCENT } from '../components/ui'
import { catLabel } from '../lib/categoryLabel'
import { useIdeaMutations } from '../hooks/useIdeaMutations'
import { useBreakpoint } from '../hooks/useBreakpoint'
import FixedBar from '../components/FixedBar'
import TextBlock from '../components/TextBlock'
import LogOutfitButton from '../components/LogOutfitButton'

const TIME_DEFAULTS: Record<'weekday' | 'friday' | 'weekend', string[]> = {
  weekday: ['work', 'lunch', 'errands', 'dinner', 'casual', 'gym'],
  friday:  ['dinner', 'drinks', 'work', 'casual', 'date', 'errands'],
  weekend: ['weekend', 'brunch', 'casual', 'dinner', 'walk', 'errands'],
}

type Suggestion = { item_ids: string[]; reasoning: string }

export default function SuggestPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items } = useItems()
  const { outfits } = useOutfits()
  const { isDesktop } = useBreakpoint()

  const [view, setView] = useState<'input' | 'result'>('input')
  const [occasion, setOccasion] = useState('')
  const [anchorItemId, setAnchorItemId] = useState<string | null>(null)
  const [anchorFilterCat, setAnchorFilterCat] = useState<string>('all')
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
  const [savedMsg, setSavedMsg] = useState(false)
  const [saveIdeaError, setSaveIdeaError] = useState<string | null>(null)

  const occasionPresets = useMemo(() => {
    const freq: Record<string, number> = {}
    outfits.forEach(o => {
      const k = o.occasion?.trim().toLowerCase()
      if (k) freq[k] = (freq[k] ?? 0) + 1
    })
    const fromHistory = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k]) => k)
    if (fromHistory.length >= 5) return fromHistory.slice(0, 6)
    const dow = new Date().getDay()
    const slot = dow === 0 || dow === 6 ? 'weekend' : dow === 5 ? 'friday' : 'weekday'
    const seen = new Set(fromHistory)
    const padded = [...fromHistory]
    for (const d of TIME_DEFAULTS[slot]) {
      if (!seen.has(d)) { padded.push(d); seen.add(d) }
      if (padded.length >= 6) break
    }
    return padded
  }, [outfits])

  const [feedback, setFeedback] = useState<('up' | 'down' | null)[]>([])
  const [feedbackIds, setFeedbackIds] = useState<string[]>([])
  const [previousSuggestions, setPreviousSuggestions] = useState<string[][]>([])
  const { saveIdea } = useIdeaMutations()

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
    const alreadyShown = [...previousSuggestions, ...suggestions.map(s => s.item_ids)]
    setPreviousSuggestions(alreadyShown)

    const { data: profileData } = await supabase
      .from('style_profile').select('description').eq('user_id', user!.id).single()

    const recent_outfits = outfits.slice(0, 7).map(o => ({
      date: o.date_worn, occasion: o.occasion,
      item_names: o.item_ids.map(id => items.find(i => i.id === id)?.name ?? '').filter(Boolean),
    }))

    const { data: feedbackRows } = await supabase
      .from('suggestion_feedback')
      .select('item_ids, feedback, occasion')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(30)

    const feedback_history = (feedbackRows ?? []).map(f => ({
      item_names: f.item_ids.map((id: string) => items.find(i => i.id === id)?.name).filter(Boolean) as string[],
      feedback: f.feedback as 'up' | 'down',
      occasion: f.occasion,
    })).filter(f => f.item_names.length > 0)

    try {
      const anchorItem = anchorItemId ? items.find(i => i.id === anchorItemId) : null

      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: occasion.trim(), weather,
          items: items.map(({ id, name, category, subcategory, color, warmth, formality }) =>
            ({ id, name, category, subcategory, color, warmth, formality })),
          style_profile: profileData?.description ?? '',
          recent_outfits,
          feedback_history,
          previously_shown: alreadyShown,
          anchor_item: anchorItem
            ? { id: anchorItem.id, name: anchorItem.name, category: anchorItem.category, subcategory: anchorItem.subcategory, color: anchorItem.color }
            : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Suggestion failed')
      const incoming = data.suggestions ?? []
      if (incoming.length === 0) throw new Error('No valid outfits found — try a different anchor item or occasion.')
      setSuggestions(incoming)
      setFeedback(incoming.map(() => null))
      setFeedbackIds(incoming.map(() => crypto.randomUUID()))
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
      await supabase.from('suggestion_feedback').upsert({
        id: feedbackIds[optionIndex],
        user_id: user.id,
        occasion: occasion.trim() || null,
        item_ids: suggestion.item_ids,
        feedback: next,
      })
    }
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

    const ResultHeader = (
      <div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          // suggestion {String(selectedOption + 1).padStart(2, '0')} of {String(suggestions.length).padStart(2, '0')}
        </div>
        <div style={{ fontFamily: UI, fontSize: 24, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 6, lineHeight: 1.1 }}>
          For {occasion} · {weather ? `${weather.temp_c}° ${weather.conditions}.` : '—'}
        </div>
        {anchorItemId && (() => {
          const anchor = items.find(i => i.id === anchorItemId)
          return anchor ? (
            <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.5)', marginTop: 6, letterSpacing: '0.04em' }}>
              built around: {anchor.name}
            </div>
          ) : null
        })()}
      </div>
    )

    const OptionTabs = suggestions.length > 1 ? (
      <div style={{ marginTop: 14, display: 'flex', gap: 6 }}>
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
    ) : null

    const Thumbnails = (
      <div style={{ marginTop: 14 }}>
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
              }}>{catLabel(item.category)}</div>
            </div>
          ))}
        </div>
      </div>
    )

    const FeedbackRow = (
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          rate this suggestion
        </div>
        <div style={{ flex: 1, borderTop: '1px dashed rgba(0,0,0,0.12)' }} />
        {(['up', 'down'] as const).map(dir => {
          const active = feedback[selectedOption] === dir
          return (
            <button
              key={dir}
              onClick={() => handleFeedback(selectedOption, dir)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36,
                border: `1px solid ${active ? INK : 'rgba(0,0,0,0.15)'}`,
                background: active ? INK : 'transparent',
                color: active ? '#fff' : 'rgba(0,0,0,0.45)',
                borderRadius: 2, cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon name={`thumbs-${dir}`} size={15} stroke={active ? 2 : 1.5} />
            </button>
          )
        })}
      </div>
    )

    const ReasoningBlock = (
      <div>
        <SectionLabel right="reasoning">AI</SectionLabel>
        <TextBlock>
          {currentSuggestion?.reasoning}
        </TextBlock>
      </div>
    )

    const PiecesList = (
      <div style={{ marginTop: 20 }}>
        <SectionLabel right={`${outfitItems.length} pieces`}>pieces</SectionLabel>
        <div style={{ borderTop: RULE }}>
          {(currentSuggestion?.item_ids ?? []).map((id, i) => {
            const item = itemMap.get(id)
            if (!item) return null
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 56px',
                gap: 12, alignItems: 'center',
                padding: '7px 0', borderBottom: RULE,
                fontFamily: MONO, fontSize: 10,
              }}>
                <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 500, letterSpacing: '-0.005em', color: INK }}>{item.name}</span>
                <span style={{ color: 'rgba(0,0,0,0.5)', textAlign: 'right' }}>{catLabel(item.category)}</span>
              </div>
            )
          })}
        </div>
      </div>
    )

    const ActionButtons = (
      <>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <UButton variant="ghost" style={{ flex: 1 }} icon="spark" onClick={handleSuggest} disabled={loading}>
            {loading ? '…' : 'Regen'}
          </UButton>
          <LogOutfitButton style={{ flex: 1.6 }} onClick={() => handleLog(currentSuggestion?.item_ids ?? [])}>
            Log this outfit
          </LogOutfitButton>
        </div>
        <UButton
          variant="ghost"
          full
          icon="bookmark"
          onClick={() => handleSaveIdea(currentSuggestion?.item_ids ?? [], currentSuggestion?.reasoning ?? '')}
        >
          {savedMsg ? 'Saved to ideas ✓' : saveIdeaError ? saveIdeaError : 'Save as idea'}
        </UButton>
      </>
    )

    return (
      <div style={{ paddingBottom: isDesktop ? 40 : 100 }}>
        <AppBar
          title="Brief"
          back
          onBack={() => setView('input')}
          meta={elapsed !== null ? `${elapsed}s · AI` : undefined}
        />

        {isDesktop ? (
          <div style={{ display: 'grid', gridTemplateColumns: '45% 55%', margin: '16px 20px 0', alignItems: 'start', overflow: 'hidden' }}>
            {/* Left: header + option tabs + thumbnails + feedback */}
            <div style={{ minWidth: 0, paddingRight: 28 }}>
              {ResultHeader}
              {OptionTabs}
              {Thumbnails}
              {FeedbackRow}
            </div>
            {/* Right: reasoning + pieces + actions */}
            <div style={{ minWidth: 0 }}>
              {ReasoningBlock}
              {PiecesList}
              <div style={{ marginTop: 24 }}>{ActionButtons}</div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: '16px 20px 0' }}>{ResultHeader}</div>
            {OptionTabs && <div style={{ padding: '14px 20px 0' }}>{OptionTabs}</div>}
            <div style={{ padding: '14px 20px 0' }}>{Thumbnails}</div>
            <div style={{ padding: '20px 20px 0' }}>{ReasoningBlock}</div>
            <div style={{ padding: '12px 20px 0' }}>{FeedbackRow}</div>
            <div style={{ padding: '20px 20px 0' }}>{PiecesList}</div>
            <FixedBar zIndex={10}>{ActionButtons}</FixedBar>
          </>
        )}
      </div>
    )
  }

  // ── Input view ───────────────────────────────────────────────────────────────

  const OccasionSection = (
    <div>
      <SectionLabel right="required *">occasion</SectionLabel>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {occasionPresets.map(o => (
          <button key={o} onClick={() => setOccasion(prev => prev === o ? '' : o)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <MonoTag filled={occasion === o}>{o}</MonoTag>
          </button>
        ))}
      </div>
      <input
        type="text"
        value={occasionPresets.includes(occasion) ? '' : occasion}
        onChange={e => setOccasion(e.target.value)}
        placeholder="or type custom…"
        style={{
          width: '100%', fontFamily: UI, fontSize: 14, fontWeight: 500,
          color: INK, background: 'none', border: 'none', outline: 'none',
          borderBottom: RULE, padding: '6px 0',
        }}
      />
    </div>
  )

  const AnchorSection = (
    <div>
      <SectionLabel right="optional">build around</SectionLabel>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {(['all', 'top', 'bottom', 'one-piece', 'outerwear', 'shoes', 'accessory'] as const).map(cat => (
          <button key={cat} onClick={() => setAnchorFilterCat(cat)} style={{
            fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.04em', padding: '3px 8px',
            border: `1px solid ${anchorFilterCat === cat ? INK : 'rgba(0,0,0,0.15)'}`,
            background: anchorFilterCat === cat ? INK : 'transparent',
            color: anchorFilterCat === cat ? '#fff' : INK,
            borderRadius: 2, cursor: 'pointer',
          }}>
            {cat === 'all' ? 'all' : catLabel(cat)}
          </button>
        ))}
      </div>
      <div style={isDesktop ? {} : { maxHeight: 260, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isDesktop ? 8 : 6}, minmax(0, 1fr))`, gap: 6 }}>
          {items.filter(item => anchorFilterCat === 'all' || item.category === anchorFilterCat).map(item => {
            const selected = anchorItemId === item.id
            return (
              <button
                key={item.id}
                onClick={() => setAnchorItemId(prev => prev === item.id ? null : item.id)}
                style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <div style={{
                  width: '100%', aspectRatio: '3/4', position: 'relative', overflow: 'hidden',
                  border: selected ? `2px solid ${INK}` : RULE,
                }}>
                  {item.signedImageUrl ? (
                    <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 8px, #DCD9D3 8px 16px)' }} />
                  )}
                  <div style={{
                    position: 'absolute', top: 4, left: 4,
                    fontFamily: MONO, fontSize: 7.5,
                    background: 'rgba(255,255,255,0.9)', padding: '1px 4px',
                  }}>{catLabel(item.category)}</div>
                  {selected && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.38)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    }}>
                      <Icon name="check" size={22} stroke={2.5} />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      {anchorItemId && (() => {
        const anchor = items.find(i => i.id === anchorItemId)
        return anchor ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 8, padding: '6px 10px',
            background: INK, color: '#fff',
            fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.04em',
          }}>
            <span>building around: {anchor.name}</span>
            <button
              onClick={() => setAnchorItemId(null)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0 0 0 8px', fontFamily: MONO, fontSize: 11, lineHeight: 1 }}
            >×</button>
          </div>
        ) : null
      })()}
    </div>
  )

  const WeatherSection = (
    <div>
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
  )

  const ConstraintsSection = (
    <div>
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
  )

  const ProfileSection = (
    <div>
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
  )

  const SuggestButton = (
    <>
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
    </>
  )

  return (
    <div style={{ paddingBottom: isDesktop ? 40 : 100 }}>
      <TopBar title="Suggest" meta="hybrid · code + AI" />

      {isDesktop ? (
        <div style={{
          display: 'grid', gridTemplateColumns: '55% 45%',
          margin: '0 20px',
          height: 'calc(100dvh - 56px - var(--nav-h))',
          overflow: 'hidden',
          alignItems: 'start',
        }}>
          {/* Left: anchor item picker — scrolls independently */}
          <div style={{ minWidth: 0, paddingRight: 28, paddingTop: 20, height: '100%', overflowY: 'auto' }}>
            {AnchorSection}
          </div>
          {/* Right: brief context + CTA — fully visible */}
          <div style={{ minWidth: 0, paddingTop: 20, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                // what should i wear?
              </div>
              <div style={{ fontFamily: UI, fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 8, lineHeight: 1.1 }}>
                Set the brief.
              </div>
            </div>
            {OccasionSection}
            {WeatherSection}
            {ConstraintsSection}
            {ProfileSection}
            {SuggestButton}
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: '16px 20px 0' }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              // what should i wear?
            </div>
            <div style={{ fontFamily: UI, fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 8, lineHeight: 1.1 }}>
              Set the brief.
            </div>
          </div>
          <div style={{ padding: '20px 20px 0' }}>{OccasionSection}</div>
          <div style={{ padding: '20px 20px 0' }}>{AnchorSection}</div>
          <div style={{ padding: '20px 20px 0' }}>{WeatherSection}</div>
          <div style={{ padding: '20px 20px 0' }}>{ConstraintsSection}</div>
          <div style={{ padding: '20px 20px 0' }}>{ProfileSection}</div>
          <FixedBar zIndex={10}>{SuggestButton}</FixedBar>
        </>
      )}
    </div>
  )
}
