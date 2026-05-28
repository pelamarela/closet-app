// Shared primitives used by all three mood variations.

// Mobile canvas size matches an iPhone 14 viewport (no device chrome — the
// canvas requested screens-only).
const SCREEN_W = 390;
const SCREEN_H = 844;

// Color tokens from the user's palette.
const C = {
  bg:    '#F7F6F5',
  cream: '#F2E1D0',
  blush: '#DFAFA1',
  ink:   '#0A0A0A',
};

// Diagonal-stripe photo placeholder. Two tones from the palette, with a
// monospace caption naming what the slot is for. Pass `tone` to swap between
// cream / blush / neutral. The aspect comes from the wrapping element.
function StripedPlaceholder({ tone = 'cream', label = 'item', radius = 8, style }) {
  const palette = {
    cream:   { a: '#F2E1D0', b: '#E8D3BD' },
    blush:   { a: '#DFAFA1', b: '#D29C8C' },
    neutral: { a: '#ECEAE6', b: '#DCD9D3' },
    ink:     { a: '#1A1A1A', b: '#0A0A0A' },
  }[tone];
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      borderRadius: radius, overflow: 'hidden',
      background:
        `repeating-linear-gradient(135deg, ${palette.a} 0 14px, ${palette.b} 14px 28px)`,
      ...style,
    }}>
      <div style={{
        position: 'absolute', left: 8, bottom: 8,
        fontFamily: 'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, monospace',
        fontSize: 9, letterSpacing: '0.04em', textTransform: 'lowercase',
        color: tone === 'ink' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)',
        padding: '2px 5px',
        background: tone === 'ink' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)',
        borderRadius: 3,
        backdropFilter: 'blur(2px)',
      }}>{label}</div>
    </div>
  );
}

// Tiny stroke-icon set used in nav + filters. Sized 1em; stroke color
// inherited from `currentColor` so callers control hue + active state.
function Icon({ name, size = 20, stroke = 1.5 }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (name) {
    case 'hanger':
      return (<svg {...common}><path d="M12 8a2 2 0 1 1 2-2"/><path d="M12 8v2"/><path d="M3 18l9-6 9 6"/><path d="M3 18h18"/></svg>);
    case 'plus':
      return (<svg {...common}><path d="M12 5v14M5 12h14"/></svg>);
    case 'calendar':
      return (<svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>);
    case 'spark':
      return (<svg {...common}><path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/></svg>);
    case 'search':
      return (<svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>);
    case 'filter':
      return (<svg {...common}><path d="M3 6h18M6 12h12M10 18h4"/></svg>);
    case 'more':
      return (<svg {...common}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>);
    case 'back':
      return (<svg {...common}><path d="M15 6l-6 6 6 6"/></svg>);
    case 'star':
      return (<svg {...common}><path d="M12 3l2.7 6 6.3.6-4.8 4.3 1.5 6.4L12 17l-5.7 3.3L7.8 13.9 3 9.6l6.3-.6z"/></svg>);
    case 'sun':
      return (<svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>);
    case 'cloud':
      return (<svg {...common}><path d="M7 18a4 4 0 1 1 .9-7.9A6 6 0 0 1 19 12a4 4 0 0 1-.7 8z"/></svg>);
    case 'check':
      return (<svg {...common}><path d="M5 12l5 5 9-11"/></svg>);
    case 'archive':
      return (<svg {...common}><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 13h4"/></svg>);
    case 'heart':
      return (<svg {...common}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>);
    case 'shirt':
      return (<svg {...common}><path d="M8 4l-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3-3 2z"/></svg>);
    case 'user':
      return (<svg {...common}><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></svg>);
    case 'grid':
      return (<svg {...common}><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/></svg>);
    default: return null;
  }
}

// Wraps every screen so they all sit at exactly 390×844 with the right bg
// and a soft drop shadow on the canvas. Children fill the box.
function Screen({ bg = C.bg, children }) {
  return (
    <div style={{
      width: SCREEN_W, height: SCREEN_H, background: bg,
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
    }}>{children}</div>
  );
}

// iOS-ish status bar — kept abstract / on-brand. Color follows the bg.
function StatusBar({ tint = '#0A0A0A' }) {
  return (
    <div style={{
      height: 44, padding: '0 22px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      fontFamily: '"SF Pro Text", system-ui, sans-serif',
      fontSize: 14, fontWeight: 600, color: tint,
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="16" height="11" viewBox="0 0 16 11" fill={tint}>
          <rect x="0" y="7" width="2.5" height="4" rx="0.5"/>
          <rect x="4" y="5" width="2.5" height="6" rx="0.5"/>
          <rect x="8" y="3" width="2.5" height="8" rx="0.5"/>
          <rect x="12" y="0" width="2.5" height="11" rx="0.5"/>
        </svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke={tint} strokeWidth="1.2">
          <path d="M7 8.5L1 3.5a4 4 0 0 1 6-1 4 4 0 0 1 6 1z"/>
        </svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill={tint}>
          <rect x="0" y="0.5" width="20" height="10" rx="2.5" fill="none" stroke={tint} strokeWidth="1" opacity="0.5"/>
          <rect x="2" y="2.5" width="14" height="6" rx="1.2"/>
          <rect x="21" y="3.5" width="1.5" height="4" rx="0.5"/>
        </svg>
      </div>
    </div>
  );
}

// Brand mark — the umbrella-in-circle logo. The PNG already ships its own
// peach watercolor wash and ink line; we render it as a square block so the
// existing 18px header slot, 56px settings avatar, and the bigger login hero
// all share one source.
function BrandMark({ size = 18, style }) {
  return (
    <img
      src="assets/logo.png"
      alt="closet"
      draggable={false}
      style={{
        width: size, height: size, display: 'block',
        userSelect: 'none', ...style,
      }}
    />
  );
}

// Export everything the screen files use.
Object.assign(window, {
  SCREEN_W, SCREEN_H, C, StripedPlaceholder, Icon, Screen, StatusBar, BrandMark,
});
