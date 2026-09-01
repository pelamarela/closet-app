import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { useOutfitMutations } from '../hooks/useOutfitMutations'
import { getOccasionPresets } from '../lib/occasionPresets'
import { calcStreak } from '../lib/streak'
import { catLabel } from '../lib/categoryLabel'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { T, fS, fM, V4Icon, V4Bar, Btn, Pill, ItemTile, Disp, Body, SecH, CONTENT_MAX_W } from '../design/kit'

// Fragrance isn't a "piece worn on the body" — it gets its own always-visible
// strip below the grid instead of a filter chip in with clothing/accessories.
const CATS: { value: string; label: string }[] = [
  { value: 'all', label: 'all' },
  { value: 'top', label: catLabel('top') },
  { value: 'bottom', label: catLabel('bottom') },
  { value: 'one-piece', label: catLabel('one-piece') },
  { value: 'outerwear', label: catLabel('outerwear') },
  { value: 'shoes', label: catLabel('shoes') },
  { value: 'accessory', label: catLabel('accessory') },
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
  const { isDesktop } = useBreakpoint()

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
  const toggleItem = (id: string) => setSelectedIds(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const picked = items.filter(i => selectedIds.has(i.id)).sort((a, b) => b.created_at.localeCompare(a.created_at))
  const pickedWorn = picked.filter(i => i.category !== 'fragrance')
  const pickedFragrance = picked.filter(i => i.category === 'fragrance')
  const clothingItems = items.filter(i => i.category !== 'fragrance')
  const fragranceItems = items.filter(i => i.category === 'fragrance').sort((a, b) => b.created_at.localeCompare(a.created_at))
  const gridItems = clothingItems
    .filter(i => filterCat === 'all' || i.category === filterCat)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

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
          <div style={{ marginTop: 28 }}>
            <Btn full onClick={() => navigate('/')}>Back to today</Btn>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 1 — pieces ──────────────────────────────────────────────────────
  if (step === 'pieces') {
    const Grid = itemsLoading ? (
      <Body s={13}>loading…</Body>
    ) : gridItems.length === 0 ? (
      <Body s={13}>No items here.</Body>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 8 }}>
        {gridItems.map(item => (
          <ItemTile key={item.id} src={item.signedImageUrl} alt={item.name} sel={selectedIds.has(item.id)} onClick={() => toggleItem(item.id)} />
        ))}
      </div>
    )

    // Fragrance isn't filterable with the clothing grid above — it's a small,
    // always-visible strip of its own so it never gets lost behind a category chip.
    const FragranceStrip = fragranceItems.length > 0 ? (
      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g500, marginBottom: 8 }}>Fragrance</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {fragranceItems.map(item => (
            <div key={item.id} style={{ width: 68 }}>
              <ItemTile src={item.signedImageUrl} alt={item.name} sel={selectedIds.has(item.id)} onClick={() => toggleItem(item.id)} />
            </div>
          ))}
        </div>
      </div>
    ) : null

    if (isDesktop) {
      return (
        <div style={{ paddingBottom: 40 }}>
          <V4Bar
            title="Log outfit"
            right={<button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, display: 'flex' }}><V4Icon n="close" s={22} w={1.8} /></button>}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 44, alignItems: 'start', padding: '10px 22px 0' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto' }}>
                {CATS.map(c => <Pill key={c.value} on={filterCat === c.value} s="sm" onClick={() => setFilterCat(c.value)}>{c.label}</Pill>)}
              </div>
              {Grid}
              {FragranceStrip}
            </div>
            <div style={{ position: 'sticky', top: 'calc(var(--v3-header-h) + 20px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontFamily: fS, fontSize: 14.5, fontWeight: 600 }}>{pickedWorn.length} piece{pickedWorn.length === 1 ? '' : 's'} on</div>
                {selectedIds.size > 0 && <button onClick={() => setSelectedIds(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 13, color: T.cocoa }}>Clear</button>}
              </div>
              {picked.length === 0 ? (
                <Body s={13}>Tap pieces to add them here.</Body>
              ) : (
                <>
                  {pickedWorn.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {pickedWorn.map(item => (
                        <div key={item.id} style={{ position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden', background: T.g200 }}>
                          {item.signedImageUrl && <img src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                          <button onClick={() => toggleItem(item.id)} style={{ position: 'absolute', top: 5, right: 5, width: 21, height: 21, background: T.paper, boxShadow: `0 0 0 1px ${T.g200}`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <V4Icon n="close" s={11} w={2.4} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {pickedFragrance.length > 0 && (
                    <div style={{ marginTop: pickedWorn.length > 0 ? 16 : 0 }}>
                      <div style={{ fontFamily: fS, fontSize: 12, color: T.g400, marginBottom: 8 }}>+ fragrance</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {pickedFragrance.map(item => (
                          <div key={item.id} style={{ position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden', background: T.g200 }}>
                            {item.signedImageUrl && <img src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                            <button onClick={() => toggleItem(item.id)} style={{ position: 'absolute', top: 5, right: 5, width: 21, height: 21, background: T.paper, boxShadow: `0 0 0 1px ${T.g200}`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <V4Icon n="close" s={11} w={2.4} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div style={{ marginTop: 22 }}>
                <Btn full icon="next" disabled={selectedIds.size === 0} onClick={() => setStep('context')}>Add the details</Btn>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div style={{ paddingBottom: 100 }}>
        <V4Bar
          title="Log outfit"
          right={<button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, display: 'flex' }}><V4Icon n="close" s={22} w={1.8} /></button>}
        />
        <div style={{ position: 'sticky', top: 'calc(var(--v3-header-h) + 44px)', zIndex: 24, background: T.paper, paddingBottom: 12, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ padding: '14px 22px 0' }}>
            {selectedIds.size > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <button onClick={() => setSelectedIds(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 13, color: T.cocoa }}>Clear</button>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
              {pickedWorn.map(item => (
                <div key={item.id} style={{ position: 'relative', width: 60, height: 74, flexShrink: 0, overflow: 'hidden', background: T.g200 }}>
                  {item.signedImageUrl && <img src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                  <button onClick={() => toggleItem(item.id)} style={{ position: 'absolute', top: -5, right: -5, width: 21, height: 21, background: T.paper, boxShadow: `0 0 0 1px ${T.g200}`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <V4Icon n="close" s={11} w={2.4} />
                  </button>
                </div>
              ))}
              <div style={{ width: 60, height: 74, flexShrink: 0, border: `1.5px dashed ${T.g200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.g400 }}><V4Icon n="plus" s={18} w={1.7} /></div>
              {pickedFragrance.length > 0 && (
                <>
                  <div style={{ width: 1, flexShrink: 0, background: T.line, margin: '4px 2px' }} />
                  {pickedFragrance.map(item => (
                    <div key={item.id} style={{ position: 'relative', width: 60, height: 74, flexShrink: 0, overflow: 'hidden', background: T.g200 }}>
                      {item.signedImageUrl && <img src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                      <button onClick={() => toggleItem(item.id)} style={{ position: 'absolute', top: -5, right: -5, width: 21, height: 21, background: T.paper, boxShadow: `0 0 0 1px ${T.g200}`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <V4Icon n="close" s={11} w={2.4} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '14px 22px 0', overflowX: 'auto' }}>
            {CATS.map(c => <Pill key={c.value} on={filterCat === c.value} s="sm" onClick={() => setFilterCat(c.value)}>{c.label}</Pill>)}
          </div>
        </div>
        <div style={{ padding: '16px 22px 0' }}>{Grid}{FragranceStrip}</div>
        <div style={{ position: 'fixed', bottom: 'var(--v3-sticky-bottom)', left: 'var(--v3-sidenav-w)', right: 0, padding: '14px 22px 20px', background: 'rgba(247,246,245,.96)', backdropFilter: 'blur(10px)', borderTop: `1px solid ${T.line}` }}>
          <div style={{ maxWidth: CONTENT_MAX_W, margin: '0 auto' }}>
            <Btn full icon="next" disabled={selectedIds.size === 0} onClick={() => setStep('context')}>Add the details</Btn>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 2 — context ─────────────────────────────────────────────────────
  const PiecesPreview = (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflowX: isDesktop ? undefined : 'auto', flexWrap: isDesktop ? 'wrap' : undefined }}>
      {picked.slice(0, isDesktop ? 12 : 6).map(item => (
        <div key={item.id} style={{ width: 46, height: 58, flexShrink: 0, overflow: 'hidden', background: T.g200 }}>
          {item.signedImageUrl && <img src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        </div>
      ))}
    </div>
  )

  const FormFields = (
    <>
      <div>
        <SecH>When</SecH>
        <label style={{ position: 'relative', display: 'inline-block' }}>
          <Pill on>
            {date === todayStr() ? 'Today' : date === yesterdayStr() ? 'Yesterday' : new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
          </Pill>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
        </label>
      </div>
      <div style={{ marginTop: 22 }}>
        <SecH>What for</SecH>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {occasionPresets.map(o => <Pill key={o} on={occasion === o} tone="peach" onClick={() => setOccasion(prev => prev === o ? '' : o)}>{o}</Pill>)}
        </div>
        <input
          type="text" value={occasionPresets.includes(occasion) ? '' : occasion} onChange={e => setOccasion(e.target.value)}
          placeholder="or type your own…"
          style={{ width: '100%', fontFamily: fS, fontSize: 14, color: T.ink, background: 'none', border: 'none', outline: 'none', borderBottom: `1px solid ${T.line}`, padding: '10px 0 6px', marginTop: 10 }}
        />
      </div>
      <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
      <div style={{ marginTop: 22 }}>
        <SecH right="Optional">A note</SecH>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)} placeholder="Too warm for the waistcoat by noon…" rows={3}
          style={{ width: '100%', boxSizing: 'border-box', minHeight: 62, background: T.white, boxShadow: `inset 0 0 0 1px ${T.line}`, padding: 15, fontFamily: fS, fontSize: 14, color: T.ink, border: 'none', outline: 'none', resize: 'none' }}
        />
      </div>
      <div style={{ marginTop: 20 }}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
        <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', border: `1.5px dashed ${T.g200}`, background: 'none', cursor: 'pointer', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: fS, fontSize: 13, color: T.g500 }}>
          <V4Icon n="cam" s={17} w={1.5} />{imageFile ? imageFile.name : 'Add a photo of the full look (optional)'}
        </button>
      </div>
    </>
  )

  if (isDesktop) {
    return (
      <div style={{ paddingBottom: 40 }}>
        <V4Bar back onBack={() => setStep('pieces')} />
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 44, alignItems: 'start', padding: '10px 22px 0' }}>
          <div style={{ position: 'sticky', top: 'calc(var(--v3-header-h) + 20px)' }}>{PiecesPreview}</div>
          <div>
            <Disp s={24}>{isEdit ? 'Update this outfit' : 'Anything to remember about it?'}</Disp>
            <div style={{ marginTop: 24 }}>{FormFields}</div>
            {error && <Body s={12.5} c={T.roseDeep} style={{ marginTop: 16 }}>{error}</Body>}
            <div style={{ marginTop: 24 }}>
              <Btn icon="check" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving…' : isEdit ? 'Save changes' : `Save to ${new Date(date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}`}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <V4Bar back onBack={() => setStep('pieces')} />
      <div style={{ padding: '4px 22px 0' }}>
        <Disp s={24}>{isEdit ? 'Update this outfit' : <>Anything to<br />remember about it?</>}</Disp>
      </div>
      <div style={{ padding: '18px 22px 0' }}>{PiecesPreview}</div>
      <div style={{ padding: '24px 22px 0' }}>{FormFields}</div>
      <div style={{ position: 'fixed', bottom: 'var(--v3-sticky-bottom)', left: 'var(--v3-sidenav-w)', right: 0, padding: '14px 22px 20px', background: T.paper, borderTop: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: CONTENT_MAX_W, margin: '0 auto' }}>
          {error && <Body s={12.5} c={T.roseDeep} style={{ marginBottom: 8 }}>{error}</Body>}
          <Btn full icon="check" disabled={saving} onClick={handleSave}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : `Save to ${new Date(date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}`}
          </Btn>
        </div>
      </div>
    </div>
  )
}
