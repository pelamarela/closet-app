// V4 Today — merges V3's Home + Calendar into one place. Today's look is the
// hero; the week strip replaces the "recent" list and doubles as the door to
// the month view. Weather is the headline, not a stat card.

const week = [
  { d: '10', w: 'm', tones: ['sand', 'ink', 'peach', 'paper'] },
  { d: '11', w: 't', tones: ['peach', 'peach', 'rose', 'sand'] },
  { d: '12', w: 'w', tones: ['ink', 'ink', 'peach', 'rose'] },
  { d: '13', w: 't', tones: ['ink', 'ink', 'peach', 'rose'], today: true },
  { d: '14', w: 'f' }, { d: '15', w: 's' }, { d: '16', w: 's' },
];
const monthOutfits = [
  { d: '13', w: 'thu', t: 'Waistcoat + balloon pants', o: 'work', n: 5, tones: ['ink', 'ink', 'peach', 'rose'] },
  { d: '12', w: 'wed', t: 'Zara black set', o: 'casual', n: 5, tones: ['ink', 'ink', 'sand', 'paper'] },
  { d: '11', w: 'tue', t: 'Oysho linen + flats', o: 'work', n: 6, tones: ['peach', 'peach', 'rose', 'sand'] },
  { d: '09', w: 'sun', t: 'Stella tee + jeans', o: 'weekend', n: 4, tones: ['paper', 'sand', 'sand', 'ink'] },
  { d: '08', w: 'sat', t: 'Striped shirt + shorts', o: 'weekend', n: 4, tones: ['paper', 'peach', 'sand', 'rose'] },
];

function LookCollage({ h = 300, r = 0 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 5, height: h, borderRadius: r, overflow: 'hidden' }}>
      <Ph tone="ink" r={0} />
      <div style={{ display: 'grid', gridTemplateRows: '1.4fr 1fr 1fr', gap: 5 }}>
        <Ph tone="peach" r={0} /><Ph tone="rose" r={0} /><Ph tone="sand" r={0} />
      </div>
    </div>
  );
}

function TodayHeader() {
  return (
    <div style={{ padding: '2px 22px 12px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="assets/logo-brown.png" alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
        <span style={{ fontFamily: fS, fontSize: 14, fontWeight: 600, letterSpacing: '-.01em' }}>closet</span>
      </div>
      <div style={{ width: 36, height: 36, borderRadius: 2, background: T.peach, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fS, fontSize: 15, fontWeight: 600 }}>Š</div>
    </div>
  );
}

// Warm, first-person weather line — the thing that actually decides what you
// put on. Replaces V3's boxed "weather / this mo / vs last" strip.
function WeatherHead({ big = 30 }) {
  return (
    <div style={{ padding: '20px 22px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
        <V4Icon n="sun" s={17} w={1.7} c={T.cocoa} />
        <Mono s={11.5} c={T.cocoa}>thu 13 aug · ljubljana</Mono>
      </div>
      <Disp s={big}>Warm again — 32° and clear.</Disp>
    </div>
  );
}

function WeekStrip({ pad = 22 }) {
  return (
    <div style={{ padding: `0 ${pad}px` }}>
      <SecH right="August">This week</SecH>
      <div style={{ display: 'flex', gap: 7 }}>
        {week.map((c, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Mono s={10.5} c={c.today ? T.ink : T.g400} style={{ fontWeight: c.today ? 700 : 400, textTransform: 'uppercase' }}>{c.w}</Mono>
            <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 2, overflow: 'hidden', border: c.today ? `2px solid ${T.ink}` : 'none', background: c.tones ? 'none' : T.white, boxShadow: c.tones ? 'none' : `inset 0 0 0 1px ${T.line}` }}>
              {c.tones ? <OutfitThumb tones={c.tones} gap={1.5} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.g200 }}><V4Icon n="plus" s={15} w={1.8} /></div>}
            </div>
            <Mono s={10} c={c.today ? T.ink : T.g400} style={{ fontWeight: c.today ? 700 : 400 }}>{c.d}</Mono>
          </div>
        ))}
      </div>
    </div>
  );
}

// Twelve months of logging as a sparkline row — encodes the trend that V3
// stated as "12 outfits (−15)" with no context for whether that's good.
function MonthTrend() {
  const bars = [18, 22, 26, 24, 30, 27, 27, 12];
  return (
    <div style={{ padding: '0 22px' }}>
      <V4Card fill={T.peachSoft} shadow={false} pad={16}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <Body s={13.5} c={T.cocoa}>12 outfits logged in August</Body>
            <Disp s={17} w={400} style={{ marginTop: 4 }}>Quieter than usual.</Disp>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 38 }}>
            {bars.map((b, i) => <div key={i} style={{ width: 7, height: `${(b / 30) * 100}%`, borderRadius: 2, background: i === bars.length - 1 ? T.cocoa : T.peachDeep }} />)}
          </div>
        </div>
      </V4Card>
    </div>
  );
}

// ── TODAY · logged ───────────────────────────────────────────────────────
function V4Today() {
  return (
    <V4Screen height={1004}>
      <V4Status /><TodayHeader /><WeatherHead />
      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ position: 'relative' }}>
          <LookCollage h={310} />
          <div style={{ position: 'absolute', top: 14, left: 14, height: 30, display: 'inline-flex', alignItems: 'center', padding: '0 13px', borderRadius: 2, background: 'rgba(247,246,245,.94)', fontFamily: fS, fontSize: 12.5, fontWeight: 600 }}>Work</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, marginTop: 16 }}>
          <div style={{ minWidth: 0 }}>
            <Disp s={21}>Waistcoat + balloon pants</Disp>
            <Body s={13} style={{ marginTop: 5 }}>5 pieces · logged at 8:20</Body>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <RoundBtn icon="bookmark" /><RoundBtn icon="next" />
          </div>
        </div>
      </div>
      <div style={{ padding: '26px 0 0' }}><WeekStrip /></div>
      <div style={{ padding: '24px 0 0' }}><MonthTrend /></div>
      <V4Tabs active="today" />
    </V4Screen>
  );
}

// ── TODAY · nothing logged (the highest-value moment in the app) ─────────
function V4TodayEmpty() {
  return (
    <V4Screen height={1064}>
      <V4Status /><TodayHeader /><WeatherHead />
      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ ...dotted, borderRadius: 2, padding: '30px 24px 26px', border: `1px solid ${T.line}` }}>
          <img src="assets/wave.png" alt="" style={{ width: 92, display: 'block', marginBottom: 18, opacity: .95 }} />
          <Disp s={23}>Nothing on today yet.</Disp>
          <Body s={14} style={{ marginTop: 8, maxWidth: 270 }}>Tell me what you put on, or I can pull something together from the 211 pieces you own.</Body>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
            <Btn full icon="cal">Log what I'm wearing</Btn>
            <Btn full kind="peach" icon="spark">Suggest three looks</Btn>
          </div>
        </div>
      </div>
      <div style={{ padding: '26px 0 0' }}><WeekStrip /></div>
      <div style={{ padding: '22px 22px 0' }}>
        <SecH right="Ideas">Saved for later</SecH>
        <div style={{ display: 'flex', gap: 10 }}>
          {[['peach', 'peach', 'rose', 'sand'], ['paper', 'sand', 'sand', 'ink'], ['peach', 'ink', 'ink', 'rose']].map((t, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 2, overflow: 'hidden' }}><OutfitThumb tones={t} gap={1.5} /></div>
              <Body s={12} style={{ marginTop: 6 }}>{['Linen set', 'Denim + tee', 'Trench look'][i]}</Body>
            </div>
          ))}
        </div>
      </div>
      <V4Tabs active="today" />
    </V4Screen>
  );
}

// ── MONTH ───────────────────────────────────────────────────────────────
function CalCells({ cell = 46 }) {
  const logged = {
    1: 'peach', 2: 'rose', 3: 'sand', 4: 'rose', 5: 'peach', 7: 'ink',
    8: 'paper', 9: 'sand', 11: 'peach', 12: 'ink', 13: 'ink',
  };
  const cells = [...Array(5).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
      {cells.map((d, i) => d === null ? <div key={i} /> : (
        <div key={i} style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 2, overflow: 'hidden', boxShadow: d === 13 ? `inset 0 0 0 2px ${T.ink}` : (logged[d] ? 'none' : `inset 0 0 0 1px ${T.line}`), background: logged[d] ? 'none' : T.white }}>
          {logged[d] && <Ph tone={logged[d]} r={0} />}
          {logged[d] && <div style={{ position: 'absolute', top: 2, left: 2, width: 15, height: 13, background: 'rgba(247,246,245,.9)' }} />}
          <div style={{ position: 'absolute', top: 3, left: 4, fontFamily: fM, fontSize: 9.5, fontWeight: d === 13 ? 700 : 400, color: logged[d] ? 'rgba(0,0,0,.7)' : T.g400 }}>{d}</div>
        </div>
      ))}
    </div>
  );
}
// ── OUTFIT DETAIL — a past logged outfit, reached from Month, Statistics'
// combinations, and any "worn with" thumbnail row ──────────────────────
function V4OutfitDetail() {
  const pieces = [['BOA waistcoat', 'top', 'ink', 2], ['Zara balloon pants', 'bottoms', 'ink', 4], ['Anre tote bag', 'bag', 'peach', 6], ['Chanel pink flats', 'shoes', 'rose', 9], ['LeLabo Matcha 26', 'fragrance', 'paper', 14]];
  return (
    <V4Screen height={1340}>
      <V4Status /><TodayHeader />
      <V4Bar back title="Month" right={<><V4Icon n="pen" s={20} w={1.6} /><V4Icon n="more" s={22} w={2.4} /></>} />
      <div style={{ padding: '8px 22px 0' }}><LookCollage h={320} /></div>
      <div style={{ padding: '18px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          <Pill s="sm" on tone="peach">Work</Pill><Mono s={11}>13 aug · thu</Mono>
        </div>
        <Disp s={25}>Waistcoat + balloon pants</Disp>
        <Body s={13} style={{ marginTop: 5 }}>5 pieces · logged at 8:20</Body>
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <V4Card fill={T.peachSoft} shadow={false} pad={15} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <V4Icon n="sun" s={18} w={1.7} c={T.cocoa} />
          <Body s={13} c={T.cocoa}>32° and clear that day.</Body>
        </V4Card>
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <Btn full icon="repeat">Wear again</Btn>
      </div>
      <div style={{ padding: '26px 22px 0' }}>
        <SecH right="5 pieces">In this look</SecH>
        {pieces.map(([n, c, tone, w], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '9px 0', borderBottom: i < pieces.length - 1 ? `1px solid ${T.line}` : 'none' }}>
            <div style={{ width: 36, height: 45, flexShrink: 0 }}><Ph tone={tone} r={0} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: fS, fontSize: 14, fontWeight: 500 }}>{n}</div>
              <div style={{ marginTop: 2 }}><Mono s={10.5}>{c}</Mono></div>
            </div>
            <Mono s={11} c={T.cocoa} style={{ fontWeight: 700 }}>{w}×</Mono>
          </div>
        ))}
      </div>
      <div style={{ padding: '20px 22px 0' }}>
        <V4Card pad={16}>
          <div style={{ fontFamily: fS, fontSize: 12, fontWeight: 600, color: T.g400, marginBottom: 5 }}>Note</div>
          <Body s={14}>Too warm for the waistcoat by noon — should've gone sleeveless.</Body>
        </V4Card>
      </div>
      <V4Tabs active="today" />
    </V4Screen>
  );
}

function V4Month() {
  return (
    <V4Screen height={1210}>
      <V4Status /><TodayHeader />
      <V4Bar back title="Today" right={<V4Icon n="chart" s={21} w={1.6} />} />
      <div style={{ padding: '10px 22px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div><Mono s={11.5} c={T.cocoa}>2026</Mono><Disp s={34} style={{ marginTop: 4 }}>August</Disp></div>
        <div style={{ display: 'flex', gap: 6 }}><RoundBtn icon="back" /><RoundBtn icon="next" /></div>
      </div>
      <div style={{ padding: '10px 22px 0' }}>
        <Body s={14}>11 days logged, a 3-day streak going. Mostly <span style={{ color: T.ink, fontWeight: 500 }}>work</span> and <span style={{ color: T.ink, fontWeight: 500 }}>weekend</span>.</Body>
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
          {['m', 't', 'w', 't', 'f', 's', 's'].map((d, i) => <div key={i} style={{ textAlign: 'center' }}><Mono s={10} style={{ textTransform: 'uppercase' }}>{d}</Mono></div>)}
        </div>
        <CalCells />
      </div>
      <div style={{ padding: '26px 22px 0' }}>
        <SecH right="All 75">Logged in August</SecH>
        {monthOutfits.map((o, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '9px 0', borderBottom: `1px solid ${T.line}` }}>
            <div style={{ width: 38, height: 48, flexShrink: 0 }}><OutfitThumb tones={o.tones} gap={1.5} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: fS, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.t}</div>
              <div style={{ marginTop: 2 }}><Mono s={11}>{o.d} {o.w} · {o.o} · {o.n} pieces</Mono></div>
            </div>
            <V4Icon n="next" s={16} w={1.7} c={T.g400} />
          </div>
        ))}
      </div>
      <V4Tabs active="today" />
    </V4Screen>
  );
}

Object.assign(window, { V4Today, V4TodayEmpty, V4Month, V4OutfitDetail, LookCollage, WeekStrip, TodayHeader, WeatherHead, monthOutfits, CalCells, MonthTrend, week });
