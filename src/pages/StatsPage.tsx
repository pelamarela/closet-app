import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useItems, type ItemWithSignedUrl } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { AppBar, SectionLabel, MONO, UI, INK, RULE, outfitTitle } from '../components/ui'

// Two outfits count as "the same combination" if their defining pieces match —
// a different fragrance, necklace, or jacket shouldn't split an otherwise
// identical look into separate one-off entries.
const CORE_CATEGORIES = new Set(['top', 'bottom', 'one-piece', 'shoes'])

const SEASONS = ['winter', 'spring', 'summer', 'fall'] as const
type Season = typeof SEASONS[number]

function seasonOf(dateWorn: string): Season {
  const month = Number(dateWorn.slice(5, 7))
  if (month === 12 || month <= 2) return 'winter'
  if (month <= 5) return 'spring'
  if (month <= 8) return 'summer'
  return 'fall'
}

function titleCase(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1)
}

function Dropdown({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        fontFamily: MONO, fontSize: 10, fontWeight: 600, color: INK,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        background: '#fff', border: RULE, borderRadius: 4,
        padding: '6px 8px', cursor: 'pointer',
        WebkitAppearance: 'none' as const, appearance: 'none' as const,
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function ItemThumb({ item, count, onClick }: { item: ItemWithSignedUrl; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', background: '#ECEAE6', borderRadius: 3, overflow: 'hidden' }}>
        {item.signedImageUrl
          ? <img src={item.signedImageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 6px, #DCD9D3 6px 12px)' }} />
        }
        <div style={{
          position: 'absolute', top: 4, right: 4,
          background: 'rgba(10,10,10,0.72)', color: '#fff',
          fontFamily: MONO, fontSize: 9, fontWeight: 600,
          padding: '2px 5px', borderRadius: 3, lineHeight: 1,
        }}>
          {count}×
        </div>
      </div>
      <div style={{
        fontFamily: UI, fontSize: 11, fontWeight: 500, color: INK, letterSpacing: '-0.005em',
        marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {item.name}
      </div>
    </button>
  )
}

function OutfitCollage({ itemIds, items }: { itemIds: string[]; items: ItemWithSignedUrl[] }) {
  const thumbItems = itemIds.slice(0, 4).map(id => items.find(i => i.id === id)).filter(Boolean) as ItemWithSignedUrl[]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, width: 56, height: 68, flexShrink: 0 }}>
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
  )
}

export default function StatsPage() {
  const navigate = useNavigate()
  const { items } = useItems()
  const { outfits } = useOutfits()
  const { isDesktop } = useBreakpoint()

  const bySeasonTopItems = useMemo(() => {
    const counts: Record<Season, Record<string, number>> = { winter: {}, spring: {}, summer: {}, fall: {} }
    for (const o of outfits) {
      const season = seasonOf(o.date_worn)
      for (const id of o.item_ids) counts[season][id] = (counts[season][id] ?? 0) + 1
    }
    const itemById = new Map(items.map(i => [i.id, i]))
    const result: Record<Season, { item: ItemWithSignedUrl; count: number }[]> = { winter: [], spring: [], summer: [], fall: [] }
    for (const season of SEASONS) {
      result[season] = Object.entries(counts[season])
        .map(([id, count]) => ({ item: itemById.get(id), count }))
        .filter((r): r is { item: ItemWithSignedUrl; count: number } => !!r.item)
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
    }
    return result
  }, [outfits, items])

  const availableSeasons = SEASONS.filter(s => bySeasonTopItems[s].length > 0)
  const [season, setSeason] = useState<Season | null>(null)
  const activeSeason = (season && bySeasonTopItems[season].length > 0) ? season : availableSeasons[0]

  const byCategory = useMemo(() => {
    const itemById = new Map(items.map(i => [i.id, i]))
    const groups: Record<string, typeof outfits> = {}
    for (const o of outfits) {
      const key = (o.occasion?.trim() || 'uncategorized').toLowerCase()
      groups[key] = groups[key] ?? []
      groups[key].push(o)
    }
    return Object.entries(groups)
      .map(([category, list]) => {
        const comboCounts = new Map<string, { item_ids: string[]; count: number; outfitId: string }>()
        for (const o of list) {
          const coreIds = o.item_ids.filter(id => CORE_CATEGORIES.has(itemById.get(id)?.category ?? ''))
          // Fall back to the full set on the rare outfit with no core pieces logged,
          // so those don't all collapse into one empty-key bucket together.
          const key = coreIds.length ? [...coreIds].sort().join(',') : [...o.item_ids].sort().join(',')
          const existing = comboCounts.get(key)
          if (existing) existing.count += 1
          else comboCounts.set(key, { item_ids: o.item_ids, count: 1, outfitId: o.id })
        }
        const topCombos = [...comboCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5)
        return { category, count: list.length, topCombos }
      })
      .sort((a, b) => b.count - a.count)
  }, [outfits, items])

  const [category, setCategory] = useState<string | null>(null)
  const activeCategory = (category && byCategory.some(c => c.category === category)) ? category : byCategory[0]?.category
  const activeCategoryData = byCategory.find(c => c.category === activeCategory)

  const hasData = outfits.length > 0

  return (
    <div style={{ paddingBottom: 40 }}>
      <AppBar title="Statistics" back onBack={() => navigate('/settings')} meta={`${outfits.length} logged`} />

      {!hasData && (
        <div style={{ padding: '32px 20px 0', fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>
          Log some outfits to see stats here.
        </div>
      )}

      {hasData && (
        <div style={{
          padding: '20px 20px 0',
          display: isDesktop ? 'grid' : 'block',
          gridTemplateColumns: isDesktop ? '1.3fr 1fr' : undefined,
          gap: isDesktop ? 40 : undefined,
          alignItems: 'start',
        }}>
          <div>
            <SectionLabel right={
              activeSeason && (
                <Dropdown
                  value={activeSeason}
                  onChange={v => setSeason(v as Season)}
                  options={availableSeasons.map(s => ({ value: s, label: titleCase(s) }))}
                />
              )
            }>most worn by season</SectionLabel>
            {activeSeason && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(96px, 1fr))' : 'repeat(3, 1fr)',
                gap: 12, marginTop: 4,
              }}>
                {bySeasonTopItems[activeSeason].map(({ item, count }) => (
                  <ItemThumb key={item.id} item={item} count={count} onClick={() => navigate(`/wardrobe/${item.id}`)} />
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: isDesktop ? 0 : 28 }}>
            <SectionLabel right={
              activeCategory && (
                <Dropdown
                  value={activeCategory}
                  onChange={setCategory}
                  options={byCategory.map(c => ({ value: c.category, label: titleCase(c.category) }))}
                />
              )
            }>most worn by category</SectionLabel>
            {activeCategoryData && (
              <>
                <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.45)', marginTop: 4, marginBottom: 8 }}>
                  {activeCategoryData.count} outfits logged in {activeCategoryData.category}
                </div>
                <div style={{ borderTop: RULE }}>
                  {activeCategoryData.topCombos.map((combo, i) => (
                    <button
                      key={combo.item_ids.join(',')}
                      onClick={() => navigate(`/outfits/${combo.outfitId}`)}
                      style={{
                        width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', gap: 12, alignItems: 'center',
                        padding: '12px 0', borderBottom: RULE,
                      }}
                    >
                      <span style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', flexShrink: 0 }}>0{i + 1}</span>
                      <OutfitCollage itemIds={combo.item_ids} items={items} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 500, color: INK, letterSpacing: '-0.005em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {outfitTitle(combo.item_ids, items, 'outfit')}
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)', marginTop: 3 }}>
                          worn {combo.count}× together
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
