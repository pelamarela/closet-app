import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { useAuth } from '../hooks/useAuth'
import { AppBar, SectionLabel, UButton, MonoTag, MONO, UI, INK, RULE, ACCENT } from '../components/ui'
import FixedBar from '../components/FixedBar'
import { COLOR_SEASONS, COLOR_SEASON_MAP } from '../lib/colorSeasons'
import type { ColorSeason } from '../types/database'

const PROMPTS = [
  'What occasions do you dress for most?',
  'Which brands or designers do you reach for?',
  'Anything you actively avoid?',
  'Comfort vs polish — where do you sit?',
  'Quirks — always cold, run hot, prefer flats…',
]

const SEASON_GROUPS = ['Spring', 'Summer', 'Autumn', 'Winter']

export default function StyleProfileEditorPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [original, setOriginal] = useState('')
  const [colorSeason, setColorSeason] = useState<ColorSeason | null>(null)
  const [originalColorSeason, setOriginalColorSeason] = useState<ColorSeason | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const { items } = useItems()
  const { outfits } = useOutfits()

  const isDirty = text !== original || colorSeason !== originalColorSeason

  useEffect(() => {
    if (!user) return
    supabase.from('style_profile').select('description, color_season').eq('user_id', user.id).single()
      .then(({ data, error }) => {
        if (error) { console.error('style_profile fetch failed:', error); return }
        if (data) {
          setText(data.description); setOriginal(data.description)
          setColorSeason(data.color_season); setOriginalColorSeason(data.color_season)
        }
      })
  }, [user])

  const generateFromOutfits = async () => {
    if (outfits.length < 5) { alert('Log at least 5 outfits first so AI has enough to work with.'); return }
    setGenerating(true); setGenerateError(null)
    try {
      const res = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outfits: outfits.map(o => ({ date: o.date_worn, occasion: o.occasion, item_ids: o.item_ids })),
          items: items.map(i => ({ id: i.id, name: i.name, category: i.category, color: i.color, brand: i.brand, subcategory: i.subcategory })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      if (data.profile) setText(data.profile)
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : 'Generation failed')
    } finally { setGenerating(false) }
  }

  const save = async () => {
    if (!user) return
    setSaving(true); setSaveError(null)
    const { error } = await supabase.from('style_profile').upsert(
      { user_id: user.id, description: text, color_season: colorSeason },
      { onConflict: 'user_id' }
    )
    setSaving(false)
    if (error) { console.error('style_profile save failed:', error); setSaveError(error.message); return }
    setOriginal(text)
    setOriginalColorSeason(colorSeason)
    navigate('/settings')
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <AppBar
        title="Settings"
        back
        onBack={() => navigate('/settings')}
        meta={isDirty ? 'unsaved' : 'saved'}
      />

      {/* Title */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ fontFamily: UI, fontSize: 24, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
          Style profile
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
          free text · fed verbatim into the suggestion prompt
        </div>
      </div>

      {/* Generate button */}
      <div style={{ padding: '14px 20px 0' }}>
        <button
          onClick={generateFromOutfits}
          disabled={generating}
          style={{
            width: '100%', border: RULE, background: generating ? 'rgba(0,0,0,0.04)' : '#fff',
            padding: '10px 14px', cursor: generating ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            opacity: generating ? 0.6 : 1,
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em', color: INK }}>
              {generating ? 'Analysing your wardrobe…' : 'Generate from my outfits'}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>
              AI reads your outfit history and writes a profile
            </div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', marginLeft: 12 }}>
            {generating ? '…' : 'AI ›'}
          </div>
        </button>
      {generateError && (
        <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 9.5, color: ACCENT }}>{generateError}</div>
      )}
      </div>

      {/* Textarea */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ border: RULE, background: '#fff', padding: 14, position: 'relative', minHeight: 220 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. I dress for quiet days at the studio and dinners with friends — monochrome bases with one warm accessory. Lean towards Lemaire, Toteme, The Row. Avoid prints, anything boxy."
            maxLength={1000}
            style={{
              width: '100%', minHeight: 192,
              fontFamily: UI, fontSize: 14, lineHeight: 1.6,
              letterSpacing: '-0.005em', color: INK,
              background: 'none', border: 'none', outline: 'none',
              resize: 'none', padding: 0,
            }}
          />
          <div style={{ position: 'absolute', bottom: 8, right: 10, fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)' }}>
            {text.length} / 1000
          </div>
        </div>
      </div>

      {/* Color season */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right="used by shop · optional in suggest">color profile</SectionLabel>
        <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.5)', marginBottom: 10 }}>
          your seasonal color analysis, if you know it — helps judge whether a color works for you
        </div>
        {SEASON_GROUPS.map(group => (
          <div key={group} style={{ marginBottom: 8 }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              {group}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {COLOR_SEASONS.filter(s => s.group === group).map(s => (
                <button
                  key={s.value}
                  onClick={() => setColorSeason(prev => prev === s.value ? null : s.value)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  <MonoTag filled={colorSeason === s.value}>{s.label}</MonoTag>
                </button>
              ))}
            </div>
          </div>
        ))}
        {colorSeason && (
          <div style={{ fontFamily: UI, fontSize: 11.5, color: 'rgba(0,0,0,0.6)', lineHeight: 1.5, marginTop: 10 }}>
            {COLOR_SEASON_MAP[colorSeason].palette}
          </div>
        )}
      </div>

      {/* Prompts */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>try answering</SectionLabel>
        <div style={{ borderTop: RULE }}>
          {PROMPTS.map((q, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '8px 0', borderBottom: RULE, fontFamily: UI, fontSize: 12, letterSpacing: '-0.005em', color: 'rgba(0,0,0,0.65)' }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, color: ACCENT, fontWeight: 600, flexShrink: 0 }}>0{i+1}</span>
              {q}
            </div>
          ))}
        </div>
      </div>

      {/* What it affects */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>this affects</SectionLabel>
        <div style={{ display: 'flex', gap: 6 }}>
          <MonoTag accent>suggest</MonoTag>
          <MonoTag accent>shop</MonoTag>
        </div>
      </div>

      {saveError && (
        <div style={{ padding: '14px 20px 0', fontFamily: MONO, fontSize: 9.5, color: ACCENT }}>
          Save failed: {saveError}
        </div>
      )}

      {/* CTA */}
      <FixedBar zIndex={10}>
        <UButton variant="ghost" style={{ flex: 1 }} onClick={() => navigate('/settings')}>Discard</UButton>
        <UButton style={{ flex: 1.4 }} icon="check" disabled={saving || !isDirty} onClick={save}>
          {saving ? 'Saving…' : 'Save profile'}
        </UButton>
      </FixedBar>
    </div>
  )
}
