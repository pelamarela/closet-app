const CAT: Record<string, string> = {
  top: 'top', bottom: 'btm', 'one-piece': '1pc', set: '1pc',
  outerwear: 'otw', shoes: 'shoe', accessory: 'acc', fragrance: 'frag',
}
export const catLabel = (cat: string): string => CAT[cat] ?? cat
