import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { AppBar, SectionLabel, UButton, MonoTag, MONO, UI, INK, RULE, ACCENT } from '../components/ui'

const PROMPTS = [
  'What occasions do you dress for most?',
  'Which brands or designers do you reach for?',
  'Anything you actively avoid?',
  'Comfort vs polish — where do you sit?',
  'Quirks — always cold, run hot, prefer flats…',
]

export default function StyleProfileEditorPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [original, setOriginal] = useState('')
  const [saving, setSaving] = useState(false)
  const [deriving, setDeriving] = useState(false)
  const [deriveError, setDeriveError] = useState<string | null>(null)

  const isDirty = text !== original

  useEffect(() => {
    if (!user) return
    supabase.from('style_profile').select('description').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) { setText(data.description); setOriginal(data.description) }
      })
  }, [user])

  const save = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('style_profile').upsert(
      { user_id: user.id, description: text },
      { onConflict: 'user_id' }
    )
    setOriginal(text)
    setSaving(false)
    navigate('/settings')
  }

  const deriveFromOutfits = async () => {
    if (!user) return
    setDeriving(true)
    setDeriveError(null)
    try {
      const { data: outfits } = await supabase
        .from('outfits')
        .select('date_worn, occasion, rating, notes, outfit_items(item_id)')
        .eq('user_id', user.id)
        .order('date_worn', { ascending: false })
        .limit(40)

      const itemIds = [...new Set(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (outfits ?? []).flatMap((o: any) => (o.outfit_items ?? []).map((oi: any) => oi.item_id))
      )]

      let items: { id: string; name: string; category: string; color: string | null; brand: string | null }[] = []
      if (itemIds.length > 0) {
        const { data } = await supabase.from('items').select('id, name, category, color, brand').in('id', itemIds)
        items = data ?? []
      }

      const res = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outfits, items }),
      })

      if (!res.ok) throw new Error(await res.text())
      const { description } = await res.json()
      setText(description)
    } catch (err) {
      setDeriveError(err instanceof Error ? err.message : 'Failed to generate')
    } finally {
      setDeriving(false)
    }
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

      {/* Derive button */}
      <div style={{ padding: '14px 20px 0' }}>
        <button
          onClick={deriveFromOutfits}
          disabled={deriving}
          style={{
            width: '100%', border: RULE, background: deriving ? 'rgba(0,0,0,0.04)' : '#fff',
            padding: '10px 14px', cursor: deriving ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            opacity: deriving ? 0.6 : 1,
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em', color: INK }}>
              {deriving ? 'Analysing your wardrobe…' : 'Derive from my outfits'}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>
              Claude reads your outfit history and writes a profile
            </div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', marginLeft: 12 }}>
            {deriving ? '…' : 'AI ›'}
          </div>
        </button>
        {deriveError && (
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: ACCENT, marginTop: 6 }}>{deriveError}</div>
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
        </div>
      </div>

      {/* CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: '#F7F6F5', borderTop: RULE, padding: '12px 20px 28px', display: 'flex', gap: 8, zIndex: 10 }}>
        <UButton variant="ghost" style={{ flex: 1 }} onClick={() => navigate('/settings')}>Discard</UButton>
        <UButton style={{ flex: 1.4 }} icon="check" disabled={saving || !isDirty} onClick={save}>
          {saving ? 'Saving…' : 'Save profile'}
        </UButton>
      </div>
    </div>
  )
}
