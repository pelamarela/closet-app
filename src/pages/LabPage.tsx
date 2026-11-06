// Dev-only preview of the animated elements in src/design/fx.tsx.
import { useState } from 'react'
import { T, fS, fM, Disp, Btn, Pill, V4Card, ItemTile, Body, dotted } from '../design/kit'
import { GlareHover, Shimmer, BorderBeam, ProgressRing, Confetti, RevealText } from '../design/fx'

const IMG = '/brand/' // filled below
const Label = ({ children }: { children: string }) => <div style={{ fontFamily: fM, fontSize: 10.5, color: T.cocoa, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 10 }}>{children}</div>
const Block = ({ title, note, children }: { title: string; note: string; children: React.ReactNode }) => (
  <section style={{ padding: '26px 0', borderBottom: `1px solid ${T.line}` }}>
    <Label>{title}</Label>
    <div style={{ fontFamily: fS, fontSize: 12.5, color: T.g500, marginBottom: 14 }}>{note}</div>
    {children}
  </section>
)

export default function LabPage() {
  const [fire, setFire] = useState(0)
  const [thinking, setThinking] = useState(true)
  void IMG
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '28px 22px 80px', background: T.paper, minHeight: '100svh' }}>
      <Disp s={30}><RevealText text="Element lab." /></Disp>
      <div style={{ fontFamily: fS, fontSize: 13, color: T.g500, marginTop: 8 }}>Open-source elements restyled in closet tokens. Hover / tap each one.</div>

      <Block title="New look" note="Soft radii, layered shadows, plain paper with a warm glow instead of dots.">
        <div style={{ ...dotted, padding: 16, borderRadius: 22 }}>
          <V4Card><Disp s={22}>Nothing on today yet.</Disp><Body s={14} style={{ marginTop: 8 }}>Card, pills and buttons share one radius scale.</Body></V4Card>
          <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}><Pill on group="lab-demo" s="sm">All</Pill><Pill s="sm">Tops</Pill><Pill s="sm">Shoes</Pill></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}><ItemTile worn={3} /><ItemTile tone="rose" /><ItemTile sel tone="sand" /></div>
          <div style={{ display: 'flex', gap: 10 }}><Btn kind="peach" icon="spark" flex={1}>Suggest</Btn><Btn kind="primary" flex={1}>Log</Btn></div>
        </div>
      </Block>

      <Block title="Glare hover" note="Light sweep across tiles and cards. Hover (desktop).">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {['#F2E1D0', '#DFAFA1', '#8A6B54'].map(c => (
            <GlareHover key={c} style={{ aspectRatio: '3/4', background: c, boxShadow: `inset 0 0 0 1px ${T.line}` }}><div /></GlareHover>
          ))}
        </div>
      </Block>

      <Block title="Shimmer" note="Loading placeholder instead of a blank grey box while photos load.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[0, 1, 2, 3].map(i => <Shimmer key={i} style={{ aspectRatio: '3/4' }} />)}
        </div>
      </Block>

      <Block title="Border beam" note="A light circling the border while the stylist is working on a suggestion.">
        <BorderBeam>
          <div style={{ padding: '18px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: fS, fontSize: 14, fontWeight: 500 }}>{thinking ? 'Putting looks together…' : 'Done'}</span>
            <Btn kind="quiet" onClick={() => setThinking(t => !t)}>{thinking ? 'Stop' : 'Again'}</Btn>
          </div>
        </BorderBeam>
      </Block>

      <Block title="Progress ring" note="Stats: share of the closet worn this month.">
        <div style={{ display: 'flex', gap: 22 }}>
          <ProgressRing value={64} label="worn" />
          <ProgressRing value={38} label="new" />
        </div>
      </Block>

      <Block title="Confetti" note="Tiny burst when an outfit is saved.">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Btn onClick={() => setFire(f => f + 1)}>Save outfit</Btn>
          <Confetti fire={fire} />
        </div>
      </Block>
    </div>
  )
}
