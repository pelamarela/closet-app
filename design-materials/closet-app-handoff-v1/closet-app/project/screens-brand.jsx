// Brand showcase — three artboards to demonstrate the logo at the scales it
// lives at inside the Utility direction. None of these are app screens; they
// are tidy spec sheets a designer would print on a brand page.

// ── 01 · The mark at scale ───────────────────────────────────────────────
// Shows the logo at four sizes against the system palette, with mono labels.
function BrandMarkScales() {
  const sizes = [
    { px: 144, label: 'app icon · 144' },
    { px:  96, label: 'hero · 96'      },
    { px:  56, label: 'avatar · 56'    },
    { px:  20, label: 'header · 20'    },
  ];
  return (
    <div style={{
      width: '100%', height: '100%', background: C.bg, padding: 28,
      fontFamily: uiFont, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>// brand mark</div>
      <div style={{
        fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em',
        marginTop: 6,
      }}>Scale.</div>
      <div style={{
        fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.5)',
        marginTop: 4, lineHeight: 1.5,
      }}>
        the umbrella reads cleanly from 20–144px.<br/>
        below 18px the watercolour wash muddies — use the<br/>
        ink-on-blush placeholder block as a fallback.
      </div>

      <div style={{
        marginTop: 28,
        display: 'flex', alignItems: 'flex-end', gap: 28,
        justifyContent: 'center', flex: 1,
      }}>
        {sizes.map((s) => (
          <div key={s.px} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          }}>
            <BrandMark size={s.px} />
            <div style={{
              fontFamily: monoFont, fontSize: 9.5, color: 'rgba(0,0,0,0.55)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 18, paddingTop: 14, borderTop: uRule,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        <span>source · uploads/logo-2023-margins-FINAL.png</span>
        <span>1104 × 1104 · png · transparent</span>
      </div>
    </div>
  );
}

// ── 02 · Palette alignment ───────────────────────────────────────────────
// Side-by-side proof that the logo's three colours already live in the system
// tokens. Three swatch columns, with the logo cropped behind each colour to
// show the bit of the artwork that colour comes from.
function BrandPaletteFit() {
  const swatches = [
    { token: 'C.ink',   hex: '#0A0A0A', role: 'umbrella line + ring',  fg: '#fff' },
    { token: 'C.blush', hex: '#DFAFA1', role: 'watercolour wash',      fg: '#0A0A0A' },
    { token: 'C.bg',    hex: '#F7F6F5', role: 'inside the circle',     fg: '#0A0A0A' },
  ];
  return (
    <div style={{
      width: '100%', height: '100%', background: C.bg, padding: 28,
      fontFamily: uiFont, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>// palette alignment</div>
      <div style={{
        fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6,
      }}>The logo is already in the system.</div>
      <div style={{
        fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.5)',
        marginTop: 4, lineHeight: 1.5,
      }}>
        all three colours map 1:1 to existing tokens — no recolouring needed.
      </div>

      <div style={{
        marginTop: 22, display: 'flex', gap: 14, alignItems: 'stretch', flex: 1,
      }}>
        {/* Left: a big inspection of the logo */}
        <div style={{
          width: 220, border: uRule, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <BrandMark size={180} />
          <div style={{
            position: 'absolute', top: 8, left: 8,
            fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
            background: C.bg, padding: '2px 5px',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>specimen</div>
        </div>

        {/* Right: token columns */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {swatches.map((s) => (
            <div key={s.token} style={{
              flex: 1, border: uRule, display: 'grid',
              gridTemplateColumns: '90px 1fr',
            }}>
              <div style={{
                background: s.hex, color: s.fg, padding: 10,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                fontFamily: monoFont, fontSize: 9.5,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                <span>{s.hex}</span>
                <span>{s.token}</span>
              </div>
              <div style={{
                padding: '10px 12px', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', gap: 4,
              }}>
                <div style={{
                  fontFamily: uiFont, fontSize: 13, fontWeight: 500,
                  letterSpacing: '-0.005em',
                }}>{s.role}</div>
                <div style={{
                  fontFamily: monoFont, fontSize: 9.5, color: 'rgba(0,0,0,0.5)',
                }}>shared.jsx › <span style={{ color: C.ink }}>{s.token}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 03 · Header strips — before / after ─────────────────────────────────
// Two stacked phone-width strips showing the old placeholder header next to
// the new logo header. Same width as the mobile canvas so the comparison is
// literal.
function BrandHeaderCompare() {
  const Header = ({ left }) => (
    <div style={{
      width: SCREEN_W, border: uRule, background: C.bg,
      paddingTop: 6,
    }}>
      <div style={{
        padding: '4px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: uiFont,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
        }}>
          {left}
          closet
          <span style={{
            fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.4)', marginLeft: 4,
          }}>v0.1</span>
        </div>
        <div style={{
          fontFamily: monoFont, fontSize: 11, color: 'rgba(0,0,0,0.55)',
        }}>2026-04-14 · sun</div>
      </div>
      <div style={{ borderTop: uRule, margin: '12px 20px 14px' }} />
    </div>
  );
  return (
    <div style={{
      width: '100%', height: '100%', background: C.bg, padding: 28,
      fontFamily: uiFont, display: 'flex', flexDirection: 'column', gap: 18,
    }}>
      <div>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>// header — before / after</div>
        <div style={{
          fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6,
        }}>The slot is already the right shape.</div>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.5)',
          marginTop: 4, lineHeight: 1.5,
        }}>
          18px placeholder square → 20px umbrella mark. wordmark + version stay put.
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          fontFamily: monoFont, fontSize: 9.5, color: 'rgba(0,0,0,0.5)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          width: 56, textAlign: 'right',
        }}>before</div>
        <Header left={
          <div style={{
            width: 18, height: 18, background: C.blush,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 6, height: 6, background: C.ink }} />
          </div>
        } />
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          fontFamily: monoFont, fontSize: 9.5, color: '#9C5544',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          width: 56, textAlign: 'right', fontWeight: 600,
        }}>after</div>
        <Header left={<BrandMark size={20} />} />
      </div>

      <div style={{
        marginTop: 'auto', paddingTop: 14, borderTop: uRule,
        fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>applied · home + login brand line</span>
        <span>app-bar screens · untouched</span>
      </div>
    </div>
  );
}

Object.assign(window, { BrandMarkScales, BrandPaletteFit, BrandHeaderCompare });
