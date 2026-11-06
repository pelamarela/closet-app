import { motion } from 'motion/react'
import { rise } from '../design/rise'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIdeas } from '../hooks/useIdeas'
import { useItems } from '../hooks/useItems'
import { T, fS, fM, V4Icon, Btn, Pill, Disp, Body } from '../design/kit'
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
      <div style={{ padding: '4px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Disp s={22}>ideas</Disp>
        <Btn kind="peach" icon="spark" onClick={() => navigate('/suggest')} style={{ height: 40, fontSize: 13 }}>suggest</Btn>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '20px 22px 0', overflowX: 'auto' }}>
        <Pill group="ideas" on={filter === 'all'} s="sm" count={ideas.length} onClick={() => setFilter('all')}>all</Pill>
        <Pill group="ideas" on={filter === 'suggested'} s="sm" count={suggested.length} onClick={() => setFilter('suggested')}>suggested</Pill>
        <Pill group="ideas" on={filter === 'mine'} s="sm" count={mine.length} onClick={() => setFilter('mine')}>mine</Pill>
      </div>
      {visible.length === 0 ? (
        <div style={{ padding: '40px 22px 0' }}>
          <Body s={13.5}>
            {ideas.length === 0 ? (
              <>no ideas yet — go to <button onClick={() => navigate('/suggest')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: fS, fontSize: 13.5, color: T.cocoa, textDecoration: 'underline' }}>suggest</button> and save outfits you like.</>
            ) : `no ${filter} ideas`}
          </Body>
        </div>
      ) : (
        <div style={{ padding: '18px 22px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {visible.map((idea, i) => {
            return (
              <motion.button key={idea.id} {...rise(i)} whileTap={{ scale: 0.97 }} onClick={() => navigate(`/ideas/${idea.id}`)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Collage items={collageItems(idea.item_ids)} maxSmall={4} />
                  {idea.occasion && (
                    <div style={{ position: 'absolute', top: 9, left: 9, height: 24, display: 'inline-flex', alignItems: 'center', padding: '0 10px', borderRadius: 2, background: T.paper, fontFamily: fS, fontSize: 11.5, fontWeight: 600 }}>{idea.occasion}</div>
                  )}
                  {idea.reasoning && (
                    <div style={{ position: 'absolute', bottom: 9, right: 9, width: 24, height: 24, borderRadius: 2, background: T.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><V4Icon n="spark" s={13} w={1.7} c={T.cocoa} /></div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}
