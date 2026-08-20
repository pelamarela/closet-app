// V4 Me — the account tab. V3 hid Ideas, Statistics, Archived and Constants
// behind an 18px top-bar icon; here they're real, tappable destinations.

function V4Me() {
  return (
    <V4Screen height={1155}>
      <V4Status /><TodayHeader />
      <div style={{ padding: '4px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Disp s={30}>Me</Disp><Mono s={11}>v4.0</Mono>
      </div>
      <div style={{ padding: '20px 22px 0' }}>
        <V4Card fill={T.peach} shadow={false} pad={18} style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={{ width: 58, height: 58, borderRadius: 2, background: T.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fS, fontSize: 21, fontWeight: 600, flexShrink: 0 }}>Š</div>
          <div style={{ minWidth: 0 }}>
            <Disp s={19}>Špela</Disp>
            <div style={{ marginTop: 3 }}><Mono s={11} c={T.cocoa}>spelaa.newsletter@icloud.com</Mono></div>
            <div style={{ marginTop: 2 }}><Mono s={10.5} c={T.cocoaSoft}>keeping track since march 2026</Mono></div>
          </div>
        </V4Card>
      </div>
      <div style={{ padding: '16px 22px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
        {[['Statistics', '75 outfits', 'chart'], ['Ideas', '14 saved', 'bulb'], ['Archived', '3 pieces', 'archive'], ['Constants', '2 always on', 'repeat']].map(([l, s, ic], i) => (
          <V4Card key={i} pad={15} style={{ minHeight: 92, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <V4Icon n={ic} s={20} w={1.6} c={T.cocoa} />
            <div>
              <div style={{ fontFamily: fS, fontSize: 14.5, fontWeight: 600 }}>{l}</div>
              <div style={{ marginTop: 1 }}><Mono s={10.5}>{s}</Mono></div>
            </div>
          </V4Card>
        ))}
      </div>
      <div style={{ padding: '24px 22px 0' }}>
        <SecH right="Edit">How I dress</SecH>
        <V4Card pad={17}>
          <Body s={14} c={T.g700}>Fundamentally minimalist with bold colour pops — a reliable rotation of black basics, Zara staples and neutrals, mixed with rust orange, cream and jewel-toned accents. A creature of habit about shoes.</Body>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 13, borderTop: `1px solid ${T.line}` }}>
            <Mono s={10.5}>read by every suggestion</Mono>
            <Pill s="sm" on tone="peach">Warm autumn</Pill>
          </div>
        </V4Card>
      </div>
      <div style={{ padding: '26px 22px 0' }}>
        <SecH>Account</SecH>
        <Row4 label="Change password" />
        <Row4 label="Notifications" sub="A nudge if you haven't logged by 9pm" value="On" />
        <Row4 label="Email me" sub="Bugs, ideas, anything" last />
      </div>
      <div style={{ padding: '24px 22px 0' }}><Btn full kind="quiet">Sign out</Btn></div>
      <V4Tabs active="me" />
    </V4Screen>
  );
}

// ── STYLE PROFILE EDITOR ────────────────────────────────────────────────
function V4StyleProfile() {
  const seasons = ['Warm autumn', 'Cool winter', 'Soft summer', 'Clear spring'];
  return (
    <V4Screen height={950}>
      <V4Status /><TodayHeader />
      <V4Bar back title="Me" right={<Mono s={11} c={T.roseDeep}>unsaved</Mono>} />
      <div style={{ padding: '8px 22px 0' }}>
        <Disp s={27}>How I dress</Disp>
        <Body s={13.5} style={{ marginTop: 6 }}>Written in your words and read verbatim before every suggestion.</Body>
      </div>
      <div style={{ padding: '20px 22px 0' }}>
        <V4Card pad={17} style={{ minHeight: 220, position: 'relative' }}>
          <Body s={14.5} c={T.ink}>My style is fundamentally minimalist with bold colour pops, anchored by a reliable rotation of black basics, Zara staples, and neutral tones that I mix with rust orange, cream, and jewel-toned accents. I'm a creature of habit when it comes to footwear — my Chanel pink burgundy flats and cognac orange flats paired with black Zara pieces.</Body>
          <div style={{ position: 'absolute', bottom: 12, right: 15 }}><Mono s={10}>968 / 1000</Mono></div>
        </V4Card>
      </div>
      <div style={{ padding: '22px 22px 0' }}>
        <SecH right="Used when shopping">Colour season</SecH>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{seasons.map((s, i) => <Pill key={s} on={i === 0} tone="peach">{s}</Pill>)}</div>
      </div>
      <div style={{ padding: '24px 22px 0' }}>
        <V4Card fill={T.peachSoft} shadow={false} pad={17}>
          <Disp s={17}>Or let me write it.</Disp>
          <Body s={13.5} c={T.cocoa} style={{ marginTop: 6 }}>I'll read your 75 logged outfits and draft this for you to edit.</Body>
          <div style={{ marginTop: 15 }}><Btn kind="white" icon="spark" style={{ height: 46, fontSize: 14 }}>Draft from my history</Btn></div>
        </V4Card>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 22px 28px', background: T.paper, borderTop: `1px solid ${T.line}`, display: 'flex', gap: 10 }}>
        <Btn kind="quiet" flex={1}>Discard</Btn><Btn flex={1.5} icon="check">Save</Btn>
      </div>
    </V4Screen>
  );
}

Object.assign(window, { V4Me, V4StyleProfile });
