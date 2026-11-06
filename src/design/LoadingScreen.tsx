// One loading screen for every wait in the app: the wave, a title, then either ticking steps or a progress line.
import LoadingWave from './LoadingWave'
import { T, dotted, V4Bar, V4Icon, Disp, Body, BouncingDots } from './kit'

export default function LoadingScreen({ title, steps, step = 0, progress, label, onClose }: {
  title: string
  steps?: string[]
  step?: number
  progress?: number   // 0-100, used instead of steps
  label?: string      // text under the progress line
  onClose?: () => void
}) {
  return (
    <div style={{ ...dotted, minHeight: '100svh' }}>
      <V4Bar right={onClose && (
        <button onClick={onClose} aria-label="close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, display: 'flex' }}>
          <V4Icon n="close" s={22} w={1.8} />
        </button>
      )} />
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '12vh 28px 0' }}>
        <LoadingWave width={120} />
        <Disp s={26}>{title}</Disp>
        {steps && (
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 15 }}>
            {steps.map((s, i) => {
              const done = i < step
              const active = i === step
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: done || active ? 1 : .4 }}>
                  <div className={done ? 'ds-pop' : undefined} style={{ width: 20, height: 20, background: done ? T.ink : 'transparent', border: done ? 'none' : `1.5px solid ${T.g200}`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {done && <V4Icon n="check" s={11} w={2.8} />}
                  </div>
                  <Body s={14} c={done ? T.ink : T.g500}>{s}</Body>{active && <BouncingDots size={3} gap={3} color={T.g400} />}
                </div>
              )
            })}
          </div>
        )}
        {progress !== undefined && (
          <div style={{ marginTop: 28 }}>
            <div style={{ width: '100%', height: 2, background: T.g200, marginBottom: 14 }}>
              <div style={{ height: '100%', background: T.ink, width: `${progress}%`, transition: 'width .3s' }} />
            </div>
            {label && <Body s={14}>{label}</Body>}
          </div>
        )}
      </div>
    </div>
  )
}
