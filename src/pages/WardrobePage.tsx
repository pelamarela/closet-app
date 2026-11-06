import { motion, AnimatePresence } from 'motion/react'
import { useState, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import { useItemMutations } from '../hooks/useItemMutations'
import { useOutfits } from '../hooks/useOutfits'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { setBatchFiles, setSingleFile } from '../lib/batchState'
import { catLabel } from '../lib/categoryLabel'
import type { Category } from '../types/database'
import { T, fS, fM, V4Icon, Btn, Pill, ItemTile, Disp, Body, Mono, CONTENT_MAX_W } from '../design/kit'

const FILTERS: { value: 'all' | Category; label: string }[] = [
  { value: 'all', label: 'all' },
  { value: 'top', label: catLabel('top') },
  { value: 'bottom', label: catLabel('bottom') },
  { value: 'one-piece', label: catLabel('one-piece') },
  { value: 'outerwear', label: catLabel('outerwear') },
  { value: 'shoes', label: catLabel('shoes') },
  { value: 'accessory', label: catLabel('accessory') },
  { value: 'fragrance', label: catLabel('fragrance') },
]

const STALE_DAYS = 365

export default function WardrobePage() {
  const navigate = useNavigate()
  const { items, loading, error } = useItems()
  const { outfits } = useOutfits()
  const { archiveItems } = useItemMutations()
  const { isDesktop } = useBreakpoint()
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
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
  const countFor = (v: 'all' | Category) => v === 'all' ? items.length : items.filter(i => i.category === v).length

  if (loading) return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  if (error) return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.roseDeep }}>{error}</div>

  // same small header button as add and check, on every size
  const headBtn: React.CSSProperties = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, padding: '0 12px', background: 'transparent', color: T.ink, border: `1px solid ${T.g200}`, cursor: 'pointer', fontFamily: fS, fontSize: 13.5, fontWeight: 500 }
  const SelectToggle = (
    <button onClick={selectMode ? exitSelectMode : () => setSelectMode(true)} style={headBtn}>
      <V4Icon n={selectMode ? 'close' : 'check'} s={15} w={1.9} />{selectMode ? 'cancel' : 'select'}
    </button>
  )

  // no page title (the top bar already says closet) and no shop button (shop is in the bottom bar): just the two actions
  const Header = (
    <div style={{ padding: '4px 22px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      {SelectToggle}
      <input ref={addFileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleAddFiles} />
      <button onClick={() => addFileRef.current?.click()} style={headBtn}>
        <V4Icon n="plus" s={15} w={1.9} />add
      </button>
    </div>
  )

  if (items.length === 0) {
    return (
      <div style={{ paddingBottom: 32 }}>
        {Header}
        <div style={{ padding: '30px 22px 0' }}>
          <Disp s={22}>nothing here yet</Disp>
          <Body s={14} style={{ marginTop: 8 }}>add your first piece to start building your closet.</Body>
          <div style={{ marginTop: 20 }}><Btn full icon="plus" onClick={() => addFileRef.current?.click()}>add first item</Btn></div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ position: 'sticky', top: 'var(--v3-header-h)', zIndex: 25, background: T.paper, paddingBottom: 10, borderBottom: `1px solid ${T.line}` }}>
        {Header}
        <div style={{ display: 'flex', gap: 8, padding: '14px 22px 0', overflowX: 'auto' }}>
          {FILTERS.map(f => (
            <Pill group="closet-filter" key={f.value} on={filter === f.value} s="sm" count={countFor(f.value)} onClick={() => setFilter(f.value)}>{f.label}</Pill>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: fS, fontSize: 13, fontWeight: 500, color: T.ink }}>{staleOnly ? 'not worn in a year' : 'recently added'}</div>
        {staleOnly && <button onClick={() => setStaleOnly(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 13, color: T.cocoa }}>clear</button>}
      </div>
      <div style={{ padding: '10px 22px 0' }}>
        {filtered.length === 0 ? (
          <Body s={13} style={{ padding: '20px 0' }}>no {filter === 'all' ? 'items' : FILTERS.find(f => f.value === filter)?.label.toLowerCase()}.</Body>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(110px, 1fr))' : 'repeat(4, 1fr)', gap: 8 }}>
            <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 24) * 0.025, layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
              >
              <ItemTile
                src={item.signedImageUrl}
                alt={item.name}
                crop={['top', 'bottom', 'one-piece', 'outerwear'].includes(item.category) ? 'top' : 'center'}
                worn={wearCountById[item.id] ?? 0}
                sel={selectMode ? selectedIds.has(item.id) : undefined}
                onClick={() => selectMode ? toggleSelect(item.id) : navigate(`/wardrobe/${item.id}`, { viewTransition: true })}
                vtName={`item-${item.id}`}
              />
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      {!selectMode && !staleOnly && staleItems.length > 0 && (
        <div style={{ padding: '20px 22px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
            <V4Icon n="archive" s={20} w={1.6} c={T.cocoa} />
            <Body s={13} style={{ flex: 1 }}>{staleItems.length} piece{staleItems.length === 1 ? '' : 's'} haven't left the closet in a year.</Body>
            <Pill s="sm" onClick={() => setStaleOnly(true)}>review</Pill>
          </div>
        </div>
      )}
      {selectMode && (
        <div style={{ position: 'fixed', left: 'var(--v3-sidenav-w)', right: 0, bottom: 'var(--v3-sticky-bottom)', padding: '14px 22px', borderRadius: 2, background: T.paper, backdropFilter: 'blur(10px)', borderTop: `1px solid ${T.line}`, zIndex: 20 }}>
          <div style={{ maxWidth: CONTENT_MAX_W, margin: '0 auto', display: 'flex', gap: 10 }}>
            {confirmArchive ? (
              <>
                <Mono s={11} c={T.roseDeep} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>archive {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''}?</Mono>
                <Btn kind="quiet" onClick={() => setConfirmArchive(false)}>cancel</Btn>
                <Btn kind="peach" disabled={archiving} onClick={handleArchive}>{archiving ? 'archiving…' : 'confirm'}</Btn>
              </>
            ) : (
              <>
                <Btn kind="quiet" flex={1} onClick={() => setSelectedIds(new Set(filtered.map(i => i.id)))}>select all</Btn>
                <Btn kind="primary" flex={1.4} disabled={selectedIds.size === 0} onClick={() => setConfirmArchive(true)}>archive {selectedIds.size > 0 ? selectedIds.size : ''}</Btn>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
