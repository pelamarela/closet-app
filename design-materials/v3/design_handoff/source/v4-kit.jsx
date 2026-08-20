// V4 kit — Pelamarela-native primitives for the Closet app redesign.
// Replaces the mono/dashed "utility" grammar with the brand's real system:
// Syne display, Poppins UI, Space Mono for true metadata only, paper/peach/
// rose/cocoa, soft radii, hairlines instead of boxes-inside-boxes.

const W = 390;
const DW = 1440;

const T = {
  paper: '#F7F6F5', white: '#FFFFFF', ink: '#000000',
  peach: '#F2E1D0', peachSoft: '#FAF2EA', peachDeep: '#E9CBB0',
  rose: '#DFAFA1', roseSoft: '#ECCFC4', roseDeep: '#C98E7C',
  cocoa: '#6F4E37', cocoaSoft: '#8A6B54', cocoaDeep: '#543A29',
  line: '#E6E3E0', g700: '#2B2B29', g500: '#5A5854', g400: '#8A8884', g200: '#D9D6D2',
};
const fD = '"Syne", system-ui, sans-serif';
const fS = '"Poppins", system-ui, sans-serif';
const fM = '"Space Mono", ui-monospace, monospace';
const dotted = { backgroundColor: T.paper, backgroundImage: 'radial-gradient(circle, rgba(0,0,0,.13) 1px, transparent 1.4px)', backgroundSize: '22px 22px' };

// Real hover/active/disabled feedback for every button, round button and
// pill in the app — one shared stylesheet so the live prototype and the
// design system page match exactly.
if (typeof document !== 'undefined' && !document.getElementById('v4-interactive-css')) {
  const st = document.createElement('style');
  st.id = 'v4-interactive-css';
  st.textContent = `.v4-btn{transition:background .15s ease,transform .08s ease,border-color .15s ease}.v4-btn-primary:hover:not(:disabled){background:#2b2b29}.v4-btn-primary:active:not(:disabled){background:#000;transform:scale(.97)}.v4-btn-peach:hover:not(:disabled){background:${T.peachDeep}}.v4-btn-peach:active:not(:disabled){background:${T.peachDeep};transform:scale(.97)}.v4-btn-quiet:hover:not(:disabled){background:rgba(0,0,0,.045);border-color:${T.g400}}.v4-btn-quiet:active:not(:disabled){background:rgba(0,0,0,.08);transform:scale(.97)}.v4-btn-white:hover:not(:disabled){background:${T.paper}}.v4-btn-white:active:not(:disabled){background:${T.g200};transform:scale(.97)}.v4-btn:disabled{opacity:.38;cursor:not-allowed}.v4-round{transition:background .15s ease,transform .08s ease}.v4-round-quiet:hover:not(:disabled){background:rgba(0,0,0,.045)}.v4-round-peach:hover:not(:disabled){background:${T.peachDeep}}.v4-round:active:not(:disabled){transform:scale(.94)}.v4-round:disabled{opacity:.38;cursor:not-allowed}.v4-pill{cursor:pointer;transition:border-color .15s ease,background .15s ease,transform .08s ease}.v4-pill:not(.v4-pill-on):hover{border-color:${T.g400}}.v4-pill:not(.v4-pill-on):active{background:rgba(0,0,0,.05);transform:scale(.97)}.v4-pill.v4-pill-on:active{transform:scale(.97);opacity:.85}.v4-tile{cursor:pointer;transition:box-shadow .15s ease,transform .08s ease}.v4-tile:hover{box-shadow:inset 0 0 0 1.5px ${T.g400}}.v4-tile:active{transform:scale(.97)}.v4-row4{cursor:pointer;transition:background .15s ease;margin:0 -12px;padding-left:12px;padding-right:12px}.v4-row4:hover{background:rgba(0,0,0,.03)}.v4-dd-trig{cursor:pointer;display:inline-flex;align-items:center;gap:5px}.v4-dd-opt{cursor:pointer;transition:background .12s ease}.v4-dd-opt:hover{background:rgba(0,0,0,.04)}`;
  document.head.appendChild(st);
}

function V4Icon({ n, s = 22, w = 1.6, c, style }) {
  const p = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: c || 'currentColor', strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const d = {
    home: 'M4 11l8-6.5L20 11M6.5 9.4V19h11V9.4',
    hanger: 'M12 7.5a2 2 0 1 1 2-2M12 7.5v2M3.5 17.5 12 11.5l8.5 6M4 17.5h16',
    bulb: 'M9 18h6M10 21h4M8 13a4.6 4.6 0 1 1 8 0c-.7 1.1-1 1.9-1 3H9c0-1.1-.3-1.9-1-3Z',
    user: 'M12 11.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8ZM5.5 20a6.5 6.5 0 0 1 13 0',
    plus: 'M12 5.5v13M5.5 12h13',
    check: 'M5 12.5l4.5 4.5L19 6.5',
    back: 'M15 5.5 8.5 12 15 18.5',
    next: 'M9 5.5 15.5 12 9 18.5',
    close: 'M6 6l12 12M18 6 6 18',
    spark: 'M12 3.5l1.7 5.3 5.3 1.7-5.3 1.7L12 17.5l-1.7-5.3L5 10.5l5.3-1.7zM18.5 16.5l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6z',
    cal: 'M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 3.5v4M15.5 3.5v4',
    sun: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4',
    heart: 'M12 19.5s-6.8-4.2-6.8-9.2A3.9 3.9 0 0 1 12 7.6a3.9 3.9 0 0 1 6.8 2.7c0 5-6.8 9.2-6.8 9.2Z',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM16.2 16.2 20.5 20.5',
    more: 'M12 5.6v.1M12 12v.1M12 18.4v.1',
    up: 'M6.5 11.5V20H4v-8.5zM6.5 11.5 10 4a2 2 0 0 1 2 2v4h4.8a2 2 0 0 1 2 2.3l-.9 4.4A2 2 0 0 1 16 20H6.5',
    down: 'M17.5 12.5V4H20v8.5zM17.5 12.5 14 20a2 2 0 0 1-2-2v-4H7.2a2 2 0 0 1-2-2.3l.9-4.4A2 2 0 0 1 8 4h8',
    box: 'M4 5.5h16v3.5H4zM5.5 9v10h13V9M10 13h4',
    archive: 'M4 5.5h16v3.5H4zM5.5 9v10h13V9M9.5 13.2h5',
    pen: 'M4.5 19.5h4L20 8a2.1 2.1 0 0 0-3-3L5.5 16.5zM15.5 6.5 18.5 9.5',
    cam: 'M4 8.5h3l1.5-2h7L17 8.5h3v11H4zM12 17a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z',
    link: 'M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.5 1.5M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1.5-1.5',
    chart: 'M5 19V11M12 19V5M19 19v-6M3.5 19h17',
    grid: 'M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z',
    list: 'M4 7h16M4 12h16M4 17h11',
    repeat: 'M5 9.5V8a2.5 2.5 0 0 1 2.5-2.5h9M19 14.5V16a2.5 2.5 0 0 1-2.5 2.5h-9M16 2.5 19 5.5 16 8.5M8 15.5 5 18.5 8 21.5',
    caret: 'M5.5 9 12 15.5 18.5 9',
    bookmark: 'M6.5 4.5h11v15l-5.5-3.8-5.5 3.8z',
    trash: 'M5 7.5h14M9.5 7.5V5.3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7.5M7 7.5 7.8 19a1.4 1.4 0 0 0 1.4 1.3h5.6A1.4 1.4 0 0 0 16.2 19l.8-11.5M10.2 11v6M13.8 11v6',
  }[n];
  return <svg {...p} style={style}><path d={d} /></svg>;
}

// Soft two-tone placeholder. Warmer + lower-contrast than V3's hard stripes.
// `crop` documents how a real photo would be framed once one replaces the
// placeholder: clothing shot on a hanger/person crops from the top, flat
// product shots (bags, fragrance) crop from the center — encoded here as a
// background-position shift on the pattern so the rule is visible today.
function Ph({ tone = 'sand', label, r = 0, crop, style }) {
  const p = {
    peach: ['#F5E7DA', '#EAD8C4', 0], rose: ['#E7C6BA', '#DAB0A1', 0],
    cocoa: ['#7C5B44', '#61452F', 1], ink: ['#2C2925', '#1A1815', 1],
    sand: ['#EDEAE5', '#DFDAD3', 0], paper: ['#F4F2EF', '#E8E4DE', 0],
  }[tone];
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: r, overflow: 'hidden', backgroundImage: `repeating-linear-gradient(122deg, ${p[0]} 0 18px, ${p[1]} 18px 36px)`, backgroundPosition: crop === 'top' ? '0 0' : '50% 50%', ...style }}>
      {label && <div style={{ position: 'absolute', left: 8, bottom: 7, fontFamily: fM, fontSize: 9, letterSpacing: '.02em', color: p[2] ? 'rgba(255,255,255,.82)' : 'rgba(0,0,0,.5)' }}>{label}</div>}
    </div>
  );
}

// An outfit has no photo of its own — it only exists as its item images, so
// it's always a composite, never a single tile. The collage groups pieces by
// importance: mains (tops/bottoms/outerwear/shoes) get a big block on the
// left; secondary/tertiary pieces (bags, jewellery, fragrance) stack in a
// narrower sidebar on the right. With no secondary pieces to split out, it
// falls back to a simple even grid. Mains crop from the top (shot on a
// hanger/person); everything else crops from the center (flat product shot).
function OutfitThumb({ tones, items, gap = 2 }) {
  // Legacy shorthand: a flat tone list. Position implies tier — the pieces
  // you'd actually wear come first and count as main, the trailing one or
  // two stand in for a bag/fragrance.
  let list = items;
  if (!list) {
    const t = (tones && tones.length ? tones : ['sand']);
    if (t.length <= 2) list = t.map(tone => ({ tone, tier: 'main' }));
    else if (t.length === 3) list = [{ tone: t[0], tier: 'main' }, { tone: t[1], tier: 'main' }, { tone: t[2], tier: 'secondary' }];
    else list = [{ tone: t[0], tier: 'main' }, { tone: t[1], tier: 'main' }, { tone: t[2], tier: 'secondary' }, { tone: t[3], tier: 'tertiary' }];
  }
  const mains = list.filter(i => i.tier === 'main');
  const rest = list.filter(i => i.tier !== 'main');

  if (rest.length === 0) {
    const cols = mains.length <= 1 ? 1 : 2;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: '1fr', gap, width: '100%', height: '100%' }}>
        {mains.map((m, i) => <Ph key={i} tone={m.tone} r={0} crop="top" />)}
      </div>
    );
  }
  const mn = mains.length;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap, width: '100%', height: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: mn > 2 ? '1fr 1fr' : '1fr', gridTemplateRows: mn === 1 ? '1fr' : '1fr 1fr', gap }}>
        {mains.map((m, i) => <Ph key={i} tone={m.tone} r={0} crop="top" style={mn === 3 && i === 2 ? { gridColumn: '1 / -1' } : undefined} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateRows: `repeat(${rest.length}, 1fr)`, gap }}>
        {rest.map((m, i) => <Ph key={i} tone={m.tone} r={0} />)}
      </div>
    </div>
  );
}

function V4Screen({ height = 844, bg = T.paper, grid = false, children, style }) {
  return <div style={{ width: W, height, position: 'relative', overflow: 'hidden', ...(grid ? dotted : { background: bg }), fontFamily: fS, color: T.ink, ...style }}>{children}</div>;
}
function DeskScreen4({ height = 900, children }) {
  return <div style={{ width: DW, height, position: 'relative', overflow: 'hidden', background: T.paper, fontFamily: fS, color: T.ink }}>{children}</div>;
}

function V4Status({ dark = false }) {
  const c = dark ? '#fff' : T.ink;
  return (
    <div style={{ height: 46, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: fS, fontSize: 14, fontWeight: 600, color: c }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: .9 }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill={c}><rect x="0" y="7" width="2.6" height="4" rx=".6" /><rect x="4.2" y="5" width="2.6" height="6" rx=".6" /><rect x="8.4" y="3" width="2.6" height="8" rx=".6" /><rect x="12.6" y="0" width="2.6" height="11" rx=".6" /></svg>
        <svg width="23" height="11" viewBox="0 0 23 11" fill={c}><rect x=".5" y=".5" width="19" height="10" rx="3" fill="none" stroke={c} strokeWidth="1" opacity=".45" /><rect x="2.2" y="2.2" width="13" height="6.6" rx="1.6" /><rect x="20.6" y="3.6" width="1.6" height="3.8" rx=".8" /></svg>
      </div>
    </div>
  );
}

// App bar. Big-title screens pass no title and set their own headline below.
function V4Bar({ title, back, right, dark = false, pad = 22 }) {
  const c = dark ? '#fff' : T.ink;
  return (
    <div style={{ height: 44, padding: `0 ${pad}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: c }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: back ? -6 : 0, fontFamily: fS, fontSize: 14, fontWeight: 500 }}>
        {back && <V4Icon n="back" s={20} w={1.7} />}{title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>{right}</div>
    </div>
  );
}

// 4 tabs + a raised Log action. One primary action, always reachable.
function V4Tabs({ active = 'today' }) {
  const tabs = [{ id: 'today', l: 'Today', i: 'home' }, { id: 'closet', l: 'Closet', i: 'hanger' }, null, { id: 'ideas', l: 'Ideas', i: 'bulb' }, { id: 'me', l: 'Me', i: 'user' }];
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 86, paddingBottom: 22, background: 'rgba(247,246,245,.94)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${T.line}`, display: 'flex', alignItems: 'center' }}>
      {tabs.map((t, i) => t === null ? (
        <div key={i} style={{ width: 78, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 2, background: T.ink, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: -30, boxShadow: '0 8px 20px rgba(0,0,0,.22)' }}>
            <V4Icon n="cal" s={22} w={1.9} />
            <div style={{ fontFamily: fS, fontSize: 8.5, fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: -1 }}>log</div>
          </div>
        </div>
      ) : (
        <div key={t.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: active === t.id ? T.ink : T.g400 }}>
          <V4Icon n={t.i} s={23} w={active === t.id ? 1.9 : 1.5} />
          <div style={{ fontFamily: fS, fontSize: 10.5, fontWeight: active === t.id ? 500 : 400 }}>{t.l}</div>
        </div>
      ))}
    </div>
  );
}

// Tap targets are 40–44px now; labels are Poppins sentence case, not 9px mono.
function Pill({ children, on = false, tone = 'ink', count, s = 'md' }) {
  const h = s === 'lg' ? 46 : s === 'sm' ? 34 : 40;
  const bg = on ? (tone === 'peach' ? T.peach : T.ink) : 'transparent';
  const fg = on ? (tone === 'peach' ? T.ink : '#fff') : T.g700;
  return (
    <span className={`v4-pill${on ? ' v4-pill-on' : ''}`} style={{ height: h, display: 'inline-flex', alignItems: 'center', gap: 6, padding: `0 ${s === 'sm' ? 13 : 17}px`, borderRadius: 2, background: bg, color: fg, border: on ? 'none' : `1px solid ${T.g200}`, fontFamily: fS, fontSize: s === 'sm' ? 12.5 : 14, fontWeight: 400, whiteSpace: 'nowrap', flexShrink: 0 }}>
      {children}{count != null && <span style={{ fontFamily: fM, fontSize: 11, opacity: .55 }}>{count}</span>}
    </span>
  );
}

function Btn({ children, kind = 'primary', icon, full, flex, disabled = false, style }) {
  const k = { primary: { background: T.ink, color: '#fff', border: 'none' }, peach: { background: T.peach, color: T.ink, border: 'none' }, quiet: { background: 'transparent', color: T.ink, border: `1px solid ${T.g200}` }, white: { background: T.white, color: T.ink, border: 'none' } }[kind];
  return (
    <button disabled={disabled} className={`v4-btn v4-btn-${kind}`} style={{ height: 52, padding: '0 22px', borderRadius: 2, cursor: disabled ? 'not-allowed' : 'pointer', width: full ? '100%' : undefined, flex, fontFamily: fS, fontSize: 14.5, fontWeight: 400, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...k, ...style }}>
      {icon && <V4Icon n={icon} s={19} w={1.9} />}{children}
    </button>
  );
}
function RoundBtn({ icon, tone = 'quiet', disabled = false }) {
  const k = tone === 'peach' ? { background: T.peach, border: 'none' } : { background: 'transparent', border: `1px solid ${T.g200}` };
  return <button disabled={disabled} className={`v4-round v4-round-${tone}`} style={{ width: 52, height: 52, padding: 0, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: disabled ? 'not-allowed' : 'pointer', ...k }}><V4Icon n={icon} s={21} w={1.7} /></button>;
}

// Type helpers — display for headlines, sans for everything readable,
// mono strictly for dates / counts / codes.
// Syne is reserved for real headlines (H1/H2, 24px+); anything smaller drops
// to Poppins at a calmer weight so small titles stop reading as shouty.
function Disp({ children, s = 28, w = 600, c = T.ink, style }) {
  const head = s >= 24;
  return <div style={{ fontFamily: head ? fD : fS, fontSize: s, fontWeight: head ? w : Math.min(w, 500), lineHeight: head ? 1.12 : 1.32, letterSpacing: head ? '-.015em' : '-.005em', color: c, textWrap: 'pretty', ...style }}>{children}</div>;
}
function Body({ children, s = 14, c = T.g500, style }) {
  return <div style={{ fontFamily: fS, fontSize: s, lineHeight: 1.6, color: c, textWrap: 'pretty', ...style }}>{children}</div>;
}
function Mono({ children, s = 11, c = T.g400, style }) {
  return <span style={{ fontFamily: fM, fontSize: s, color: c, letterSpacing: '.01em', ...style }}>{children}</span>;
}
function SecH({ children, right, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, ...style }}>
      <div style={{ fontFamily: fS, fontSize: 14.5, fontWeight: 500, color: T.ink }}>{children}</div>
      {right && <div style={{ fontFamily: fS, fontSize: 13, color: T.cocoa, display: 'flex', alignItems: 'center', gap: 3 }}>{right}<V4Icon n="next" s={14} w={2} /></div>}
    </div>
  );
}
function V4Card({ children, fill = T.white, pad = 16, r = 0, shadow = true, style }) {
  return <div style={{ background: fill, borderRadius: r, padding: pad, boxShadow: shadow ? '0 2px 10px rgba(0,0,0,.045)' : 'none', ...style }}>{children}</div>;
}
function Row4({ label, value, chev = true, sub, last }) {
  return (
    <div className="v4-row4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 54, borderBottom: last ? 'none' : `1px solid ${T.line}` }}>
      <div><div style={{ fontFamily: fS, fontSize: 15 }}>{label}</div>{sub && <div style={{ fontFamily: fS, fontSize: 12, color: T.g400, marginTop: 1 }}>{sub}</div>}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.g400 }}>{value && <span style={{ fontFamily: fM, fontSize: 12.5 }}>{value}</span>}{chev && <V4Icon n="next" s={16} w={1.8} />}</div>
    </div>
  );
}
// Bottom sheet over a dimmed screen — used for Log, Suggest brief, Shop check.
function Sheet({ children, h, title, right, step }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: h, background: T.paper, borderRadius: 2, boxShadow: '0 -14px 40px rgba(0,0,0,.16)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}><div style={{ width: 40, height: 4, borderRadius: 2, background: T.g200 }} /></div>
      <div style={{ padding: '12px 22px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>{title}{step && <div style={{ marginTop: 8 }}><Dots n={2} i={step - 1} /></div>}</div>
        <div style={{ paddingTop: 4 }}>{right}</div>
      </div>
      {children}
    </div>
  );
}
function Scrim({ children }) {
  return <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.34)' }}>{children}</div>;
}
function Dots({ n = 3, i = 0 }) {
  return <div style={{ display: 'flex', gap: 6 }}>{Array.from({ length: n }, (_, k) => <div key={k} style={{ width: k === i ? 20 : 6, height: 6, borderRadius: 2, background: k === i ? T.ink : T.g200 }} />)}</div>;
}
// Visual encoding instead of a mono number in a row.
function BarStat({ label, v, max = 100, suffix = '%', tone = T.cocoa, thumb }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0' }}>
      {thumb && <div style={{ width: 34, height: 42, flexShrink: 0 }}><Ph tone={thumb} r={0} /></div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontFamily: fS, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
          <Mono s={12} c={T.ink} style={{ fontWeight: 700, paddingLeft: 10 }}>{v}{suffix}</Mono>
        </div>
        <div style={{ height: 6, borderRadius: 2, background: T.g200 }}><div style={{ width: `${(v / max) * 100}%`, height: 6, borderRadius: 2, background: tone }} /></div>
      </div>
    </div>
  );
}
// 5-dot scale — replaces "warmth 2 / 5" mono text.
function DotScale({ v, n = 5, tone = T.cocoa }) {
  return <div style={{ display: 'flex', gap: 4 }}>{Array.from({ length: n }, (_, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: 2, background: i < v ? tone : T.g200 }} />)}</div>;
}
// Trigger + options panel for time-grain and rail-style pickers (Statistics
// header, category sort). `open` is a static prop for documentation — the
// live app would wire this to local state.
function Dropdown({ value, options = [], open = false, align = 'right', size = 'md' }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div className="v4-dd-trig" style={{ fontFamily: fS, fontSize: size === 'sm' ? 13 : 14, fontWeight: 600, color: T.ink }}>
        {value}<V4Icon n="caret" s={16} w={2.2} style={open ? { transform: 'rotate(180deg)' } : undefined} />
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', [align]: 0, minWidth: 168, background: T.white, borderRadius: 2, boxShadow: '0 10px 28px rgba(0,0,0,.14)', border: `1px solid ${T.line}`, overflow: 'hidden', zIndex: 10 }}>
          {options.map((o, i) => (
            <div key={o} className="v4-dd-opt" style={{ padding: '12px 16px', fontFamily: fS, fontSize: 14, fontWeight: o === value ? 600 : 400, background: o === value ? T.peachSoft : 'transparent', color: T.ink, borderBottom: i < options.length - 1 ? `1px solid ${T.line}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {o}{o === value && <V4Icon n="check" s={15} w={2.2} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { W, DW, T, fD, fS, fM, dotted, V4Icon, Ph, OutfitThumb, V4Screen, DeskScreen4, V4Status, V4Bar, V4Tabs, Pill, Btn, RoundBtn, Disp, Body, Mono, SecH, V4Card, Row4, Sheet, Scrim, Dots, BarStat, DotScale, Dropdown });
