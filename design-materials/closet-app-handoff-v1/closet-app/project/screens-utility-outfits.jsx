// Outfit-related screens: log new outfit, calendar month view, library list.

// ── LOG OUTFIT ───────────────────────────────────────────────────────────
function UtilityLogOutfit() {
  const slots = [
    { cat: 'outerwear', filled: true,  name: 'Lemaire trench', id: 'i138', tone: 'cream' },
    { cat: 'top',       filled: true,  name: 'Toteme tee',     id: 'i142', tone: 'neutral' },
    { cat: 'bottom',    filled: true,  name: 'Khaite jeans',   id: 'i140', tone: 'neutral' },
    { cat: 'shoes',     filled: true,  name: 'Alaïa flats',    id: 'i136', tone: 'ink' },
    { cat: 'accessory', filled: false },
  ];
  // Items to pick from in the bottom drawer
  const drawer = [
    { tone: 'neutral', cat: 'top' },
    { tone: 'cream',   cat: 'top' },
    { tone: 'ink',     cat: 'top' },
    { tone: 'neutral', cat: 'top' },
    { tone: 'blush',   cat: 'top' },
    { tone: 'cream',   cat: 'top' },
    { tone: 'neutral', cat: 'top' },
    { tone: 'ink',     cat: 'top' },
  ];
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <AppBar
        title={<><Icon name="back" size={16} stroke={1.6} /> Cancel</>}
        right={
          <div style={{
            fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          }}>2026-04-14 · sun</div>
        }
      />

      {/* Page title */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          fontFamily: uiFont, fontSize: 24, fontWeight: 500,
          letterSpacing: '-0.025em', lineHeight: 1.05,
        }}>Log today's outfit</div>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          marginTop: 4,
        }}>4 of 5 slots filled · weather captured 16°</div>
      </div>

      {/* Occasion + meta */}
      <div style={{ padding: '14px 20px 0' }}>
        <SectionLabel>context</SectionLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            ['casual',   true],
            ['work',     false],
            ['dinner',   false],
            ['gallery',  false],
            ['weekend',  false],
            ['+ custom', false],
          ].map(([l, on], i) => (
            <MonoTag key={i} filled={on}>{l}</MonoTag>
          ))}
        </div>
      </div>

      {/* Slot stack — the outfit being composed */}
      <div style={{ padding: '14px 20px 0' }}>
        <SectionLabel right="4 / 5">pieces</SectionLabel>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6,
        }}>
          {slots.map((s, i) => (
            <div key={i} style={{
              border: s.filled ? uRule : '1.5px dashed rgba(0,0,0,0.22)',
              background: s.filled ? '#fff' : 'transparent',
              borderRadius: 3,
              aspectRatio: '3/4',
              position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}>
              {s.filled ? (
                <>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <StripedPlaceholder tone={s.tone} label="" radius={0} />
                  </div>
                  <div style={{
                    position: 'absolute', top: 4, left: 4,
                    fontFamily: monoFont, fontSize: 7.5,
                    background: '#fff', padding: '1px 4px',
                  }}>{s.cat}</div>
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 14, height: 14,
                    background: 'rgba(0,0,0,0.5)', color: '#fff',
                    fontFamily: monoFont, fontSize: 9, lineHeight: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>×</div>
                </>
              ) : (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 4,
                  fontFamily: monoFont, fontSize: 8.5,
                  color: 'rgba(0,0,0,0.4)',
                }}>
                  <Icon name="plus" size={14} stroke={1.4} />
                  {s.cat}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Item picker drawer */}
      <div style={{
        position: 'absolute', bottom: 140, left: 0, right: 0,
        background: '#fff', borderTop: uRule, borderBottom: uRule,
        padding: '12px 20px 12px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8,
        }}>
          <div style={{
            fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>// pick from closet</div>
          <div style={{ flex: 1, borderTop: uDashed }} />
          <Icon name="filter" size={13} stroke={1.4} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {['top', 'btm', 'coat', 'shoe', 'acc'].map((t, i) => (
            <MonoTag key={t} filled={i === 0}>{t}</MonoTag>
          ))}
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6,
          overflow: 'hidden',
        }}>
          {drawer.map((d, i) => (
            <div key={i} style={{
              aspectRatio: '3/4', border: uRule,
              opacity: i > 4 ? 0.5 : 1,
            }}>
              <StripedPlaceholder tone={d.tone} label="" radius={0} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom action */}
      <div style={{
        position: 'absolute', bottom: 84, left: 0, right: 0,
        background: C.bg, borderTop: uRule,
        padding: '12px 20px',
      }}>
        <UButton full icon="check">Log this outfit</UButton>
      </div>

      <UtilityTabs active="log" />
    </Screen>
  );
}

// ── CALENDAR ─────────────────────────────────────────────────────────────
function UtilityCalendar() {
  // April 2026 starts Wed. Build a 5-row grid: prepended Sun/Mon/Tue blanks,
  // then 1-30. Some days have outfits, some don't, today (14) is highlighted.
  const today = 14;
  const offset = 3; // sun(29) mon(30) tue(31) of March, blanks
  const logged = new Set([1, 3, 5, 7, 9, 11, 12, 14, 16, 18, 21, 22, 24, 26, 28, 29, 30]);
  const dayTone = { 1: 'neutral', 3: 'cream', 5: 'ink', 7: 'cream', 9: 'ink',
                    11: 'cream', 12: 'neutral', 14: 'blush', 16: 'neutral',
                    18: 'cream', 21: 'ink', 22: 'cream', 24: 'neutral',
                    26: 'blush', 28: 'cream', 29: 'neutral', 30: 'cream' };

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push({ blank: true });
  for (let d = 1; d <= 30; d++) cells.push({ d, has: logged.has(d), tone: dayTone[d], today: d === today });
  while (cells.length % 7 !== 0) cells.push({ blank: true });

  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <TopBar title="Calendar" />

      {/* Month nav */}
      <div style={{
        padding: '16px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <div>
          <div style={{
            fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>2026</div>
          <div style={{
            fontFamily: uiFont, fontSize: 32, fontWeight: 500,
            letterSpacing: '-0.025em', lineHeight: 1, marginTop: 4,
          }}>April</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: monoFont, fontSize: 11,
        }}>
          <span style={{ color: 'rgba(0,0,0,0.4)' }}>‹ mar</span>
          <span style={{ color: 'rgba(0,0,0,0.4)' }}>may ›</span>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{
        margin: '14px 20px 0',
        border: uRule, borderRadius: 4,
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
      }}>
        {[
          ['logged', '17 days'],
          ['streak', '4 days'],
          ['top occ', 'studio'],
        ].map(([k, v], i) => (
          <div key={i} style={{
            padding: 10,
            borderRight: i < 2 ? uRule : 'none',
          }}>
            <div style={{
              fontFamily: monoFont, fontSize: 8.5, color: 'rgba(0,0,0,0.5)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>{k}</div>
            <div style={{
              fontFamily: uiFont, fontSize: 15, fontWeight: 500,
              letterSpacing: '-0.015em', marginTop: 4,
            }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Day headers */}
      <div style={{
        margin: '20px 20px 0',
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.45)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        paddingBottom: 6, borderBottom: uRule,
      }}>
        {['sun','mon','tue','wed','thu','fri','sat'].map((d) => (
          <div key={d} style={{ textAlign: 'center' }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        margin: '0 20px',
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        borderRight: uRule, borderBottom: uRule,
      }}>
        {cells.map((c, i) => (
          <div key={i} style={{
            aspectRatio: '1/1.05',
            borderLeft: uRule, borderTop: uRule,
            background: c.today ? C.cream : 'transparent',
            position: 'relative',
            padding: 4,
            opacity: c.blank ? 0.35 : 1,
          }}>
            {!c.blank && (
              <>
                <div style={{
                  fontFamily: monoFont, fontSize: 9.5,
                  color: c.today ? C.ink : 'rgba(0,0,0,0.65)',
                  fontWeight: c.today ? 600 : 400,
                }}>{String(c.d).padStart(2, '0')}</div>
                {c.has && (
                  <div style={{
                    position: 'absolute', left: 4, right: 4, bottom: 4, top: 18,
                  }}>
                    <StripedPlaceholder tone={c.tone} label="" radius={0} />
                  </div>
                )}
                {!c.has && !c.today && c.d <= today && (
                  <div style={{
                    position: 'absolute', left: '50%', top: '60%',
                    transform: 'translate(-50%, -50%)',
                    width: 4, height: 4,
                    background: 'rgba(0,0,0,0.15)',
                  }} />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Today summary + primary Log CTA */}
      <div style={{
        position: 'absolute', bottom: 88, left: 20, right: 20,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{
          border: uRule, background: '#fff', padding: 12,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 44, height: 54 }}>
            <StripedPlaceholder tone="blush" label="" radius={2} />
          </div>
          <div style={{ flex: 1, fontFamily: uiFont }}>
            <div style={{
              fontFamily: monoFont, fontSize: 9.5, color: 'rgba(0,0,0,0.55)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>2026-04-14 · today</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>
              Quiet Sunday · 5 pieces
            </div>
          </div>
          <Icon name="back" size={14} stroke={1.2} />
        </div>
        <UButton icon="plus" full>Log outfit</UButton>
      </div>

      <UtilityTabs active="calendar" />
    </Screen>
  );
}

// ── LIBRARY (LIST) ───────────────────────────────────────────────────────
function UtilityLibrary() {
  const days = [
    { date: 'Apr 14', dow: 'sun', occ: 'Quiet Sunday',     items: 5, weather: '16° cloud',  rating: 3, tone: 'blush' },
    { date: 'Apr 12', dow: 'fri', occ: 'Studio',           items: 4, weather: '14° cloud',  rating: 4, tone: 'neutral' },
    { date: 'Apr 11', dow: 'thu', occ: "Dinner at Lila's", items: 5, weather: '12° clear',  rating: 4, tone: 'cream' },
    { date: 'Apr 09', dow: 'tue', occ: 'Gallery opening',  items: 6, weather: '15° clear',  rating: 5, tone: 'ink' },
    { date: 'Apr 07', dow: 'sun', occ: 'Brunch',           items: 4, weather: '13° cloud',  rating: 3, tone: 'cream' },
    { date: 'Apr 05', dow: 'fri', occ: 'Client review',    items: 5, weather: '11° rain',   rating: 4, tone: 'neutral' },
    { date: 'Apr 03', dow: 'wed', occ: 'Studio',           items: 4, weather: '10° clear',  rating: 3, tone: 'neutral' },
  ];
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <AppBar
        title="Library"
        right={
          <div style={{
            display: 'flex', gap: 6,
            fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          }}>
            <span style={{ color: C.ink, borderBottom: `1px solid ${C.ink}`, paddingBottom: 2 }}>list</span>
            <span>·</span>
            <span>grid</span>
          </div>
        }
      />

      {/* Sort/filter row */}
      <div style={{
        padding: '14px 20px 12px',
        display: 'flex', gap: 6, alignItems: 'center',
      }}>
        <MonoTag filled>all</MonoTag>
        <MonoTag>this month</MonoTag>
        <MonoTag>★ ≥ 4</MonoTag>
        <div style={{ flex: 1 }} />
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.45)',
        }}>↓ newest</div>
      </div>

      {/* Day rows */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ borderTop: uRule }}>
          {days.map((d, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '50px 48px 1fr 14px',
              gap: 12, alignItems: 'center',
              padding: '12px 0', borderBottom: uRule,
            }}>
              {/* Date column */}
              <div style={{ fontFamily: monoFont }}>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1 }}>
                  {d.date.split(' ')[1]}
                </div>
                <div style={{
                  fontSize: 9, color: 'rgba(0,0,0,0.5)',
                  marginTop: 3, textTransform: 'lowercase',
                  letterSpacing: '0.04em',
                }}>
                  {d.date.split(' ')[0]} · {d.dow}
                </div>
              </div>

              {/* Thumb */}
              <div style={{ width: 48, height: 60 }}>
                <StripedPlaceholder tone={d.tone} label="" radius={2} />
              </div>

              {/* Title + meta */}
              <div style={{ fontFamily: uiFont }}>
                <div style={{
                  fontSize: 14, fontWeight: 500,
                  letterSpacing: '-0.01em', lineHeight: 1.2,
                }}>{d.occ}</div>
                <div style={{
                  display: 'flex', gap: 8, marginTop: 4,
                  fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
                }}>
                  <span>{d.items} pieces</span>
                  <span>·</span>
                  <span>{d.weather}</span>
                  <span>·</span>
                  <span style={{ color: '#9C5544' }}>
                    {'★'.repeat(d.rating)}{'·'.repeat(5 - d.rating)}
                  </span>
                </div>
              </div>

              <Icon name="back" size={12} stroke={1.2} />
            </div>
          ))}
        </div>
      </div>

      <UtilityTabs active="calendar" />
    </Screen>
  );
}

Object.assign(window, { UtilityLogOutfit, UtilityCalendar, UtilityLibrary });
