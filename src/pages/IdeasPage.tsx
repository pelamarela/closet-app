import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIdeas } from '../hooks/useIdeas'
import { useItems } from '../hooks/useItems'
import { outfitTitle } from '../lib/outfitTitle'
import { T, fS, fM, V4Icon, Btn, Pill, Disp, Body, Mono } from '../design/kit'
import Collage from '../design/Collage'

type Filter = 'all' | 'suggested' | 'mine'

export default function IdeasPage() {
  const navigate = useNavigate()
  const { ideas, loading } = useIdeas()
  const { items } = useItems()
  const [filter, setFilter] = useState<Filter>('all')

  const suggested = useMemo(() => ideas.filter(i => !!i.reasoning), [ideas])
  const mine = useMemo(() => ideas.filter(i => !i.reasoning), [ideas])
  const visible = filter === 'suggested' ? suggested : filter === 'mine' ? mine : ideas

  const collageItems = (itemIds: string[]) => itemIds
    .map(id => items.find(i => i.id === id))
    .filter((i): i is NonNullable<typeof i> => !!i)
    .map(i => ({ id: i.id, name: i.name, category: i.category, signedImageUrl: i.signedImageUrl }))

  if (loading) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  }

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ padding: '4px 22px 0' }}>
        <Disp s={30}>Ideas</Disp>
        <Body s={13.5} style={{ marginTop: 6 }}>{ideas.length} look{ideas.length === 1 ? '' : 's'} you've saved for a day that hasn't happened yet.</Body>
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <Btn kind="peach" icon="spark" full onClick={() => navigate('/suggest')}>Suggest</Btn>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '20px 22px 0', overflowX: 'auto' }}>
        <Pill on={filter === 'all'} s="sm" count={ideas.length} onClick={() => setFilter('all')}>All</Pill>
        <Pill on={filter === 'suggested'} s="sm" count={suggested.length} onClick={() => setFilter('suggested')}>Suggested</Pill>
        <Pill on={filter === 'mine'} s="sm" count={mine.length} onClick={() => setFilter('mine')}>Mine</Pill>
      </div>
      {visible.length === 0 ? (
        <div style={{ padding: '40px 22px 0' }}>
          <Body s={13.5}>
            {ideas.length === 0 ? (
              <>No ideas yet — go to <button onClick={() => navigate('/suggest')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: fS, fontSize: 13.5, color: T.cocoa, textDecoration: 'underline' }}>Suggest</button> and save outfits you like.</>
            ) : `No ${filter} ideas.`}
          </Body>
        </div>
      ) : (
        <div style={{ padding: '18px 22px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {visible.map(idea => {
            const d = new Date(idea.created_at)
            return (
              <button key={idea.id} onClick={() => navigate(`/ideas/${idea.id}`)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', overflow: 'hidden' }}>
                  <Collage items={collageItems(idea.item_ids)} fill />
                  <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 1px ${T.line}`, pointerEvents: 'none' }} />
                  {idea.occasion && (
                    <div style={{ position: 'absolute', top: 9, left: 9, height: 24, display: 'inline-flex', alignItems: 'center', padding: '0 10px', background: 'rgba(247,246,245,.92)', fontFamily: fS, fontSize: 11.5, fontWeight: 600, textTransform: 'capitalize' }}>{idea.occasion}</div>
                  )}
                  {idea.reasoning && (
                    <div style={{ position: 'absolute', bottom: 9, right: 9, width: 24, height: 24, background: 'rgba(247,246,245,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><V4Icon n="spark" s={13} w={1.7} c={T.cocoa} /></div>
                  )}
                </div>
                <div style={{ fontFamily: fS, fontSize: 14, fontWeight: 500, marginTop: 8, lineHeight: 1.35 }}>{outfitTitle(idea.item_ids, items, idea.occasion ?? 'Idea')}</div>
                <div style={{ marginTop: 3 }}><Mono s={10.5}>saved {d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toLowerCase()}</Mono></div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
