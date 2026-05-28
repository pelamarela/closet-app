// Utility screens — core trio (Home, Wardrobe, Outfit detail).
// All design primitives come from utility-system.jsx.

// ── HOME ─────────────────────────────────────────────────────────────────
function UtilityHome() {
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <TopBar
        title={<>
          <BrandMark size={20} />
          closet
          <span style={{
            fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.4)', marginLeft: 4,
          }}>v0.1</span>
        </>}
        meta="2026-04-14 · sun"
      />

      {/* Hero: today block */}
      <div style={{ padding: '24px 20px 0' }}>
        <SectionLabel>today</SectionLabel>

        <div style={{
          fontFamily: uiFont, fontSize: 38, lineHeight: 1.02,
          fontWeight: 500, letterSpacing: '-0.025em',
        }}>
          You haven't<br/>logged today.
        </div>
      </div>

      {/* Weather + stats grid */}
      <div style={{
        margin: '28px 20px 0',
        border: uRule, borderRadius: 4,
        display: 'grid', gridTemplateColumns: '1fr 1fr',
      }}>
        <div style={{ padding: 14, borderRight: uRule }}>
          <div style={{
            fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>weather</div>
          <div style={{
            fontFamily: uiFont, fontSize: 28, fontWeight: 500,
            letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1,
          }}>16°</div>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
            overcast · ljubljana
          </div>
        </div>
        <div style={{ padding: 14 }}>
          <div style={{
            fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>this month</div>
          <div style={{
            fontFamily: uiFont, fontSize: 28, fontWeight: 500,
            letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1,
            display: 'flex', alignItems: 'baseline', gap: 6,
          }}>
            28 <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)' }}>outfits</span>
          </div>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)', marginTop: 4 }}>
            +6 vs last month
          </div>
        </div>
      </div>

      {/* Recent log */}
      <div style={{ padding: '24px 20px 0' }}>
        <SectionLabel right="3 of 28 ›">recent</SectionLabel>

        {[
          { d: '04-12', occ: 'studio',  items: 4, weather: '14° cloud', tone: 'neutral' },
          { d: '04-11', occ: 'dinner',  items: 5, weather: '12° clear', tone: 'cream' },
          { d: '04-09', occ: 'gallery', items: 6, weather: '15° clear', tone: 'ink' },
        ].map((o, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0',
            borderTop: i === 0 ? uRule : 'none',
            borderBottom: uRule,
          }}>
            <div style={{ width: 34, height: 42 }}>
              <StripedPlaceholder tone={o.tone} label="" radius={2} />
            </div>
            <div style={{ flex: 1, fontFamily: uiFont }}>
              <div style={{
                fontSize: 14, fontWeight: 500, textTransform: 'capitalize',
                letterSpacing: '-0.01em',
              }}>{o.occ}</div>
              <div style={{ fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>
                {o.d} · {o.items} pieces · {o.weather}
              </div>
            </div>
            <Icon name="back" size={14} stroke={1.2} />
          </div>
        ))}
      </div>

      {/* Primary actions — anchored above the tabs (consistent across
          top-level screens: Home, Closet, Empty, Calendar). */}
      <div style={{
        position: 'absolute', bottom: 96, left: 20, right: 20,
        display: 'flex', gap: 8,
      }}>
        <UButton icon="plus" style={{ flex: 1 }}>Log outfit</UButton>
        <UButton variant="secondary" icon="spark" style={{ width: 132 }}>Suggest</UButton>
      </div>

      <UtilityTabs active="closet" />
    </Screen>
  );
}

// ── WARDROBE GRID ────────────────────────────────────────────────────────
function UtilityWardrobe() {
  const items = [
    { id: 'i142', name: 'Toteme tee',      cat: 'top',    tone: 'neutral', w: 2, f: 1 },
    { id: 'i141', name: 'Row blazer',      cat: 'top',    tone: 'ink',     w: 3, f: 4 },
    { id: 'i140', name: 'Khaite jeans',    cat: 'btm',    tone: 'neutral', w: 3, f: 2 },
    { id: 'i139', name: 'Bode dress',      cat: 'dress',  tone: 'cream',   w: 2, f: 3 },
    { id: 'i138', name: 'Lemaire trench',  cat: 'coat',   tone: 'cream',   w: 4, f: 3 },
    { id: 'i137', name: 'Acne cardigan',   cat: 'top',    tone: 'cream',   w: 4, f: 2 },
  ];
  const filters = [
    { l: 'all',     n: 142, active: true },
    { l: 'top',     n: 38 },
    { l: 'btm',     n: 22 },
    { l: 'dress',   n: 14 },
    { l: 'coat',    n: 11 },
    { l: 'shoe',    n: 19 },
    { l: 'acc',     n: 38 },
  ];
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <TopBar
        title={<><Icon name="hanger" size={16} stroke={1.6} /> Closet</>}
        meta="142 items"
      />

      {/* Search bar */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          border: uRule, borderRadius: 4, padding: '0 12px', height: 40,
          background: '#fff',
        }}>
          <Icon name="search" size={16} stroke={1.4} />
          <div style={{
            flex: 1, fontFamily: uiFont, fontSize: 13, color: 'rgba(0,0,0,0.4)',
          }}>search items, brands, colors…</div>
          <div style={{
            fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.4)',
            padding: '3px 6px', border: uRule, borderRadius: 3,
          }}>⌘ K</div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{
        display: 'flex', gap: 6, padding: '14px 20px 0',
        overflow: 'hidden',
      }}>
        {filters.map((f) => (
          <MonoTag key={f.l} filled={f.active}>
            {f.l} <span style={{ opacity: 0.55 }}>{f.n}</span>
          </MonoTag>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        padding: '16px 20px 0',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
      }}>
        {items.map((it, i) => (
          <div key={i}>
            <div style={{
              position: 'relative', width: '100%', aspectRatio: '3/4',
              border: uRule, borderRadius: 3, overflow: 'hidden',
            }}>
              <StripedPlaceholder tone={it.tone} label="" radius={0} />
              <div style={{
                position: 'absolute', top: 6, left: 6,
                fontFamily: monoFont, fontSize: 8.5,
                background: '#fff', color: C.ink, padding: '2px 5px',
                letterSpacing: '0.04em',
              }}>{it.cat}</div>
              <div style={{
                position: 'absolute', top: 6, right: 6,
                fontFamily: monoFont, fontSize: 8.5,
                color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.4)',
                padding: '2px 5px',
              }}>{it.id}</div>
            </div>
            <div style={{ padding: '6px 2px 0', fontFamily: uiFont }}>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '-0.005em',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{it.name}</div>
              <div style={{
                fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
                marginTop: 2, display: 'flex', gap: 6,
              }}>
                <span>w{it.w}</span><span>f{it.f}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Primary actions — anchored above the tabs */}
      <div style={{
        position: 'absolute', bottom: 96, left: 20, right: 20,
        display: 'flex', gap: 8,
      }}>
        <UButton icon="plus" style={{ flex: 1.25 }}>
          <span>Add item</span>
          <span style={{
            marginLeft: 'auto', opacity: 0.7, fontSize: 10,
            fontFamily: monoFont, paddingLeft: 8,
          }}>▾</span>
        </UButton>
        <UButton variant="secondary" icon="hanger" style={{ flex: 1 }}>Log outfit</UButton>
      </div>

      <UtilityTabs active="closet" />
    </Screen>
  );
}

// ── OUTFIT DETAIL ────────────────────────────────────────────────────────
function UtilityOutfit() {
  const pieces = [
    { id: 'i138', name: 'Lemaire wool trench',     cat: 'coat',  col: 'camel',  tone: 'cream',   w: '8×' },
    { id: 'i142', name: 'Toteme heavyweight tee',  cat: 'top',   col: 'white',  tone: 'neutral', w: '12×' },
    { id: 'i140', name: 'Khaite slim jeans',       cat: 'btm',   col: 'indigo', tone: 'neutral', w: '21×' },
    { id: 'i136', name: 'Ala\u00efa ballet flats', cat: 'shoe',  col: 'black',  tone: 'ink',     w: '17×' },
    { id: 'i134', name: 'Jacquemus mini bag',      cat: 'bag',   col: 'tan',    tone: 'blush',   w: '14×' },
  ];
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <AppBar
        title={<><Icon name="back" size={16} stroke={1.6} /> Library</>}
        right={<Icon name="more" size={18} stroke={1.4} />}
      />

      {/* Title block */}
      <div style={{ padding: '20px 20px 0', fontFamily: uiFont }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 10,
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          2026-04-11 · thu
          <div style={{ width: 4, height: 4, background: C.blush }} />
          casual dinner
        </div>
        <div style={{
          fontSize: 30, fontWeight: 500,
          letterSpacing: '-0.025em', marginTop: 8, lineHeight: 1.05,
        }}>
          Dinner at Lila's.
        </div>
      </div>

      {/* Hero image */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{
          width: '100%', aspectRatio: '5/4',
          border: uRule, borderRadius: 3, overflow: 'hidden', position: 'relative',
        }}>
          <StripedPlaceholder tone="cream" label="full look" radius={0} />
          <div style={{
            position: 'absolute', top: 8, left: 8,
            display: 'flex', flexDirection: 'column', gap: 2,
            background: '#fff', padding: '4px 6px',
          }}>
            <MonoKV k="temp" v="12°" />
            <MonoKV k="cond" v="clear" />
            <MonoKV k="rate" v="4/5" accent />
          </div>
        </div>
      </div>

      {/* Items table */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>pieces (5)</SectionLabel>

        {pieces.map((p, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '34px 1fr 60px 14px',
            alignItems: 'center', gap: 12,
            padding: '8px 0',
            borderBottom: uRule,
          }}>
            <div style={{ height: 42 }}>
              <StripedPlaceholder tone={p.tone} label="" radius={2} />
            </div>
            <div>
              <div style={{
                fontFamily: uiFont, fontSize: 12, fontWeight: 500,
                letterSpacing: '-0.005em',
              }}>{p.name}</div>
              <div style={{
                fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
                marginTop: 2,
              }}>{p.id} · {p.cat} · {p.col}</div>
            </div>
            <div style={{
              fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.45)',
              textAlign: 'right',
            }}>worn {p.w}</div>
            <Icon name="back" size={12} stroke={1} />
          </div>
        ))}
      </div>

      <UtilityTabs active="calendar" />
    </Screen>
  );
}

Object.assign(window, { UtilityHome, UtilityWardrobe, UtilityWardrobeAddMenu, UtilityOutfit });

// ── WARDROBE · ADD-ITEM MENU OPEN ────────────────────────────────────────
// Same wardrobe canvas, dimmed, with a small popover anchored to the
// "Add item" button showing the two creation modes.
function UtilityWardrobeAddMenu() {
  const Row = ({ icon, label, sub, beta }) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '34px 1fr 14px',
      alignItems: 'center', gap: 12,
      padding: '12px 12px',
      borderBottom: uRule,
      cursor: 'pointer',
    }}>
      <div style={{
        width: 34, height: 34, border: uRule, borderRadius: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={16} stroke={1.6} />
      </div>
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: uiFont, fontSize: 13, fontWeight: 500,
          letterSpacing: '-0.005em',
        }}>
          {label}
          {beta && <MonoTag accent>beta</MonoTag>}
        </div>
        <div style={{
          fontFamily: monoFont, fontSize: 9.5, color: 'rgba(0,0,0,0.5)',
          marginTop: 2,
        }}>{sub}</div>
      </div>
      <Icon name="back" size={12} stroke={1.2} />
    </div>
  );

  return (
    <div style={{ position: 'relative', width: SCREEN_W, height: SCREEN_H }}>
      <UtilityWardrobe />

      {/* Dimmer */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(10,10,10,0.32)',
      }} />

      {/* Popover — anchored to the Add item button. The button sits at
          y ≈ 120 with height 48; popover opens just below at y ≈ 174. */}
      <div style={{
        position: 'absolute',
        top: 174, left: 20, width: 240,
        background: '#fff', border: uRule, borderRadius: 4,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '8px 12px',
          borderBottom: uRule,
          fontFamily: monoFont, fontSize: 9.5, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>// add item</span>
          <span style={{ color: 'rgba(0,0,0,0.4)' }}>▴</span>
        </div>
        <Row
          icon="plus"
          label="Single item"
          sub="form · one piece at a time"
        />
        <Row
          icon="grid"
          label="Multiple at once"
          sub="batch upload · 2–20 photos"
          beta
        />
        <div style={{
          padding: '10px 12px',
          fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.4)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          esc to dismiss
        </div>
      </div>
    </div>
  );
}
