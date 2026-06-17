import { useNavigate } from 'react-router-dom'
import { Icon, MONO, UI, INK, RULE } from './ui'
import { catLabel } from '../lib/categoryLabel'

type Props = {
  item: {
    id: string
    name: string
    category: string
    color?: string | null
    signedImageUrl: string | null
  }
  right?: React.ReactNode
}

export default function PieceRow({ item, right }: Props) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/wardrobe/${item.id}`)}
      style={{
        width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        display: 'grid', gridTemplateColumns: `34px 1fr${right ? ' auto' : ''} 14px`,
        alignItems: 'center', gap: 12,
        paddingTop: 8, paddingBottom: 8, borderBottom: RULE,
      }}
    >
      <div style={{ height: 42, borderRadius: 2, overflow: 'hidden', border: RULE }}>
        {item.signedImageUrl
          ? <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 8px, #DCD9D3 8px 16px)' }} />
        }
      </div>
      <div>
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 500, letterSpacing: '-0.005em', color: INK }}>{item.name}</div>
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>
          {catLabel(item.category)}{item.color ? ` · ${item.color}` : ''}
        </div>
      </div>
      {right && <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.45)', textAlign: 'right' }}>{right}</div>}
      <Icon name="forward" size={12} stroke={1.2} />
    </button>
  )
}
