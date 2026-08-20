// Utility design system — shared across every screen of the Closet App.
// Type, dividers, app bar, bottom tabs, mono key/value, mono section labels,
// striped photo with mono caption. Everything below sits on these.

const uiFont   = 'Geist, "Inter", system-ui, sans-serif';
const monoFont = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace';

const uRule = '1px solid rgba(0,0,0,0.10)';
const uRuleStrong = '1px solid rgba(0,0,0,0.18)';
const uDashed = '1px dashed rgba(0,0,0,0.18)';

// Bottom tab bar — flat, low-key, icons + mono microlabels. Active = ink rule.
function UtilityTabs({ active = 'closet' }) {
  const tabs = [
    { id: 'closet',   l: 'closet',   icon: 'hanger'   },
    { id: 'calendar', l: 'calendar', icon: 'calendar' },
    { id: 'suggest',  l: 'suggest',  icon: 'spark'    },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 84, paddingBottom: 24,
      borderTop: uRule, background: C.bg,
      display: 'flex',
    }}>
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <div key={t.id} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
            color: isActive ? C.ink : 'rgba(0,0,0,0.4)',
            fontFamily: monoFont, fontSize: 9.5,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            position: 'relative',
          }}>
            {isActive && <div style={{
              position: 'absolute', top: 0, left: '36%', right: '36%',
              height: 2, background: C.ink,
            }} />}
            <Icon name={t.icon} size={20} stroke={isActive ? 1.8 : 1.4} />
            {t.l}
          </div>
        );
      })}
    </div>
  );
}

// Top bar used on top-level screens. Title sits left (free-form JSX), the
// account icon is the only fixture on the right — optional mono meta sits to
// the icon's left. Nested screens (with a back arrow / step counter) keep
// using AppBar below.
function TopBar({ title, meta = null }) {
  return (
    <div>
      <div style={{
        padding: '4px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: uiFont,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
          minWidth: 0,
        }}>{title}</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
        }}>
          {meta && (
            <div style={{
              fontFamily: monoFont, fontSize: 11, color: 'rgba(0,0,0,0.55)',
            }}>{meta}</div>
          )}
          <Icon name="user" size={18} stroke={1.5} />
        </div>
      </div>
      <div style={{ borderTop: uRule, margin: '12px 20px 0' }} />
    </div>
  );
}

// Header bar with optional back, optional right slot. Mono meta below the rule.
function AppBar({ title, back = false, right = null, meta = null }) {
  return (
    <div>
      <div style={{
        padding: '4px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: uiFont,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
        }}>
          {back && <Icon name="back" size={16} stroke={1.6} />}
          {title}
        </div>
        {meta && !right && (
          <div style={{
            fontFamily: monoFont, fontSize: 11, color: 'rgba(0,0,0,0.55)',
          }}>{meta}</div>
        )}
        {right}
      </div>
      <div style={{ borderTop: uRule, margin: '12px 20px 0' }} />
    </div>
  );
}

// "// section" label with a dashed rule extending to the right and optional
// counter on the far right.
function SectionLabel({ children, right = null }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 8,
      marginBottom: 8,
    }}>
      <div style={{
        fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>// {children}</div>
      <div style={{ flex: 1, borderTop: uDashed }} />
      {right && (
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.4)',
        }}>{right}</div>
      )}
    </div>
  );
}

// Compact mono key/value stack — `key: value`
function MonoKV({ k, v, accent = false, inline = false }) {
  if (inline) {
    return (
      <span style={{ fontFamily: monoFont, fontSize: 10 }}>
        <span style={{ color: 'rgba(0,0,0,0.45)' }}>{k} </span>
        <span style={{ color: accent ? '#9C5544' : C.ink, fontWeight: 600 }}>{v}</span>
      </span>
    );
  }
  return (
    <div style={{ fontFamily: monoFont, fontSize: 10, lineHeight: 1.4 }}>
      <span style={{ color: 'rgba(0,0,0,0.45)' }}>{k} </span>
      <span style={{ color: accent ? '#9C5544' : C.ink, fontWeight: 600 }}>{v}</span>
    </div>
  );
}

// Primary action button.
function UButton({ children, variant = 'primary', icon, full, style: extra }) {
  const variants = {
    primary:   { bg: C.ink, color: '#fff', border: 'none' },
    secondary: { bg: 'transparent', color: C.ink, border: `1px solid ${C.ink}` },
    ghost:     { bg: 'transparent', color: C.ink, border: '1px solid rgba(0,0,0,0.15)' },
    accent:    { bg: C.blush, color: C.ink, border: 'none' },
  }[variant];
  return (
    <button style={{
      width: full ? '100%' : undefined,
      height: 48,
      padding: '0 16px',
      background: variants.bg, color: variants.color, border: variants.border,
      borderRadius: 4, cursor: 'pointer',
      fontFamily: uiFont, fontSize: 13, fontWeight: 600,
      letterSpacing: '-0.005em',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...extra,
    }}>
      {icon && <Icon name={icon} size={15} stroke={2} />}
      {children}
    </button>
  );
}

// Small monospace pill — used for tags, IDs, status. Border + tiny padding.
function MonoTag({ children, accent = false, filled = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: monoFont, fontSize: 9.5,
      letterSpacing: '0.04em', textTransform: 'lowercase',
      padding: '3px 6px',
      border: `1px solid ${accent ? '#9C5544' : (filled ? C.ink : 'rgba(0,0,0,0.15)')}`,
      background: filled ? C.ink : (accent ? 'rgba(220,175,160,0.15)' : 'transparent'),
      color: filled ? '#fff' : (accent ? '#9C5544' : C.ink),
      borderRadius: 2,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

Object.assign(window, {
  uiFont, monoFont, uRule, uRuleStrong, uDashed,
  UtilityTabs, TopBar, AppBar, SectionLabel, MonoKV, UButton, MonoTag,
});
