import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useItems, type ItemWithSignedUrl } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { AppBar, SectionLabel, MONO, UI, INK, RULE, outfitTitle } from '../components/ui'
import ItemCollage from '../components/ItemCollage'

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

// Main pieces (the outfit's actual silhouette) get their own "most worn"
// ranking, separate from shoes/accessories/fragrance — otherwise those
// dominate the list purely because they get re-worn far more often than
// any single garment.
const MAIN_CATEGORIES = new Set(['top', 'bottom', 'one-piece', 'outerwear'])
const WEAR_TIERS = ['main', 'shoes', 'accessory', 'fragrance'] as const
type WearTier = typeof WEAR_TIERS[number]
const wearTierOf = (category: string): WearTier =>
  MAIN_CATEGORIES.has(category) ? 'main' : category === 'shoes' ? 'shoes' : category === 'accessory' ? 'accessory' : 'fragrance'

function titleCase(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1)
}

function Dropdown({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          fontFamily: MONO, fontSize: 11, fontWeight: 700, color: INK,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          background: '#fff', border: `1px solid ${INK}`, borderRadius: 4,
          padding: '7px 28px 7px 10px', cursor: 'pointer',
          WebkitAppearance: 'none' as const, appearance: 'none' as const,
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg
        width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  )
}

function ItemThumb({ item, count, onClick }: { item: ItemWithSignedUrl; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: '#ECEAE6', borderRadius: 3, overflow: 'hidden' }}>
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

export default function StatsPage() {
  const navigate = useNavigate()
  const { items } = useItems()
  const { outfits } = useOutfits()
  const { isDesktop } = useBreakpoint()

  const itemById = useMemo(() => new Map(items.map(i => [i.id, i])), [items])

  // Latest season first — both the dropdown order and the default selection
  // start from whatever season it is right now and cycle backward from there.
  const seasonOrder = useMemo(() => {
    const current = seasonOf(new Date().toISOString().slice(0, 10))
    const idx = SEASONS.indexOf(current)
    return [...SEASONS.slice(idx), ...SEASONS.slice(0, idx)]
  }, [])

  type TierBucket = { item: ItemWithSignedUrl; count: number }[]
  const bySeasonTopItems = useMemo(() => {
    const counts: Record<Season, Record<string, number>> = { winter: {}, spring: {}, summer: {}, fall: {} }
    for (const o of outfits) {
      const season = seasonOf(o.date_worn)
      for (const id of o.item_ids) counts[season][id] = (counts[season][id] ?? 0) + 1
    }
    const empty = (): Record<WearTier, TierBucket> => ({ main: [], shoes: [], accessory: [], fragrance: [] })
    const result: Record<Season, Record<WearTier, TierBucket>> = { winter: empty(), spring: empty(), summer: empty(), fall: empty() }
    // Multiples of 3 (main/shoes/accessory) so mobile's fixed 3-column grid
    // never strands a single lonely item on its own last row.
    const tierLimits: Record<WearTier, number> = { main: 12, shoes: 12, accessory: 12, fragrance: 5 }
    for (const season of SEASONS) {
      const entries = Object.entries(counts[season])
        .map(([id, count]) => ({ item: itemById.get(id), count }))
        .filter((r): r is { item: ItemWithSignedUrl; count: number } => !!r.item)
      const byTier = empty()
      for (const entry of entries) byTier[wearTierOf(entry.item.category)].push(entry)
      for (const tier of WEAR_TIERS) {
        byTier[tier] = byTier[tier].sort((a, b) => b.count - a.count).slice(0, tierLimits[tier])
      }
      result[season] = byTier
    }
    return result
  }, [outfits, itemById])

  const seasonHasData = (s: Season) => WEAR_TIERS.some(tier => bySeasonTopItems[s][tier].length > 0)
  const availableSeasons = seasonOrder.filter(seasonHasData)
  const [season, setSeason] = useState<Season | null>(null)
  const activeSeason = (season && seasonHasData(season)) ? season : availableSeasons[0]

  const byCategory = useMemo(() => {
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
  }, [outfits, itemById])

  const [category, setCategory] = useState<string | null>(null)
  const activeCategory = (category && byCategory.some(c => c.category === category)) ? category : byCategory[0]?.category
  const activeCategoryData = byCategory.find(c => c.category === activeCategory)

  const hasData = outfits.length > 0
  const [view, setView] = useState<'season' | 'occasions'>('season')

  return (
    <div style={{ paddingBottom: 40 }}>
      <AppBar title="Statistics" back onBack={() => navigate('/settings')} meta={`${outfits.length} logged`} />

      {!hasData && (
        <div style={{ padding: '32px 20px 0', fontFamily: MONO, fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>
          Log some outfits to see stats here.
        </div>
      )}

      {hasData && (
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['season', 'occasions'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  flex: 1, border: `1px solid ${v === view ? INK : 'rgba(0,0,0,0.15)'}`,
                  background: v === view ? INK : 'transparent',
                  color: v === view ? '#fff' : 'rgba(0,0,0,0.55)',
                  padding: '8px 0', textAlign: 'center',
                  fontFamily: MONO, fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >{v === 'season' ? 'Items' : 'Outfits'}</button>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            {view === 'season' ? (
              <>
                <SectionLabel right={
                  activeSeason && (
                    <Dropdown
                      value={activeSeason}
                      onChange={v => setSeason(v as Season)}
                      options={availableSeasons.map(s => ({ value: s, label: titleCase(s) }))}
                    />
                  )
                }>most worn by season</SectionLabel>
                {activeSeason && WEAR_TIERS.map(tier => {
                  const bucket = bySeasonTopItems[activeSeason][tier]
                  if (bucket.length === 0) return null
                  const label = tier === 'main' ? 'main pieces' : tier === 'shoes' ? 'shoes' : tier === 'accessory' ? 'accessories' : 'fragrances'
                  return (
                    <div key={tier} style={{ marginTop: tier === 'main' ? 4 : 20 }}>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                        {label}
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: isDesktop ? 'repeat(auto-fit, minmax(96px, 1fr))' : 'repeat(3, 1fr)',
                        gap: 12,
                      }}>
                        {bucket.map(({ item, count }) => (
                          <ItemThumb key={item.id} item={item} count={count} onClick={() => navigate(`/wardrobe/${item.id}`)} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </>
            ) : (
              <>
                <SectionLabel right={
                  activeCategory && (
                    <Dropdown
                      value={activeCategory}
                      onChange={setCategory}
                      options={byCategory.map(c => ({ value: c.category, label: titleCase(c.category) }))}
                    />
                  )
                }>most worn by occasion</SectionLabel>
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
                            display: 'flex', gap: 16, alignItems: 'center',
                            padding: '16px 0', borderBottom: RULE,
                          }}
                        >
                          <span style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', flexShrink: 0 }}>0{i + 1}</span>
                          <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                            <ItemCollage
                              items={combo.item_ids.map(id => itemById.get(id)).filter((it): it is ItemWithSignedUrl => !!it)}
                              fill
                            />
                          </div>
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
