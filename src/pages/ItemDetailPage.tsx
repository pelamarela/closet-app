import { useNavigate, useParams } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { useItemMutations } from '../hooks/useItemMutations'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { T, fS, fM, V4Icon, V4Bar, Btn, Row4, DotScale, Disp, Mono, SecH, V4Card, APP_HEADER_H } from '../design/kit'
import Collage from '../design/Collage'

const GARMENT_CAT = new Set(['top', 'bottom', 'one-piece', 'outerwear'])

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { items, loading } = useItems()
  const { outfits, loading: outfitsLoading } = useOutfits()
  const { archiveItem } = useItemMutations()
  const { isDesktop } = useBreakpoint()

  if (loading || outfitsLoading) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>loading…</div>
  }

  const item = items.find(i => i.id === id)
  if (!item) {
    return <div style={{ padding: '40px 22px', fontFamily: fM, fontSize: 11, color: T.g400 }}>Item not found.</div>
  }

  const wornIn = outfits.filter(o => o.item_ids.includes(item.id)).sort((a, b) => b.date_worn.localeCompare(a.date_worn))
  const wearCount = wornIn.length
  const lastWorn = wornIn[0]?.date_worn ?? null
  const firstWorn = wornIn[wornIn.length - 1]?.date_worn ?? null
  let avgPerMonth = 0
  if (firstWorn && wearCount > 0) {
    const first = new Date(firstWorn)
    const now = new Date()
    const months = (now.getFullYear() - first.getFullYear()) * 12 + (now.getMonth() - first.getMonth()) + 1
    avgPerMonth = Math.round((wearCount / months) * 10) / 10
  }

  const collageItems = (itemIds: string[]) => itemIds
    .map(iid => items.find(i => i.id === iid))
    .filter((i): i is NonNullable<typeof i> => !!i)
    .map(i => ({ id: i.id, name: i.name, category: i.category, signedImageUrl: i.signedImageUrl }))

  const handleWearToday = () => {
    navigate('/outfits/new', { state: { preselectedIds: [item.id], date: new Date().toISOString().slice(0, 10) } })
  }
  const handleArchive = async () => { await archiveItem(item.id); navigate('/wardrobe') }

  const attrs: [string, string | null][] = [
    ['Colour', item.color],
    ['Material', item.material],
    ['Pattern', item.pattern],
    ['Brand', item.brand],
    ['Subcategory', item.subcategory],
  ].filter(([, v]) => !!v) as [string, string][]

  const PhotoBlock = (
    <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', background: T.g200 }}>
      {item.signedImageUrl && (
        <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: GARMENT_CAT.has(item.category) ? 'top' : 'center', display: 'block' }} />
      )}
    </div>
  )

  const InfoBlock = (
    <>
      <div>
        <Mono s={11.5} c={T.cocoa}>{[item.brand, item.category].filter(Boolean).join(' · ')}</Mono>
        <Disp s={27} style={{ marginTop: 5 }}>{item.name}</Disp>
      </div>
      <div style={{ marginTop: 18 }}>
        <V4Card fill={T.peach} shadow={false} pad={0} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', overflow: 'hidden' }}>
          {[['Worn', wearCount > 0 ? `${wearCount}×` : '—'], ['Last', lastWorn ?? '—'], ['Average', avgPerMonth > 0 ? `${avgPerMonth} / mo` : '—']].map(([k, v], i) => (
            <div key={i} style={{ padding: '15px 14px', borderLeft: i ? '1px solid rgba(0,0,0,.07)' : 'none' }}>
              <div style={{ fontFamily: fS, fontSize: 11.5, color: T.cocoa, fontWeight: 500 }}>{k}</div>
              <div style={{ fontFamily: fS, fontSize: 17, fontWeight: 600, marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </V4Card>
      </div>
      <div style={{ marginTop: 18 }}>
        <Btn full icon="check" onClick={handleWearToday}>Wear it today</Btn>
      </div>
      <div style={{ marginTop: 26 }}>
        <SecH>Details</SecH>
        {attrs.map(([k, v], i) => <Row4 key={k} label={k} value={v} chev={false} last={i === attrs.length - 1 && item.warmth == null} />)}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 54, borderBottom: `1px solid ${T.line}` }}>
          <span style={{ fontFamily: fS, fontSize: 15 }}>Warmth</span><DotScale v={item.warmth} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 54 }}>
          <span style={{ fontFamily: fS, fontSize: 15 }}>Formality</span><DotScale v={item.formality} tone={T.roseDeep} />
        </div>
      </div>
    </>
  )

  const WornWith = wornIn.length > 0 && (
    <div style={{ marginTop: isDesktop ? 30 : 14 }}>
      <SecH right={`All ${wornIn.length}`} onRightClick={() => navigate('/outfits')}>Worn with</SecH>
      <div style={{ display: 'flex', gap: 9 }}>
        {wornIn.slice(0, 4).map(o => (
          <button key={o.id} onClick={() => navigate(`/outfits/${o.id}`)} style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: '100%', aspectRatio: '3/4', position: 'relative' }}>
              <Collage items={collageItems(o.item_ids)} />
              <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 1px ${T.line}`, pointerEvents: 'none' }} />
            </div>
            <div style={{ marginTop: 5 }}><Mono s={10}>{o.date_worn.slice(8, 10)} {o.date_worn.slice(5, 7)}</Mono></div>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ paddingBottom: 40 }}>
      <V4Bar
        back title="Closet" onBack={() => navigate('/wardrobe')}
        right={<>
          <button onClick={() => navigate(`/wardrobe/${id}/edit`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, padding: 4, display: 'flex' }}><V4Icon n="pen" s={20} w={1.6} /></button>
          <button onClick={handleArchive} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.g400, padding: 4, display: 'flex' }}><V4Icon n="archive" s={19} w={1.6} /></button>
        </>}
      />
      {isDesktop ? (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 44, alignItems: 'start', padding: '10px 0 0' }}>
          <div style={{ position: 'sticky', top: APP_HEADER_H + 20 }}>{PhotoBlock}</div>
          <div>
            {InfoBlock}
            {WornWith}
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: '8px 22px 0' }}>{PhotoBlock}</div>
          <div style={{ padding: '18px 22px 0' }}>{InfoBlock}</div>
          <div style={{ padding: '0 22px 0' }}>{WornWith}</div>
        </>
      )}
    </div>
  )
}
