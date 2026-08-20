// V4 Log — V3's 1450px-tall form becomes two sheets with a visible tray, so
// you can always see what you've assembled. Selection state is explicit.

const drawerTones = ['sand', 'ink', 'peach', 'rose', 'paper', 'cocoa', 'sand', 'ink', 'peach', 'rose', 'paper', 'sand'];
const logCats = ['Tops', 'Bottoms', 'One-piece', 'Outerwear', 'Shoes', 'Bags', 'Fragrance'];

// The tray: what you've picked so far, always in view above the drawer.
function Tray({ picked = ['ink', 'ink', 'peach', 'rose'] }) {
  return (
    <div style={{ padding: '18px 22px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 600 }}>{picked.length} pieces on</div>
        {picked.length > 0 && <span style={{ fontFamily: fS, fontSize: 13, color: T.cocoa }}>Clear</span>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {picked.map((t, i) => (
          <div key={i} style={{ position: 'relative', width: 60, height: 74 }}>
            <Ph tone={t} r={0} />
            <div style={{ position: 'absolute', top: -5, right: -5, width: 21, height: 21, borderRadius: 2, background: T.paper, boxShadow: `0 0 0 1px ${T.g200}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><V4Icon n="close" s={11} w={2.4} /></div>
          </div>
        ))}
        <div style={{ width: 60, height: 74, borderRadius: 2, border: `1.5px dashed ${T.g200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.g400 }}><V4Icon n="plus" s={18} w={1.7} /></div>
      </div>
    </div>
  );
}

// ── STEP 1 · pieces ─────────────────────────────────────────────────────
function V4LogPieces() {
  const sel = [1, 3, 5];
  return (
    <V4Screen height={858}>
      <V4Status /><TodayHeader /><WeatherHead big={26} />
      <Scrim>
        <Sheet h={740} step={1} title={<Disp s={24}>What did you wear?</Disp>} right={<span style={{ fontFamily: fS, fontSize: 14, color: T.cocoa }}>Cancel</span>}>
          <Tray />
          <div style={{ display: 'flex', gap: 8, padding: '20px 22px 0', overflowX: 'auto' }}>
            {logCats.map((c, i) => <Pill key={c} on={i === 0} s="sm">{c}</Pill>)}
          </div>
          <div style={{ padding: '16px 22px 0' }}>
            <Mono s={11} style={{ display: 'block', marginBottom: 10 }}>worn most recently first</Mono>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {drawerTones.slice(0, 9).map((t, i) => <ItemTile key={i} tone={t} sel={sel.includes(i)} />)}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 22px 24px', background: 'rgba(247,246,245,.96)', backdropFilter: 'blur(10px)', borderTop: `1px solid ${T.line}` }}>
            <Btn full icon="next">Add the details</Btn>
          </div>
        </Sheet>
      </Scrim>
    </V4Screen>
  );
}

// ── STEP 2 · context ────────────────────────────────────────────────────
function V4LogContext() {
  const occ = ['Work', 'Casual', 'Weekend', 'Errands', 'Dinner', 'Date night', 'Travel', 'Gym'];
  return (
    <V4Screen height={858}>
      <V4Status /><TodayHeader /><WeatherHead big={26} />
      <Scrim>
        <Sheet h={700} step={2} title={<Disp s={24}>Anything to<br />remember about it?</Disp>} right={<V4Icon n="back" s={22} w={1.8} />}>
          <div style={{ padding: '20px 22px 0' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {['ink', 'ink', 'peach', 'rose', 'sand'].map((t, i) => <div key={i} style={{ width: 46, height: 58 }}><Ph tone={t} r={0} /></div>)}
              <span style={{ fontFamily: fS, fontSize: 13, color: T.cocoa, marginLeft: 4 }}>Edit</span>
            </div>
          </div>
          <div style={{ padding: '24px 22px 0' }}>
            <SecH>When</SecH>
            <div style={{ display: 'flex', gap: 8 }}><Pill on>Today</Pill><Pill>Yesterday</Pill><Pill icon>Pick a date</Pill></div>
          </div>
          <div style={{ padding: '22px 22px 0' }}>
            <SecH right="More">What for</SecH>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {occ.slice(0, 6).map((o, i) => <Pill key={o} on={i === 0} tone="peach">{o}</Pill>)}
            </div>
          </div>
          <div style={{ padding: '22px 22px 0' }}>
            <SecH right="Optional">A note</SecH>
            <div style={{ minHeight: 62, borderRadius: 2, background: T.white, boxShadow: `inset 0 0 0 1px ${T.line}`, padding: 15 }}>
              <Body s={14} c={T.g400}>Too warm for the waistcoat by noon…</Body>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 22px 24px', background: T.paper, borderTop: `1px solid ${T.line}` }}>
            <Btn full icon="check">Save to 13 August</Btn>
          </div>
        </Sheet>
      </Scrim>
    </V4Screen>
  );
}

// ── SAVED · confirmation, with the one useful next step ─────────────────
function V4LogSaved() {
  return (
    <V4Screen height={894} grid>
      <V4Status /><TodayHeader />
      <V4Bar right={<V4Icon n="close" s={22} w={1.8} />} />
      <div style={{ position: 'absolute', top: 186, left: 0, right: 0, padding: '0 34px', textAlign: 'center' }}>
        <img src="assets/wave-rose.png" alt="" style={{ width: 120, display: 'block', margin: '0 auto 26px' }} />
        <Disp s={30}>Logged.</Disp>
        <Body s={15} style={{ marginTop: 10 }}>Thursday 13 August — work, five pieces. That's a four-day streak.</Body>
        <div style={{ display: 'flex', gap: 9, justifyContent: 'center', marginTop: 24 }}>
          {['ink', 'ink', 'peach', 'rose', 'sand'].map((t, i) => <div key={i} style={{ width: 46, height: 58 }}><Ph tone={t} r={0} /></div>)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 30 }}>
          <Btn full kind="peach" icon="bookmark">Save it as an idea too</Btn>
          <Btn full kind="quiet">Back to today</Btn>
        </div>
      </div>
    </V4Screen>
  );
}

Object.assign(window, { V4LogPieces, V4LogContext, V4LogSaved, Tray, logCats, drawerTones });
