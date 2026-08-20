// Mood A — EDITORIAL
// Type: Instrument Serif (display) + Inter Tight (body)
// Voice: a fashion-magazine table of contents. Hairline rules, lots of
// whitespace, big asymmetric serif numerals.

const editorialFont = {
  display: '"Instrument Serif", "Cormorant Garamond", Georgia, serif',
  body:    '"Inter Tight", "Helvetica Neue", system-ui, sans-serif',
};

const eRule = '1px solid rgba(0,0,0,0.12)';

// Bottom tab bar — labels only, serif, an underline marks the active one.
function EditorialTabs({ active = 'Closet' }) {
  const tabs = ['Closet', 'Log', 'Calendar', 'Suggest'];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 88, paddingBottom: 28,
      borderTop: eRule, background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      fontFamily: editorialFont.display,
    }}>
      {tabs.map((t) => (
        <div key={t} style={{
          fontSize: 17, fontStyle: 'italic',
          color: t === active ? C.ink : 'rgba(0,0,0,0.4)',
          borderBottom: t === active ? '1px solid #0A0A0A' : '1px solid transparent',
          paddingBottom: 2,
        }}>{t}</div>
      ))}
    </div>
  );
}

// ── A1 ── HOME ───────────────────────────────────────────────────────────
function EditorialHome() {
  return (
    <Screen bg={C.bg}>
      <StatusBar />
      {/* Masthead */}
      <div style={{ padding: '8px 28px 0', fontFamily: editorialFont.body }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.55)',
        }}>
          <span>No. 142 · Sun Apr 14</span>
          <span>16° · Overcast</span>
        </div>
        <div style={{ borderTop: eRule, marginTop: 10 }} />
      </div>

      {/* Big serif greeting */}
      <div style={{
        padding: '22px 28px 6px',
        fontFamily: editorialFont.display,
        fontSize: 46, lineHeight: 1, letterSpacing: '-0.01em',
      }}>
        <div>Good</div>
        <div style={{ fontStyle: 'italic', color: '#7A6A5F' }}>morning,</div>
        <div>Špela.</div>
      </div>

      {/* CTA */}
      <div style={{ padding: '18px 28px 0' }}>
        <button style={{
          width: '100%', height: 52, border: '1px solid #0A0A0A', background: C.ink,
          color: '#fff', fontFamily: editorialFont.body, fontSize: 14,
          letterSpacing: '0.04em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon name="plus" size={16} /> Log today's outfit
        </button>
      </div>

      {/* Section: Today's brief */}
      <div style={{ padding: '28px 28px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          fontFamily: editorialFont.body, fontSize: 10,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.55)',
        }}>
          <span>The brief</span>
          <span>I.</span>
        </div>
        <div style={{ borderTop: eRule, marginTop: 8, marginBottom: 14 }} />
        <div style={{
          fontFamily: editorialFont.display, fontSize: 22, lineHeight: 1.25,
          letterSpacing: '-0.005em',
        }}>
          A cool, cloud-bright day in Ljubljana.<br/>
          Studio meetings till four, then dinner at <span style={{ fontStyle: 'italic' }}>Lila's</span>.
        </div>
      </div>

      {/* Section: Recently worn */}
      <div style={{ padding: '28px 28px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          fontFamily: editorialFont.body, fontSize: 10,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.55)',
        }}>
          <span>Recently worn</span>
          <span>II.</span>
        </div>
        <div style={{ borderTop: eRule, marginTop: 8 }} />

        {[
          { date: '12', day: 'fri', name: 'Studio day',     items: 4, tone: 'neutral' },
          { date: '11', day: 'thu', name: 'Dinner at Lila\u2019s', items: 5, tone: 'cream' },
          { date: '09', day: 'tue', name: 'Gallery opening', items: 6, tone: 'blush' },
        ].map((o, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 0', borderBottom: eRule,
          }}>
            <div style={{
              width: 52, fontFamily: editorialFont.display, lineHeight: 1,
            }}>
              <div style={{ fontSize: 28 }}>{o.date}</div>
              <div style={{ fontSize: 10, fontStyle: 'italic', color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>
                Apr · {o.day}
              </div>
            </div>
            <div style={{ width: 44, height: 56 }}>
              <StripedPlaceholder tone={o.tone} label="" radius={2} />
            </div>
            <div style={{ flex: 1, fontFamily: editorialFont.body }}>
              <div style={{ fontFamily: editorialFont.display, fontSize: 19, lineHeight: 1.1 }}>
                {o.name}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginTop: 4 }}>
                {o.items} pieces
              </div>
            </div>
            <Icon name="back" size={14} stroke={1} />
          </div>
        ))}
      </div>

      <EditorialTabs active="Closet" />
    </Screen>
  );
}

// ── A2 ── WARDROBE GRID ──────────────────────────────────────────────────
function EditorialWardrobe() {
  const items = [
    { name: 'Toteme tee',        cat: 'top',       tone: 'neutral' },
    { name: 'The Row blazer',    cat: 'top',       tone: 'ink' },
    { name: 'Khaite jeans',      cat: 'bottom',    tone: 'neutral' },
    { name: 'Bode dress',        cat: 'dress',     tone: 'cream' },
    { name: 'Lemaire trench',    cat: 'outerwear', tone: 'cream' },
    { name: 'Acne cardigan',     cat: 'top',       tone: 'cream' },
    { name: 'Ala\u00efa flats',  cat: 'shoes',     tone: 'ink' },
    { name: 'Margiela tabis',    cat: 'shoes',     tone: 'neutral' },
    { name: 'Jacquemus mini',    cat: 'bag',       tone: 'blush' },
    { name: 'Pearl rope',        cat: 'jewellery', tone: 'neutral' },
    { name: 'Cosmic silk scarf', cat: 'accessory', tone: 'blush' },
    { name: 'Loro Piana coat',   cat: 'outerwear', tone: 'cream' },
  ];
  const filters = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      {/* Masthead */}
      <div style={{ padding: '4px 28px 0', fontFamily: editorialFont.body }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.55)',
        }}>
          <span>The closet</span>
          <span>142 pieces</span>
        </div>
        <div style={{ borderTop: eRule, marginTop: 8 }} />
      </div>

      {/* Display title */}
      <div style={{
        padding: '18px 28px 4px',
        fontFamily: editorialFont.display,
        fontSize: 56, lineHeight: 0.95, letterSpacing: '-0.02em',
      }}>
        Closet<span style={{ fontStyle: 'italic', color: '#7A6A5F' }}>.</span>
      </div>
      <div style={{
        padding: '0 28px 14px',
        fontFamily: editorialFont.display, fontStyle: 'italic',
        fontSize: 15, color: 'rgba(0,0,0,0.55)',
      }}>
        A complete index, by category.
      </div>

      {/* Filter rail — serif italics, scrolling */}
      <div style={{
        display: 'flex', gap: 18, padding: '0 28px 14px',
        fontFamily: editorialFont.display, fontStyle: 'italic', fontSize: 16,
        borderBottom: eRule, marginBottom: 16,
      }}>
        {filters.map((f, i) => (
          <span key={f} style={{
            color: i === 0 ? C.ink : 'rgba(0,0,0,0.4)',
            borderBottom: i === 0 ? '1px solid #0A0A0A' : 'none',
            paddingBottom: 6,
          }}>{f}</span>
        ))}
      </div>

      {/* 3-col grid */}
      <div style={{
        padding: '0 28px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 12px',
      }}>
        {items.slice(0, 9).map((it, i) => (
          <div key={i}>
            <div style={{ width: '100%', aspectRatio: '3/4' }}>
              <StripedPlaceholder tone={it.tone} label={it.cat} radius={2} />
            </div>
            <div style={{
              marginTop: 6,
              fontFamily: editorialFont.display, fontSize: 13, lineHeight: 1.2,
              letterSpacing: '-0.005em',
            }}>{it.name}</div>
            <div style={{
              fontFamily: editorialFont.body, fontSize: 9,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.45)', marginTop: 2,
            }}>{it.cat}</div>
          </div>
        ))}
      </div>

      <EditorialTabs active="Closet" />
    </Screen>
  );
}

// ── A3 ── OUTFIT DETAIL ──────────────────────────────────────────────────
function EditorialOutfit() {
  const pieces = [
    { name: 'Lemaire wool trench',     cat: 'outerwear', tone: 'cream' },
    { name: 'Toteme heavyweight tee',  cat: 'top',       tone: 'neutral' },
    { name: 'Khaite slim jeans',       cat: 'bottom',    tone: 'neutral' },
    { name: 'Ala\u00efa ballet flats', cat: 'shoes',     tone: 'ink' },
    { name: 'Jacquemus mini bag',      cat: 'bag',       tone: 'blush' },
  ];
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      {/* Header */}
      <div style={{
        padding: '4px 22px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: editorialFont.body, fontSize: 10,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'rgba(0,0,0,0.55)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="back" size={14} stroke={1.2} /> Library
        </div>
        <span>Outfit · No. 042</span>
        <Icon name="more" size={16} stroke={1.2} />
      </div>
      <div style={{ borderTop: eRule, margin: '8px 22px 0' }} />

      {/* Hero block — date, occasion, conditions */}
      <div style={{ padding: '20px 28px 0', fontFamily: editorialFont.display }}>
        <div style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(0,0,0,0.55)' }}>
          Thursday, 11 April
        </div>
        <div style={{
          fontSize: 42, lineHeight: 1, letterSpacing: '-0.01em', marginTop: 4,
        }}>
          Dinner at<br/>
          <span style={{ fontStyle: 'italic', color: '#7A6A5F' }}>Lila's</span>.
        </div>
      </div>

      {/* meta strip */}
      <div style={{
        margin: '18px 28px 0', padding: '12px 0',
        borderTop: eRule, borderBottom: eRule,
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        fontFamily: editorialFont.body,
      }}>
        {[
          ['Occasion', 'Casual dinner'],
          ['Weather',  '12° · clear'],
          ['Rating',   '\u2605\u2605\u2605\u2605\u2606'],
        ].map(([l, v], i) => (
          <div key={i} style={{
            borderRight: i < 2 ? eRule : 'none', paddingLeft: i === 0 ? 0 : 12,
          }}>
            <div style={{
              fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.45)',
            }}>{l}</div>
            <div style={{
              fontFamily: editorialFont.display, fontSize: 16, marginTop: 4,
            }}>{v}</div>
          </div>
        ))}
      </div>

      {/* The look — two large tiles + caption */}
      <div style={{ padding: '20px 28px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          fontFamily: editorialFont.body, fontSize: 10,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.55)',
        }}>
          <span>The look</span>
          <span>5 pieces</span>
        </div>
        <div style={{ borderTop: eRule, marginTop: 8, marginBottom: 12 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10 }}>
          <div style={{ aspectRatio: '3/4' }}>
            <StripedPlaceholder tone="cream" label="full look" radius={2} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ flex: 1, aspectRatio: '3/2' }}>
              <StripedPlaceholder tone="ink" label="shoes" radius={2} />
            </div>
            <div style={{ flex: 1, aspectRatio: '3/2' }}>
              <StripedPlaceholder tone="blush" label="bag" radius={2} />
            </div>
          </div>
        </div>

        {/* Caption — item list */}
        <div style={{
          marginTop: 14,
          fontFamily: editorialFont.display, fontSize: 14, lineHeight: 1.5,
          color: 'rgba(0,0,0,0.78)',
        }}>
          {pieces.map((p, i) => (
            <span key={i}>
              <span style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.5)' }}>{p.cat}</span>
              {' '}
              {p.name}
              {i < pieces.length - 1 && <span style={{ color: 'rgba(0,0,0,0.3)' }}> · </span>}
            </span>
          ))}
        </div>
      </div>

      <EditorialTabs active="Calendar" />
    </Screen>
  );
}

Object.assign(window, { EditorialHome, EditorialWardrobe, EditorialOutfit });
