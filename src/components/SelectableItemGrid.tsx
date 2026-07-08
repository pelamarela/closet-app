import { useBreakpoint } from '../hooks/useBreakpoint'
import { SectionLabel, Icon, MONO, INK, RULE } from './ui'
import { catLabel } from '../lib/categoryLabel'
import type { Category } from '../types/database'

type GridItem = {
  id: string
  name: string
  category: string
  signedImageUrl: string | null
}

type Props = {
  items: GridItem[]
  selected: Set<string>
  onToggle: (id: string) => void
  initialSelected?: Set<string>
  filterCat?: string
  onFilterCat?: (cat: string) => void
  scrollable?: boolean
  hideFilters?: boolean
  label?: string
}

const CATS = ['all', 'top', 'bottom', 'one-piece', 'outerwear', 'shoes', 'accessory'] as const

export default function SelectableItemGrid({
  items, selected, onToggle, initialSelected, filterCat, onFilterCat, scrollable, hideFilters, label = 'items',
}: Props) {
  const { isDesktop } = useBreakpoint()
  const filtered = items
    .filter(item => hideFilters || filterCat === 'all' || item.category === (filterCat as Category))
    .sort((a, b) => {
      if (!initialSelected) return 0
      return Number(!initialSelected.has(a.id)) - Number(!initialSelected.has(b.id))
    })

  return (
    <>
      <SectionLabel right={selected.size > 0 ? `${selected.size} selected` : undefined}>{label}</SectionLabel>
      {!hideFilters && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {CATS.map(cat => (
            <button key={cat} onClick={() => onFilterCat?.(cat)} style={{
              fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.04em', padding: '3px 8px',
              border: `1px solid ${filterCat === cat ? INK : 'rgba(0,0,0,0.15)'}`,
              background: filterCat === cat ? INK : 'transparent',
              color: filterCat === cat ? '#fff' : INK,
              borderRadius: 2, cursor: 'pointer',
            }}>
              {cat === 'all' ? 'all' : catLabel(cat)}
            </button>
          ))}
        </div>
      )}
      <div style={scrollable && !isDesktop ? { maxHeight: '38vh', overflowY: 'auto', overflowX: 'hidden' } : {}}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(120px, 1fr))' : 'repeat(4, minmax(0, 1fr))',
          gap: 8,
        }}>
          {filtered.map(item => (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <div style={{
                width: '100%', aspectRatio: '3/4',
                border: selected.has(item.id) ? `2px solid ${INK}` : RULE,
                position: 'relative', overflow: 'hidden',
              }}>
                {item.signedImageUrl ? (
                  <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 8px, #DCD9D3 8px 16px)' }} />
                )}
                <div style={{
                  position: 'absolute', top: 4, left: 4,
                  fontFamily: MONO, fontSize: 7.5,
                  background: 'rgba(255,255,255,0.9)', padding: '1px 4px',
                }}>{catLabel(item.category)}</div>
                {selected.has(item.id) && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.38)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>
                    <Icon name="check" size={22} stroke={2.5} />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
