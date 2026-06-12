import { useNavigate } from 'react-router-dom'
import { useIdeas } from '../hooks/useIdeas'
import { useItems } from '../hooks/useItems'
import type { OutfitIdeaWithItems } from '../types/database'
import { TopBar, Icon, MONO, UI, INK, RULE } from '../components/ui'
import { outfitTitle } from '../components/ui'
import { useBreakpoint } from '../hooks/useBreakpoint'

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function IdeaRow({ idea, items, onClick }: {
  idea: OutfitIdeaWithItems
  items: ReturnType<typeof useItems>['items']
  onClick: () => void
}) {
  const d = new Date(idea.created_at)
  const thumbItems = idea.item_ids.slice(0, 4).map(id => items.find(i => i.id === id)).filter(Boolean) as typeof items

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        display: 'grid', gridTemplateColumns: '44px 1fr 14px',
        gap: 12, alignItems: 'center',
        paddingTop: 12, paddingBottom: 12, borderBottom: RULE,
      }}
    >
      {/* Mini collage */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, width: 44, height: 54, flexShrink: 0 }}>
        {thumbItems.length === 0 ? (
          <div style={{ gridColumn: '1/-1', gridRow: '1/-1', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 6px, #DCD9D3 6px 12px)', borderRadius: 2 }} />
        ) : thumbItems.map((item, i) => (
          <div key={item.id} style={{
            background: '#ECEAE6', borderRadius: 1, overflow: 'hidden',
            ...(thumbItems.length === 1 ? { gridColumn: '1/-1', gridRow: '1/-1' } :
               thumbItems.length === 3 && i === 2 ? { gridColumn: '1/-1' } : {}),
          }}>
            {item.signedImageUrl
              ? <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 6px, #DCD9D3 6px 12px)' }} />
            }
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontFamily: UI, fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          {outfitTitle(idea.item_ids, items, idea.occasion || 'idea')}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4, fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.5)' }}>
          <span>{idea.item_ids.length} pieces</span>
          {idea.occasion && <><span>·</span><span>{idea.occasion}</span></>}
          <span>·</span>
          <span>{String(d.getDate()).padStart(2,'0')} {MONTH_SHORT[d.getMonth()].toLowerCase()}</span>
        </div>
        {idea.reasoning && (
          <div style={{
            fontFamily: UI, fontSize: 11, color: 'rgba(0,0,0,0.5)', marginTop: 4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}>
            {idea.reasoning}
          </div>
        )}
      </div>

      <Icon name="forward" size={12} stroke={1.2} />
    </button>
  )
}

export default function IdeasPage() {
  const navigate = useNavigate()
  const { ideas, loading } = useIdeas()
  const { items } = useItems()
  const { isDesktop } = useBreakpoint()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>loading…</span>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: isDesktop ? 40 : 80 }}>
      <TopBar title="Ideas" />

      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          // saved outfit ideas
        </div>
        <div style={{ fontFamily: UI, fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 8, lineHeight: 1.1 }}>
          {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'} saved.
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {ideas.length === 0 ? (
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.4)', padding: '20px 0', lineHeight: 1.6 }}>
            no ideas yet — go to <button
              onClick={() => navigate('/suggest')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: MONO, fontSize: 10, color: INK, borderBottom: '1px solid currentColor' }}
            >suggest</button> and save outfits you like.
          </div>
        ) : (
          <div style={{ borderTop: RULE }}>
            {ideas.map(idea => (
              <IdeaRow
                key={idea.id}
                idea={idea}
                items={items}
                onClick={() => navigate(`/ideas/${idea.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
