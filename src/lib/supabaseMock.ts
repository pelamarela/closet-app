// DEV only: a tiny in-memory stand-in for Supabase so logged-in screens can be looked at without a login.
// Switched on with ?mock=1 (and off with ?mock=0). Photos are the local, gitignored ones in public/preview/items.
/* eslint-disable @typescript-eslint/no-explicit-any */

type Row = Record<string, any>
type Entry = { file: string; cat: string; name: string }

const USER = { id: 'mock-user', email: 'mock@closet.app' }
const iso = (d: Date) => d.toISOString().slice(0, 10)

let tables: Record<string, Row[]> | null = null
let readyPromise: Promise<void> | null = null
// loaded on first use, so importing this file (it is bundled but never used in production) does nothing
const loadFixtures = (): Promise<void> => readyPromise ??= fetch('/preview/items/manifest.json').then(r => r.json()).then((m: Entry[]) => {
  const by = (cat: string, n: number) => m.filter(e => e.cat === cat).slice(0, n)
  const picked = [...by('top', 12), ...by('bottom', 10), ...by('one-piece', 6), ...by('outerwear', 6), ...by('shoes', 8), ...by('accessory', 12), ...by('fragrance', 3)]
  const now = Date.now()
  const items: Row[] = picked.map((e, i) => ({
    id: `item-${i}`, user_id: USER.id, name: e.name.replace(/-/g, ' ').toLowerCase(), category: e.cat, subcategory: null, color: ['cream', 'black', 'navy', 'olive', 'blush'][i % 5],
    pattern: null, material: null, warmth: (i % 5) + 1, formality: ((i * 2) % 5) + 1, sport: false, brand: null, image_url: `/preview/items/${e.file}`,
    status: 'active', created_at: new Date(now - i * 86400000).toISOString(),
  }))
  const ids = (cat: string) => items.filter(i => i.category === cat).map(i => i.id)
  const pick = (cat: string, k: number) => { const a = ids(cat); return a[k % a.length] }
  const outfits: Row[] = []
  const outfitItems: Row[] = []
  for (let d = 0; d < 14; d++) {
    if (d % 3 === 2) continue
    const id = `outfit-${d}`
    const date = new Date(now - d * 86400000)
    const set = d % 4 === 1
      ? [pick('one-piece', d), pick('shoes', d), pick('accessory', d), pick('accessory', d + 1), pick('accessory', d + 2), pick('accessory', d + 3), pick('accessory', d + 4), pick('fragrance', d)]
      : [pick('top', d), pick('bottom', d), pick('outerwear', d), pick('shoes', d), pick('accessory', d), pick('accessory', d + 1)]
    outfits.push({ id, user_id: USER.id, date_worn: iso(date), occasion: ['work', 'casual', 'dinner', 'weekend'][d % 4], weather: { temp_c: 11, conditions: 'cloudy' }, rating: (d % 5) + 1, image_url: null, notes: d === 0 ? 'felt right' : null, created_at: date.toISOString() })
    set.forEach(item_id => outfitItems.push({ outfit_id: id, item_id }))
  }
  const ideasRows: Row[] = [0, 1, 2, 3].map(k => ({ id: `idea-${k}`, user_id: USER.id, occasion: ['work', 'evening', 'casual', null][k], reasoning: k % 2 ? 'soft layers for a cool day' : null, created_at: new Date(now - k * 86400000).toISOString() }))
  const ideaItems: Row[] = []
  ideasRows.forEach((idea, k) => [pick('top', k + 3), pick('bottom', k + 2), pick('shoes', k + 1), pick('accessory', k), pick('accessory', k + 5)].forEach(item_id => ideaItems.push({ idea_id: idea.id, item_id })))
  tables = {
    items, outfits, outfit_items: outfitItems, outfit_ideas: ideasRows, idea_items: ideaItems,
    constants: [0, 1, 2].map(k => ({ id: `const-${k}`, user_id: USER.id, name: ['watch', 'ring', 'perfume'][k], image_url: items.find(i => i.category === (k === 2 ? 'fragrance' : 'accessory'))!.image_url, created_at: new Date(now - k * 86400000).toISOString() })),
    style_profile: [{ id: 'sp', user_id: USER.id, description: 'soft neutrals, relaxed shapes', color_season: 'soft-autumn' }],
    suggestion_feedback: [],
  }
})

class Query {
  private filters: ((r: Row) => boolean)[] = []
  private ord: { col: string; asc: boolean } | null = null
  private lim: number | null = null
  private one = false
  private join: string | null = null
  private op: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private payload: any = null
  private table: string
  constructor(table: string) { this.table = table }
  select(cols?: string) {
    const m = cols?.match(/(outfit_items|idea_items)\(/)
    this.join = m ? m[1] : null
    return this
  }
  eq(c: string, v: any) { this.filters.push(r => r[c] === v); return this }
  neq(c: string, v: any) { this.filters.push(r => r[c] !== v); return this }
  in(c: string, v: any[]) { this.filters.push(r => v.includes(r[c])); return this }
  is(c: string, v: any) { this.filters.push(r => (r[c] ?? null) === v); return this }
  gte(c: string, v: any) { this.filters.push(r => r[c] >= v); return this }
  lte(c: string, v: any) { this.filters.push(r => r[c] <= v); return this }
  order(col: string, o?: { ascending?: boolean }) { this.ord = { col, asc: o?.ascending !== false }; return this }
  limit(n: number) { this.lim = n; return this }
  single() { this.one = true; return this }
  maybeSingle() { this.one = true; return this }
  insert(p: any) { this.op = 'insert'; this.payload = p; return this }
  upsert(p: any) { this.op = 'insert'; this.payload = p; return this }
  update(p: any) { this.op = 'update'; this.payload = p; return this }
  delete() { this.op = 'delete'; return this }
  private run() {
    const t = tables![this.table]
    if (this.op === 'insert') {
      const arr = (Array.isArray(this.payload) ? this.payload : [this.payload]).map((r: Row) => ({ id: r.id ?? `${this.table}-${Math.random().toString(36).slice(2, 8)}`, created_at: new Date().toISOString(), ...r }))
      t.push(...arr)
      return { data: this.one ? arr[0] : arr, error: null }
    }
    let rows = t.filter(r => this.filters.every(f => f(r)))
    if (this.op === 'update') { rows.forEach(r => Object.assign(r, this.payload)); return { data: this.one ? rows[0] : rows, error: null } }
    if (this.op === 'delete') { tables![this.table] = t.filter(r => !rows.includes(r)); return { data: null, error: null } }
    if (this.ord) rows = [...rows].sort((a, b) => (a[this.ord!.col] > b[this.ord!.col] ? 1 : -1) * (this.ord!.asc ? 1 : -1))
    if (this.lim != null) rows = rows.slice(0, this.lim)
    if (this.join) {
      const j = this.join
      const key = j === 'outfit_items' ? 'outfit_id' : 'idea_id'
      rows = rows.map(r => ({ ...r, [j]: tables![j].filter(x => x[key] === r.id).map(x => ({ item_id: x.item_id })) }))
    }
    return { data: this.one ? rows[0] ?? null : rows, error: null }
  }
  then(res: (v: any) => any, rej?: (e: any) => any) { return loadFixtures().then(() => this.run()).then(res, rej) }
}

export const supabaseMock: any = {
  from: (t: string) => new Query(t),
  storage: {
    from: () => ({
      createSignedUrls: async (paths: string[]) => ({ data: paths.map(p => ({ path: p, signedUrl: p })), error: null }),
      createSignedUrl: async (p: string) => ({ data: { signedUrl: p }, error: null }),
      upload: async () => ({ data: {}, error: null }),
      remove: async () => ({ data: [], error: null }),
    }),
  },
  auth: {
    getSession: async () => ({ data: { session: { user: USER, access_token: 'mock' } }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: USER }, error: null }),
  },
  functions: { invoke: async () => ({ data: null, error: { message: 'mock mode' } }) },
}
