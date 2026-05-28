// Additional screens completing the app:
// - CheckEmail (after sending magic link)
// - EmptyCloset (first-run state)
// - PhotoReview (add-item step 2: review compressed photo)
// - SearchOverlay (full-screen search active state)
// - LibraryGrid (alt view of the outfit library)
// - SuggestInput (Phase 3 — "what should I wear?")
// - SuggestResult (Phase 3 — proposed outfit + reasoning)
// - StyleProfileEditor (the free-text profile feeding suggestions)

// ── CHECK EMAIL ──────────────────────────────────────────────────────────
function UtilityCheckEmail() {
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <div style={{
        padding: '4px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: uiFont,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
        }}>
          <Icon name="back" size={16} stroke={1.6} /> back
        </div>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
        }}>step 2 / 2</div>
      </div>
      <div style={{ borderTop: uRule, margin: '12px 20px 0' }} />

      {/* Big mark */}
      <div style={{
        margin: '64px auto 0', width: 96, height: 96,
        border: uRule, background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <Icon name="check" size={36} stroke={1.4} />
        <div style={{
          position: 'absolute', top: -6, left: -6,
          width: 10, height: 10, background: C.blush,
        }} />
      </div>

      {/* Title */}
      <div style={{ padding: '40px 28px 0', textAlign: 'center', fontFamily: uiFont }}>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>// link sent</div>
        <div style={{
          fontSize: 28, fontWeight: 500,
          letterSpacing: '-0.025em', marginTop: 14, lineHeight: 1.1,
        }}>
          Check your email.
        </div>
        <div style={{
          fontFamily: uiFont, fontSize: 14, lineHeight: 1.55,
          color: 'rgba(0,0,0,0.6)', marginTop: 12, padding: '0 8px',
        }}>
          We sent a sign-in link to <span style={{
            fontFamily: monoFont, color: C.ink,
          }}>spela@anzeljc.com</span>. Tap it on any device to open your closet.
        </div>
      </div>

      {/* Mono meta box */}
      <div style={{
        margin: '32px 20px 0',
        border: uRule, padding: 14,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <MonoKV k="sent"     v="2026-04-14 09:41:02 CET" />
        <MonoKV k="expires"  v="in 15 minutes" accent />
        <MonoKV k="from"     v="auth@closet.app" />
      </div>

      {/* Actions */}
      <div style={{ padding: '20px 20px 0', display: 'flex', gap: 8 }}>
        <UButton variant="ghost" style={{ flex: 1 }}>Resend</UButton>
        <UButton variant="secondary" style={{ flex: 1 }}>Open mail app</UButton>
      </div>

      <div style={{
        position: 'absolute', bottom: 28, left: 20, right: 20,
        textAlign: 'center', paddingTop: 14, borderTop: uRule,
        fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.5)',
      }}>
        wrong email? <span style={{ color: C.ink, textDecoration: 'underline' }}>change it ›</span>
      </div>
    </Screen>
  );
}

// ── EMPTY CLOSET (FIRST-RUN) ─────────────────────────────────────────────
function UtilityEmptyCloset() {
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <TopBar
        title={<><Icon name="hanger" size={16} stroke={1.6} /> Closet</>}
        meta="0 items"
      />

      {/* Hero — striped box that visually echoes a placeholder grid */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          width: '100%', aspectRatio: '3/2',
          border: uRule, position: 'relative', overflow: 'hidden',
          background:
            `repeating-linear-gradient(135deg, ${C.cream} 0 14px, #E8D3BD 14px 28px)`,
        }}>
          {/* Tiny dashed-outline tiles */}
          <div style={{
            position: 'absolute', inset: 24,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)', gap: 8,
          }}>
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} style={{
                background: '#fff',
                border: '1.5px dashed rgba(0,0,0,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="plus" size={14} stroke={1.2} />
              </div>
            ))}
          </div>
          <div style={{
            position: 'absolute', top: 8, left: 8,
            fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.55)',
            background: '#fff', padding: '2px 5px',
          }}>// empty</div>
        </div>
      </div>

      {/* Copy */}
      <div style={{ padding: '24px 20px 0', fontFamily: uiFont }}>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>// start your closet</div>
        <div style={{
          fontSize: 28, fontWeight: 500,
          letterSpacing: '-0.025em', marginTop: 8, lineHeight: 1.1,
        }}>
          Nothing here yet.<br/>
          <span style={{ color: 'rgba(0,0,0,0.45)' }}>Add your first piece.</span>
        </div>
      </div>

      {/* Step list — what to do */}
      <div style={{ padding: '24px 20px 0' }}>
        <SectionLabel>what to do</SectionLabel>
        <div style={{ borderTop: uRule }}>
          {[
            ['01', 'Snap or upload a photo'],
            ['02', 'Name it · pick a category'],
            ['03', 'Rate warmth + formality (drives weather match)'],
            ['04', 'Repeat for ~30 favourites before logging outfits'],
          ].map(([n, t], i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '36px 1fr',
              padding: '10px 0', borderBottom: uRule,
              alignItems: 'baseline',
            }}>
              <div style={{
                fontFamily: monoFont, fontSize: 11, fontWeight: 600,
                color: '#9C5544',
              }}>{n}</div>
              <div style={{
                fontFamily: uiFont, fontSize: 14, fontWeight: 500,
                letterSpacing: '-0.005em',
              }}>{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '20px 20px 0' }}>
        <UButton icon="plus" full>Add first item</UButton>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.5)',
          textAlign: 'center', marginTop: 10,
        }}>
          targeted for 150–400 items total
        </div>
      </div>

      <UtilityTabs active="closet" />
    </Screen>
  );
}

// ── PHOTO REVIEW (ADD-ITEM STEP) ─────────────────────────────────────────
function UtilityPhotoReview() {
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <AppBar
        title={<><Icon name="back" size={16} stroke={1.6} /> Cancel</>}
        right={
          <div style={{
            fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          }}>step 2 / 3 · review</div>
        }
      />

      {/* Page title */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          fontFamily: uiFont, fontSize: 22, fontWeight: 500,
          letterSpacing: '-0.025em', lineHeight: 1.05,
        }}>Review photo</div>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          marginTop: 4,
        }}>compressed client-side · before upload</div>
      </div>

      {/* Big photo with crop frame */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{
          width: '100%', aspectRatio: '1/1',
          border: uRule, background: '#000', position: 'relative', overflow: 'hidden',
        }}>
          <StripedPlaceholder tone="cream" label="" radius={0} />
          {/* Crop guide */}
          <div style={{
            position: 'absolute', inset: 24,
            border: '1px solid rgba(255,255,255,0.85)',
          }}>
            {/* Corner ticks */}
            {[
              { top: -1, left: -1, borderTop: '2px solid #fff', borderLeft: '2px solid #fff' },
              { top: -1, right: -1, borderTop: '2px solid #fff', borderRight: '2px solid #fff' },
              { bottom: -1, left: -1, borderBottom: '2px solid #fff', borderLeft: '2px solid #fff' },
              { bottom: -1, right: -1, borderBottom: '2px solid #fff', borderRight: '2px solid #fff' },
            ].map((s, i) => (
              <div key={i} style={{
                position: 'absolute', width: 14, height: 14, ...s,
              }} />
            ))}
            {/* Rule of thirds */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '33.33%', borderLeft: '1px solid rgba(255,255,255,0.3)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '66.66%', borderLeft: '1px solid rgba(255,255,255,0.3)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '33.33%', borderTop: '1px solid rgba(255,255,255,0.3)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '66.66%', borderTop: '1px solid rgba(255,255,255,0.3)' }} />
          </div>
          {/* Filename badge */}
          <div style={{
            position: 'absolute', top: 8, left: 8,
            fontFamily: monoFont, fontSize: 9, color: '#fff',
            background: 'rgba(0,0,0,0.5)', padding: '2px 6px',
          }}>IMG_4218.HEIC</div>
        </div>
      </div>

      {/* Compression stats */}
      <div style={{
        margin: '14px 20px 0',
        border: uRule,
      }}>
        <div style={{
          padding: 10, borderBottom: uRule,
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          fontFamily: monoFont, fontSize: 10,
        }}>
          <span style={{ color: 'rgba(0,0,0,0.55)' }}>compression preview</span>
          <span style={{ color: '#3F9C5C' }}>↓ 96%</span>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        }}>
          {[
            ['size',  '4.2 MB → 287 KB'],
            ['dims',  '4032 × 3024 → 1200 × 900'],
            ['fmt',   'HEIC → JPEG q0.8'],
          ].map(([k, v], i) => (
            <div key={i} style={{
              padding: 10, borderRight: i < 2 ? uRule : 'none',
            }}>
              <div style={{
                fontFamily: monoFont, fontSize: 8.5, color: 'rgba(0,0,0,0.5)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>{k}</div>
              <div style={{
                fontFamily: monoFont, fontSize: 10, fontWeight: 500,
                marginTop: 4, color: C.ink, lineHeight: 1.3,
              }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Adjustments row */}
      <div style={{ padding: '16px 20px 0' }}>
        <SectionLabel>adjust</SectionLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            ['rotate', '⟲'],
            ['crop',   '⊡'],
            ['flip',   '⇄'],
            ['retake', '↺'],
          ].map(([l, g], i) => (
            <div key={i} style={{
              flex: 1, border: uRule, padding: '10px 6px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4,
            }}>
              <div style={{
                fontFamily: monoFont, fontSize: 18, color: C.ink,
              }}>{g}</div>
              <div style={{
                fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.55)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: C.bg, borderTop: uRule, padding: '12px 20px 28px',
        display: 'flex', gap: 8,
      }}>
        <UButton variant="ghost" style={{ flex: 1 }}>Retake</UButton>
        <UButton style={{ flex: 1.4 }} icon="check">Use this photo</UButton>
      </div>
    </Screen>
  );
}

// ── SEARCH OVERLAY ───────────────────────────────────────────────────────
function UtilitySearchOverlay() {
  const recent = ['black flats', 'lemaire', 'cream knit', 'jeans · indigo'];
  const hits = [
    { type: 'item',   name: 'Black Alaïa ballet flats', meta: 'i136 · shoe · 17×',  tone: 'ink' },
    { type: 'item',   name: 'Black Row blazer',         meta: 'i141 · top · 4×',   tone: 'ink' },
    { type: 'brand',  name: 'Toteme',                    meta: '12 items',         tone: null },
    { type: 'color',  name: 'Black',                     meta: '23 items',         tone: null },
    { type: 'outfit', name: 'Black-on-black studio fit', meta: '2026-03-22',       tone: 'ink' },
  ];
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      {/* Sticky search field */}
      <div style={{
        padding: '4px 20px 0',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon name="back" size={18} stroke={1.6} />
        <div style={{
          flex: 1, height: 40, border: uRule, background: '#fff',
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px',
        }}>
          <Icon name="search" size={15} stroke={1.4} />
          <div style={{
            fontFamily: monoFont, fontSize: 13, color: C.ink, fontWeight: 500,
            flex: 1,
          }}>
            black<span style={{
              display: 'inline-block', width: 1.5, height: 14,
              background: C.ink, marginLeft: 1, verticalAlign: 'middle',
            }} />
          </div>
          <div style={{
            fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
          }}>x</div>
        </div>
      </div>
      <div style={{ borderTop: uRule, margin: '12px 20px 0' }} />

      {/* Result count */}
      <div style={{
        padding: '12px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontFamily: monoFont, fontSize: 10,
      }}>
        <span style={{ color: 'rgba(0,0,0,0.5)' }}>// 5 results across 3 types</span>
        <span style={{ color: 'rgba(0,0,0,0.4)' }}>0.04s</span>
      </div>

      {/* Recent */}
      <div style={{ padding: '14px 20px 0' }}>
        <SectionLabel>recent</SectionLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {recent.map((r, i) => (
            <MonoTag key={i}>{r}</MonoTag>
          ))}
        </div>
      </div>

      {/* Filter chips (type) */}
      <div style={{
        padding: '14px 20px 0',
        display: 'flex', gap: 6, overflow: 'hidden',
      }}>
        {[
          ['all', 5, true], ['items', 2], ['brands', 1], ['colors', 1], ['outfits', 1],
        ].map(([l, n, on], i) => (
          <MonoTag key={i} filled={on}>{l} <span style={{ opacity: 0.55 }}>{n}</span></MonoTag>
        ))}
      </div>

      {/* Hits */}
      <div style={{ padding: '16px 20px 0' }}>
        <SectionLabel>matches</SectionLabel>
        <div style={{ borderTop: uRule }}>
          {hits.map((h, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '36px 1fr 60px 14px',
              gap: 12, alignItems: 'center',
              padding: '10px 0', borderBottom: uRule,
            }}>
              <div style={{ height: 44 }}>
                {h.tone ? (
                  <StripedPlaceholder tone={h.tone} label="" radius={2} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    border: uRule,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.4)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>{h.type.slice(0,3)}</div>
                )}
              </div>
              <div>
                <div style={{
                  fontFamily: uiFont, fontSize: 13, fontWeight: 500,
                  letterSpacing: '-0.005em',
                }}>
                  {h.name.split('Black').map((part, j, arr) => (
                    <React.Fragment key={j}>
                      {part}
                      {j < arr.length - 1 && <span style={{
                        background: C.cream, padding: '0 2px',
                      }}>Black</span>}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{
                  fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.55)',
                  marginTop: 2,
                }}>{h.meta}</div>
              </div>
              <div style={{
                fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
                textAlign: 'right', textTransform: 'lowercase',
              }}>{h.type}</div>
              <Icon name="back" size={12} stroke={1.2} />
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

// ── LIBRARY GRID VIEW ────────────────────────────────────────────────────
function UtilityLibraryGrid() {
  const days = [
    { date: '14', mo: 'apr', tone: 'blush'   },
    { date: '12', mo: 'apr', tone: 'neutral' },
    { date: '11', mo: 'apr', tone: 'cream'   },
    { date: '09', mo: 'apr', tone: 'ink'     },
    { date: '07', mo: 'apr', tone: 'cream'   },
    { date: '05', mo: 'apr', tone: 'neutral' },
    { date: '03', mo: 'apr', tone: 'neutral' },
    { date: '01', mo: 'apr', tone: 'cream'   },
    { date: '30', mo: 'mar', tone: 'ink'     },
    { date: '28', mo: 'mar', tone: 'blush'   },
    { date: '27', mo: 'mar', tone: 'cream'   },
    { date: '25', mo: 'mar', tone: 'neutral' },
    { date: '22', mo: 'mar', tone: 'ink'     },
    { date: '20', mo: 'mar', tone: 'cream'   },
    { date: '18', mo: 'mar', tone: 'neutral' },
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
            <span>list</span>
            <span>·</span>
            <span style={{ color: C.ink, borderBottom: `1px solid ${C.ink}`, paddingBottom: 2 }}>grid</span>
          </div>
        }
      />

      {/* Filter row */}
      <div style={{
        padding: '14px 20px 12px',
        display: 'flex', gap: 6, alignItems: 'center',
      }}>
        <MonoTag filled>all 86</MonoTag>
        <MonoTag>this mo</MonoTag>
        <MonoTag>★ ≥ 4</MonoTag>
        <div style={{ flex: 1 }} />
        <Icon name="filter" size={14} stroke={1.4} />
      </div>

      {/* Month label */}
      <div style={{
        padding: '0 20px 10px',
        display: 'flex', alignItems: 'baseline', gap: 8,
      }}>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>// 2026 · april</div>
        <div style={{ flex: 1, borderTop: uDashed }} />
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.4)',
        }}>8 days</div>
      </div>

      {/* Grid */}
      <div style={{
        padding: '0 20px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
      }}>
        {days.slice(0, 8).map((d, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <div style={{
              width: '100%', aspectRatio: '3/4',
              border: uRule, position: 'relative', overflow: 'hidden',
            }}>
              <StripedPlaceholder tone={d.tone} label="" radius={0} />
              <div style={{
                position: 'absolute', top: 6, left: 6,
                fontFamily: monoFont, fontSize: 9.5, fontWeight: 600,
                background: '#fff', padding: '2px 5px', color: C.ink,
              }}>{d.date}</div>
              <div style={{
                position: 'absolute', top: 6, right: 6,
                fontFamily: monoFont, fontSize: 8,
                color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.45)',
                padding: '2px 4px', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>{d.mo}</div>
            </div>
          </div>
        ))}
      </div>

      {/* March block */}
      <div style={{
        padding: '18px 20px 10px',
        display: 'flex', alignItems: 'baseline', gap: 8,
      }}>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>// 2026 · march</div>
        <div style={{ flex: 1, borderTop: uDashed }} />
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.4)',
        }}>22 days</div>
      </div>

      <div style={{
        padding: '0 20px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
      }}>
        {days.slice(8).map((d, i) => (
          <div key={i}>
            <div style={{
              width: '100%', aspectRatio: '3/4',
              border: uRule, position: 'relative', overflow: 'hidden',
            }}>
              <StripedPlaceholder tone={d.tone} label="" radius={0} />
              <div style={{
                position: 'absolute', top: 6, left: 6,
                fontFamily: monoFont, fontSize: 9.5, fontWeight: 600,
                background: '#fff', padding: '2px 5px', color: C.ink,
              }}>{d.date}</div>
            </div>
          </div>
        ))}
      </div>

      <UtilityTabs active="calendar" />
    </Screen>
  );
}

// ── SUGGEST INPUT ────────────────────────────────────────────────────────
function UtilitySuggestInput() {
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <TopBar
        title={<><Icon name="spark" size={16} stroke={1.6} /> Suggest</>}
        meta="hybrid · code + claude"
      />

      {/* Page title */}
      <div style={{ padding: '16px 20px 0', fontFamily: uiFont }}>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>// what should i wear?</div>
        <div style={{
          fontSize: 28, fontWeight: 500,
          letterSpacing: '-0.025em', marginTop: 8, lineHeight: 1.1,
        }}>
          Set the brief.
        </div>
      </div>

      {/* Occasion */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right="required *">occasion</SectionLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            ['studio',    false],
            ['dinner',    true],
            ['gallery',   false],
            ['weekend',   false],
            ['client',    false],
            ['errands',   false],
            ['+ custom',  false],
          ].map(([l, on], i) => (
            <MonoTag key={i} filled={on}>{l}</MonoTag>
          ))}
        </div>
      </div>

      {/* Weather (auto) */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right="auto · open-meteo">weather</SectionLabel>
        <div style={{
          border: uRule, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        }}>
          {[
            ['temp', '16°', false],
            ['cond', 'overcast', false],
            ['wind', '8 km/h', false],
          ].map(([k, v], i) => (
            <div key={i} style={{
              padding: 12, borderRight: i < 2 ? uRule : 'none',
            }}>
              <div style={{
                fontFamily: monoFont, fontSize: 8.5, color: 'rgba(0,0,0,0.5)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>{k}</div>
              <div style={{
                fontFamily: uiFont, fontSize: 17, fontWeight: 500,
                letterSpacing: '-0.015em', marginTop: 4,
              }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>constraints</SectionLabel>
        <div style={{ borderTop: uRule }}>
          {[
            ['avoid worn this week', 'on'],
            ['use cold-layer rule (+1)', 'on'],
            ['favourites only', 'off'],
          ].map(([k, v], i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: uRule,
              fontFamily: monoFont, fontSize: 11,
            }}>
              <span style={{ color: C.ink }}>{k}</span>
              <span style={{
                padding: '2px 7px',
                background: v === 'on' ? C.ink : 'transparent',
                color: v === 'on' ? '#fff' : 'rgba(0,0,0,0.45)',
                border: `1px solid ${v === 'on' ? C.ink : 'rgba(0,0,0,0.15)'}`,
                fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Style profile preview */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right="edit ›">style profile · in use</SectionLabel>
        <div style={{
          border: uRule, padding: 12,
          fontFamily: uiFont, fontSize: 12, lineHeight: 1.5,
          color: 'rgba(0,0,0,0.65)',
          maxHeight: 60, overflow: 'hidden', position: 'relative',
        }}>
          I dress for quiet days at the studio and dinners with friends — monochrome bases with one warm accessory. Comfort over fuss…
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 24,
            background: 'linear-gradient(transparent, #fff)',
          }} />
        </div>
      </div>

      {/* CTA */}
      <div style={{
        position: 'absolute', bottom: 84, left: 0, right: 0,
        background: C.bg, borderTop: uRule,
        padding: '12px 20px',
      }}>
        <UButton full icon="spark">Suggest 3 outfits</UButton>
      </div>

      <UtilityTabs active="suggest" />
    </Screen>
  );
}

// ── SUGGEST RESULT ───────────────────────────────────────────────────────
function UtilitySuggestResult() {
  const pieces = [
    { id: 'i138', name: 'Lemaire wool trench',    cat: 'coat',  tone: 'cream'   },
    { id: 'i137', name: 'Acne ecru cardigan',     cat: 'top',   tone: 'cream'   },
    { id: 'i140', name: 'Khaite slim jeans',      cat: 'btm',   tone: 'neutral' },
    { id: 'i135', name: 'Margiela tabis',         cat: 'shoe',  tone: 'neutral' },
    { id: 'i134', name: 'Jacquemus mini bag',     cat: 'bag',   tone: 'blush'   },
  ];
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <AppBar
        title={<><Icon name="back" size={16} stroke={1.6} /> Brief</>}
        right={
          <div style={{
            fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          }}>3.1s · claude haiku</div>
        }
      />

      {/* Page title */}
      <div style={{ padding: '16px 20px 0', fontFamily: uiFont }}>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>// suggestion 01 of 03</div>
        <div style={{
          fontSize: 24, fontWeight: 500,
          letterSpacing: '-0.025em', marginTop: 6, lineHeight: 1.1,
        }}>
          For dinner · 16° overcast.
        </div>
      </div>

      {/* Tabs for 1/2/3 */}
      <div style={{
        padding: '14px 20px 0',
        display: 'flex', gap: 6,
      }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{
            flex: 1, border: `1px solid ${n === 1 ? C.ink : 'rgba(0,0,0,0.15)'}`,
            background: n === 1 ? C.ink : 'transparent',
            color: n === 1 ? '#fff' : 'rgba(0,0,0,0.55)',
            padding: '8px 0', textAlign: 'center',
            fontFamily: monoFont, fontSize: 10, fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>option {n}</div>
        ))}
      </div>

      {/* Outfit grid — 5 small tiles */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6,
        }}>
          {pieces.map((p, i) => (
            <div key={i} style={{
              position: 'relative', border: uRule, aspectRatio: '3/4',
              overflow: 'hidden',
            }}>
              <StripedPlaceholder tone={p.tone} label="" radius={0} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                fontFamily: monoFont, fontSize: 7.5,
                background: '#fff',
                padding: '2px 4px', textAlign: 'center',
                letterSpacing: '0.04em',
              }}>{p.cat}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reasoning block — Claude's brief */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right="reasoning">claude</SectionLabel>
        <div style={{
          border: uRule, background: '#fff', padding: 14,
          fontFamily: uiFont, fontSize: 13, lineHeight: 1.55,
          color: 'rgba(0,0,0,0.78)',
        }}>
          Soft layering for cool overcast: <span style={{
            background: C.cream, padding: '0 3px',
          }}>ecru cardigan</span> under the wool trench reads warm without
          formality. Tabis keep it considered for dinner. The blush mini bag
          is your "one warm accessory" — matches your style profile.
        </div>
        <div style={{
          fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.5)',
          marginTop: 6, display: 'flex', gap: 12,
        }}>
          <span>warmth Σ 14</span>
          <span>formality Σ 11</span>
          <span>last paired · never</span>
        </div>
      </div>

      {/* Piece list */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right="5 pieces">pieces</SectionLabel>
        <div style={{ borderTop: uRule }}>
          {pieces.map((p, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '24px 1fr 56px',
              gap: 12, alignItems: 'center',
              padding: '7px 0', borderBottom: uRule,
              fontFamily: monoFont, fontSize: 10,
            }}>
              <span style={{ color: 'rgba(0,0,0,0.45)' }}>{p.id}</span>
              <span style={{
                fontFamily: uiFont, fontSize: 12, fontWeight: 500,
                letterSpacing: '-0.005em', color: C.ink,
              }}>{p.name}</span>
              <span style={{ color: 'rgba(0,0,0,0.5)', textAlign: 'right' }}>{p.cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div style={{
        position: 'absolute', bottom: 84, left: 0, right: 0,
        background: C.bg, borderTop: uRule,
        padding: '12px 20px', display: 'flex', gap: 8,
      }}>
        <UButton variant="ghost" style={{ flex: 1 }} icon="spark">Regen</UButton>
        <UButton style={{ flex: 1.6 }} icon="check">Log this outfit</UButton>
      </div>

      <UtilityTabs active="suggest" />
    </Screen>
  );
}

// ── STYLE PROFILE EDITOR ─────────────────────────────────────────────────
function UtilityStyleProfileEditor() {
  return (
    <Screen bg={C.bg}>
      <StatusBar />

      <AppBar
        title={<><Icon name="back" size={16} stroke={1.6} /> Settings</>}
        right={
          <div style={{
            fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          }}>unsaved</div>
        }
      />

      {/* Title */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          fontFamily: uiFont, fontSize: 24, fontWeight: 500,
          letterSpacing: '-0.025em', lineHeight: 1.05,
        }}>Style profile</div>
        <div style={{
          fontFamily: monoFont, fontSize: 10, color: 'rgba(0,0,0,0.55)',
          marginTop: 4,
        }}>free text · fed verbatim into the suggestion prompt</div>
      </div>

      {/* Big textarea */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          border: uRule, background: '#fff',
          padding: 14, minHeight: 220,
          fontFamily: uiFont, fontSize: 14, lineHeight: 1.6,
          letterSpacing: '-0.005em', color: C.ink,
          position: 'relative',
        }}>
          I dress for quiet days at the studio and dinners with friends —
          monochrome bases with one warm accessory. Comfort over fuss.{' '}
          Lean towards Lemaire, Toteme, The Row, Khaite. Avoid prints,{' '}
          anything boxy. Always cold; layer warmth +1.<span style={{
            display: 'inline-block', width: 1.5, height: 16,
            background: C.ink, marginLeft: 1, verticalAlign: 'middle',
          }} />
          <div style={{
            position: 'absolute', bottom: 8, right: 10,
            fontFamily: monoFont, fontSize: 9, color: 'rgba(0,0,0,0.4)',
          }}>312 / 1000</div>
        </div>
      </div>

      {/* Prompts to help */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>try answering</SectionLabel>
        <div style={{ borderTop: uRule }}>
          {[
            'What occasions do you dress for most?',
            'Which brands or designers do you reach for?',
            'Anything you actively avoid?',
            'Comfort vs polish — where do you sit?',
            'Quirks — always cold, run hot, prefer flats…',
          ].map((q, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'baseline', gap: 10,
              padding: '8px 0', borderBottom: uRule,
              fontFamily: uiFont, fontSize: 12, letterSpacing: '-0.005em',
              color: 'rgba(0,0,0,0.65)',
            }}>
              <span style={{
                fontFamily: monoFont, fontSize: 9.5, color: '#9C5544',
                fontWeight: 600,
              }}>0{i + 1}</span>
              {q}
            </div>
          ))}
        </div>
      </div>

      {/* What it affects */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel>this affects</SectionLabel>
        <div style={{ display: 'flex', gap: 6 }}>
          <MonoTag accent>suggest</MonoTag>
          <MonoTag>weekly digest</MonoTag>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: C.bg, borderTop: uRule,
        padding: '12px 20px 28px', display: 'flex', gap: 8,
      }}>
        <UButton variant="ghost" style={{ flex: 1 }}>Discard</UButton>
        <UButton style={{ flex: 1.4 }} icon="check">Save profile</UButton>
      </div>
    </Screen>
  );
}

Object.assign(window, {
  UtilityCheckEmail, UtilityEmptyCloset, UtilityPhotoReview,
  UtilitySearchOverlay, UtilityLibraryGrid,
  UtilitySuggestInput, UtilitySuggestResult, UtilityStyleProfileEditor,
});
