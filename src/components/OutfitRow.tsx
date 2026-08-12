import { Icon, MONO, RULE, outfitTitle } from './ui'
import { outfitPalette } from '../lib/outfitPalette'
import type { OutfitWithItems } from '../hooks/useOutfits'
import type { ItemWithSignedUrl } from '../hooks/useItems'

const MONTH_SHORT = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
const DAY_LABELS = ['mon','tue','wed','thu','fri','sat','sun']

// Same swatch pattern used everywhere an outfit needs a quick visual ID
// without loading every item's photo — deterministic from the outfit id.
function OutfitSwatch({ id }: { id: string }) {
  const [a, b] = outfitPalette(id)
  return <div style={{ width: '100%', height: '100%', background: `repeating-linear-gradient(135deg, ${a} 0 10px, ${b} 10px 20px)` }} />
}

// The single row layout for "an outfit in a list" — used identically by
// OutfitsPage's calendar library and HomePage's Recent block so the two
// never drift apart again: date · thumbnail · title · occasion · pieces.
export default function OutfitRow({ outfit, items, onClick, topBorder = false }: {
  outfit: OutfitWithItems
  items: ItemWithSignedUrl[]
  onClick: () => void
  topBorder?: boolean
}) {
  const d = new Date(outfit.date_worn + 'T00:00:00')
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        display: 'grid', gridTemplateColumns: '50px 48px 1fr 14px',
        gap: 12, alignItems: 'center',
        paddingTop: 12, paddingBottom: 12,
        borderTop: topBorder ? RULE : 'none',
        borderBottom: RULE,
      }}
    >
      <div style={{ fontFamily: MONO }}>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1 }}>{String(d.getDate()).padStart(2, '0')}</div>
        <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.5)', marginTop: 3, letterSpacing: '0.04em' }}>
          {MONTH_SHORT[d.getMonth()]} · {DAY_LABELS[d.getDay()]}
        </div>
      </div>
      <div style={{ width: 48, height: 60, borderRadius: 2, overflow: 'hidden', border: RULE, flexShrink: 0 }}>
        <OutfitSwatch id={outfit.id} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'Geist, Inter, system-ui', fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          {outfitTitle(outfit.item_ids, items, outfit.occasion || 'outfit')}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4, fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', flexWrap: 'wrap' }}>
          {outfit.occasion && <><span>{outfit.occasion}</span><span>·</span></>}
          <span>{outfit.item_ids.length} pieces</span>
        </div>
      </div>
      <Icon name="forward" size={12} stroke={1.2} />
    </button>
  )
}
