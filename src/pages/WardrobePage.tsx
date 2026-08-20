import { useState, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import { useItemMutations } from '../hooks/useItemMutations'
import { useOutfits } from '../hooks/useOutfits'
import { setBatchFiles, setSingleFile } from '../lib/batchState'
import type { Category } from '../types/database'
import { T, fS, fM, V4Icon, Btn, Pill, ItemTile, Disp, Body, Mono } from '../design/kit'

const FILTERS: { value: 'all' | Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'top', label: 'Tops' },
  { value: 'bottom', label: 'Bottoms' },
  { value: 'one-piece', label: 'One-piece' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessory', label: 'Bags & jewellery' },
  { value: 'fragrance', label: 'Fragrance' },
]

const STALE_DAYS = 365

export default function WardrobePage() {
  const navigate = useNavigate()
  const { items, loading, error } = useItems()
  const { outfits } = useOutfits()
  const { archiveItems } = useItemMutations()
  const [filter, setFilter] = useState<'all' | Category>('all')
  const [staleOnly, setStaleOnly] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const addFileRef = useRef<HTMLInputElement>(null)

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''
    if (files.length === 1) { setSingleFile(files[0]); navigate('/wardrobe/new') }
    else { setBatchFiles(files); navigate('/wardrobe/batch') }
  }

  // Last-worn date per item, derived client-side from already-loaded outfits —
  // drives both the "recently worn" sort and the stale-item nudge below.
  const lastWornById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const o of outfits) {
      for (const id of o.item_ids) {
        if (!map[id] || o.date_worn > map[id]) map[id] = o.date_worn
      }
    }
    return map
  }, [outfits])
  const wearCountById = useMemo(() => {
    const map: Record<string, number> = {}
    for (const o of outfits) for (const id of o.item_ids) map[id] = (map[id] ?? 0) + 1
    return map
  }, [outfits])

  const staleCutoff = new Date()
  staleCutoff.setDate(staleCutoff.getDate() - STALE_DAYS)
  const staleCutoffStr = staleCutoff.toISOString().slice(0, 10)
  const staleItems = items.filter(i => !lastWornById[i.id] || lastWornById[i.id] < staleCutoffStr)

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }, [])
  const exitSelectMode = () => { setSelectMode(false); setSelectedIds(new Set()); setConfirmArchive(false) }
  const handleArchive = async () => {
    setArchiving(true)
    await archiveItems(Array.from(selectedIds))
    setArchiving(false)
    exitSelectMode()
  }

  const byFilter = filter === 'all' ? items : items.filter(i => i.category === filter)
  const filtered = (staleOnly ? staleItems.filter(i => byFilter.includes(i)) : byFilter)
    .slice()
    .sort((a, b) => (lastWornById[b.id] ?? '').localeCompare(lastWornById[a.id] ?? ''))
  const countFor = (v: 'all' | Category) => v === 'all' ? items.length : items.filter(i => i.category === v).length

  if (loading) return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  if (error) return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.roseDeep }}>{error}</div>

  const Header = (
    <div style={{ padding: '4px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Disp s={30}>Closet</Disp>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
        <input ref={addFileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleAddFiles} />
        <button onClick={() => navigate('/settings/stats')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, display: 'flex' }}><V4Icon n="chart" s={22} w={1.6} /></button>
        <button onClick={() => addFileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', background: `${T.g200}55`, color: T.ink, border: 'none', cursor: 'pointer' }}>
          <V4Icon n="plus" s={15} w={1.9} /><span style={{ fontFamily: fS, fontSize: 12.5, fontWeight: 600 }}>Add</span>
        </button>
        <button onClick={() => navigate('/shop')} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', background: T.peachSoft, color: T.cocoa, border: 'none', cursor: 'pointer' }}>
          <V4Icon n="bag" s={15} w={1.8} /><span style={{ fontFamily: fS, fontSize: 12.5, fontWeight: 600 }}>Shop</span>
        </button>
      </div>
    </div>
  )

  if (items.length === 0) {
    return (
      <div style={{ paddingBottom: 32 }}>
        {Header}
        <div style={{ padding: '30px 22px 0' }}>
          <Disp s={22}>Nothing here yet.</Disp>
          <Body s={14} style={{ marginTop: 8 }}>Add your first piece to start building your closet.</Body>
          <div style={{ marginTop: 20 }}><Btn full icon="plus" onClick={() => addFileRef.current?.click()}>Add first item</Btn></div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 32 }}>
      {Header}
      <div style={{ padding: '4px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {selectMode ? (
          <button onClick={exitSelectMode} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 13, color: T.g500 }}>Cancel</button>
        ) : (
          <button onClick={() => setSelectMode(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 13, color: T.g500 }}>{items.length} items · select</button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '14px 22px 0', overflowX: 'auto' }}>
        {FILTERS.map(f => (
          <Pill key={f.value} on={filter === f.value} s="sm" count={countFor(f.value)} onClick={() => setFilter(f.value)}>{f.label}</Pill>
        ))}
      </div>
      <div style={{ padding: '16px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: fS, fontSize: 13, fontWeight: 500, color: T.ink }}>{staleOnly ? 'Not worn in a year' : 'Recently worn'}</div>
        {staleOnly && <button onClick={() => setStaleOnly(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 13, color: T.cocoa }}>Clear</button>}
      </div>
      <div style={{ padding: '10px 22px 0' }}>
        {filtered.length === 0 ? (
          <Body s={13} style={{ padding: '20px 0' }}>No {filter === 'all' ? 'items' : FILTERS.find(f => f.value === filter)?.label.toLowerCase()}.</Body>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {filtered.map(item => (
              <ItemTile
                key={item.id}
                src={item.signedImageUrl}
                alt={item.name}
                crop={['top', 'bottom', 'one-piece', 'outerwear'].includes(item.category) ? 'top' : 'center'}
                worn={wearCountById[item.id] ?? 0}
                sel={selectMode ? selectedIds.has(item.id) : undefined}
                onClick={() => selectMode ? toggleSelect(item.id) : navigate(`/wardrobe/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
      {!selectMode && !staleOnly && staleItems.length > 0 && (
        <div style={{ padding: '20px 22px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
            <V4Icon n="archive" s={20} w={1.6} c={T.cocoa} />
            <Body s={13} style={{ flex: 1 }}>{staleItems.length} piece{staleItems.length === 1 ? '' : 's'} haven't left the closet in a year.</Body>
            <Pill s="sm" onClick={() => setStaleOnly(true)}>Review</Pill>
          </div>
        </div>
      )}
      {selectMode && (
        <div style={{ position: 'fixed', left: 'var(--v3-sidenav-w)', right: 0, bottom: 'var(--v3-sticky-bottom)', padding: '14px 22px', background: 'rgba(247,246,245,.96)', backdropFilter: 'blur(10px)', borderTop: `1px solid ${T.line}`, zIndex: 20 }}>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: 10 }}>
            {confirmArchive ? (
              <>
                <Mono s={11} c={T.roseDeep} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>archive {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''}?</Mono>
                <Btn kind="quiet" onClick={() => setConfirmArchive(false)}>Cancel</Btn>
                <Btn kind="peach" disabled={archiving} onClick={handleArchive}>{archiving ? 'Archiving…' : 'Confirm'}</Btn>
              </>
            ) : (
              <>
                <Btn kind="quiet" flex={1} onClick={() => setSelectedIds(new Set(filtered.map(i => i.id)))}>Select all</Btn>
                <Btn kind="primary" flex={1.4} disabled={selectedIds.size === 0} onClick={() => setConfirmArchive(true)}>Archive {selectedIds.size > 0 ? selectedIds.size : ''}</Btn>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
