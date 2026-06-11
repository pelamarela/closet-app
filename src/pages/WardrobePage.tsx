import { useState, useRef, useCallback } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useNavigate } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import ItemCard from '../components/ItemCard'
import { TopBar, SectionLabel, MonoTag, UButton, Icon, MONO, UI, RULE, CREAM, ACCENT } from '../components/ui'
import { setBatchFiles, setSingleFile } from '../lib/batchState'
import { useItemMutations } from '../hooks/useItemMutations'
import type { Category } from '../types/database'

const FILTERS: { value: 'all' | Category; label: string }[] = [
  { value: 'all',        label: 'all' },
  { value: 'top',        label: 'top' },
  { value: 'bottom',     label: 'btm' },
  { value: 'one-piece',  label: '1pc' },
  { value: 'outerwear',  label: 'otw' },
  { value: 'shoes',      label: 'shoe' },
  { value: 'accessory',  label: 'acc' },
]

export default function WardrobePage() {
  const navigate = useNavigate()
  const { items, loading, error } = useItems()
  const [filter, setFilter] = useState<'all' | Category>('all')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const batchInputRef = useRef<HTMLInputElement>(null)
  const { isDesktop } = useBreakpoint()
  const { deleteItems } = useItemMutations()

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }, [])

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
    setConfirmDelete(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await deleteItems(Array.from(selectedIds))
    setDeleting(false)
    exitSelectMode()
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)
  const countFor = (v: 'all' | Category) =>
    v === 'all' ? items.length : items.filter(i => i.category === v).length

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>loading…</span>
      </div>
    )
  }

  if (error) {
    return <div style={{ padding: '16px 20px', fontFamily: MONO, fontSize: 11, color: '#9C5544' }}>{error}</div>
  }

  if (items.length === 0) {
    return (
      <div style={{ paddingBottom: 40 }}>
        <TopBar
          title="Closet"
          meta="0 items"
        />

        {/* Empty hero */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            width: '100%', aspectRatio: '3/2',
            border: RULE, position: 'relative', overflow: 'hidden',
            background: `repeating-linear-gradient(135deg, ${CREAM} 0 14px, #E8D3BD 14px 28px)`,
          }}>
            <div style={{
              position: 'absolute', inset: 24,
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)', gap: 8,
            }}>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{
                  background: '#fff', border: '1.5px dashed rgba(0,0,0,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="plus" size={14} stroke={1.2} />
                </div>
              ))}
            </div>
            <div style={{
              position: 'absolute', top: 8, left: 8,
              fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.55)',
              background: '#fff', padding: '2px 5px',
            }}>// empty</div>
          </div>
        </div>

        <div style={{ padding: '24px 20px 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            // start your closet
          </div>
          <div style={{ fontFamily: UI, fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 8, lineHeight: 1.1 }}>
            Nothing here yet.<br />
            <span style={{ color: 'rgba(0,0,0,0.45)' }}>Add your first piece.</span>
          </div>
        </div>

        <div style={{ padding: '24px 20px 0' }}>
          <SectionLabel>what to do</SectionLabel>
          <div style={{ borderTop: RULE }}>
            {[
              ['01', 'Snap or upload a photo'],
              ['02', 'Name it · pick a category'],
              ['03', 'Rate warmth + formality (drives weather match)'],
              ['04', 'Repeat for ~30 favourites before logging outfits'],
            ].map(([n, t], i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '36px 1fr',
                padding: '10px 0', borderBottom: RULE, alignItems: 'baseline',
              }}>
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: '#9C5544' }}>{n}</div>
                <div style={{ fontFamily: UI, fontSize: 14, fontWeight: 500, letterSpacing: '-0.005em' }}>{t}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px 20px 0' }}>
          <UButton icon="plus" full onClick={() => navigate('/wardrobe/new')}>Add first item</UButton>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)', textAlign: 'center', marginTop: 10 }}>
            targeted for 150–400 items total
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: isDesktop ? 40 : 100 }}>
      <TopBar
        title="Closet"
        meta={
          selectMode
            ? <button onClick={exitSelectMode} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.55)', padding: 0 }}>cancel</button>
            : <button onClick={() => setSelectMode(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.55)', padding: 0 }}>{items.length} items · select</button>
        }
      />

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 20px 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <MonoTag filled={filter === f.value}>
              {f.label} <span style={{ opacity: 0.55 }}>{countFor(f.value)}</span>
            </MonoTag>
          </button>
        ))}
      </div>

      {/* Grid — alignItems:start prevents unequal row stretching */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>
          no {FILTERS.find(f => f.value === filter)?.label} yet
        </div>
      ) : (
        <div style={{ padding: '16px 20px 0', display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(160px, 1fr))' : 'repeat(3, minmax(0, 1fr))', gap: 10, alignItems: 'start' }}>
          {filtered.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              selected={selectMode ? selectedIds.has(item.id) : undefined}
              onClick={() => selectMode ? toggleSelect(item.id) : navigate(`/wardrobe/${item.id}`)}
            />
          ))}
        </div>
      )}

      {/* Hidden file input — single pick → item form, multiple → batch */}
      <input
        ref={batchInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => {
          const files = Array.from(e.target.files ?? [])
          if (!files.length) return
          e.target.value = ''
          if (files.length === 1) {
            setSingleFile(files[0])
            navigate('/wardrobe/new')
          } else {
            setBatchFiles(files)
            navigate('/wardrobe/batch')
          }
        }}
      />

      {/* Fixed action bar */}
      <div style={{
        ...(isDesktop ? { padding: '16px 20px', display: 'flex', gap: 8 } : {
          position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 700,
          background: '#F7F6F5', borderTop: RULE,
          padding: '12px 20px', display: 'flex', gap: 8, zIndex: 25,
        }),
      }}>
        {selectMode ? (
          confirmDelete ? (
            <>
              <div style={{ flex: 1, fontFamily: MONO, fontSize: 10, color: ACCENT, display: 'flex', alignItems: 'center' }}>
                delete {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''}? can't undo.
              </div>
              <UButton variant="ghost" onClick={() => setConfirmDelete(false)} style={{ flex: 0.7 }}>Cancel</UButton>
              <UButton variant="accent" icon="trash" disabled={deleting} onClick={handleDelete} style={{ flex: 1 }}>
                {deleting ? 'Deleting…' : 'Confirm'}
              </UButton>
            </>
          ) : (
            <>
              <UButton variant="ghost" onClick={() => setSelectedIds(new Set(filtered.map(i => i.id)))} style={{ flex: 1 }}>
                Select all
              </UButton>
              <UButton
                variant="accent" icon="trash"
                disabled={selectedIds.size === 0}
                onClick={() => setConfirmDelete(true)}
                style={{ flex: 1.4 }}
              >
                Delete {selectedIds.size > 0 ? selectedIds.size : ''}
              </UButton>
            </>
          )
        ) : (
          <>
            <UButton icon="plus" onClick={() => batchInputRef.current?.click()} style={{ flex: 1.25 }}>
              Add item
            </UButton>
            <UButton variant="secondary" icon="hanger" onClick={() => navigate('/outfits/new')} style={{ flex: 1 }}>
              Log outfit
            </UButton>
          </>
        )}
      </div>
    </div>
  )
}
