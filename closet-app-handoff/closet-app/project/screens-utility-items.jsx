// Item-level screens: detail, add/edit.

// ── ITEM DETAIL ──────────────────────────────────────────────────────────
function UtilityItemDetail() {
  const stats = [
    { l: 'worn',        v: '17×' },
    { l: 'last',        v: '04-09' },
    { l: 'first',       v: '2024-11' },
    { l: 'avg / month', v: '3.2' },
  ];
  const attrs = [
    ['category',    'shoes'],
    ['subcategory', 'flats'],
    ['color',       'black'],
    ['material',    'lambskin'],
    ['pattern',     '—'],
    ['brand',       'Alaïa'],
    ['warmth',      '2 / 5'],
    ['formality',   '3 / 5'],
    ['acquired',    '2024-11-02'],
  ];
  const pairings = [
    { name: 'Khaite jeans',    cat: 'btm', tone: 'neutral', n: 9 },
    { name: 'Toteme tee',      cat: 'top', tone: 'neutral', n: 7 },
    { name: 'Bode dress',      cat: 'dress', tone: 'cream', n: 4 },
    { name: 'Lemaire trench',  cat: 'coat', tone: 'cream', n: 6 },
  ];
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <AppBar
        title={<><Icon name="back" size={16} stroke={1.6} /> Closet</>}
        right={
          <div style={{ display: 'flex', gap: 14 }}>
            <Icon name="archive" size={17} stroke={1.4} />
            <Icon name="more" size={18} stroke={1.4} />
          </div>
        }
      />

      {/* Hero image */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          width: '100%', aspectRatio: '1/1',
          border: uRule, borderRadius: 3, overflow: 'hidden', position: 'relative',
        }}>
          <StripedPlaceholder tone="ink" label="alaïa flats" radius={0} />
          <div style={{
            position: 'absolute', top: 10, left: 10,
            display: 'flex', gap: 6,
          }}>
            <MonoTag filled>shoe</MonoTag>
            <MonoTag>active</MonoTag>
          </div>
          <div style={{
            position: 'absolute', top: 10, right: 10,
            fontFamily: monoFont, fontSize: 9, color: '#fff',
            background: 'rgba(0,0,0,0.5)', padding: '3px 6px',
          }}>i136</div>
          <div style={{
            position: 'absolute', bottom: 10, left: 10,
            display: 'flex', gap: 4,
          }}>
            {[0,1,2,3,4].map((d) => (
              <div key={d} style={{
                width: 6, height: 6,
                background: d === 0 ? '#fff' : 'rgba(255,255,255,0.4)',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Title block */}
      <div style={{ padding: '16px 20px 0', fontFamily: uiFont }}>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>Alaïa · 2024</div>
        <div style={{
          fontSize: 26, fontWeight: 500,
          letterSpacing: '-0.025em', marginTop: 4, lineHeight: 1.05,
        }}>
          Black ballet flats
        </div>
      </div>

      {/* Stats strip */}
      <div style={{
        margin: '14px 20px 0',
        border: uRule, borderRadius: 4,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            padding: '10px 8px',
            borderRight: i < stats.length - 1 ? uRule : 'none',
          }}>
            <div style={{
              fontFamily: monoFont, fontSize: 8.5, color: 'rgba(0,0,0,0.5)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>{s.l}</div>
            <div style={{
              fontFamily: uiFont, fontSize: 16, fontWeight: 500,
              letterSpacing: '-0.015em', marginTop: 4,
            }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Attributes */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right="edit ›">attributes</SectionLabel>
        <div style={{ borderTop: uRule }}>
          {attrs.map(([k, v], i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '7px 0', borderBottom: uRule,
              fontFamily: monoFont, fontSize: 11,
            }}>
              <span style={{ color: 'rgba(0,0,0,0.5)' }}>{k}</span>
              <span style={{ color: C.ink, fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pairings */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right="see outfits ›">often worn with</SectionLabel>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
        }}>
          {pairings.map((p, i) => (
            <div key={i}>
              <div style={{
                width: '100%', aspectRatio: '3/4', position: 'relative',
                border: uRule,
              }}>
                <StripedPlaceholder tone={p.tone} label="" radius={0} />
              </div>
              <div style={{
                marginTop: 4,
                fontFamily: monoFont, fontSize: 9,
                color: 'rgba(0,0,0,0.55)',
              }}>{p.n}× together</div>
            </div>
          ))}
        </div>
      </div>

      <UtilityTabs active="closet" />
    </Screen>
  );
}

// ── ADD ITEM ─────────────────────────────────────────────────────────────
function UtilityAddItem() {
  // Field component — mono label above, ink input/value below, hairline rule.
  const Field = ({ label, value, placeholder, mono, required, suffix }) => (
    <div style={{ padding: '12px 0', borderBottom: uRule }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        <span>{label} {required && <span style={{ color: '#9C5544' }}>*</span>}</span>
        {suffix}
      </div>
      <div style={{
        marginTop: 6,
        fontFamily: mono ? monoFont : uiFont,
        fontSize: mono ? 12 : 15,
        fontWeight: 500, letterSpacing: '-0.005em',
        color: value ? C.ink : 'rgba(0,0,0,0.35)',
      }}>{value || placeholder}</div>
    </div>
  );

  const Scale = ({ value, label }) => (
    <div style={{ padding: '12px 0', borderBottom: uRule }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        <span>{label} <span style={{ color: '#9C5544' }}>*</span></span>
        <span style={{ color: C.ink }}>{value} / 5</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        {[1,2,3,4,5].map((n) => (
          <div key={n} style={{
            flex: 1, height: 28,
            border: `1px solid ${n <= value ? C.ink : 'rgba(0,0,0,0.15)'}`,
            background: n <= value ? C.ink : 'transparent',
            color: n <= value ? '#fff' : 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: monoFont, fontSize: 11, fontWeight: 600,
          }}>{n}</div>
        ))}
      </div>
    </div>
  );

  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <AppBar
        title={<><Icon name="back" size={16} stroke={1.6} /> Cancel</>}
        right={
          <div style={{
            fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          }}>step 1 / 1 · draft</div>
        }
      />

      {/* Page title */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          fontFamily: uiFont, fontSize: 24, fontWeight: 500,
          letterSpacing: '-0.025em', lineHeight: 1.05,
        }}>Add an item</div>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          marginTop: 4,
        }}>compress · save · sync</div>
      </div>

      {/* Photo uploader */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{
          width: '100%', aspectRatio: '4/3',
          border: `1.5px dashed rgba(0,0,0,0.25)`,
          background: '#fff',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8,
          position: 'relative',
        }}>
          <div style={{
            width: 44, height: 44,
            border: uRule, borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="plus" size={20} stroke={1.4} />
          </div>
          <div style={{
            fontFamily: uiFont, fontSize: 13, fontWeight: 500,
          }}>Tap to add a photo</div>
          <div style={{
            fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
          }}>max 1200px · ~300 KB · JPEG q0.8</div>
          <div style={{
            position: 'absolute', top: 8, left: 8,
            fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
          }}>// 0 / 1 attached</div>
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: '4px 20px 0' }}>
        <SectionLabel right="9 fields">attributes</SectionLabel>

        <Field
          label="name" required mono={false}
          value="Toteme heavyweight tee"
        />
        <Field
          label="category" required mono
          value="top › tee"
          suffix={<span style={{ color: 'rgba(0,0,0,0.4)' }}>▾</span>}
        />
        <Field
          label="color" mono
          value="white"
        />
        <Field
          label="brand" mono
          value="Toteme"
        />
        <Field
          label="material" mono
          placeholder="cotton, wool, silk…"
        />
        <Field
          label="pattern" mono
          placeholder="solid, stripe, floral…"
        />
        <Scale label="warmth" value={2} />
        <Scale label="formality" value={3} />
      </div>

      {/* Footer actions */}
      <div style={{
        position: 'absolute', bottom: 84, left: 0, right: 0,
        background: C.bg, borderTop: uRule,
        padding: '12px 20px',
        display: 'flex', gap: 8,
      }}>
        <UButton variant="ghost" style={{ flex: 1 }}>Save draft</UButton>
        <UButton style={{ flex: 1.4 }}>Save to closet</UButton>
      </div>

      <UtilityTabs active="closet" />
    </Screen>
  );
}

Object.assign(window, { UtilityItemDetail, UtilityAddItem });
