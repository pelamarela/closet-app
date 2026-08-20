// Closet App V4 — Design System reference. Documents the actual v4-kit
// primitives (not a restyle) so this page and the app can never drift apart.
// Structure: a quick-nav for orientation, then every group of examples sits
// inside a bordered white "stage" so what belongs together reads as one unit.

const PAGE_W = 1240;
const GUTTER = 'clamp(18px, 5vw, 56px)';
const SECTIONS = [['s-01', '01', 'Type'], ['s-02', '02', 'Colour'], ['s-03', '03', 'Visual elements'], ['s-04', '04', 'Components'], ['s-05', '05', 'Patterns']];

function Wrap({ children }) { return <div style={{ width: '100%', maxWidth: PAGE_W, margin: '0 auto', padding: `0 ${GUTTER} 120px`, boxSizing: 'border-box' }}>{children}</div>; }

function QuickNav() {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 5, background: 'rgba(247,246,245,.92)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${T.line}` }}>
      <div style={{ width: '100%', maxWidth: PAGE_W, margin: '0 auto', display: 'flex', gap: 4, padding: `10px ${GUTTER}`, overflowX: 'auto', boxSizing: 'border-box' }}>
        {SECTIONS.map(([id, n, t]) => (
          <a key={id} href={'#' + id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', fontFamily: fS, fontSize: 13, fontWeight: 500, color: T.ink, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <Mono s={10.5} c={T.peachDeep} style={{ fontWeight: 700 }}>{n}</Mono>{t}
          </a>
        ))}
      </div>
    </div>
  );
}

function Section({ id, n, title, sub, children }) {
  return (
    <div id={id} style={{ padding: '52px 0 56px', borderTop: `1px solid ${T.line}`, scrollMarginTop: 60 }}>
      <div style={{ display: 'flex', gap: 28, marginBottom: 34 }}>
        <Mono s={13} c={T.peachDeep} style={{ fontWeight: 700, paddingTop: 6 }}>{n}</Mono>
        <div style={{ maxWidth: 640 }}>
          <Disp s={30} style={{ marginBottom: sub ? 8 : 0 }}>{title}</Disp>
          {sub && <Body s={14.5}>{sub}</Body>}
        </div>
      </div>
      {children}
    </div>
  );
}

// Every example set lives inside one of these — a consistent white boundary
// that separates "what this is" (the label above) from the page around it,
// and from the next component's stage below.
function Stage({ children, pad = '26px 28px' }) {
  return <div style={{ background: T.white, boxShadow: `inset 0 0 0 1px ${T.line}`, padding: pad, maxWidth: '100%', overflowX: 'auto', boxSizing: 'border-box' }}>{children}</div>;
}
function Group({ label, note, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: fS, fontSize: 13, fontWeight: 600, color: T.ink }}>{label}</div>
        {note && <Body s={12} c={T.g400} style={{ marginTop: 4, maxWidth: 560 }}>{note}</Body>}
      </div>
      <Stage>{children}</Stage>
    </div>
  );
}
function Swatch({ name, hex, on }) {
  const fg = on ? '#fff' : T.ink;
  return (
    <div style={{ width: 150 }}>
      <div style={{ height: 88, background: hex, display: 'flex', alignItems: 'flex-end', padding: 10, boxShadow: hex === '#FFFFFF' || hex === T.paper ? `inset 0 0 0 1px ${T.line}` : 'none' }}>
        <Mono s={10.5} c={fg} style={{ opacity: .85 }}>{hex}</Mono>
      </div>
      <div style={{ fontFamily: fS, fontSize: 12.5, fontWeight: 500, marginTop: 8 }}>{name}</div>
    </div>
  );
}
// Wraps one example with its state name underneath — every variant of a
// component shown side by side rather than one sample instance.
function St({ label, children, align = 'center' }) {
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : 'center', gap: 10 }}>{children}<Mono s={10} c={T.g400}>{label}</Mono></div>;
}
function Row({ children, gap = 26, wrap = true }) { return <div style={{ display: 'flex', gap, flexWrap: wrap ? 'wrap' : 'nowrap', alignItems: 'flex-start' }}>{children}</div>; }
// Non-interactive preview of a button's hover/active look — CSS pseudo-
// classes can't be forced on-screen, so these mirror the real stylesheet's
// values exactly (see BTN_STATE_BG) for documentation purposes.
const BTN_STATE_BG = {
  primary: { hover: '#2b2b29', active: '#000000' },
  peach: { hover: T.peachDeep, active: T.peachDeep },
  quiet: { hover: 'rgba(0,0,0,.045)', active: 'rgba(0,0,0,.08)' },
  white: { hover: T.paper, active: T.g200 },
};
function StaticBtnState({ kind, bg, icon, children }) {
  const fg = { primary: '#fff', peach: T.ink, quiet: T.ink, white: T.ink }[kind];
  const border = kind === 'quiet' ? `1px solid ${T.g400}` : 'none';
  return <div style={{ height: 52, padding: '0 22px', borderRadius: 2, background: bg, color: fg, border, fontFamily: fS, fontSize: 14.5, fontWeight: 400, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{icon && <V4Icon n={icon} s={19} w={1.9} />}{children}</div>;
}
// For mockups that are themselves a piece of the app canvas (tab bar, app
// bar, sheets) — kept on paper so they read as "app surface", set apart from
// the white documentation stage around them.
function Mock({ children, w = 390, style }) { return <div style={{ width: w, background: T.paper, boxShadow: `0 0 0 1px ${T.line}`, ...style }}>{children}</div>; }

const ICONS = [
  ['home', 'Today tab (the app\u2019s home/landing screen)'],
  ['hanger', 'Closet tab; add-item entry points; Shop\u2019s \u201ccheck what I own\u201d'],
  ['bulb', 'Ideas tab'],
  ['user', 'Account / settings entry point'],
  ['plus', 'Add-new affordance (e.g. the Wardrobe add button)'],
  ['cal', 'Calendar; the Log Outfit action'],
  ['spark', 'AI-generated actions \u2014 Suggest, drafting, verdicts'],
  ['check', 'Confirm / save; grid selection; completed step'],
  ['bookmark', 'Save as an idea'],
  ['bag', 'Shop tab'],
  ['archive', 'Archive an item'],
  ['trash', 'Delete a record'],
  ['pen', 'Edit a record'],
  ['back', 'Navigate back / cancel'],
  ['next', 'Row disclosure chevron'],
  ['close', 'Dismiss / reject / negative'],
  ['cam', 'Photo capture / retake'],
  ['chart', 'Statistics'],
  ['grid', 'Grid view'],
  ['list', 'List view'],
  ['repeat', 'Wear again / re-use'],
  ['caret', 'Dropdown trigger'],
  ['sun', 'Weather context'],
  ['heart', 'Generic favourite'],
  ['more', 'Overflow menu'],
  ['up', 'Trend \u2014 increase'],
  ['down', 'Trend \u2014 decrease'],
  ['link', 'Paste a link'],
];

function DSPage() {
  return (
    <div style={{ fontFamily: fS, color: T.ink }}>
      <div style={{ background: T.ink, color: '#fff', padding: '54px 0 40px' }}>
        <div style={{ width: '100%', maxWidth: PAGE_W, margin: '0 auto', padding: `0 ${GUTTER}`, boxSizing: 'border-box' }}>
          <Mono s={12} c={T.peach}>closet app · v4</Mono>
          <Disp s={44} c="#fff" style={{ marginTop: 12, maxWidth: 720 }}>Design system</Disp>
          <Body s={15.5} c="rgba(255,255,255,.7)" style={{ marginTop: 12, maxWidth: 560 }}>The fonts, colour, visual language and components behind Closet V4 — the single source of truth every screen is built from.</Body>
        </div>
      </div>
      <QuickNav />

      <Wrap>
        {/* 01 — TYPE */}
        <Section id="s-01" n="01" title="Type" sub="Three families, three jobs. Syne is reserved for real headlines at 24px and up — everything smaller drops to Poppins, capped at medium weight, so small titles stay calm. Mono is reserved for true metadata.">
          <Row gap={20}>
            <div style={{ flex: '1 1 260px', minWidth: 240 }}><Group label="Display · Syne — 24px and up only">
              <div style={{ fontFamily: fD, fontSize: 38, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-.02em' }}>Warm again.</div>
              <Mono s={11} style={{ display: 'block', marginTop: 14 }}>page &amp; section headlines · weight 600–700</Mono>
            </Group></div>
            <div style={{ flex: '1 1 260px', minWidth: 240 }}><Group label="UI · Poppins — everything else">
              <div style={{ fontFamily: fS, fontSize: 17, lineHeight: 1.5 }}>Body copy, buttons, small titles, nav.</div>
              <Mono s={11} style={{ display: 'block', marginTop: 14 }}>weight 400–600, capped at 500 below 24px</Mono>
            </Group></div>
            <div style={{ flex: '1 1 260px', minWidth: 240 }}><Group label="Metadata · Space Mono — unchanged">
              <div style={{ fontFamily: fM, fontSize: 14 }}>13 aug · 9× · 87%</div>
              <Mono s={11} style={{ display: 'block', marginTop: 14 }}>dates, wear counts, scores — never sentences</Mono>
            </Group></div>
          </Row>
          <Group label="Scale — rendered through the app's own Disp component" note="Below 24px, Disp auto-switches family to Poppins and caps weight at 500 — this is what every screen actually renders, not an approximation.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[[44, 700, 'Page headline — Today\'s weather line'], [30, 600, 'Screen title — Closet, Ideas, Me'], [24, 600, 'Threshold — last size that stays Syne'], [21, 600, 'Item / idea detail title'], [16, 600, 'Card title'], [14.5, 500, 'Section header (SecH)']].map(([s, w, l], i) => {
                const head = s >= 24;
                return (
                  <div key={i} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '6px 22px', borderBottom: i < 5 ? `1px solid ${T.line}` : 'none', paddingBottom: 14 }}>
                    <div style={{ width: 240, flexShrink: 0 }}><Mono s={11} c={T.g400}>{l}</Mono></div>
                    <div style={{ width: 120, flexShrink: 0 }}><Mono s={10.5} c={head ? T.cocoa : T.roseDeep}>{head ? 'Syne' : 'Poppins'} · {head ? w : Math.min(w, 500)}</Mono></div>
                    <Disp s={s} w={w}>Sample text</Disp>
                  </div>
                );
              })}
            </div>
          </Group>
        </Section>

        {/* 02 — COLOUR */}
        <Section id="s-02" n="02" title="Colour" sub="Paper dominates, ink carries the message, peach and rose are accents — Pelamarela's palette, unchanged. Cocoa reads as this app's voice: AI reasoning, callouts, verdicts.">
          <Group label="Base">
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <Swatch name="Paper — background" hex={T.paper} />
              <Swatch name="White — cards" hex={T.white} />
              <Swatch name="Ink — type & primary" hex={T.ink} on />
            </div>
          </Group>
          <Group label="Peach">
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <Swatch name="Peach soft — tints" hex={T.peachSoft} />
              <Swatch name="Peach — emphasis fills" hex={T.peach} />
              <Swatch name="Peach deep — chart high" hex={T.peachDeep} />
            </div>
          </Group>
          <Group label="Rose">
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <Swatch name="Rose soft" hex={T.roseSoft} />
              <Swatch name="Rose — accents" hex={T.rose} />
              <Swatch name="Rose deep — warnings, low scores" hex={T.roseDeep} on />
            </div>
          </Group>
          <Group label="Cocoa & grey">
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <Swatch name="Cocoa — reasoning text" hex={T.cocoa} on />
              <Swatch name="Cocoa soft" hex={T.cocoaSoft} on />
              <Swatch name="Grey 500 — body" hex={T.g500} on />
              <Swatch name="Grey 400 — muted" hex={T.g400} on />
              <Swatch name="Grey 200 — hairlines" hex={T.g200} />
              <Swatch name="Line" hex={T.line} />
            </div>
          </Group>
        </Section>

        {/* 03 — VISUAL ELEMENTS */}
        <Section id="s-03" n="03" title="Visual elements" sub="Corners are sharp — 0 on imagery, 2px on containers. Clothes stand in for photography: warm two-tone diagonals per item, always a four-tile composite for outfits.">
          <Group label="Item placeholder — one garment">
            <div style={{ display: 'flex', gap: 14 }}>
              {['sand', 'peach', 'rose', 'ink', 'cocoa', 'paper'].map((t, i) => (
                <div key={i} style={{ width: 84, height: 100 }}><Ph tone={t} label={t} /></div>
              ))}
            </div>
          </Group>
          <Group label="Outfit thumbnail" note="Mains (top/bottom/outerwear/shoes) get a big block on the left; secondary/tertiary (bags, fragrance) stack in a narrower sidebar. No secondary pieces → falls back to an even grid. Mains crop from the top (shot on a hanger); everything else crops from the center (flat product shot).">
            <Row gap={22}>
              <St label="2 main + bag + fragrance" align="left"><div style={{ width: 200, height: 108 }}><OutfitThumb items={[{ tone: 'ink', tier: 'main' }, { tone: 'ink', tier: 'main' }, { tone: 'peach', tier: 'secondary' }, { tone: 'paper', tier: 'tertiary' }]} gap={2} /></div></St>
              <St label="3 main + bag" align="left"><div style={{ width: 200, height: 108 }}><OutfitThumb items={[{ tone: 'sand', tier: 'main' }, { tone: 'rose', tier: 'main' }, { tone: 'ink', tier: 'main' }, { tone: 'peach', tier: 'secondary' }]} gap={2} /></div></St>
              <St label="mains only → even grid" align="left"><div style={{ width: 130, height: 108 }}><OutfitThumb items={[{ tone: 'peach', tier: 'main' }, { tone: 'rose', tier: 'main' }]} gap={2} /></div></St>
              <St label="single piece" align="left"><div style={{ width: 90, height: 108 }}><OutfitThumb items={[{ tone: 'sand', tier: 'main' }]} gap={2} /></div></St>
            </Row>
          </Group>
          <Group label="Corners & surfaces">
            <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
              <St label="containers · 2px"><div style={{ width: 88, height: 88, background: T.paper, borderRadius: 2, boxShadow: `inset 0 0 0 1px ${T.line}` }} /></St>
              <St label="imagery · 0"><div style={{ width: 88, height: 88, background: T.peach, borderRadius: 0 }} /></St>
              <St label="dotted grid · empty states"><div style={{ width: 88, height: 88, ...dotted, boxShadow: `inset 0 0 0 1px ${T.line}` }} /></St>
            </div>
          </Group>
          <Group label="Icon set — meaning is fixed per icon" note="1.6–1.9px stroke, no fill, 22–24px default. Every icon carries one job across the app — reused for its meaning, never borrowed for its shape.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 32px' }}>
              {ICONS.map(([n, meaning]) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 2, background: T.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><V4Icon n={n} s={19} w={1.6} /></div>
                  <div style={{ minWidth: 0 }}>
                    <Mono s={10.5} c={T.ink} style={{ fontWeight: 700 }}>{n}</Mono>
                    <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g500, marginTop: 1 }}>{meaning}</div>
                  </div>
                </div>
              ))}
            </div>
          </Group>
          <Group label="Wave motif" note="Pelamarela's hand-painted brushstroke — a quiet flourish for moments with no data yet: nothing logged, a suggestion loading, a save confirmed. Never on ordinary content screens.">
            <Row gap={30}>
              <St label="empty state (Today)"><img src="assets/wave.png" alt="" style={{ width: 76 }} /></St>
              <St label="loading (Suggest)"><img src="assets/wave.png" alt="" style={{ width: 76 }} /></St>
              <St label="confirmation (Log saved)"><img src="assets/wave-rose.png" alt="" style={{ width: 92 }} /></St>
            </Row>
          </Group>
        </Section>

        {/* 04 — COMPONENTS */}
        <Section id="s-04" n="04" title="Components" sub="Every repeating pattern in the app, pulled live from the same kit the screens use — each one grouped in its own stage with every state shown side by side.">
          <Group label="App top bar" note="Logo + wordmark + avatar, with the tab bar's hairline repeated on the underside. Sits above the contextual bar (back button, title, or a screen's own header) on every screen in the app.">
            <Mock><TodayHeader /></Mock>
          </Group>
          <Group label="Buttons — 4 kinds">
            <Row gap={30}>
              <St label="primary"><Btn icon="plus">Wear it today</Btn></St>
              <St label="peach"><Btn kind="peach" icon="spark">Suggest three looks</Btn></St>
              <St label="quiet"><Btn kind="quiet" icon="bookmark">Save to idea</Btn></St>
              <St label="white"><Btn kind="white" icon="spark">Draft from history</Btn></St>
              <St label="no icon"><Btn>Done</Btn></St>
            </Row>
            <div style={{ height: 22 }} />
            <Row gap={24}>
              <St label="full width, flex 1" align="left"><div style={{ width: 220 }}><Btn full icon="check">Save</Btn></div></St>
              <St label="round · quiet"><RoundBtn icon="bookmark" /></St>
              <St label="round · peach"><RoundBtn icon="close" tone="peach" /></St>
            </Row>
          </Group>
          <Group label="Buttons — interaction states" note="Real buttons — hover any idle example above to feel it. Disabled uses the native attribute, dimmed automatically by the same stylesheet.">
            {['primary', 'peach', 'quiet', 'white'].map((kind, ki) => (
              <div key={kind} style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: ki === 3 ? 0 : 18 }}>
                <div style={{ width: 54, flexShrink: 0 }}><Mono s={11} c={T.g400}>{kind}</Mono></div>
                <St label="idle"><Btn kind={kind} icon="check">Save</Btn></St>
                <St label="hover"><StaticBtnState kind={kind} bg={BTN_STATE_BG[kind].hover} icon="check">Save</StaticBtnState></St>
                <St label="active"><StaticBtnState kind={kind} bg={BTN_STATE_BG[kind].active} icon="check">Save</StaticBtnState></St>
                <St label="disabled"><Btn kind={kind} icon="check" disabled>Save</Btn></St>
              </div>
            ))}
          </Group>
          <Group label="Pills & tags — size × on/off × count">
            <Row gap={20}>
              <St label="lg · on"><Pill s="lg" on>Work</Pill></St>
              <St label="lg · off"><Pill s="lg">Casual</Pill></St>
              <St label="md · on"><Pill on>Selected</Pill></St>
              <St label="md · off"><Pill>Unselected</Pill></St>
              <St label="md · peach on"><Pill on tone="peach">Peach on</Pill></St>
              <St label="md · with count"><Pill count={46}>Tops</Pill></St>
              <St label="sm · on"><Pill s="sm" on>Small on</Pill></St>
              <St label="sm · off"><Pill s="sm">Small off</Pill></St>
              <St label="sm · on + count"><Pill s="sm" on count={14}>All</Pill></St>
            </Row>
            <div style={{ height: 18 }} />
            <Row gap={20}>
              <St label="off · idle"><Pill>Casual</Pill></St>
              <St label="off · hover"><span className="v4-pill" style={{ height: 40, display: 'inline-flex', alignItems: 'center', padding: '0 17px', borderRadius: 2, border: `1px solid ${T.g400}`, fontFamily: fS, fontSize: 14 }}>Casual</span></St>
              <St label="on · idle"><Pill on>Casual</Pill></St>
              <St label="on · active (press)"><span style={{ height: 40, display: 'inline-flex', alignItems: 'center', padding: '0 17px', borderRadius: 2, background: T.ink, color: '#fff', opacity: .85, transform: 'scale(.97)', fontFamily: fS, fontSize: 14 }}>Casual</span></St>
            </Row>
          </Group>
          <Group label="Dot scale — every value, both tones">
            <Row gap={30}>{[0, 1, 2, 3, 4, 5].map(v => <St key={'c' + v} label={'cocoa · ' + v}><DotScale v={v} /></St>)}</Row>
            <div style={{ height: 18 }} />
            <Row gap={30}>{[0, 1, 3, 5].map(v => <St key={'r' + v} label={'rose deep · ' + v}><DotScale v={v} tone={T.roseDeep} /></St>)}</Row>
          </Group>
          <Group label="Bar stat — value, thumbnail, tone">
            <div style={{ maxWidth: 440 }}>
              <BarStat label="Colour harmony" v={92} />
              <BarStat label="Fills a real gap — low value, muted tone" v={24} tone={T.g400} />
              <BarStat label="With a thumbnail" v={12} max={12} suffix="×" thumb="rose" />
            </div>
          </Group>
          <Group label="List row & section header">
            <div style={{ maxWidth: 460 }}>
              <SecH right="See all">Section header, with link</SecH>
              <SecH>Section header, no link</SecH>
              <Row4 label="Plain row, chevron only" />
              <Row4 label="With a value" value="9×" />
              <Row4 label="With a sub-label" sub="A nudge if you haven't logged by 9pm" value="On" />
              <Row4 label="No chevron" chev={false} value="Burgundy / pink" />
              <Row4 label="Last row — no divider" last />
            </div>
            <div style={{ height: 8 }} />
            <div style={{ maxWidth: 460, background: 'rgba(0,0,0,.03)', margin: '0 -12px', padding: '0 12px' }}><Row4 label="Row — hover state" value="9×" last /></div>
          </Group>
          <Group label="Cards — fill × shadow">
            <Row gap={16}>
              <St label="white · shadow" align="left"><V4Card style={{ width: 240 }}><Body s={13.5} c={T.g700}>Default card — content groupings.</Body></V4Card></St>
              <St label="peach-soft · flat" align="left"><V4Card fill={T.peachSoft} shadow={false} style={{ width: 240 }}><Body s={13.5} c={T.cocoa}>AI reasoning, tips, empty-state prompts.</Body></V4Card></St>
              <St label="peach · flat" align="left"><V4Card fill={T.peach} shadow={false} style={{ width: 240 }}><Disp s={16}>Highest emphasis</Disp><Body s={13} c={T.cocoa} style={{ marginTop: 6 }}>Shop CTA, a verdict.</Body></V4Card></St>
            </Row>
          </Group>
          <Group label="Navigation — tab bar, every active state">
            <Row gap={18}>
              {['today', 'closet', 'ideas', 'me'].map(a => (
                <St key={a} label={'active: ' + a}><Mock style={{ height: 86, position: 'relative' }}><V4Tabs active={a} /></Mock></St>
              ))}
            </Row>
          </Group>
          <Group label="App bar — title only, with back, with back + actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Mock><V4Bar title="Today" /></Mock>
              <Mock><V4Bar back title="Ideas" /></Mock>
              <Mock><V4Bar back title="Closet" right={<><V4Icon n="pen" s={20} w={1.6} /><V4Icon n="more" s={22} w={2.4} /></>} /></Mock>
            </div>
          </Group>
          <Group label="Item tile — default, worn count, selected, both">
            <Row gap={16}>
              <St label="default"><div style={{ width: 90, height: 108 }}><ItemTile tone="peach" /></div></St>
              <St label="worn count"><div style={{ width: 90, height: 108 }}><ItemTile tone="rose" worn={9} /></div></St>
              <St label="selected"><div style={{ width: 90, height: 108 }}><ItemTile tone="ink" sel /></div></St>
              <St label="worn + selected"><div style={{ width: 90, height: 108 }}><ItemTile tone="sand" worn={4} sel /></div></St>
            </Row>
            <div style={{ height: 18 }} />
            <Row gap={16}>
              <St label="hover"><div style={{ width: 90, height: 108, boxShadow: `inset 0 0 0 1.5px ${T.g400}`, overflow: 'hidden' }}><Ph tone="peach" /></div></St>
              <St label="active (press)"><div style={{ width: 90, height: 108, transform: 'scale(.97)', overflow: 'hidden', boxShadow: `inset 0 0 0 1px ${T.line}` }}><Ph tone="peach" /></div></St>
            </Row>
          </Group>
          <Group label="Dropdown — closed, open, with a checked option">
            <Row gap={40}>
              <St label="closed"><Dropdown value="Monthly" options={['Weekly', 'Monthly', 'Yearly']} /></St>
              <div style={{ position: 'relative', height: 210 }}>
                <St label="open" align="left"><Dropdown value="Monthly" options={['Weekly', 'Monthly', 'Yearly']} open align="left" /></St>
              </div>
            </Row>
          </Group>
          <Group label="Bottom sheet — with step dots, without">
            <Row gap={20}>
              <St label="multi-step (step 1 of 2)" align="left">
                <div style={{ width: 300, height: 220, position: 'relative', background: '#8a8884', overflow: 'hidden' }}>
                  <Scrim><Sheet h={220} step={1} title={<Disp s={18}>Step title</Disp>} right={<V4Icon n="close" s={18} w={1.8} />}><div style={{ padding: '12px 20px 0' }}><Body s={12.5}>Log's two-step flow.</Body></div></Sheet></Scrim>
                </div>
              </St>
              <St label="single step" align="left">
                <div style={{ width: 300, height: 220, position: 'relative', background: '#8a8884', overflow: 'hidden' }}>
                  <Scrim><Sheet h={220} title={<Disp s={18}>Sheet title</Disp>} right={<V4Icon n="close" s={18} w={1.8} />}><div style={{ padding: '12px 20px 0' }}><Body s={12.5}>Suggest and Shop launch as one-step sheets.</Body></div></Sheet></Scrim>
                </div>
              </St>
            </Row>
          </Group>
        </Section>

        {/* 05 — PATTERNS */}
        <Section id="s-05" n="05" title="Composite patterns" sub="Structural pieces built from the components above — reused across Today, Log, Statistics and Desktop rather than redrawn per screen.">
          <Group label="Selection tray — Log"><Mock><Tray /></Mock></Group>
          <Group label="Worn-most / worn-least row" note="Thumbnail ranking, not a labelled bar chart."><div style={{ width: 460 }}><WornRow items={[['sand', 12], ['ink', 9], ['rose', 9], ['peach', 8], ['ink', 7]]} /></div></Group>
          <Group label="Statistics header — tab + time-grain + period rail"><Mock><V4Status /><StatsHead /></Mock></Group>
          <Group label="Week strip" note="Day cell as outfit composite; today ringed."><Mock style={{ padding: '16px 0' }}><WeekStrip /></Mock></Group>
          <Group label="Month calendar cell"><div style={{ width: 200 }}><CalCells /></div></Group>
          <Group label="Trend sparkline card"><div style={{ width: 390 }}><MonthTrend /></div></Group>
          <Group label="Desktop side navigation"><div style={{ width: 236, height: 420, position: 'relative', background: T.paper, boxShadow: `inset 0 0 0 1px ${T.line}` }}><SideNav /></div></Group>
        </Section>
      </Wrap>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<DSPage />);
