import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { useOutfitMutations } from '../hooks/useOutfitMutations'
import { useIdeaMutations } from '../hooks/useIdeaMutations'
import { getOccasionPresets } from '../lib/occasionPresets'
import { calcStreak } from '../lib/streak'
import { T, fS, fM, V4Icon, V4Bar, Btn, Pill, ItemTile, Disp, Body, Mono, SecH } from '../design/kit'

const CATS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'top', label: 'Tops' },
  { value: 'bottom', label: 'Bottoms' },
  { value: 'one-piece', label: 'One-piece' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessory', label: 'Bags' },
  { value: 'fragrance', label: 'Fragrance' },
]

function todayStr() { return new Date().toISOString().slice(0, 10) }
function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10) }

type Step = 'pieces' | 'context' | 'saved'

export default function LogOutfitPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id: editId } = useParams<{ id?: string }>()
  const isEdit = !!editId
  const navState = location.state as { preselectedIds?: string[]; occasion?: string; date?: string } | null
  const { items, loading: itemsLoading } = useItems()
  const { outfits } = useOutfits()
  const { logOutfit, updateOutfit } = useOutfitMutations()
  const { saveIdea } = useIdeaMutations()

  const [step, setStep] = useState<Step>('pieces')
  const [date, setDate] = useState(navState?.date ?? todayStr())
  const [occasion, setOccasion] = useState(navState?.occasion ?? '')
  const [rating, setRating] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(navState?.preselectedIds ?? []))
  const [filterCat, setFilterCat] = useState('all')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loadingEdit, setLoadingEdit] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [savedAsIdea, setSavedAsIdea] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEdit || !editId) return
    async function load() {
      const { data } = await supabase.from('outfits').select('*, outfit_items(item_id)').eq('id', editId!).single()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = data as any
      if (!d) { setLoadingEdit(false); return }
      setDate(d.date_worn)
      setOccasion(d.occasion ?? '')
      setRating(d.rating ?? null)
      setNotes(d.notes ?? '')
      setSelectedIds(new Set((d.outfit_items ?? []).map((oi: { item_id: string }) => oi.item_id)))
      setLoadingEdit(false)
    }
    load()
  }, [editId, isEdit])

  const occasionPresets = useMemo(() => getOccasionPresets(outfits), [outfits])
  const lastWornById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const o of outfits) for (const id of o.item_ids) if (!map[id] || o.date_worn > map[id]) map[id] = o.date_worn
    return map
  }, [outfits])

  const toggleItem = (id: string) => setSelectedIds(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const picked = items.filter(i => selectedIds.has(i.id)).sort((a, b) => (lastWornById[b.id] ?? '').localeCompare(lastWornById[a.id] ?? ''))
  const gridItems = items
    .filter(i => filterCat === 'all' || i.category === filterCat)
    .sort((a, b) => (lastWornById[b.id] ?? '').localeCompare(lastWornById[a.id] ?? ''))

  const handleSave = async () => {
    if (selectedIds.size === 0) return
    setSaving(true); setError(null)
    try {
      if (isEdit && editId) {
        await updateOutfit(editId, { date_worn: date, occasion, rating, notes }, Array.from(selectedIds), imageFile ?? undefined)
        navigate(`/outfits/${editId}`)
      } else {
        const id = await logOutfit({ date_worn: date, occasion, rating, notes }, Array.from(selectedIds), imageFile ?? undefined)
        setSavedId(id)
        setStep('saved')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
    setSaving(false)
  }

  const handleSaveAsIdea = async () => {
    await saveIdea(occasion, notes, Array.from(selectedIds))
    setSavedAsIdea(true)
  }

  if (loadingEdit) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  }

  // ── Saved confirmation ───────────────────────────────────────────────────
  if (step === 'saved') {
    const d = new Date(date + 'T00:00:00')
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
    const streak = calcStreak([...outfits, { date_worn: date }])
    return (
      <div style={{ paddingBottom: 40 }}>
        <V4Bar right={<button onClick={() => navigate(savedId ? `/outfits/${savedId}` : '/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, display: 'flex' }}><V4Icon n="close" s={22} w={1.8} /></button>} />
        <div style={{ padding: '30px 34px 0', textAlign: 'center' }}>
          <img src="/brand/wave-rose.png" alt="" style={{ width: 110, display: 'block', margin: '0 auto 24px' }} />
          <Disp s={28}>Logged.</Disp>
          <Body s={14.5} style={{ marginTop: 10 }}>
            {dayLabel}{occasion ? ` — ${occasion}` : ''}, {selectedIds.size} piece{selectedIds.size === 1 ? '' : 's'}.
            {streak > 1 && ` That's a ${streak}-day streak.`}
          </Body>
          <div style={{ display: 'flex', gap: 9, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
            {picked.slice(0, 6).map(item => (
              <div key={item.id} style={{ width: 46, height: 58, overflow: 'hidden', background: T.g200 }}>
                {item.signedImageUrl && <img src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
            <Btn full kind="peach" icon="bookmark" disabled={savedAsIdea} onClick={handleSaveAsIdea}>{savedAsIdea ? 'Saved as idea' : 'Save it as an idea too'}</Btn>
            <Btn full kind="quiet" onClick={() => navigate('/')}>Back to today</Btn>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 1 — pieces ──────────────────────────────────────────────────────
  if (step === 'pieces') {
    return (
      <div style={{ paddingBottom: 100 }}>
        <V4Bar right={<button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 14, color: T.cocoa }}>Cancel</button>} />
        <div style={{ padding: '4px 22px 0' }}>
          <Disp s={24}>What did you wear?</Disp>
        </div>
        <div style={{ padding: '18px 22px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 600 }}>{selectedIds.size} piece{selectedIds.size === 1 ? '' : 's'} on</div>
            {selectedIds.size > 0 && <button onClick={() => setSelectedIds(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 13, color: T.cocoa }}>Clear</button>}
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {picked.map(item => (
              <div key={item.id} style={{ position: 'relative', width: 60, height: 74, flexShrink: 0, overflow: 'hidden', background: T.g200 }}>
                {item.signedImageUrl && <img src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                <button onClick={() => toggleItem(item.id)} style={{ position: 'absolute', top: -5, right: -5, width: 21, height: 21, background: T.paper, boxShadow: `0 0 0 1px ${T.g200}`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <V4Icon n="close" s={11} w={2.4} />
                </button>
              </div>
            ))}
            <div style={{ width: 60, height: 74, flexShrink: 0, border: `1.5px dashed ${T.g200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.g400 }}><V4Icon n="plus" s={18} w={1.7} /></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '20px 22px 0', overflowX: 'auto' }}>
          {CATS.map(c => <Pill key={c.value} on={filterCat === c.value} s="sm" onClick={() => setFilterCat(c.value)}>{c.label}</Pill>)}
        </div>
        <div style={{ padding: '16px 22px 0' }}>
          {itemsLoading ? (
            <Body s={13}>loading…</Body>
          ) : gridItems.length === 0 ? (
            <Body s={13}>No items here.</Body>
          ) : (
            <>
              <Mono s={11} style={{ display: 'block', marginBottom: 10 }}>worn most recently first</Mono>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {gridItems.map(item => (
                  <ItemTile key={item.id} src={item.signedImageUrl} alt={item.name} sel={selectedIds.has(item.id)} onClick={() => toggleItem(item.id)} />
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ position: 'fixed', bottom: 'var(--nav-h)', left: 0, right: 0, padding: '14px 22px 20px', background: 'rgba(247,246,245,.96)', backdropFilter: 'blur(10px)', borderTop: `1px solid ${T.line}` }}>
          <Btn full icon="next" disabled={selectedIds.size === 0} onClick={() => setStep('context')}>Add the details</Btn>
        </div>
      </div>
    )
  }

  // ── Step 2 — context ─────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: 100 }}>
      <V4Bar back onBack={() => setStep('pieces')} />
      <div style={{ padding: '4px 22px 0' }}>
        <Disp s={24}>{isEdit ? 'Update this outfit' : <>Anything to<br />remember about it?</>}</Disp>
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto' }}>
          {picked.slice(0, 6).map(item => (
            <div key={item.id} style={{ width: 46, height: 58, flexShrink: 0, overflow: 'hidden', background: T.g200 }}>
              {item.signedImageUrl && <img src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
            </div>
          ))}
          <button onClick={() => setStep('pieces')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 13, color: T.cocoa, marginLeft: 4, flexShrink: 0 }}>Edit</button>
        </div>
      </div>
      <div style={{ padding: '24px 22px 0' }}>
        <SecH>When</SecH>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Pill on={date === todayStr()} onClick={() => setDate(todayStr())}>Today</Pill>
          <Pill on={date === yesterdayStr()} onClick={() => setDate(yesterdayStr())}>Yesterday</Pill>
          <label style={{ position: 'relative' }}>
            <Pill on={date !== todayStr() && date !== yesterdayStr()}>
              {date !== todayStr() && date !== yesterdayStr() ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Pick a date'}
            </Pill>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
          </label>
        </div>
      </div>
      <div style={{ padding: '22px 22px 0' }}>
        <SecH right="Optional">What for</SecH>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {occasionPresets.map(o => <Pill key={o} on={occasion === o} tone="peach" onClick={() => setOccasion(prev => prev === o ? '' : o)}>{o}</Pill>)}
        </div>
        <input
          type="text" value={occasionPresets.includes(occasion) ? '' : occasion} onChange={e => setOccasion(e.target.value)}
          placeholder="or type your own…"
          style={{ width: '100%', fontFamily: fS, fontSize: 14, color: T.ink, background: 'none', border: 'none', outline: 'none', borderBottom: `1px solid ${T.line}`, padding: '10px 0 6px', marginTop: 10 }}
        />
      </div>
      <div style={{ padding: '22px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: fS, fontSize: 14.5, fontWeight: 500 }}>How did it feel</span>
        <div style={{ display: 'flex', gap: 5 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setRating(prev => prev === n ? null : n)}
              aria-label={`Rate ${n}`}
              style={{ width: 18, height: 18, padding: 6, margin: -6, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span style={{ width: 7, height: 7, borderRadius: 2, background: rating != null && n <= rating ? T.cocoa : T.g200, display: 'block' }} />
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '22px 22px 0' }}>
        <SecH right="Optional">A note</SecH>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)} placeholder="Too warm for the waistcoat by noon…" rows={3}
          style={{ width: '100%', boxSizing: 'border-box', minHeight: 62, background: T.white, boxShadow: `inset 0 0 0 1px ${T.line}`, padding: 15, fontFamily: fS, fontSize: 14, color: T.ink, border: 'none', outline: 'none', resize: 'none' }}
        />
      </div>
      <div style={{ padding: '20px 22px 0' }}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
        <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', border: `1.5px dashed ${T.g200}`, background: 'none', cursor: 'pointer', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: fS, fontSize: 13, color: T.g500 }}>
          <V4Icon n="cam" s={17} w={1.5} />{imageFile ? imageFile.name : 'Add a photo of the full look (optional)'}
        </button>
      </div>
      <div style={{ position: 'fixed', bottom: 'var(--nav-h)', left: 0, right: 0, padding: '14px 22px 20px', background: T.paper, borderTop: `1px solid ${T.line}` }}>
        {error && <Body s={12.5} c={T.roseDeep} style={{ marginBottom: 8 }}>{error}</Body>}
        <Btn full icon="check" disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : `Save to ${new Date(date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}`}
        </Btn>
      </div>
    </div>
  )
}
