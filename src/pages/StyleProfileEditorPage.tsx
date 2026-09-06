import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { apiFetch } from '../lib/apiFetch'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { useAuth } from '../hooks/useAuth'
import { COLOR_SEASONS } from '../lib/colorSeasons'
import type { ColorSeason } from '../types/database'
import { T, fS, dotted, V4Bar, V4Icon, Btn, Pill, Disp, Body, Mono, SecH, V4Card , CONTENT_MAX_W } from '../design/kit'

const GENERATE_STEPS = ['Going through your outfits', 'Spotting your patterns', 'Writing it up']

export default function StyleProfileEditorPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items } = useItems()
  const { outfits } = useOutfits()
  const [text, setText] = useState('')
  const [original, setOriginal] = useState('')
  const [colorSeason, setColorSeason] = useState<ColorSeason | null>(null)
  const [originalColorSeason, setOriginalColorSeason] = useState<ColorSeason | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generateStep, setGenerateStep] = useState(0)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const isDirty = text !== original || colorSeason !== originalColorSeason

  useEffect(() => {
    if (!user) return
    supabase.from('style_profile').select('description, color_season').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setText(data.description); setOriginal(data.description)
          setColorSeason(data.color_season); setOriginalColorSeason(data.color_season)
        }
      })
  }, [user])

  const generateFromOutfits = async () => {
    if (outfits.length < 5) { setGenerateError('Log at least 5 outfits first so I have enough to work with.'); return }
    setGenerating(true); setGenerateStep(0); setGenerateError(null)
    const stepTimers = [setTimeout(() => setGenerateStep(1), 900), setTimeout(() => setGenerateStep(2), 1900)]
    try {
      const res = await apiFetch('/api/generate-profile', {
        outfits: outfits.map(o => ({ date: o.date_worn, occasion: o.occasion, item_ids: o.item_ids })),
        items: items.map(i => ({ id: i.id, name: i.name, category: i.category, color: i.color, brand: i.brand, subcategory: i.subcategory })),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      if (data.profile) setText(data.profile)
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : 'Generation failed')
    } finally { stepTimers.forEach(clearTimeout); setGenerating(false) }
  }

  if (generating) {
    return (
      <div style={{ ...dotted, minHeight: '100svh' }}>
        <V4Bar />
        <div style={{ padding: '40px 40px 0' }}>
          <img src="/brand/wave.png" alt="" style={{ width: 100, display: 'block', marginBottom: 24 }} />
          <Disp s={26}>Reading your outfits.</Disp>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 15 }}>
            {GENERATE_STEPS.map((label, i) => {
              const done = i < generateStep
              const active = i === generateStep
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

  const save = async () => {
    if (!user) return
    setSaving(true); setSaveError(null)
    const { error } = await supabase.from('style_profile').upsert({ user_id: user.id, description: text, color_season: colorSeason }, { onConflict: 'user_id' })
    setSaving(false)
    if (error) { setSaveError(error.message); return }
    setOriginal(text); setOriginalColorSeason(colorSeason)
    navigate('/settings')
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <V4Bar back title="Me" onBack={() => navigate('/settings')} right={<Mono s={11} c={isDirty ? T.roseDeep : T.g400}>{isDirty ? 'unsaved' : 'saved'}</Mono>} />
      <div style={{ padding: '8px 22px 0' }}>
        <Disp s={27}>How I dress</Disp>
        <Body s={13.5} style={{ marginTop: 6 }}>Written in your words and read verbatim before every suggestion.</Body>
      </div>
      <div style={{ padding: '20px 22px 0' }}>
        <V4Card pad={17} style={{ minHeight: 220, position: 'relative' }}>
          <textarea
            value={text} onChange={e => setText(e.target.value)} maxLength={1000}
            placeholder="e.g. I dress for quiet days at the studio and dinners with friends — monochrome bases with one warm accessory. Lean towards Lemaire, Toteme, The Row. Avoid prints, anything boxy."
            style={{ width: '100%', minHeight: 190, fontFamily: fS, fontSize: 14.5, lineHeight: 1.6, color: T.ink, background: 'none', border: 'none', outline: 'none', resize: 'none' }}
          />
          <div style={{ position: 'absolute', bottom: 12, right: 15 }}><Mono s={10}>{text.length} / 1000</Mono></div>
        </V4Card>
      </div>
      <div style={{ padding: '22px 22px 0' }}>
        <SecH right="Used when shopping">Colour season</SecH>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLOR_SEASONS.map(s => <Pill key={s.value} on={colorSeason === s.value} tone="peach" onClick={() => setColorSeason(prev => prev === s.value ? null : s.value)}>{s.label}</Pill>)}
        </div>
        {colorSeason && <Body s={12.5} style={{ marginTop: 10 }}>{COLOR_SEASONS.find(s => s.value === colorSeason)?.palette}</Body>}
      </div>
      <div style={{ padding: '24px 22px 0' }}>
        <V4Card fill={T.peachSoft} shadow={false} pad={17}>
          <Disp s={17}>Or let me write it.</Disp>
          <Body s={13.5} c={T.cocoa} style={{ marginTop: 6 }}>I'll read your {outfits.length} logged outfits and draft this for you to edit.</Body>
          {generateError && <Body s={12} c={T.roseDeep} style={{ marginTop: 8 }}>{generateError}</Body>}
          <div style={{ marginTop: 15 }}><Btn kind="white" icon="spark" style={{ height: 46, fontSize: 14 }} onClick={generateFromOutfits}>Draft from my history</Btn></div>
        </V4Card>
      </div>
      <div style={{ position: 'fixed', bottom: 'var(--v3-sticky-bottom)', left: 'var(--v3-sidenav-w)', right: 0, padding: '16px 22px 28px', background: T.paper, borderTop: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: CONTENT_MAX_W, margin: '0 auto', display: 'flex', gap: 10, position: 'relative' }}>
          {saveError && <Body s={12} c={T.roseDeep} style={{ position: 'absolute', top: -26, left: 0 }}>{saveError}</Body>}
          <Btn kind="quiet" flex={1} onClick={() => navigate('/settings')}>Discard</Btn>
          <Btn flex={1.5} icon="check" disabled={saving || !isDirty} onClick={save}>{saving ? 'Saving…' : 'Save'}</Btn>
        </div>
      </div>
    </div>
  )
}
