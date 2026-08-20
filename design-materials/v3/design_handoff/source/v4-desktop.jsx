// V4 desktop — bottom tabs become a real sidebar; the phone's vertical stack
// becomes two columns. Same content, no separate desktop IA.

function SideNav({ active = 'today' }) {
  const items = [['today', 'Today', 'home'], ['closet', 'Closet', 'hanger'], ['ideas', 'Ideas', 'bulb'], ['me', 'Me', 'user']];
  return (
    <div style={{ width: 236, height: '100%', borderRight: `1px solid ${T.line}`, padding: '30px 18px', display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 12px 26px' }}>
        <img src="assets/logo-brown.png" alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} />
        <span style={{ fontFamily: fS, fontSize: 15, fontWeight: 600 }}>closet</span>
      </div>
      <div style={{ padding: '0 0 18px' }}><Btn full icon="cal">Log an outfit</Btn></div>
      {items.map(([id, l, ic]) => (
        <div key={id} style={{ height: 46, borderRadius: 2, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 11, background: active === id ? T.peach : 'transparent', fontFamily: fS, fontSize: 14.5, fontWeight: active === id ? 600 : 400, color: active === id ? T.ink : T.g500 }}>
          <V4Icon n={ic} s={21} w={active === id ? 1.9 : 1.5} />{l}
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '0 12px' }}>
        <div style={{ width: 34, height: 34, borderRadius: 2, background: T.peach, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fS, fontSize: 14, fontWeight: 600 }}>Š</div>
        <div><div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 500 }}>Špela</div><Mono s={10}>211 pieces</Mono></div>
      </div>
    </div>
  );
}

function V4TodayDesktop() {
  return (
    <DeskScreen4 height={900}>
      <div style={{ display: 'flex', height: '100%' }}>
        <SideNav active="today" />
        <div style={{ flex: 1, padding: '34px 44px', minWidth: 0, display: 'grid', gridTemplateColumns: '1fr 400px', gap: 52, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <V4Icon n="sun" s={18} w={1.7} c={T.cocoa} /><Mono s={12} c={T.cocoa}>thu 13 aug · ljubljana</Mono>
            </div>
            <Disp s={40}>Warm again — 32° and clear.</Disp>
            <div style={{ display: 'flex', gap: 26, marginTop: 30 }}>
              <div style={{ width: 340, flexShrink: 0, position: 'relative' }}>
                <LookCollage h={400} />
                <div style={{ position: 'absolute', top: 14, left: 14, height: 30, display: 'inline-flex', alignItems: 'center', padding: '0 13px', borderRadius: 2, background: 'rgba(247,246,245,.94)', fontFamily: fS, fontSize: 12.5, fontWeight: 600 }}>Work</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Disp s={26}>Waistcoat + balloon pants</Disp>
                <Body s={14} style={{ marginTop: 6 }}>5 pieces · logged at 8:20</Body>
                <div style={{ marginTop: 22 }}>
                  {[['BOA waistcoat', 'top', 'ink', 2], ['Zara balloon pants', 'bottoms', 'ink', 4], ['Anre tote bag', 'bag', 'peach', 6], ['Chanel pink flats', 'shoes', 'rose', 9], ['LeLabo Matcha 26', 'fragrance', 'paper', 14]].map(([n, c, t, w], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '9px 0', borderBottom: `1px solid ${T.line}` }}>
                      <div style={{ width: 34, height: 42, flexShrink: 0 }}><Ph tone={t} r={0} /></div>
                      <div style={{ flex: 1, fontFamily: fS, fontSize: 14 }}>{n}</div>
                      <Mono s={10.5}>{c}</Mono><Mono s={11} c={T.cocoa} style={{ fontWeight: 700 }}>{w}×</Mono>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                  <Btn kind="quiet" icon="repeat" style={{ height: 46, fontSize: 14 }}>Wear again</Btn>
                  <Btn kind="quiet" icon="bookmark" style={{ height: 46, fontSize: 14 }}>Save as idea</Btn>
                </div>
              </div>
            </div>
          </div>
          <div>
            <SecH right="August">This week</SecH>
            <div style={{ display: 'flex', gap: 8 }}>
              {week.map((c, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <Mono s={10.5} c={c.today ? T.ink : T.g400} style={{ fontWeight: c.today ? 700 : 400, textTransform: 'uppercase' }}>{c.w}</Mono>
                  <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 2, overflow: 'hidden', border: c.today ? `2px solid ${T.ink}` : 'none', background: c.tones ? 'none' : T.white, boxShadow: c.tones ? 'none' : `inset 0 0 0 1px ${T.line}` }}>
                    {c.tones ? <OutfitThumb tones={c.tones} gap={1.5} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.g200 }}><V4Icon n="plus" s={15} w={1.8} /></div>}
                  </div>
                  <Mono s={10} c={c.today ? T.ink : T.g400}>{c.d}</Mono>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 26 }}>
              <V4Card fill={T.peachSoft} shadow={false} pad={17}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14 }}>
                  <div><Body s={13.5} c={T.cocoa}>12 outfits logged in August</Body><Disp s={18} w={400} style={{ marginTop: 4 }}>Quieter than usual.</Disp></div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
                    {[18, 22, 26, 24, 30, 27, 27, 12].map((b, i) => <div key={i} style={{ width: 8, height: `${(b / 30) * 100}%`, borderRadius: 2, background: i === 7 ? T.cocoa : T.peachDeep }} />)}
                  </div>
                </div>
              </V4Card>
            </div>
            <div style={{ marginTop: 26 }}>
              <SecH right="Ideas">Saved for later</SecH>
              {ideaCards.slice(0, 3).map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px 0', borderBottom: `1px solid ${T.line}` }}>
                  <div style={{ width: 38, height: 47, flexShrink: 0 }}><OutfitThumb tones={c.tones} gap={1.5} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 500 }}>{c.n}</div><Mono s={10.5}>{c.o.toLowerCase()} · saved {c.d}</Mono></div>
                  <V4Icon n="next" s={16} w={1.7} c={T.g400} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DeskScreen4>
  );
}

function V4ClosetDesktop() {
  return (
    <DeskScreen4 height={940}>
      <div style={{ display: 'flex', height: '100%' }}>
        <SideNav active="closet" />
        <div style={{ flex: 1, padding: '34px 44px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
            <div><Disp s={36}>Closet</Disp><Body s={14} style={{ marginTop: 6 }}>211 pieces · 8 you haven't worn this year</Body></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn kind="quiet" icon="chart" style={{ height: 46, fontSize: 14 }}>Statistics</Btn>
              <Btn kind="peach" icon="bag" style={{ height: 46, fontSize: 14 }}>Check a piece</Btn>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${T.line}`, display: 'flex', gap: 8, padding: '20px 0 0' }}>{catPills.map(([l, n, on], i) => <Pill key={i} on={!!on} s="sm" count={n}>{l}</Pill>)}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 16px' }}>
            <div style={{ fontFamily: fS, fontSize: 13.5, fontWeight: 500 }}>Recently worn</div>
            <div style={{ display: 'flex', gap: 12, color: T.g400 }}><V4Icon n="grid" s={19} w={1.7} c={T.ink} /><V4Icon n="list" s={19} w={1.7} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 14 }}>
            {[...gridTones, ...gridTones].slice(0, 21).map((t, i) => <ItemTile key={i} tone={t} worn={[9, 12, 4, 6, 2, 14, 7, 3, 8, 1, 5, 11, 2, 9, 4, 6, 13, 1, 7, 3, 5][i]} />)}
          </div>
        </div>
      </div>
    </DeskScreen4>
  );
}

Object.assign(window, { SideNav, V4TodayDesktop, V4ClosetDesktop });
