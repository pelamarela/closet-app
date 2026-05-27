import { MONO, UI, INK, RULE } from './ui'
import type { ItemWithSignedUrl } from '../hooks/useItems'

interface ItemCardProps {
  item: ItemWithSignedUrl
  onClick: () => void
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  const shortId = item.id.slice(0, 6)

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', background: 'none',
        border: 'none', padding: 0, cursor: 'pointer',
      }}
    >
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '3/4',
        border: RULE, borderRadius: 3, overflow: 'hidden',
      }}>
        {item.signedImageUrl ? (
          <img
            src={item.signedImageUrl}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'repeating-linear-gradient(135deg, #ECEAE6 0 14px, #DCD9D3 14px 28px)',
          }} />
        )}

        {/* Category badge top-left */}
        <div style={{
          position: 'absolute', top: 6, left: 6,
          fontFamily: MONO, fontSize: 8.5,
          background: '#fff', color: INK,
          padding: '2px 5px', letterSpacing: '0.04em',
        }}>{item.category}</div>

        {/* ID badge top-right */}
        <div style={{
          position: 'absolute', top: 6, right: 6,
          fontFamily: MONO, fontSize: 8.5,
          color: 'rgba(255,255,255,0.9)',
          background: 'rgba(0,0,0,0.45)',
          padding: '2px 5px',
        }}>{shortId}</div>
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
