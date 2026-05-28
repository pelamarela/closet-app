import { Icon, MONO, UI, INK, RULE } from './ui'
import type { ItemWithSignedUrl } from '../hooks/useItems'

const CAT: Record<string, string> = {
  'top': 'top', 'bottom': 'btm', 'one-piece': '1pc',
  'outerwear': 'otw', 'shoes': 'shoe', 'accessory': 'acc',
  'dress': '1pc', 'set': '1pc', // legacy db values
}

interface ItemCardProps {
  item: ItemWithSignedUrl
  onClick: () => void
  selected?: boolean
}

export default function ItemCard({ item, onClick, selected }: ItemCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', background: 'none',
        border: 'none', padding: 0, cursor: 'pointer',
      }}
    >
      <div style={{
        position: 'relative', width: '100%', paddingBottom: '133.33%',
        border: selected ? `2px solid ${INK}` : RULE,
        borderRadius: 3, overflow: 'hidden',
      }}>
        {item.signedImageUrl ? (
          <img
            src={item.signedImageUrl}
            alt={item.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(135deg, #ECEAE6 0 14px, #DCD9D3 14px 28px)',
          }} />
        )}

        {/* Category badge top-left */}
        <div style={{
          position: 'absolute', top: 6, left: 6,
          fontFamily: MONO, fontSize: 8.5,
          background: '#fff', color: INK,
          padding: '2px 5px', letterSpacing: '0.04em',
        }}>{CAT[item.category] ?? item.category}</div>

        {/* Selection overlay */}
        {selected !== undefined && (
          <div style={{
            position: 'absolute', inset: 0,
            background: selected ? 'rgba(10,10,10,0.45)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.1s',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              border: `2px solid ${selected ? '#fff' : 'rgba(255,255,255,0.7)'}`,
              background: selected ? INK : 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
            }}>
              {selected && <Icon name="check" size={12} stroke={2.5} />}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '6px 2px 0' }}>
        <div style={{
          fontFamily: UI, fontSize: 11, fontWeight: 600,
          letterSpacing: '-0.005em', color: INK,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{item.name}</div>
        <div style={{
          fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)',
          marginTop: 2, display: 'flex', gap: 6,
        }}>
          <span>w{item.warmth}</span>
          <span>f{item.formality}</span>
        </div>
      </div>
    </button>
  )
}
