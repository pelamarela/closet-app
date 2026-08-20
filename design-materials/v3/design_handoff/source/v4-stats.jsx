// V4 Statistics — rebuilt after reviewing Alta. Adopted: two-level time
// scoping, most/least worn as paired thumbnail rows, brand bars, signature
// colour palettes, weekday-vs-weekend framing. Calmed down: their per-weekday
// stacked bars carried 30+ percentages; here it's dominant colour only.
// Added: every section offers the one action it implies — Alta's stats are a
// read-only dead end.

const wornMost = [['sand', 12], ['ink', 9], ['rose', 9], ['peach', 8], ['ink', 7]];
const wornLeast = [['paper', 0], ['sand', 1], ['ink', 1], ['peach', 2], ['rose', 2]];
const brands = [['Zara', 34], ['Massimo Dutti', 19], ['Oysho', 14], ['Chanel', 11], ['Toteme', 9], ['Khaite', 8], ['Arket', 6], ['Stella McCartney', 4]];
// Monotonic dark→light, and every fill carries a hairline edge so the two
// lightest steps still read against the track.
const brandRamp = [T.cocoaDeep, T.cocoa, T.cocoaSoft, '#A47A61', T.roseDeep, T.rose, '#E5C3B6', '#EFD8C9'];

// Time scoping, borrowed from Alta: a grain selector plus a period rail.
function StatsHead({ tab = 'pieces', grain = 'Monthly', rail = ['Aug 2026', 'Jul 2026', 'Jun 2026', 'May 2026', 'Apr 2026'] }) {
  const tabs = [['pieces', 'Pieces'], ['outfits', 'Outfits'], ['colour', 'Colour']];
  return (<>
    <V4Bar back title="Me" right={<Dropdown value={grain} options={['Weekly', 'Monthly', 'Yearly']} />} />
    <div style={{ padding: '8px 22px 0' }}><Disp s={29}>Statistics</Disp></div>
    <div style={{ display: 'flex', gap: 8, padding: '14px 22px 0' }}>
      {tabs.map(([id, l]) => <Pill key={id} on={tab === id} s="sm">{l}</Pill>)}
    </div>
    <div style={{ display: 'flex', gap: 22, padding: '18px 22px 0', overflowX: 'auto', borderBottom: `1px solid ${T.line}` }}>
      {rail.map((m, i) => (
        <div key={m} style={{ paddingBottom: 11, whiteSpace: 'nowrap', fontFamily: fS, fontSize: 14, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? T.ink : T.g400, boxShadow: i === 0 ? `inset 0 -2px 0 ${T.ink}` : 'none' }}>{m}</div>
      ))}
    </div>
  </>);
}

// Alta's clearest idea: clothes are recognised by sight, so the ranking is
// thumbnails with a count — not a labelled bar chart.
function WornRow({ items, dim = false }) {
  return (
    <div style={{ display: 'flex', gap: 7 }}>
      {items.map(([tone, n], i) => (
        <div key={i} style={{ flex: 1 }}>
          <div style={{ width: '100%', aspectRatio: '3/4', opacity: dim ? .78 : 1 }}><Ph tone={tone} r={0} /></div>
          <div style={{ textAlign: 'center', marginTop: 6 }}><Mono s={11} c={dim ? T.g400 : T.ink} style={{ fontWeight: 700 }}>{n}×</Mono></div>
        </div>
      ))}
    </div>
  );
}

function V4StatsPieces() {
  const split = [['Tops', 46, T.cocoa], ['Bags & jewellery', 38, T.cocoaSoft], ['One-piece', 34, T.roseDeep], ['Bottoms', 33, T.rose], ['Shoes', 32, T.peachDeep], ['Fragrance', 15, T.peach], ['Outerwear', 13, T.g200]];
  return (
    <V4Screen height={1420}>
      <V4Status /><TodayHeader />
      <StatsHead tab="pieces" />
      <div style={{ padding: '24px 22px 0' }}>
        <Disp s={20}>Most and least worn</Disp>
        <Body s={13.5} style={{ marginTop: 5 }}>The five you keep reaching for, and the five you don't.</Body>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>Reached for most</div>
          <WornRow items={wornMost} />
        </div>
        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 600 }}>Left hanging</div>
            <span style={{ fontFamily: fS, fontSize: 13, color: T.cocoa }}>See all 8</span>
          </div>
          <WornRow items={wornLeast} dim />
        </div>
        <div style={{ marginTop: 16 }}>
          <V4Card fill={T.peachSoft} shadow={false} pad={15} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Body s={13} c={T.cocoa} style={{ flex: 1 }}>Want me to build a look around one of them?</Body>
            <Pill s="sm" on tone="peach">Try it</Pill>
          </V4Card>
        </div>
      </div>
      <div style={{ padding: '30px 22px 0' }}>
        <Disp s={20}>Labels you trust</Disp>
        <Body s={13.5} style={{ marginTop: 5, marginBottom: 16 }}>Counted by pieces worn, not pieces owned.</Body>
        {brands.map(([n, v], i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 7 }}>
            <div style={{ width: 116, flexShrink: 0, fontFamily: fS, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</div>
            <div style={{ flex: 1, height: 26, background: '#EFEDEA' }}>
              <div style={{ width: `${(v / 34) * 100}%`, height: 26, background: brandRamp[i], boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.14)', display: 'flex', alignItems: 'center', justifyContent: v < 8 ? 'flex-start' : undefined, paddingLeft: v < 8 ? 0 : 8 }}>
                <Mono s={11} c={i < 4 ? '#fff' : T.ink} style={{ fontWeight: 700, marginLeft: v < 8 ? 'calc(100% + 8px)' : 0 }}>{v}</Mono>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '28px 22px 0' }}>
        <Disp s={20}>What the closet is made of</Disp>
        <div style={{ display: 'flex', height: 14, marginTop: 14 }}>
          {split.map(([l, v, c], i) => <div key={i} style={{ flex: v, background: c }} />)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 14 }}>
          {split.map(([l, v, c], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 9, height: 9, background: c }} />
              <span style={{ fontFamily: fS, fontSize: 12.5 }}>{l}</span><Mono s={11}>{v}</Mono>
            </div>
          ))}
        </div>
      </div>
      <V4Tabs active="me" />
    </V4Screen>
  );
}

function V4StatsOutfits() {
  const months = [['jan', 18], ['feb', 22], ['mar', 26], ['apr', 24], ['may', 30], ['jun', 27], ['jul', 27], ['aug', 12]];
  const occ = [['Work', 31], ['Casual', 18], ['Weekend', 14], ['Dinner', 7], ['Travel', 5]];
  const combos = [['Chanel flats + balloon pants + waistcoat', 4, ['ink', 'ink', 'rose', 'peach']], ['Alaïa flats + Khaite jeans + blazer', 3, ['sand', 'sand', 'ink', 'paper']], ['Cognac flats + linen set', 3, ['peach', 'peach', 'rose', 'sand']]];
  return (
    <V4Screen height={1510}>
      <V4Status /><TodayHeader />
      <StatsHead tab="outfits" grain="Yearly" rail={['2026', '2025']} />
      <div style={{ padding: '24px 22px 0' }}>
        <Disp s={20}>Logged each month</Disp>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, marginTop: 16 }}>
          {months.map(([m, v], i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
              <Mono s={10} c={i === months.length - 1 ? T.ink : T.g400} style={{ fontWeight: i === months.length - 1 ? 700 : 400 }}>{v}</Mono>
              <div style={{ width: '100%', height: (v / 30) * 74, background: i === months.length - 1 ? T.cocoa : T.peachDeep }} />
              <Mono s={9.5}>{m}</Mono>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '28px 22px 0' }}>
        <Disp s={20}>Where you actually go</Disp>
        <div style={{ marginTop: 10 }}>{occ.map(([l, v], i) => <BarStat key={i} label={l} v={v} max={31} suffix=" looks" tone={i === 0 ? T.cocoa : T.rose} />)}</div>
      </div>
      {/* Alta's best framing — who you are on a Tuesday vs a Sunday. */}
      <div style={{ padding: '26px 22px 0' }}>
        <Disp s={20}>Weekday you, weekend you</Disp>
        <Body s={13.5} style={{ marginTop: 5, marginBottom: 14 }}>Weekends are looser and one piece lighter.</Body>
        <V4Card pad={0} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {[['Weekday', ['#111111', '#4A4A48', '#F0EDE8', '#8C3B2A'], ['Work 31', 'Casual 9', 'Dinner 4'], '5.1'],
            ['Weekend', ['#111111', '#C9855C', '#F0EDE8', '#3F5A4A'], ['Weekend 14', 'Casual 9', 'Travel 5'], '4.2']].map(([t, cols, codes, avg], i) => (
            <div key={i} style={{ padding: 16, borderLeft: i ? `1px solid ${T.line}` : 'none' }}>
              <div style={{ fontFamily: fS, fontSize: 14.5, fontWeight: 600 }}>{t}</div>
              <div style={{ marginTop: 12 }}><Mono s={10}>top colours</Mono></div>
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>{cols.map((c, k) => <div key={k} style={{ width: 22, height: 22, background: c, boxShadow: `inset 0 0 0 1px rgba(0,0,0,.08)` }} />)}</div>
              <div style={{ marginTop: 14 }}><Mono s={10}>most often</Mono></div>
              {codes.map((c, k) => <div key={k} style={{ fontFamily: fS, fontSize: 13, marginTop: 3 }}>{c}</div>)}
              <div style={{ marginTop: 14 }}><Mono s={10}>pieces per look</Mono></div>
              <Disp s={22} style={{ marginTop: 2 }}>{avg}</Disp>
            </div>
          ))}
        </V4Card>
      </div>
      <div style={{ padding: '26px 22px 0' }}>
        <SecH right="By core pieces">Combinations you repeat</SecH>
        {combos.map(([n, v, t], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px 0', borderBottom: i < combos.length - 1 ? `1px solid ${T.line}` : 'none' }}>
            <div style={{ width: 36, height: 45, flexShrink: 0 }}><OutfitThumb tones={t} gap={1.5} /></div>
            <div style={{ flex: 1, fontFamily: fS, fontSize: 13.5, lineHeight: 1.4 }}>{n}</div>
            <Mono s={12} c={T.cocoa} style={{ fontWeight: 700 }}>{v}×</Mono>
          </div>
        ))}
      </div>
      <V4Tabs active="me" />
    </V4Screen>
  );
}

// ── COLOUR — the tab Alta's Signature Palettes made worth building ───────
const palettes = [
  [['#111111', '#4A4A48', '#F0EDE8'], 'Black, grey, cream', 9],
  [['#111111', '#8C3B2A', '#F0EDE8'], 'Black, rust, cream', 6],
  [['#111111', '#C9855C', '#4A4A48'], 'Black, cognac, grey', 5],
  [['#E8DCCA', '#111111', '#C9855C'], 'Cream, black, cognac', 4],
  [['#111111', '#3F5A4A', '#F0EDE8'], 'Black, forest, cream', 2],
];
const byDay = [
  ['m', [['#111111', 62], ['#4A4A48', 24], ['#F0EDE8', 14]]],
  ['t', [['#111111', 48], ['#8C3B2A', 30], ['#F0EDE8', 22]]],
  ['w', [['#111111', 55], ['#F0EDE8', 30], ['#C9855C', 15]]],
  ['t', [['#4A4A48', 44], ['#111111', 36], ['#E8DCCA', 20]]],
  ['f', [['#111111', 40], ['#C9855C', 34], ['#F0EDE8', 26]]],
  ['s', [['#E8DCCA', 46], ['#111111', 32], ['#3F5A4A', 22]]],
  ['s', [['#F0EDE8', 50], ['#C9855C', 28], ['#111111', 22]]],
];

function V4StatsColour() {
  return (
    <V4Screen height={1440}>
      <V4Status /><TodayHeader />
      <StatsHead tab="colour" />
      <div style={{ padding: '24px 22px 0' }}>
        <Disp s={20}>Signature palettes</Disp>
        <Body s={13.5} style={{ marginTop: 5, marginBottom: 16 }}>The colour combinations you build looks from most.</Body>
        {palettes.map(([cols, name, n], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: i < palettes.length - 1 ? `1px solid ${T.line}` : 'none' }}>
            <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
              {cols.map((c, k) => <div key={k} style={{ width: 40, height: 46, background: c, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08)' }} />)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: fS, fontSize: 14, fontWeight: 500 }}>{name}</div>
              <div style={{ marginTop: 2 }}><Mono s={11}>worn {n} times</Mono></div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 16 }}>
          <V4Card fill={T.peachSoft} shadow={false} pad={15} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Body s={13} c={T.cocoa} style={{ flex: 1 }}>Suggest something in a palette you haven't touched.</Body>
            <Pill s="sm" on tone="peach">Go</Pill>
          </V4Card>
        </div>
      </div>
      {/* Alta stacked seven weekdays with 30+ percentages. Same insight,
          dominant colour only, no numbers to decode. */}
      <div style={{ padding: '30px 22px 0' }}>
        <Disp s={20}>Colour through the week</Disp>
        <Body s={13.5} style={{ marginTop: 5, marginBottom: 16 }}>Black carries Monday to Wednesday. The warm ones only come out at the weekend.</Body>
        <div style={{ display: 'flex', gap: 6, height: 150 }}>
          {byDay.map(([d, segs], i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {segs.map(([c, pct], k) => <div key={k} style={{ height: `${pct}%`, background: c, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.07)' }} />)}
              </div>
              <div style={{ textAlign: 'center' }}><Mono s={10.5} style={{ textTransform: 'uppercase' }}>{d}</Mono></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '26px 22px 0' }}>
        <Disp s={20}>Against your season</Disp>
        <Body s={13.5} style={{ marginTop: 5, marginBottom: 12 }}>You're a warm autumn, and just over half of what you wear agrees.</Body>
        <BarStat label="In your palette" v={54} />
        <BarStat label="Neutral either way" v={33} tone={T.rose} />
        <BarStat label="Fighting it" v={13} tone={T.g400} />
      </div>
      <V4Tabs active="me" />
    </V4Screen>
  );
}

Object.assign(window, { StatsHead, WornRow, V4StatsPieces, V4StatsOutfits, V4StatsColour });
