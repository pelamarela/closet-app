// Account screens: magic-link login + settings/style profile.

// ── LOGIN ────────────────────────────────────────────────────────────────
function UtilityLogin() {
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      {/* Top brand line */}
      <div style={{
        padding: '4px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: uiFont,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
        }}>
          <BrandMark size={20} />
          closet
          <span style={{
            fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.4)', marginLeft: 4,
          }}>v0.1</span>
        </div>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
        }}>private · invite only</div>
      </div>
      <div style={{ borderTop: uRule, margin: '12px 20px 0' }} />

      {/* Massive serif-less display */}
      <div style={{ padding: '50px 20px 0', fontFamily: uiFont }}>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>// welcome back</div>
        <div style={{
          fontSize: 44, lineHeight: 1, fontWeight: 500,
          letterSpacing: '-0.03em', marginTop: 14,
        }}>
          Your closet,<br/>
          on every<br/>
          device.
        </div>
      </div>

      {/* Brand mark — the umbrella sits on a striped cream field, framed
          by mono captions on either side. Calmer than putting the logo on
          its own page; this stays a sign-in, not a splash. */}
      <div style={{
        margin: '32px 20px 0',
        border: uRule,
        background:
          `repeating-linear-gradient(135deg, ${C.cream} 0 16px, #E8D3BD 16px 32px)`,
        position: 'relative', height: 168,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', top: 8, left: 10, right: 10,
          display: 'flex', justifyContent: 'space-between',
          fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          <span>142 pieces indexed</span>
          <span>last sync · 1m ago</span>
        </div>
        <div style={{
          width: 116, height: 116, background: '#fff',
          border: uRule, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BrandMark size={96} />
        </div>
        <div style={{
          position: 'absolute', bottom: 8, left: 10, right: 10,
          display: 'flex', justifyContent: 'space-between',
          fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          <span>// closet</span>
          <span>v 0.1.0</span>
        </div>
      </div>

      {/* Email field */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ padding: '12px 0', borderBottom: uRule }}>
          <div style={{
            fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>email</div>
          <div style={{
            fontFamily: monoFont, fontSize: 14, fontWeight: 500,
            marginTop: 6, color: C.ink,
          }}>
            spela@anzeljc.com<span style={{
              display: 'inline-block', width: 1.5, height: 16,
              background: C.ink, marginLeft: 2, verticalAlign: 'middle',
              animation: 'none',
            }} />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '18px 20px 0' }}>
        <UButton icon="check" full>Send magic link</UButton>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.5)',
          textAlign: 'center', marginTop: 12,
        }}>
          we'll email you a sign-in link · no password
        </div>
      </div>

      {/* Footer mono note */}
      <div style={{
        position: 'absolute', bottom: 28, left: 20, right: 20,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.45)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        paddingTop: 14, borderTop: uRule,
      }}>
        <span>supabase auth</span>
        <span>rls enabled</span>
        <span>v 0.1.0</span>
      </div>
    </Screen>
  );
}

// ── SETTINGS / STYLE PROFILE ─────────────────────────────────────────────
function UtilitySettings() {
  const Row = ({ k, v, accent, last }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '11px 0', borderBottom: last ? 'none' : uRule,
    }}>
      <span style={{
        fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>{k}</span>
      <span style={{
        fontFamily: monoFont, fontSize: 11, fontWeight: 500,
        color: accent ? '#9C5544' : C.ink,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>{v}</span>
    </div>
  );
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <AppBar
        title="Settings"
        right={
          <div style={{
            fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          }}>signed in</div>
        }
      />

      {/* Owner block */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 56, height: 56, background: C.blush,
            color: C.ink, fontFamily: uiFont,
            fontSize: 22, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: uRule,
          }}>Š</div>
          <div>
            <div style={{
              fontFamily: uiFont, fontSize: 18, fontWeight: 500,
              letterSpacing: '-0.015em',
            }}>Špela Anzeljc Gačnik</div>
            <div style={{
              fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
              marginTop: 2,
            }}>spela@anzeljc.com · owner</div>
          </div>
        </div>
      </div>

      {/* Style profile */}
      <div style={{ padding: '24px 20px 0' }}>
        <SectionLabel right="edit ›">style profile</SectionLabel>
        <div style={{
          border: uRule, background: '#fff',
          padding: 14,
          fontFamily: uiFont, fontSize: 13, lineHeight: 1.55,
          letterSpacing: '-0.005em',
          color: 'rgba(0,0,0,0.78)',
        }}>
          I dress for quiet days at the studio and dinners with friends —
          monochrome bases with one warm accessory. Comfort over fuss.
          Lean towards <span style={{ color: C.ink, fontWeight: 500 }}>Lemaire, Toteme, The Row, Khaite</span>.
          Avoid: prints, anything boxy. Always cold; layer warmth +1.
        </div>
        <div style={{
          fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
          marginTop: 6, display: 'flex', justifyContent: 'space-between',
        }}>
          <span>used by suggestions</span>
          <span>312 chars · updated 04-12</span>
        </div>
      </div>

      {/* Location */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>location & weather</SectionLabel>
        <div style={{ borderTop: uRule }}>
          <Row k="city"    v="Ljubljana, SI" />
          <Row k="lat,lon" v="46.05, 14.50" />
          <Row k="source"  v="open-meteo · auto" last />
        </div>
      </div>

      {/* Storage */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>storage</SectionLabel>
        <div style={{ borderTop: uRule }}>
          <Row k="items"     v="142 / unlimited" />
          <Row k="outfits"   v="86 / unlimited" />
          <Row k="images"    v="318 MB / 1 GB" />
          <Row k="db"        v="2.1 MB / 500 MB" last />
        </div>
        {/* Storage bar */}
        <div style={{
          marginTop: 10, height: 6, border: uRule, position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '31.8%', background: C.ink,
          }} />
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '36.2%', background: C.blush,
            transform: 'translateX(31.8%)',
          }} />
        </div>
        <div style={{
          fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.45)',
          marginTop: 4, display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, background: C.ink, display: 'inline-block' }} />
            images 318 MB
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, background: C.blush, display: 'inline-block' }} />
            db 2 MB
          </span>
          <span>68.2% free</span>
        </div>
      </div>

      {/* Sync */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>sync</SectionLabel>
        <div style={{ borderTop: uRule }}>
          <Row k="last sync" v={<><span style={{ width: 6, height: 6, background: '#3F9C5C', display: 'inline-block' }} /> 1m ago</>} />
          <Row k="account"   v="supabase · free tier" last />
        </div>
      </div>

      {/* Sign out */}
      <div style={{ padding: '24px 20px 28px' }}>
        <UButton variant="ghost" full>Sign out</UButton>
      </div>

      <UtilityTabs active="account" />
    </Screen>
  );
}

Object.assign(window, { UtilityLogin, UtilitySettings });
