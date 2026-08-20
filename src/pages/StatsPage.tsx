import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useItems, type ItemWithSignedUrl } from '../hooks/useItems'
import { useOutfits, type OutfitWithItems } from '../hooks/useOutfits'
import { outfitTitle } from '../lib/outfitTitle'
import { bucketColor, type ColorBucket } from '../lib/colorBuckets'
import { T, fS, V4Bar, Pill, Dropdown, Disp, Body, Mono, BarStat, APP_HEADER_H } from '../design/kit'
import Collage from '../design/Collage'

type Tab = 'pieces' | 'outfits' | 'colour'
type Grain = 'Weekly' | 'Monthly' | 'Yearly'
const GARMENT_CATS = new Set(['top', 'bottom', 'one-piece', 'outerwear', 'shoes', 'accessory'])
const CORE_CATEGORIES = new Set(['top', 'bottom', 'one-piece', 'shoes'])
const DOW_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const BRAND_RAMP = [T.cocoaDeep, T.cocoa, T.cocoaSoft, '#A47A61', T.roseDeep, T.rose, '#E5C3B6', '#EFD8C9']

function isoWeekLabel(d: Date) {
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toLowerCase()
}
function mondayOf(d: Date) {
  const day = d.getDay()
  const offset = day === 0 ? -6 : 1 - day
  const m = new Date(d)
  m.setDate(d.getDate() + offset)
  return m
}

// Scopes outfits to the current week/month/year for the grain selector —
// "current", not a trailing window, since the Colour tab shows a single
// snapshot rather than a trend over time.
function filterByGrain(outfits: OutfitWithItems[], grain: Grain): OutfitWithItems[] {
  const now = new Date()
  if (grain === 'Weekly') {
    const start = mondayOf(now)
    const s = start.toISOString().slice(0, 10)
    const end = new Date(start); end.setDate(start.getDate() + 6)
    const e = end.toISOString().slice(0, 10)
    return outfits.filter(o => o.date_worn >= s && o.date_worn <= e)
  }
  if (grain === 'Yearly') {
    const y = String(now.getFullYear())
    return outfits.filter(o => o.date_worn.startsWith(y))
  }
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return outfits.filter(o => o.date_worn.startsWith(prefix))
}

export default function StatsPage() {
  const navigate = useNavigate()
  const { items } = useItems()
  const { outfits } = useOutfits()
  const [tab, setTab] = useState<Tab>('pieces')
  const [grain, setGrain] = useState<Grain>('Monthly')

  const itemById = useMemo(() => new Map(items.map(i => [i.id, i])), [items])
  const wearCount = useMemo(() => {
    const map: Record<string, number> = {}
    for (const o of outfits) for (const id of o.item_ids) map[id] = (map[id] ?? 0) + 1
    return map
  }, [outfits])

  const collageItems = (itemIds: string[]) => itemIds
    .map(id => itemById.get(id))
    .filter((i): i is ItemWithSignedUrl => !!i)
    .map(i => ({ id: i.id, name: i.name, category: i.category, signedImageUrl: i.signedImageUrl }))

  if (outfits.length === 0) {
    return (
      <div style={{ paddingBottom: 40 }}>
        <V4Bar back title="Me" onBack={() => navigate('/settings')} />
        <div style={{ padding: '20px 22px 0' }}><Body s={14}>Log some outfits to see stats here.</Body></div>
      </div>
    )
  }

  const Head = (
    <div style={{ position: 'sticky', top: APP_HEADER_H, zIndex: 25, background: T.paper, paddingBottom: 10, borderBottom: `1px solid ${T.line}` }}>
      <V4Bar sticky={false} back title="Me" onBack={() => navigate('/settings')} right={<Dropdown<Grain> value={grain} options={['Weekly', 'Monthly', 'Yearly']} onChange={setGrain} />} />
      <div style={{ padding: '8px 22px 0' }}><Disp s={29}>Statistics</Disp></div>
      <div style={{ display: 'flex', gap: 8, padding: '14px 22px 0' }}>
        <Pill on={tab === 'pieces'} s="sm" onClick={() => setTab('pieces')}>Pieces</Pill>
        <Pill on={tab === 'outfits'} s="sm" onClick={() => setTab('outfits')}>Outfits</Pill>
        <Pill on={tab === 'colour'} s="sm" onClick={() => setTab('colour')}>Colour</Pill>
      </div>
    </div>
  )

  return (
    <div style={{ paddingBottom: 40 }}>
      {Head}
      {tab === 'pieces' && <PiecesTab items={items} wearCount={wearCount} navigate={navigate} />}
      {tab === 'outfits' && <OutfitsTab outfits={outfits} items={items} itemById={itemById} grain={grain} collageItems={collageItems} navigate={navigate} />}
      {tab === 'colour' && <ColourTab outfits={outfits} itemById={itemById} grain={grain} />}
    </div>
  )
}

// ── Pieces ──────────────────────────────────────────────────────────────
function PiecesTab({ items, wearCount, navigate }: {
  items: ItemWithSignedUrl[]; wearCount: Record<string, number>; navigate: (path: string) => void
}) {
  const wearable = items.filter(i => i.category !== 'fragrance')
  const mostWorn = [...wearable].filter(i => (wearCount[i.id] ?? 0) > 0).sort((a, b) => (wearCount[b.id] ?? 0) - (wearCount[a.id] ?? 0)).slice(0, 5)
  const leastWorn = [...wearable].sort((a, b) => (wearCount[a.id] ?? 0) - (wearCount[b.id] ?? 0)).slice(0, 5)

  const brandTotals: Record<string, number> = {}
  for (const i of wearable) if (i.brand) brandTotals[i.brand] = (brandTotals[i.brand] ?? 0) + (wearCount[i.id] ?? 0)
  const brands = Object.entries(brandTotals).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxBrand = brands[0]?.[1] ?? 1

  const catCounts: Record<string, number> = {}
  for (const i of items) catCounts[i.category] = (catCounts[i.category] ?? 0) + 1
  const catTotal = items.length || 1
  const catList = Object.entries(catCounts).sort((a, b) => b[1] - a[1])

  const Row = ({ item }: { item: ItemWithSignedUrl }) => (
    <button onClick={() => navigate(`/wardrobe/${item.id}`)} style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
      <div style={{ width: '100%', aspectRatio: '3/4', overflow: 'hidden', background: T.g200 }}>
        {item.signedImageUrl && <img src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
      </div>
      <div style={{ textAlign: 'center', marginTop: 6 }}><Mono s={11} c={T.ink} style={{ fontWeight: 700 }}>{wearCount[item.id] ?? 0}×</Mono></div>
    </button>
  )

  return (
    <div style={{ padding: '24px 22px 0' }}>
      <Disp s={20}>Most and least worn</Disp>
      <Body s={13.5} style={{ marginTop: 5 }}>Fragrance excluded — this is about what you put on, not what you spritz.</Body>
      {mostWorn.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>Reached for most</div>
          <div style={{ display: 'flex', gap: 7 }}>{mostWorn.map(i => <Row key={i.id} item={i} />)}</div>
        </div>
      )}
      {leastWorn.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>Left hanging</div>
          <div style={{ display: 'flex', gap: 7, opacity: .8 }}>{leastWorn.map(i => <Row key={i.id} item={i} />)}</div>
        </div>
      )}
      {brands.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <Disp s={20}>Labels you trust</Disp>
          <Body s={13.5} style={{ marginTop: 5, marginBottom: 16 }}>Counted by pieces worn, not pieces owned.</Body>
          {brands.map(([name, v], i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 7 }}>
              <div style={{ width: 110, flexShrink: 0, fontFamily: fS, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
              <div style={{ flex: 1, height: 24, background: '#EFEDEA' }}>
                <div style={{ width: `${(v / maxBrand) * 100}%`, height: 24, background: BRAND_RAMP[i % BRAND_RAMP.length], display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
                  <Mono s={11} c={i < 4 ? '#fff' : T.ink} style={{ fontWeight: 700 }}>{v}</Mono>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 32 }}>
        <Disp s={20}>What the closet is made of</Disp>
        <div style={{ display: 'flex', height: 14, marginTop: 14 }}>
          {catList.map(([cat, v], i) => <div key={cat} style={{ flex: v, background: BRAND_RAMP[i % BRAND_RAMP.length] }} />)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 14 }}>
          {catList.map(([cat, v], i) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 9, height: 9, background: BRAND_RAMP[i % BRAND_RAMP.length] }} />
              <span style={{ fontFamily: fS, fontSize: 12.5, textTransform: 'capitalize' }}>{cat}</span><Mono s={11}>{v}</Mono>
            </div>
          ))}
        </div>
        <Mono s={10} style={{ display: 'block', marginTop: 6 }}>{catTotal} pieces total</Mono>
      </div>
    </div>
  )
}

// ── Outfits ─────────────────────────────────────────────────────────────
function OutfitsTab({ outfits, items, itemById, grain, collageItems, navigate }: {
  outfits: OutfitWithItems[]; items: ItemWithSignedUrl[]; itemById: Map<string, ItemWithSignedUrl>; grain: Grain
  collageItems: (ids: string[]) => { id: string; name: string; category: string; signedImageUrl: string | null }[]
  navigate: (path: string) => void
}) {
  const trend = useMemo(() => {
    const now = new Date()
    if (grain === 'Weekly') {
      return Array.from({ length: 10 }, (_, i) => {
        const start = mondayOf(now); start.setDate(start.getDate() - (9 - i) * 7)
        const end = new Date(start); end.setDate(start.getDate() + 6)
        const s = start.toISOString().slice(0, 10), e = end.toISOString().slice(0, 10)
        return { label: isoWeekLabel(start), count: outfits.filter(o => o.date_worn >= s && o.date_worn <= e).length }
      })
    }
    if (grain === 'Yearly') {
      const years = [...new Set(outfits.map(o => o.date_worn.slice(0, 4)))].sort()
      return years.map(y => ({ label: y, count: outfits.filter(o => o.date_worn.startsWith(y)).length }))
    }
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return { label: d.toLocaleDateString('en-US', { month: 'short' }).toLowerCase(), count: outfits.filter(o => o.date_worn.startsWith(prefix)).length }
    })
  }, [outfits, grain])
  const maxTrend = Math.max(...trend.map(t => t.count), 1)

  const occCounts: Record<string, number> = {}
  for (const o of outfits) if (o.occasion) occCounts[o.occasion] = (occCounts[o.occasion] ?? 0) + 1
  const occList = Object.entries(occCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxOcc = occList[0]?.[1] ?? 1

  const weekday = outfits.filter(o => { const d = new Date(o.date_worn + 'T00:00:00').getDay(); return d >= 1 && d <= 5 })
  const weekend = outfits.filter(o => { const d = new Date(o.date_worn + 'T00:00:00').getDay(); return d === 0 || d === 6 })
  const avgPieces = (list: OutfitWithItems[]) => list.length ? Math.round((list.reduce((s, o) => s + o.item_ids.length, 0) / list.length) * 10) / 10 : 0
  const topOcc = (list: OutfitWithItems[]) => {
    const c: Record<string, number> = {}
    list.forEach(o => { if (o.occasion) c[o.occasion] = (c[o.occasion] ?? 0) + 1 })
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k)
  }

  const combos = useMemo(() => {
    const map = new Map<string, { item_ids: string[]; count: number; outfitId: string }>()
    for (const o of outfits) {
      const coreIds = o.item_ids.filter(id => CORE_CATEGORIES.has(itemById.get(id)?.category ?? ''))
      const key = (coreIds.length ? coreIds : o.item_ids).slice().sort().join(',')
      const existing = map.get(key)
      if (existing) existing.count += 1
      else map.set(key, { item_ids: o.item_ids, count: 1, outfitId: o.id })
    }
    return [...map.values()].filter(c => c.count > 1).sort((a, b) => b.count - a.count).slice(0, 5)
  }, [outfits, itemById])

  return (
    <div style={{ padding: '24px 22px 0' }}>
      <Disp s={20}>Logged each {grain === 'Yearly' ? 'year' : grain === 'Weekly' ? 'week' : 'month'}</Disp>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110, marginTop: 16, overflowX: trend.length > 12 ? 'auto' : 'visible' }}>
        {trend.map((t, i) => (
          <div key={i} style={{ flex: 1, minWidth: grain === 'Weekly' ? 26 : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Mono s={9.5} c={i === trend.length - 1 ? T.ink : T.g400} style={{ fontWeight: i === trend.length - 1 ? 700 : 400 }}>{t.count}</Mono>
            <div style={{ width: '100%', height: Math.max((t.count / maxTrend) * 68, 2), background: i === trend.length - 1 ? T.cocoa : T.peachDeep }} />
            <Mono s={9} style={{ whiteSpace: 'nowrap' }}>{t.label}</Mono>
          </div>
        ))}
      </div>
      {occList.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <Disp s={20}>Where you actually go</Disp>
          <div style={{ marginTop: 10 }}>{occList.map(([label, v], i) => <BarStat key={label} label={label} v={v} max={maxOcc} suffix=" looks" tone={i === 0 ? T.cocoa : T.rose} />)}</div>
        </div>
      )}
      {weekday.length > 0 && weekend.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <Mono s={11} style={{ display: 'block', marginBottom: 8 }}>weekday vs. weekend</Mono>
          {([['Weekday', weekday], ['Weekend', weekend]] as const).map(([label, list], i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '7px 0', borderBottom: i === 0 ? `1px solid ${T.line}` : 'none' }}>
              <div style={{ fontFamily: fS, fontSize: 13, fontWeight: 500, width: 66, flexShrink: 0 }}>{label}</div>
              <div style={{ flex: 1, minWidth: 0, fontFamily: fS, fontSize: 12.5, color: T.g500, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topOcc(list).join(', ') || '—'}</div>
              <Mono s={11.5} c={T.cocoa} style={{ flexShrink: 0 }}>{avgPieces(list)} pcs/look</Mono>
            </div>
          ))}
        </div>
      )}
      {combos.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <Disp s={20}>Combinations you repeat</Disp>
          <div style={{ display: 'flex', gap: 7, marginTop: 14 }}>
            {combos.map((c, i) => (
              <button key={i} onClick={() => navigate(`/outfits/${c.outfitId}`)} style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '100%', aspectRatio: '3/4', overflow: 'hidden', background: T.g200 }}><Collage items={collageItems(c.item_ids)} /></div>
                <div style={{ textAlign: 'center', marginTop: 6 }}><Mono s={11} c={T.ink} style={{ fontWeight: 700 }}>{c.count}×</Mono></div>
                <div style={{ marginTop: 2, fontFamily: fS, fontSize: 11, color: T.g500, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{outfitTitle(c.item_ids, items, 'Outfit')}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Dominant colours of an outfit's garments (clothing only, no fragrance),
// ranked by how many pieces carry each colour — top 3.
function outfitBuckets(o: OutfitWithItems, itemById: Map<string, ItemWithSignedUrl>): ColorBucket[] {
  const freq: Record<string, ColorBucket> = {}
  const counts: Record<string, number> = {}
  for (const id of o.item_ids) {
    const item = itemById.get(id)
    if (!item || !GARMENT_CATS.has(item.category)) continue
    const b = bucketColor(item.color)
    if (!b) continue
    freq[b.key] = b
    counts[b.key] = (counts[b.key] ?? 0) + 1
  }
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 3).map(k => freq[k])
}

// ── Colour ──────────────────────────────────────────────────────────────
function ColourTab({ outfits, itemById, grain }: { outfits: OutfitWithItems[]; itemById: Map<string, ItemWithSignedUrl>; grain: Grain }) {
  const scoped = useMemo(() => filterByGrain(outfits, grain), [outfits, grain])

  const palettes = useMemo(() => {
    const map = new Map<string, { buckets: ColorBucket[]; count: number }>()
    for (const o of scoped) {
      const buckets = outfitBuckets(o, itemById)
      if (buckets.length === 0) continue
      const key = buckets.map(b => b.key).sort().join(',')
      const existing = map.get(key)
      if (existing) existing.count += 1
      else map.set(key, { buckets, count: 1 })
    }
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 5)
  }, [scoped, itemById])

  const byWeekday = useMemo(() => {
    const buckets: Record<number, Record<string, number>> = {}
    for (let d = 0; d < 7; d++) buckets[d] = {}
    for (const o of scoped) {
      const dow = new Date(o.date_worn + 'T00:00:00').getDay()
      for (const b of outfitBuckets(o, itemById)) buckets[dow][b.key] = (buckets[dow][b.key] ?? 0) + 1
    }
    return Array.from({ length: 7 }, (_, i) => {
      const day = (i + 1) % 7 // start Monday
      const entries = Object.entries(buckets[day])
      const total = entries.reduce((s, [, v]) => s + v, 0) || 1
      const top = entries.sort((a, b) => b[1] - a[1]).slice(0, 3)
      return { label: DOW_FULL[day], segs: top.map(([key, v]) => ({ key, pct: Math.round((v / total) * 100) })) }
    })
  }, [scoped, itemById])
  const bucketByKey = new Map<string, ColorBucket>()
  scoped.forEach(o => outfitBuckets(o, itemById).forEach(b => bucketByKey.set(b.key, b)))

  const periodLabel = grain === 'Weekly' ? 'this week' : grain === 'Yearly' ? 'this year' : 'this month'

  if (palettes.length === 0) {
    return <div style={{ padding: '24px 22px 0' }}><Body s={14}>No outfits with colours logged {periodLabel}.</Body></div>
  }

  return (
    <div style={{ padding: '24px 22px 0' }}>
      <Disp s={20}>Signature palettes</Disp>
      <Body s={13.5} style={{ marginTop: 5, marginBottom: 16 }}>The colour combinations you build looks from most.</Body>
      {palettes.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: i < palettes.length - 1 ? `1px solid ${T.line}` : 'none' }}>
          <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
            {p.buckets.map(b => <div key={b.key} style={{ width: 38, height: 44, background: b.hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08)' }} />)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: fS, fontSize: 14, fontWeight: 500 }}>{p.buckets.map(b => b.label).join(', ')}</div>
            <div style={{ marginTop: 2 }}><Mono s={11}>worn {p.count} time{p.count === 1 ? '' : 's'}</Mono></div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 30 }}>
        <Disp s={20}>Colour through the week</Disp>
        <Body s={13.5} style={{ marginTop: 5, marginBottom: 16 }}>Dominant colours logged on each weekday.</Body>
        <div style={{ display: 'flex', gap: 6, height: 140 }}>
          {byWeekday.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column-reverse' }}>
                {d.segs.map(s => <div key={s.key} style={{ height: `${s.pct}%`, background: bucketByKey.get(s.key)?.hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.07)' }} />)}
              </div>
              <div style={{ textAlign: 'center' }}><Mono s={10}>{d.label.slice(0, 1)}</Mono></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
