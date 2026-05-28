import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import ItemCard from '../components/ItemCard'
import { TopBar, SectionLabel, MonoTag, UButton, Icon, MONO, UI, INK, RULE, CREAM } from '../components/ui'
import { setBatchFiles } from '../lib/batchState'
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
  const [fabOpen, setFabOpen] = useState(false)
  const batchInputRef = useRef<HTMLInputElement>(null)

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
    <div style={{ paddingBottom: 100 }}>
      <TopBar
        title="Closet"
        meta={`${items.length} items`}
      />

      {/* Search bar */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          border: RULE, borderRadius: 4, padding: '0 12px', height: 40, background: '#fff',
        }}>
          <Icon name="search" size={16} stroke={1.4} />
          <div style={{ flex: 1, fontFamily: 'Geist, Inter, system-ui', fontSize: 13, color: 'rgba(0,0,0,0.35)' }}>
            search items, brands, colors…
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.35)', padding: '2px 5px', border: RULE, borderRadius: 3 }}>⌘ K</div>
        </div>
      </div>

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
        <div style={{ padding: '16px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, alignItems: 'start' }}>
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} onClick={() => navigate(`/wardrobe/${item.id}`)} />
          ))}
        </div>
      )}

      {/* Hidden file input for batch upload — triggered directly from user gesture */}
      <input
        ref={batchInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => {
          const files = Array.from(e.target.files ?? [])
          if (!files.length) return
          setBatchFiles(files)
          setFabOpen(false)
          navigate('/wardrobe/batch')
        }}
      />

      {/* Add item dropdown */}
      {fabOpen && (
        <>
          <div onClick={() => setFabOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 24 }} />
          <div style={{
            position: 'fixed', bottom: 158, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 430, zIndex: 26, paddingLeft: 20, pointerEvents: 'none',
          }}>
            <div style={{
              width: 240, background: '#fff', border: RULE, borderRadius: 4,
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)', overflow: 'hidden', pointerEvents: 'auto',
            }}>
              <div style={{
                padding: '8px 12px', borderBottom: RULE,
                fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.55)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span>// add item</span><span>▴</span>
              </div>
              <button
                onClick={() => { setFabOpen(false); navigate('/wardrobe/new') }}
                style={{ width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer', display: 'grid', gridTemplateColumns: '34px 1fr', alignItems: 'center', gap: 12, padding: '12px', borderBottom: RULE, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}
              >
                <div style={{ width: 34, height: 34, border: RULE, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="plus" size={16} stroke={1.6} />
                </div>
                <div>
                  <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em', color: INK }}>Single item</div>
                  <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>form · one piece at a time</div>
                </div>
              </button>
              <button
                onClick={() => { batchInputRef.current?.click() }}
                style={{ width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer', display: 'grid', gridTemplateColumns: '34px 1fr', alignItems: 'center', gap: 12, padding: '12px', borderBottom: RULE, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}
              >
                <div style={{ width: 34, height: 34, border: RULE, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="grid" size={16} stroke={1.6} />
                </div>
                <div>
                  <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em', color: INK }}>Multiple at once</div>
                  <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>batch upload · ai-powered</div>
                </div>
              </button>
              <div style={{ padding: '8px 12px', fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                tap outside to dismiss
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fixed action bar — unified UButton for both actions */}
      <div style={{
        position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: '#F7F6F5', borderTop: RULE,
        padding: '12px 20px', display: 'flex', gap: 8, zIndex: 25,
      }}>
        <UButton icon="plus" onClick={() => setFabOpen(o => !o)} style={{ flex: 1.25, justifyContent: 'flex-start' }}>
          Add item
          <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 10, opacity: 0.7 }}>{fabOpen ? '▴' : '▾'}</span>
        </UButton>
        <UButton variant="secondary" icon="hanger" onClick={() => navigate('/outfits/new')} style={{ flex: 1 }}>
          Log outfit
        </UButton>
      </div>
    </div>
  )
}
