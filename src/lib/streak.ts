// Consecutive days logged, counting back from today. Breaks on the first
// gap — a day more than 1 back with nothing logged ends the streak.
export function calcStreak(outfits: { date_worn: string }[]): number {
  const dates = new Set(outfits.map(o => o.date_worn))
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const s = d.toISOString().slice(0, 10)
    if (dates.has(s)) streak++
    else if (i > 0) break
  }
  return streak
}
