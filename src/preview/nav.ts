// Navigation handle passed to every prototype screen.
export type Tab = 'today' | 'closet' | 'ideas' | 'me'
export type ViewName = 'item' | 'add' | 'suggest' | 'shop' | 'idea' | 'month' | 'stats' | 'profile' | 'archive' | 'constants' | 'password' | 'login' | 'outfit'
export type Nav = {
  go: (name: ViewName, id?: number) => void
  back: () => void
  tab: (t: Tab) => void
  log: (pieces?: number[], date?: string) => void
}
