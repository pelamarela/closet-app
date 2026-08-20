// V4 Ideas — pulled out of V3's Settings > Wardrobe and given a tab. A saved
// suggestion you can never find again is a broken loop.

const ideaCards = [
  { n: 'Linen set + cognac flats', o: 'Work', src: 'suggested', d: '03 aug', tones: ['peach', 'peach', 'rose', 'sand'] },
  { n: 'Denim + white tee', o: 'Weekend', src: 'mine', d: '28 jul', tones: ['sand', 'paper', 'ink', 'sand'] },
  { n: 'Trench over the black set', o: 'Dinner', src: 'suggested', d: '21 jul', tones: ['peach', 'ink', 'ink', 'rose'] },
  { n: 'Striped shirt + shorts', o: 'Casual', src: 'mine', d: '14 jul', tones: ['paper', 'peach', 'sand', 'rose'] },
];

function V4Ideas() {
  return (
    <V4Screen height={1000}>
      <V4Status /><TodayHeader />
      <div style={{ padding: '4px 22px 0' }}>
        <Disp s={30}>Ideas</Disp>
        <Body s={13.5} style={{ marginTop: 6 }}>14 looks you've saved for a day that hasn't happened yet.</Body>
      </div>
      <div style={{ display: 'flex', gap: 9, padding: '18px 22px 0' }}>
        <Btn kind="peach" icon="spark" style={{ flex: 1, height: 46, fontSize: 14 }}>Suggest</Btn>
        <Btn kind="quiet" icon="plus" style={{ flex: 1, height: 46, fontSize: 14 }}>Build one</Btn>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '20px 22px 0', overflowX: 'auto' }}>
        <Pill on s="sm" count={14}>All</Pill><Pill s="sm" count={9}>Suggested</Pill><Pill s="sm" count={5}>Mine</Pill><Pill s="sm">By occasion</Pill>
      </div>
      <div style={{ padding: '18px 22px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {ideaCards.map((c, i) => (
          <div key={i}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', borderRadius: 2, overflow: 'hidden' }}>
              <OutfitThumb tones={c.tones} gap={2} />
              <div style={{ position: 'absolute', top: 9, left: 9, height: 24, display: 'inline-flex', alignItems: 'center', padding: '0 10px', borderRadius: 2, background: 'rgba(247,246,245,.92)', fontFamily: fS, fontSize: 11.5, fontWeight: 600 }}>{c.o}</div>
              {c.src === 'suggested' && <div style={{ position: 'absolute', bottom: 9, right: 9, width: 24, height: 24, borderRadius: 2, background: 'rgba(247,246,245,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><V4Icon n="spark" s={13} w={1.7} c={T.cocoa} /></div>}
            </div>
            <div style={{ fontFamily: fS, fontSize: 14, fontWeight: 500, marginTop: 8, lineHeight: 1.35 }}>{c.n}</div>
            <div style={{ marginTop: 3 }}><Mono s={10.5}>saved {c.d}</Mono></div>
          </div>
        ))}
      </div>
      <V4Tabs active="ideas" />
    </V4Screen>
  );
}

function V4IdeaDetail() {
  const pieces = [['Oysho linen shirt', 'top', 'peach', 3], ['Oysho linen shorts', 'bottoms', 'peach', 3], ['Cognac flats', 'shoes', 'rose', 6], ['Anre tote bag', 'bag', 'sand', 6], ['LeLabo Matcha 26', 'fragrance', 'paper', 14]];
  return (
    <V4Screen height={1270}>
      <V4Status /><TodayHeader />
      <V4Bar back title="Ideas" right={<><V4Icon n="pen" s={20} w={1.6} /><V4Icon n="more" s={22} w={2.4} /></>} />
      <div style={{ padding: '8px 22px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1.15fr 1fr', gap: 5, height: 330, borderRadius: 2, overflow: 'hidden' }}>
          <Ph tone="peach" r={0} /><Ph tone="peach" r={0} /><div style={{ gridRow: '1 / 3' }}><Ph tone="sand" r={0} /></div><Ph tone="rose" r={0} /><Ph tone="paper" r={0} />
        </div>
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          <Pill s="sm" on tone="peach">Work</Pill><Mono s={11}>saved 03 aug · suggested</Mono>
        </div>
        <Disp s={25}>Linen set + cognac flats</Disp>
      </div>
      <div style={{ padding: '18px 22px 0' }}>
        <V4Card fill={T.peachSoft} shadow={false} pad={16}>
          <div style={{ fontFamily: fS, fontSize: 12, fontWeight: 600, color: T.cocoa, marginBottom: 5 }}>Why I kept it</div>
          <Body s={14} c={T.g700}>Saving this for the first properly hot week — the linen breathes and the cognac stops it looking washed out.</Body>
        </V4Card>
      </div>
      <div style={{ padding: '22px 22px 0' }}>
        <SecH right="5 pieces">In this look</SecH>
        {pieces.map(([n, c, tone, w], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '9px 0', borderBottom: i < pieces.length - 1 ? `1px solid ${T.line}` : 'none' }}>
            <div style={{ width: 36, height: 45, flexShrink: 0 }}><Ph tone={tone} r={0} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: fS, fontSize: 14, fontWeight: 500 }}>{n}</div>
              <div style={{ marginTop: 2 }}><Mono s={10.5}>{c}</Mono></div>
            </div>
            <Mono s={11} c={T.cocoa} style={{ fontWeight: 700 }}>{w}×</Mono>
          </div>
        ))}
      </div>
      <div style={{ padding: '24px 22px 0', display: 'flex', gap: 10, alignItems: 'center' }}>
        <Btn flex={1} icon="check">Wear it today</Btn><RoundBtn icon="repeat" />
      </div>
      <V4Tabs active="ideas" />
    </V4Screen>
  );
}

Object.assign(window, { V4Ideas, V4IdeaDetail, ideaCards });
