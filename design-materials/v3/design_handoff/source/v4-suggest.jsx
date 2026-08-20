// V4 Suggest — one question instead of four fields. Weather and formality are
// shown as context the app already knows, not asked for. Results are swipeable
// full cards so the three options can actually be compared.

const sugPieces = [
  { n: 'Lemaire wool trench', c: 'outerwear', tone: 'peach' },
  { n: 'BOA waistcoat', c: 'top', tone: 'ink' },
  { n: 'Khaite slim jeans', c: 'bottoms', tone: 'sand' },
  { n: 'Chanel pink flats', c: 'shoes', tone: 'rose' },
  { n: 'Anre tote bag', c: 'bag', tone: 'peach' },
];

// ── BRIEF ───────────────────────────────────────────────────────────────
function V4SuggestBrief() {
  const occ = ['Work', 'Casual', 'Weekend', 'Errands', 'Dinner', 'Date night', 'Party', 'Travel'];
  return (
    <V4Screen height={858}>
      <V4Status /><TodayHeader /><WeatherHead big={26} />
      <Scrim>
        <Sheet h={690} title={<Disp s={25}>Where are you<br />off to?</Disp>} right={<V4Icon n="close" s={22} w={1.8} />}>
          <div style={{ padding: '18px 22px 0' }}>
            <V4Card fill={T.peach} shadow={false} pad={14} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <V4Icon n="sun" s={19} w={1.7} c={T.cocoa} />
              <Body s={13.5} c={T.cocoa}>32° and clear in Ljubljana all day — I'll keep the layers light.</Body>
            </V4Card>
          </div>
          <div style={{ padding: '24px 22px 0' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {occ.map((o, i) => <Pill key={o} on={i === 0} s="lg">{o}</Pill>)}
              <Pill s="lg">Something else…</Pill>
            </div>
          </div>
          <div style={{ padding: '26px 22px 0' }}>
            <SecH right="Optional">Start from a piece</SecH>
            <div style={{ display: 'flex', gap: 9 }}>
              <div style={{ width: 60, height: 74, borderRadius: 2, border: `1.5px dashed ${T.g200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.g400 }}><V4Icon n="plus" s={18} w={1.7} /></div>
              {['sand', 'rose', 'peach'].map((t, i) => <div key={i} style={{ width: 60, height: 74, opacity: i === 0 ? 1 : .5 }}><Ph tone={t} r={0} /></div>)}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 22px 24px', background: T.paper, borderTop: `1px solid ${T.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Body s={12}>Using how you actually dress, and the weather.</Body>
              <span style={{ fontFamily: fS, fontSize: 12.5, color: T.cocoa, textDecoration: 'underline' }}>Adjust</span>
            </div>
            <Btn full icon="spark">Put together three looks</Btn>
          </div>
        </Sheet>
      </Scrim>
    </V4Screen>
  );
}

// ── LOADING — says what it's doing, so 6 seconds feels honest ───────────
function V4SuggestLoading() {
  const steps = [['Checking the weather', 1], ['Reading your style profile', 1], ['Choosing from 211 pieces', 0]];
  return (
    <V4Screen height={894} grid>
      <V4Status /><TodayHeader />
      <V4Bar right={<V4Icon n="close" s={22} w={1.8} />} />
      <div style={{ position: 'absolute', top: 246, left: 0, right: 0, padding: '0 40px' }}>
        <img src="assets/wave.png" alt="" style={{ width: 108, display: 'block', marginBottom: 26 }} />
        <Disp s={27}>Having a look through your closet.</Disp>
        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {steps.map(([l, done], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: done ? 1 : .45 }}>
              <div style={{ width: 22, height: 22, borderRadius: 2, background: done ? T.ink : 'transparent', border: done ? 'none' : `1.5px solid ${T.g200}`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{done ? <V4Icon n="check" s={12} w={2.8} /> : null}</div>
              <Body s={14.5} c={done ? T.ink : T.g500}>{l}</Body>
            </div>
          ))}
        </div>
      </div>
    </V4Screen>
  );
}

// ── RESULT — swipeable cards, one look per card ─────────────────────────
function V4SuggestResult() {
  return (
    <V4Screen height={1235}>
      <V4Status /><TodayHeader />
      <V4Bar back title="Brief" right={<Mono s={11.5}>1 / 3</Mono>} />
      <div style={{ padding: '8px 0 0', display: 'flex', gap: 12, paddingLeft: 22 }}>
        <div style={{ width: 306, flexShrink: 0 }}>
          <div style={{ position: 'relative', height: 330 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 5, height: '100%', borderRadius: 2, overflow: 'hidden' }}>
              <Ph tone="peach" r={0} />
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr 1fr', gap: 5 }}><Ph tone="ink" r={0} /><Ph tone="sand" r={0} /><Ph tone="rose" r={0} /></div>
            </div>
            <div style={{ position: 'absolute', top: 13, left: 13, height: 29, display: 'inline-flex', alignItems: 'center', padding: '0 12px', borderRadius: 2, background: 'rgba(247,246,245,.94)', fontFamily: fS, fontSize: 12, fontWeight: 600 }}>Look one</div>
          </div>
        </div>
        <div style={{ width: 306, flexShrink: 0, opacity: .38 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 5, height: 330, borderRadius: 2, overflow: 'hidden' }}>
            <Ph tone="sand" r={0} /><div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 5 }}><Ph tone="rose" r={0} /><Ph tone="peach" r={0} /></div>
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 22px 0', display: 'flex', justifyContent: 'center' }}><Dots n={3} i={0} /></div>
      <div style={{ padding: '16px 22px 0' }}>
        <Disp s={23}>Light layers for a warm work day.</Disp>
      </div>
      <div style={{ padding: '16px 22px 0' }}>
        {sugPieces.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < sugPieces.length - 1 ? `1px solid ${T.line}` : 'none' }}>
            <div style={{ width: 34, height: 42, flexShrink: 0 }}><Ph tone={p.tone} r={0} /></div>
            <div style={{ flex: 1, fontFamily: fS, fontSize: 14 }}>{p.n}</div>
            <Mono s={10.5}>{p.c}</Mono>
          </div>
        ))}
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <V4Card fill={T.peachSoft} shadow={false} pad={16}>
          <Body s={14} c={T.g700}>The trench softens the black waistcoat and the jeans keep it grounded — warm neutrals for a clear 32° day, which is where your best work looks usually land.</Body>
        </V4Card>
      </div>
      <div style={{ padding: '20px 22px 0', display: 'flex', gap: 10, alignItems: 'center' }}>
        <RoundBtn icon="down" /><Btn flex={1} icon="check">Wear this today</Btn><RoundBtn icon="bookmark" tone="peach" />
      </div>
      <div style={{ padding: '14px 22px 0', textAlign: 'center' }}>
        <span style={{ fontFamily: fS, fontSize: 13.5, color: T.cocoa, textDecoration: 'underline' }}>Try three different ones</span>
      </div>
      <V4Tabs active="today" />
    </V4Screen>
  );
}

// ── ERROR — generation failed; retry keeps the brief, doesn't discard it ──
function V4SuggestError() {
  return (
    <V4Screen height={894} grid>
      <V4Status /><TodayHeader />
      <V4Bar right={<V4Icon n="close" s={22} w={1.8} />} />
      <div style={{ position: 'absolute', top: 246, left: 0, right: 0, padding: '0 40px' }}>
        <div style={{ width: 52, height: 52, borderRadius: 2, background: T.peachSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 26 }}><V4Icon n="close" s={24} w={1.8} c={T.cocoa} /></div>
        <Disp s={27}>Couldn't put those looks together.</Disp>
        <Body s={14.5} c={T.g500} style={{ marginTop: 10, maxWidth: 300 }}>Something went wrong on our end — your answers are still here, nothing's lost.</Body>
        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn full icon="spark">Try again</Btn>
          <Btn full kind="quiet">Back to brief</Btn>
        </div>
      </div>
    </V4Screen>
  );
}

Object.assign(window, { V4SuggestBrief, V4SuggestLoading, V4SuggestResult, V4SuggestError, sugPieces });
