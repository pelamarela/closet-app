import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import ItemCard from '../components/ItemCard'
import { MonoTag, UButton, MONO, UI, INK, RULE } from '../components/ui'
import type { Category } from '../types/database'

const FILTERS: { value: 'all' | Category; label: string }[] = [
  { value: 'all', label: 'all' },
  { value: 'top', label: 'top' },
  { value: 'bottom', label: 'btm' },
  { value: 'dress', label: 'dress' },
  { value: 'outerwear', label: 'coat' },
  { value: 'shoes', label: 'shoe' },
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
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ borderTop: RULE, marginBottom: 32 }} />
        <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          // empty-closet
        </div>
        <div style={{ fontFamily: UI, fontSize: 26, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: 8 }}>
          Your wardrobe<br />is empty.
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)', marginBottom: 28 }}>
          Add items to start tracking what you own.
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <UButton onClick={() => navigate('/wardrobe/new')}>Add one</UButton>
          <UButton variant="ghost" onClick={() => navigate('/wardrobe/batch')}>Add multiple</UButton>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* AppBar row */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 6 }}>
              <path d="M12 8a2 2 0 1 1 2-2"/><path d="M12 8v2"/><path d="M3 18l9-6 9 6"/><path d="M3 18h18"/>
            </svg>
            Closet
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.55)' }}>
            {items.length} items
          </div>
        </div>
        <div style={{ borderTop: RULE, marginTop: 12 }} />
      </div>

      {/* Search bar */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          border: RULE, borderRadius: 4, padding: '0 12px', height: 40,
          background: '#fff',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(0,0,0,0.4)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
          <div style={{
            flex: 1, fontFamily: UI, fontSize: 13,
            color: 'rgba(0,0,0,0.35)',
          }}>search items, brands, colors…</div>
          <div style={{
            fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.35)',
            padding: '2px 5px', border: RULE, borderRadius: 3,
          }}>⌘ K</div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{
        display: 'flex', gap: 6, padding: '12px 20px 0',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
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
        <div style={{
          padding: '16px 20px 0',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
        }}>
          {filtered.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => navigate(`/wardrobe/${item.id}/edit`)}
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
                background: '#fff', color: INK,
                border: RULE, borderRadius: 4,
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                padding: '0 16px', height: 40,
                fontFamily: MONO, fontSize: 10, cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>
              </svg>
              Add multiple
            </button>
            <button
              onClick={() => { setFabOpen(false); navigate('/wardrobe/new') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#fff', color: INK,
                border: RULE, borderRadius: 4,
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                padding: '0 16px', height: 40,
                fontFamily: MONO, fontSize: 10, cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add one
            </button>
          </>
        )}
        <button
          onClick={() => setFabOpen(o => !o)}
          style={{
            width: 52, height: 52,
            background: INK, color: '#fff',
            border: 'none', borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          }}
        >
          {fabOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
