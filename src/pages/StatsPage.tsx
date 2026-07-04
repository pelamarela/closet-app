import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { AppBar, SectionLabel, MonoTag, MONO, UI, INK, RULE, outfitTitle } from '../components/ui'

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

export default function StatsPage() {
  const navigate = useNavigate()
  const { items } = useItems()
  const { outfits } = useOutfits()

  const bySeasonTopItems = useMemo(() => {
    const counts: Record<Season, Record<string, number>> = { winter: {}, spring: {}, summer: {}, fall: {} }
    for (const o of outfits) {
      const season = seasonOf(o.date_worn)
      for (const id of o.item_ids) counts[season][id] = (counts[season][id] ?? 0) + 1
    }
    const itemById = new Map(items.map(i => [i.id, i]))
    const result: Record<Season, { item: typeof items[number]; count: number }[]> = { winter: [], spring: [], summer: [], fall: [] }
    for (const season of SEASONS) {
      result[season] = Object.entries(counts[season])
        .map(([id, count]) => ({ item: itemById.get(id), count }))
        .filter((r): r is { item: typeof items[number]; count: number } => !!r.item)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }
    return result
  }, [outfits, items])

  const byCategory = useMemo(() => {
    const groups: Record<string, typeof outfits> = {}
    for (const o of outfits) {
      const key = (o.occasion?.trim() || 'uncategorized').toLowerCase()
      groups[key] = groups[key] ?? []
      groups[key].push(o)
    }
    return Object.entries(groups)
      .map(([category, list]) => {
        const comboCounts = new Map<string, { item_ids: string[]; count: number }>()
        for (const o of list) {
          const key = [...o.item_ids].sort().join(',')
          const existing = comboCounts.get(key)
          if (existing) existing.count += 1
          else comboCounts.set(key, { item_ids: o.item_ids, count: 1 })
        }
        const topCombo = [...comboCounts.values()].sort((a, b) => b.count - a.count)[0]
        return { category, count: list.length, topCombo }
      })
      .sort((a, b) => b.count - a.count)
  }, [outfits])

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
        <>
          <div style={{ padding: '20px 20px 0' }}>
            <SectionLabel>most worn by season</SectionLabel>
            {SEASONS.filter(s => bySeasonTopItems[s].length > 0).map(season => (
              <div key={season} style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  {season}
                </div>
                <div style={{ borderTop: RULE }}>
                  {bySeasonTopItems[season].map(({ item, count }, i) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/wardrobe/${item.id}`)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '9px 0', borderBottom: RULE, cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)' }}>0{i + 1}</span>
                        <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 500, color: INK, letterSpacing: '-0.005em' }}>{item.name}</span>
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)' }}>{count}×</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '4px 20px 0' }}>
            <SectionLabel>most worn by category</SectionLabel>
            <div style={{ borderTop: RULE }}>
              {byCategory.map(({ category, count, topCombo }) => (
                <div key={category} style={{ padding: '11px 0', borderBottom: RULE }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <MonoTag accent>{titleCase(category)}</MonoTag>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.5)' }}>{count} logged</span>
                  </div>
                  {topCombo && topCombo.count > 1 && (
                    <div style={{ fontFamily: UI, fontSize: 12.5, color: 'rgba(0,0,0,0.65)', marginTop: 6, letterSpacing: '-0.005em' }}>
                      Repeated most: {outfitTitle(topCombo.item_ids, items, 'outfit')} · {topCombo.count}×
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
