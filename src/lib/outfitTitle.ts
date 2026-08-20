const MAIN_CATS = new Set(['top', 'bottom', 'one-piece', 'outerwear'])
const short = (name: string) => name.split(' ').slice(0, 2).join(' ')

export function outfitTitle(
  itemIds: string[],
  allItems: { id: string; name: string; category: string }[],
  fallback = 'outfit'
): string {
  const picked = allItems.filter(i => itemIds.includes(i.id))
  if (!picked.length) return fallback
  const sorted = [
    ...picked.filter(i => MAIN_CATS.has(i.category)),
    ...picked.filter(i => !MAIN_CATS.has(i.category)),
  ]
  if (sorted.length === 1) return sorted[0].name
  if (sorted.length === 2) return `${short(sorted[0].name)} · ${short(sorted[1].name)}`
  return `${short(sorted[0].name)} + ${sorted.length - 1} more`
}
