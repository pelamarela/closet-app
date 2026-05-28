import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import ItemCard from '../components/ItemCard'
import { AppBar, SectionLabel, MonoTag, UButton, Icon, MONO, UI, INK, RULE, CREAM } from '../components/ui'
import type { Category } from '../types/database'

const FILTERS: { value: 'all' | Category; label: string }[] = [
  { value: 'all',       label: 'all' },
  { value: 'top',       label: 'top' },
  { value: 'bottom',    label: 'btm' },
  { value: 'dress',     label: 'dress' },
  { value: 'outerwear', label: 'coat' },
  { value: 'shoes',     label: 'shoe' },
  { value: 'accessory', label: 'acc' },
]

export default function WardrobePage() {
  const navigate = useNavigate()
  const { items, loading, error } = useItems()
  const [filter, setFilter] = useState<'all' | Category>('all')
  const [fabOpen, setFabOpen] = useState(false)

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
        <AppBar
          title={<><Icon name="hanger" size={16} stroke={1.6} /> Closet</>}
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
    <div style={{ paddingBottom: 24 }}>
      <AppBar
        title={<><Icon name="hanger" size={16} stroke={1.6} /> Closet</>}
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>
          no {FILTERS.find(f => f.value === filter)?.label} yet
        </div>
      ) : (
        <div style={{ padding: '16px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {filtered.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => navigate(`/wardrobe/${item.id}`)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <div style={{
        position: 'fixed', bottom: 100, right: 16,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
        zIndex: 30,
      }}>
        {fabOpen && (
          <>
            <button
              onClick={() => { setFabOpen(false); navigate('/wardrobe/batch') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#fff', color: INK, border: RULE, borderRadius: 4,
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                padding: '0 16px', height: 40,
                fontFamily: MONO, fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <Icon name="grid" size={14} stroke={1.6} />
              Add multiple
            </button>
            <button
              onClick={() => { setFabOpen(false); navigate('/wardrobe/new') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#fff', color: INK, border: RULE, borderRadius: 4,
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                padding: '0 16px', height: 40,
                fontFamily: MONO, fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <Icon name="plus" size={14} stroke={2} />
              Add one
            </button>
          </>
        )}
        <button
          onClick={() => setFabOpen(o => !o)}
          style={{
            width: 52, height: 52, background: INK, color: '#fff',
            border: 'none', borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          }}
        >
          <Icon name={fabOpen ? 'x' : 'plus'} size={20} stroke={2} />
        </button>
      </div>
    </div>
  )
}
