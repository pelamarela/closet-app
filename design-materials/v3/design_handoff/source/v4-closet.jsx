// V4 Closet — one taxonomy instead of V3's overlapping chips + tier headers.
// Shop is a tool, not a list: there's nothing saved, so it's an entry point
// from the closet that returns a verdict and ends.

const catPills = [['All', 211, true], ['Tops', 46], ['Bottoms', 33], ['One-piece', 34], ['Outerwear', 13], ['Shoes', 32], ['Bags & jewellery', 38], ['Fragrance', 15]];
const gridTones = ['sand', 'ink', 'peach', 'rose', 'paper', 'sand', 'cocoa', 'peach', 'rose', 'sand', 'ink', 'paper'];

function ItemTile({ tone, worn, ratio = '3/4', r = 2, sel }) {
  return (
    <div className="v4-tile" style={{ position: 'relative', width: '100%', aspectRatio: ratio, borderRadius: r, overflow: 'hidden', boxShadow: sel ? `0 0 0 2.5px ${T.ink}` : `inset 0 0 0 1px ${T.line}` }}>
      <Ph tone={tone} r={0} />
      {worn != null && <div style={{ position: 'absolute', right: 6, bottom: 6, height: 20, padding: '0 7px', borderRadius: 2, background: 'rgba(247,246,245,.92)', display: 'flex', alignItems: 'center', fontFamily: fM, fontSize: 10, fontWeight: 700 }}>{worn}×</div>}
      {sel && <div style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 2, background: T.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><V4Icon n="check" s={13} w={2.6} /></div>}
    </div>
  );
}

function ClosetHead() {
  return (<>
    <div style={{ padding: '4px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Disp s={30}>Closet</Disp>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
        <V4Icon n="chart" s={22} w={1.6} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 2, background: T.g200 + '55', color: T.ink }}>
          <V4Icon n="plus" s={15} w={1.9} /><span style={{ fontFamily: fS, fontSize: 12.5, fontWeight: 600 }}>Add</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 2, background: T.peachSoft, color: T.cocoa }}>
          <V4Icon n="bag" s={15} w={1.8} /><span style={{ fontFamily: fS, fontSize: 12.5, fontWeight: 600 }}>Shop</span>
        </div>
      </div>
    </div>
  </>);
}

// ── WARDROBE ────────────────────────────────────────────────────────────
function V4Wardrobe() {
  return (
    <V4Screen height={1245}>
      <V4Status /><TodayHeader /><ClosetHead />
      <div style={{ display: 'flex', gap: 8, padding: '18px 22px 0', overflowX: 'auto' }}>
        {catPills.map(([l, n, on], i) => <Pill key={i} on={!!on} s="sm" count={n}>{l}</Pill>)}
      </div>
      <div style={{ padding: '16px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: fS, fontSize: 13, fontWeight: 500 }}>Recently worn <V4Icon n="caret" s={15} w={2} /></div>
        <div style={{ display: 'flex', gap: 12, color: T.g400 }}><V4Icon n="grid" s={19} w={1.7} c={T.ink} /><V4Icon n="list" s={19} w={1.7} /></div>
      </div>
      <div style={{ padding: '14px 22px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {gridTones.map((t, i) => <ItemTile key={i} tone={t} worn={[9, 12, 4, 6, 2, 14, 7, 3, 8, 1, 5, 11][i]} />)}
        </div>
      </div>
      <div style={{ padding: '20px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
          <V4Icon n="archive" s={20} w={1.6} c={T.cocoa} />
          <Body s={13} style={{ flex: 1 }}>8 pieces haven't left the closet in a year.</Body>
          <Pill s="sm">Review</Pill>
        </div>
      </div>
      <V4Tabs active="closet" />
    </V4Screen>
  );
}

// ── ITEM DETAIL — an action screen, not a spec sheet ────────────────────
function V4Item() {
  const attrs = [['Colour', 'Burgundy / pink'], ['Material', 'Lambskin'], ['Pattern', 'None'], ['Brand', 'Chanel']];
  return (
    <V4Screen height={1405}>
      <V4Status /><TodayHeader />
      <V4Bar back title="Closet" right={<><V4Icon n="pen" s={20} w={1.6} /><V4Icon n="more" s={22} w={2.4} /></>} />
      <div style={{ padding: '8px 22px 0' }}>
        <div style={{ width: '100%', aspectRatio: '1/1' }}><Ph tone="rose" r={0} /></div>
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <Mono s={11.5} c={T.cocoa}>chanel · flats</Mono>
        <Disp s={27} style={{ marginTop: 5 }}>Pink burgundy flats</Disp>
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <V4Card fill={T.peach} shadow={false} pad={0} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', overflow: 'hidden' }}>
          {[['Worn', '9×'], ['Last', '12 aug'], ['Average', '1.4 / mo']].map(([k, v], i) => (
            <div key={i} style={{ padding: '15px 14px', borderLeft: i ? '1px solid rgba(0,0,0,.07)' : 'none' }}>
              <div style={{ fontFamily: fS, fontSize: 11.5, color: T.cocoa, fontWeight: 500 }}>{k}</div>
              <div style={{ fontFamily: fS, fontSize: 17, fontWeight: 600, marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </V4Card>
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <Btn full icon="check">Wear it today</Btn>
      </div>
      <div style={{ padding: '26px 22px 0' }}>
        <SecH>Details</SecH>
        {attrs.map(([k, v], i) => <Row4 key={i} label={k} value={v} chev={false} />)}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 54, borderBottom: `1px solid ${T.line}` }}>
          <span style={{ fontFamily: fS, fontSize: 15 }}>Warmth</span><DotScale v={2} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 54 }}>
          <span style={{ fontFamily: fS, fontSize: 15 }}>Formality</span><DotScale v={3} tone={T.roseDeep} />
        </div>
      </div>
      <div style={{ padding: '14px 22px 0' }}>
        <SecH right="All 9">Worn with</SecH>
        <div style={{ display: 'flex', gap: 9 }}>
          {[['ink', 'ink', 'peach', 'rose'], ['peach', 'peach', 'rose', 'sand'], ['sand', 'paper', 'rose', 'ink'], ['rose', 'sand', 'ink', 'peach']].map((t, i) => (
            <div key={i} style={{ flex: 1 }}><div style={{ width: '100%', aspectRatio: '3/4' }}><OutfitThumb tones={t} gap={1.5} /></div><div style={{ marginTop: 5 }}><Mono s={10}>{['12 aug', '04 aug', '28 jul', '19 jul'][i]}</Mono></div></div>
          ))}
        </div>
      </div>
      <V4Tabs active="closet" />
    </V4Screen>
  );
}

// ── SHOP · check — a sheet, not a form screen ───────────────────────────
function V4ShopCheck() {
  return (
    <V4Screen height={894}>
      <V4Status /><TodayHeader /><ClosetHead />
      <Scrim>
        <Sheet h={612} title={<Disp s={24}>Thinking about<br />something?</Disp>} right={<V4Icon n="close" s={22} w={1.8} />}>
          <div style={{ padding: '22px 22px 0' }}>
            <div style={{ height: 54, borderRadius: 2, background: T.white, boxShadow: `inset 0 0 0 1px ${T.line}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px' }}>
              <V4Icon n="link" s={19} w={1.6} c={T.g400} /><span style={{ fontFamily: fS, fontSize: 14.5, color: T.g400 }}>Paste a product link</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: T.line }} /><Mono s={11}>or</Mono><div style={{ flex: 1, height: 1, background: T.line }} />
            </div>
            <div style={{ minHeight: 96, borderRadius: 2, background: T.white, boxShadow: `inset 0 0 0 1px ${T.line}`, padding: 16 }}>
              <Body s={14.5} c={T.g400}>A cognac leather tote, structured, medium…</Body>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
              <div style={{ width: 74, height: 74, borderRadius: 2, border: `1.5px dashed ${T.g200}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: T.g400 }}>
                <V4Icon n="cam" s={20} w={1.6} /><Mono s={9}>photo</Mono>
              </div>
              <Body s={12.5} style={{ flex: 1 }}>A picture helps me judge colour against your warm-autumn palette.</Body>
            </div>
            <div style={{ marginTop: 22 }}>
              <SecH right="Optional">What would you wear it for?</SecH>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                {['Work', 'Casual', 'Weekend', 'Dinner', 'Anything'].map((o, i) => <Pill key={o} on={i === 0} s="sm">{o}</Pill>)}
              </div>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 22px 26px', background: T.paper, borderTop: `1px solid ${T.line}` }}>
            <Btn full icon="spark">Should I buy it?</Btn>
          </div>
        </Sheet>
      </Scrim>
    </V4Screen>
  );
}

// ── SHOP · verdict — the answer leads, the score supports it ────────────
function V4ShopResult() {
  return (
    <V4Screen height={1340}>
      <V4Status /><TodayHeader />
      <V4Bar back title="Closet" right={<Mono s={11}>claude sonnet</Mono>} />
      <div style={{ padding: '14px 22px 0', display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 92, height: 112, flexShrink: 0 }}><Ph tone="peach" r={0} /></div>
        <div style={{ minWidth: 0 }}>
          <Disp s={19}>Cognac leather tote</Disp>
          <div style={{ marginTop: 4 }}><Mono s={11.5}></Mono></div>
        </div>
      </div>
      <div style={{ padding: '20px 22px 0' }}>
        <V4Card fill={T.peach} shadow={false} pad={18}>
          <Mono s={11} c={T.cocoa}>the verdict</Mono>
          <Disp s={28} style={{ marginTop: 7 }}>Probably don't.</Disp>
          <Body s={14} c={T.g700} style={{ marginTop: 9 }}>The colour is right and it would work with plenty — but you already own two structured totes in this size and you've reached for one of them nineteen times this year. This is a want, not a gap.</Body>
        </V4Card>
      </div>
      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <Disp s={44} c={T.cocoa} style={{ letterSpacing: '-.03em' }}>87%</Disp>
          <Body s={13.5} style={{ paddingBottom: 6 }}>fits the closet you<br />already have</Body>
        </div>
        <div style={{ marginTop: 16 }}>
          <BarStat label="Colour harmony" v={92} />
          <BarStat label="Style alignment" v={88} />
          <BarStat label="Formality fit" v={95} />
          <BarStat label="Fills a real gap" v={24} tone={T.g400} />
        </div>
      </div>
      <div style={{ padding: '24px 22px 0' }}>
        <SecH>You already own</SecH>
        {[['Anre tote leather bag', 'beige · structured', 'peach', 19], ['Massimo Dutti shopper', 'black · structured', 'ink', 6]].map(([n, d, tone, w], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px 0', borderBottom: i === 0 ? `1px solid ${T.line}` : 'none' }}>
            <div style={{ width: 40, height: 50, flexShrink: 0 }}><Ph tone={tone} r={0} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: fS, fontSize: 14, fontWeight: 500 }}>{n}</div>
              <div style={{ marginTop: 2 }}><Mono s={11}>{d}</Mono></div>
            </div>
            <Mono s={12} c={T.cocoa} style={{ fontWeight: 700 }}>{w}×</Mono>
          </div>
        ))}
      </div>
      <div style={{ padding: '22px 22px 0' }}>
        <SecH right="6 looks">It would have worked with</SecH>
        <div style={{ display: 'flex', gap: 9 }}>
          {[['peach', 'peach', 'rose', 'sand'], ['ink', 'ink', 'sand', 'paper'], ['sand', 'paper', 'rose', 'ink'], ['rose', 'sand', 'peach', 'ink']].map((t, i) => (
            <div key={i} style={{ flex: 1 }}><div style={{ width: '100%', aspectRatio: '3/4' }}><OutfitThumb tones={t} gap={1.5} /></div></div>
          ))}
        </div>
      </div>
      <div style={{ padding: '24px 22px 0', display: 'flex', gap: 10 }}>
        <Btn kind="quiet" flex={1} icon="bag">New one</Btn>
        <Btn flex={1}>Done</Btn>
      </div>
      <V4Tabs active="closet" />
    </V4Screen>
  );
}

// ── SHOP · error — link/photo couldn't be read; keeps the sheet open ─────
function V4ShopError() {
  return (
    <V4Screen height={894}>
      <V4Status /><TodayHeader /><ClosetHead />
      <Scrim>
        <Sheet h={520} title={<Disp s={24}>Thinking about<br />something?</Disp>} right={<V4Icon n="close" s={22} w={1.8} />}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', padding: '0 22px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 2, background: T.peachSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><V4Icon n="close" s={24} w={1.8} c={T.cocoa} /></div>
            <Disp s={21}>Couldn't read that link.</Disp>
            <Body s={14} c={T.g500} style={{ marginTop: 8, maxWidth: 260, margin: '8px auto 0' }}>Try pasting it again, or describe the piece and add a photo instead.</Body>
            <div style={{ marginTop: 24 }}><Btn full>Try again</Btn></div>
          </div>
        </Sheet>
      </Scrim>
    </V4Screen>
  );
}

Object.assign(window, { V4Wardrobe, V4Item, V4ShopCheck, V4ShopResult, V4ShopError, ItemTile, ClosetHead, catPills, gridTones });
