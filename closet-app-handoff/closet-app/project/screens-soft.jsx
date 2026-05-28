// Mood B — SOFT DOMESTIC
// Type: Plus Jakarta Sans (everything; weight + size carry hierarchy)
// Voice: a warm at-home feeling. Cream-dominant background, generous
// rounded corners, floating tab bar, pill chips, soft shadows.

const softFont = '"Plus Jakarta Sans", system-ui, sans-serif';

// Floating pill tab bar. Sits above the screen on a cream backdrop with a
// little drop shadow.
function SoftTabs({ active = 'Closet' }) {
  const tabs = [
    { label: 'Closet',   icon: 'hanger' },
    { label: 'Log',      icon: 'plus' },
    { label: 'Calendar', icon: 'calendar' },
    { label: 'Suggest',  icon: 'spark' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 22, left: 16, right: 16,
      height: 64, padding: 6,
      background: '#fff',
      borderRadius: 999,
      boxShadow: '0 8px 24px rgba(120,90,70,0.14), 0 1px 0 rgba(0,0,0,0.04)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: softFont,
    }}>
      {tabs.map((t) => {
        const isActive = t.label === active;
        return (
          <div key={t.label} style={{
            flex: 1, height: '100%',
            borderRadius: 999,
            background: isActive ? C.ink : 'transparent',
            color: isActive ? '#fff' : 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 13, fontWeight: 600,
          }}>
            <Icon name={t.icon} size={18} stroke={isActive ? 2 : 1.6} />
            {isActive && <span>{t.label}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── B1 ── HOME ───────────────────────────────────────────────────────────
function SoftHome() {
  return (
    <Screen bg={C.cream}>
      <StatusBar />

      {/* Top bar — avatar + a small weather chip */}
      <div style={{
        padding: '8px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: softFont,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: C.blush, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700,
        }}>Š</div>
        <div style={{
          background: '#fff', borderRadius: 999, padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 600,
        }}>
          <Icon name="cloud" size={16} stroke={1.8} />
          16° overcast
        </div>
      </div>

      {/* Big friendly greeting */}
      <div style={{
        padding: '24px 20px 0',
        fontFamily: softFont,
      }}>
        <div style={{
          fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase', color: 'rgba(40,30,20,0.55)',
        }}>
          Sunday, April 14
        </div>
        <div style={{
          fontSize: 34, lineHeight: 1.05, fontWeight: 700,
          marginTop: 8, letterSpacing: '-0.02em',
        }}>
          Hi Špela — <br/>
          <span style={{ color: '#9C5544' }}>what's the look</span> today?
        </div>
      </div>

      {/* Two soft cards side-by-side */}
      <div style={{
        padding: '20px 20px 0', display: 'grid',
        gridTemplateColumns: '1.2fr 1fr', gap: 12,
        fontFamily: softFont,
      }}>
        <div style={{
          background: C.ink, color: '#fff', borderRadius: 22,
          padding: 16, height: 132,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 999,
            background: 'rgba(255,255,255,0.16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="plus" size={18} stroke={2} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.15 }}>
              Log today's<br/>outfit
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
              5 pieces · 30 sec
            </div>
          </div>
        </div>

        <div style={{
          background: C.blush, color: '#3A1F18', borderRadius: 22,
          padding: 16, height: 132,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 999,
            background: 'rgba(255,255,255,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="spark" size={18} stroke={2} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.15 }}>
              Pick an<br/>outfit for me
            </div>
            <div style={{ fontSize: 11, color: 'rgba(58,31,24,0.6)', marginTop: 4 }}>
              Based on weather
            </div>
          </div>
        </div>
      </div>

      {/* Recently worn */}
      <div style={{ padding: '24px 20px 0', fontFamily: softFont }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Recently worn</div>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>See all</div>
        </div>

        <div style={{ display: 'flex', gap: 12, overflow: 'hidden' }}>
          {[
            { day: 'Fri', date: 'Apr 12', occ: 'Studio',    tone: 'neutral' },
            { day: 'Thu', date: 'Apr 11', occ: 'Dinner',    tone: 'blush' },
            { day: 'Tue', date: 'Apr 9',  occ: 'Gallery',   tone: 'ink' },
          ].map((o, i) => (
            <div key={i} style={{
              flex: '0 0 130px',
              background: '#fff', borderRadius: 18, padding: 8,
            }}>
              <div style={{ width: '100%', aspectRatio: '4/5' }}>
                <StripedPlaceholder tone={o.tone} label={o.occ.toLowerCase()} radius={12} />
              </div>
              <div style={{ padding: '8px 4px 2px' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{o.occ}</div>
                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)' }}>{o.date} · {o.day}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Closet stat */}
      <div style={{
        position: 'absolute', bottom: 110, left: 20, right: 20,
        background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.8)',
        borderRadius: 16, padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        fontFamily: softFont,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: C.cream,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="hanger" size={18} stroke={1.6} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>142 pieces in your closet</div>
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.55)' }}>You've logged 28 outfits this month</div>
        </div>
        <Icon name="back" size={14} stroke={1.4} />
      </div>

      <SoftTabs active="Closet" />
    </Screen>
  );
}

// ── B2 ── WARDROBE GRID ──────────────────────────────────────────────────
function SoftWardrobe() {
  const items = [
    { name: 'Toteme tee',     cat: 'top',   tone: 'neutral', count: '12 worn' },
    { name: 'Row blazer',     cat: 'top',   tone: 'ink',     count: '4 worn' },
    { name: 'Khaite jeans',   cat: 'btm',   tone: 'neutral', count: '21 worn' },
    { name: 'Bode dress',     cat: 'dress', tone: 'cream',   count: '2 worn' },
    { name: 'Lemaire trench', cat: 'coat',  tone: 'cream',   count: '8 worn' },
    { name: 'Acne cardi',     cat: 'top',   tone: 'cream',   count: '6 worn' },
    { name: 'Ala\u00efa flats', cat: 'shoe', tone: 'ink',    count: '17 worn' },
    { name: 'Tabis',          cat: 'shoe',  tone: 'neutral', count: '9 worn' },
    { name: 'Mini bag',       cat: 'bag',   tone: 'blush',   count: '14 worn' },
  ];
  const filters = [
    { l: 'All',     active: true,  count: 142 },
    { l: 'Tops',    count: 38 },
    { l: 'Bottoms', count: 22 },
    { l: 'Dresses', count: 14 },
    { l: 'Coats',   count: 11 },
    { l: 'Shoes',   count: 19 },
  ];
  return (
    <Screen bg={C.cream}>
      <StatusBar />

      {/* Header */}
      <div style={{
        padding: '8px 20px 12px',
        fontFamily: softFont,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 14,
        }}>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.5)',
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              My closet
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>
              142 pieces
            </div>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: C.ink,
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="plus" size={20} stroke={2} />
          </div>
        </div>

        {/* Search */}
        <div style={{
          background: '#fff', borderRadius: 999, height: 44,
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px',
        }}>
          <Icon name="search" size={18} stroke={1.6} />
          <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.4)' }}>Search your closet…</div>
        </div>
      </div>

      {/* Pill filters */}
      <div style={{
        display: 'flex', gap: 8, padding: '0 20px 14px',
        fontFamily: softFont, overflow: 'hidden',
      }}>
        {filters.map((f) => (
          <div key={f.l} style={{
            background: f.active ? C.ink : '#fff',
            color: f.active ? '#fff' : C.ink,
            borderRadius: 999, padding: '8px 14px',
            fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
            whiteSpace: 'nowrap',
          }}>
            {f.l}
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: f.active ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)',
            }}>{f.count}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        padding: '0 20px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
      }}>
        {items.map((it, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 16, padding: 6,
            fontFamily: softFont,
          }}>
            <div style={{ width: '100%', aspectRatio: '3/4' }}>
              <StripedPlaceholder tone={it.tone} label={it.cat} radius={12} />
            </div>
            <div style={{ padding: '6px 4px 2px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>
                {it.name}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.45)', marginTop: 2 }}>
                {it.count}
              </div>
            </div>
          </div>
        ))}
      </div>

      <SoftTabs active="Closet" />
    </Screen>
  );
}

// ── B3 ── OUTFIT DETAIL ──────────────────────────────────────────────────
function SoftOutfit() {
  const pieces = [
    { name: 'Lemaire trench', cat: 'Outerwear', tone: 'cream',   col: '· camel' },
    { name: 'Toteme tee',     cat: 'Top',       tone: 'neutral', col: '· white' },
    { name: 'Khaite jeans',   cat: 'Bottom',    tone: 'neutral', col: '· indigo' },
    { name: 'Ala\u00efa flats', cat: 'Shoes',   tone: 'ink',     col: '· black' },
    { name: 'Mini bag',       cat: 'Bag',       tone: 'blush',   col: '· tan' },
  ];
  return (
    <Screen bg={C.cream}>
      <StatusBar />

      {/* Top action row */}
      <div style={{
        padding: '4px 16px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="back" size={18} stroke={1.6} />
        </div>
        <div style={{
          fontFamily: softFont, fontSize: 13, fontWeight: 600,
        }}>Outfit · Apr 11</div>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="more" size={18} stroke={1.6} />
        </div>
      </div>

      {/* Hero — outfit photo */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          width: '100%', aspectRatio: '4/3', position: 'relative',
        }}>
          <div style={{ width: '100%', height: '100%' }}>
            <StripedPlaceholder tone="cream" label="full look" radius={24} />
          </div>
          {/* Rating pill */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)',
            borderRadius: 999, padding: '6px 12px',
            display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: softFont, fontSize: 12, fontWeight: 700,
          }}>
            <Icon name="star" size={13} stroke={1.6} /> 4.0
          </div>
        </div>
      </div>

      {/* Title + meta */}
      <div style={{ padding: '14px 20px 0', fontFamily: softFont }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Dinner at Lila's
        </div>
        <div style={{
          display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap',
        }}>
          <span style={{
            background: '#fff', borderRadius: 999, padding: '5px 10px',
            fontSize: 11, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <Icon name="calendar" size={12} stroke={1.6} /> Thu, Apr 11
          </span>
          <span style={{
            background: '#fff', borderRadius: 999, padding: '5px 10px',
            fontSize: 11, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <Icon name="cloud" size={12} stroke={1.6} /> 12° clear
          </span>
          <span style={{
            background: C.blush, color: '#3A1F18',
            borderRadius: 999, padding: '5px 10px',
            fontSize: 11, fontWeight: 600,
          }}>
            Casual dinner
          </span>
        </div>
      </div>

      {/* Pieces list */}
      <div style={{ padding: '18px 16px 0', fontFamily: softFont }}>
        <div style={{
          fontSize: 12, fontWeight: 700,
          color: 'rgba(0,0,0,0.5)', letterSpacing: '0.04em',
          textTransform: 'uppercase', padding: '0 4px 10px',
        }}>
          5 pieces
        </div>
        <div style={{
          background: '#fff', borderRadius: 18, padding: 6,
          display: 'flex', flexDirection: 'column',
        }}>
          {pieces.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: 8,
              borderBottom: i < pieces.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
            }}>
              <div style={{ width: 38, height: 46 }}>
                <StripedPlaceholder tone={p.tone} label="" radius={8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>
                  {p.cat} {p.col}
                </div>
              </div>
              <Icon name="back" size={14} stroke={1.4} />
            </div>
          ))}
        </div>
      </div>

      <SoftTabs active="Calendar" />
    </Screen>
  );
}

Object.assign(window, { SoftHome, SoftWardrobe, SoftOutfit });
