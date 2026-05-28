const CAT: Record<string, string> = {
  top: 'top', bottom: 'btm', dress: '1pc', set: '1pc',
  outerwear: 'otw', shoes: 'shoe', accessory: 'acc',
}
export const catLabel = (cat: string): string => CAT[cat] ?? cat
