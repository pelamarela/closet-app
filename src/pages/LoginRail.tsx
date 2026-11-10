// Desktop login: a clothes rail across the top of the page. One endless conveyor at a constant speed that eases to a
// stop every few seconds (the garments swing from the slowdown). Tags under some pieces carry the app's features:
// shop verdicts (swing tag), wear counts (woven label), occasions (ribbon). The order is shuffled on every visit.
// Also exports the rotating headline. The review page with the other options lives only locally (/login-ideas).
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { motion, AnimatePresence, useAnimate, useAnimationFrame, useMotionValue, useSpring } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { T, fD, fS, fM, V4Icon } from '../design/kit'
import { R } from '../design/radii'

const CSS = `
@keyframes lr-sway { 0%,100% { transform: rotate(var(--s)) } 50% { transform: rotate(calc(var(--s) * -1)) } }
.lr-anim { will-change: transform; backface-visibility: hidden }
.lr-cut img { filter: brightness(1.05); mix-blend-mode: multiply }
@media (prefers-reduced-motion: reduce) { .lr-anim { animation: none !important } }
`

const vars = (v: Record<string, string>) => v as CSSProperties
const pic = (n: string) => `/rail/${n}.jpg`

// Pieces on the rail and the tag each one carries (if any).
const PIECES: [string, string | null][] = [
  ['022', 'worn 23×'], ['118', 'yes, take it home'], ['040', 'perfect for work'], ['021', 'worn 41×'],
  ['052', 'perfect for weekend'], ['053', "i'd walk past"], ['054', "it's you, buy it"],
  ['069', null], ['045', null], ['050', null], ['091', null], ['111', null], ['086', null], ['042', null], ['019', null], ['066', null],
]
// Slots that get a tagged piece: never two side by side, also across the loop seam.
const TAG_SLOTS = [0, 2, 4, 7, 9, 11, 13]

function shuffle<A>(a: A[]): A[] {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

function shuffledRail(): [string, string | null][] {
  const tagged = shuffle(PIECES.filter(p => p[1]))
  const plain = shuffle(PIECES.filter(p => !p[1]))
  return PIECES.map((_, slot) => (TAG_SLOTS.includes(slot) ? tagged.shift() : plain.shift())!)
}

const PITCH = 132
const LOOP = PIECES.length * PITCH
const SPEED = -46 // px per second

// Where each garment's hem sits in its photo (0-1); tags hang from the hem, below the garment.
const HEM: Record<string, number> = {
  '022': 0.899, '069': 0.846, '118': 0.924, '045': 0.911, '040': 0.87, '050': 0.827, '091': 0.753, '021': 0.9,
  '111': 0.82, '052': 0.887, '086': 0.776, '053': 0.851, '042': 0.896, '054': 0.929, '019': 0.923, '066': 0.91,
}

type TagKind = 'shop' | 'worn' | 'occasion'
const tagKind = (text: string): TagKind => (text.startsWith('worn') ? 'worn' : text.startsWith('perfect for') ? 'occasion' : 'shop')

// attach point on the garment box (124 wide, photo starts 49px down), just inside the hem
function tagAnchor(kind: TagKind, n: string): { left: number; top: number } {
  const top = 49 + (HEM[n] ?? 0.88) * 124 - 3
  const x = kind === 'occasion' ? 0.36 : kind === 'worn' ? 0.44 : 0.6
  return { left: x * 124, top }
}

const swingStyle = (i: number, deg: number, dur: number): CSSProperties => ({
  ...vars({ '--s': `${i % 2 ? deg : -deg}deg` }), transformOrigin: '0 0', animation: `lr-sway ${dur + (i % 3) * 0.5}s ease-in-out ${-i * 0.7}s infinite`, position: 'relative',
})

// shop verdict: a swing tag on a curly thread, cut top corners and a punched hole
function SwingTag({ text, i }: { text: string; i: number }) {
  return (
    <div className="lr-anim" style={swingStyle(i, 7, 2.6)}>
      <svg width={30} height={26} style={{ position: 'absolute', left: -3, top: 0, overflow: 'visible' }}>
        <path d="M3 0 C 12 4, -4 10, 6 14 S 14 22, 14 25" fill="none" stroke={T.ink} strokeWidth={1} />
      </svg>
      <div style={{
        position: 'absolute', left: 14 - 34, top: 24, width: 68, boxSizing: 'border-box', padding: '15px 7px 9px',
        background: T.ink, color: T.paper, fontFamily: fS, fontSize: 10.5, lineHeight: 1.25, textAlign: 'center',
        clipPath: 'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%, 0 10px)', transform: `rotate(${i % 2 ? -4 : 5}deg)`, transformOrigin: '50% 0',
      }}>
        <div style={{ position: 'absolute', left: '50%', top: 5, width: 5, height: 5, marginLeft: -2.5, borderRadius: R.pill, background: T.paper }} />
        {text}
      </div>
    </div>
  )
}

// wear count: a woven label, fold band on top, the count in numbers
function WovenLabel({ text, i }: { text: string; i: number }) {
  return (
    <div className="lr-anim" style={swingStyle(i, 1.5, 4)}>
      <div style={{ position: 'absolute', left: -26, top: 0, width: 52, background: T.roseSoft, color: T.cocoa, textAlign: 'center', transform: `rotate(${i % 2 ? -6 : 7}deg)` }}>
        <div style={{ height: 4, background: T.peachDeep }} />
        <div style={{ padding: '4px 4px 6px' }}>
          <div style={{ fontFamily: fS, fontSize: 9.5, lineHeight: 1.1 }}>worn</div>
          <div style={{ fontFamily: fM, fontSize: 15, lineHeight: 1.1, fontWeight: 600 }}>{text.replace('worn ', '')}</div>
        </div>
      </div>
    </div>
  )
}

// occasion: a blush ribbon with a notched tail
function Ribbon({ text, i }: { text: string; i: number }) {
  return (
    <div className="lr-anim" style={swingStyle(i, 4, 3.4)}>
      <div style={{ position: 'absolute', left: -1, top: 0, width: 1.5, height: 14, background: T.peachDeep, transform: 'rotate(-20deg)', transformOrigin: 'top' }} />
      <div style={{
        position: 'absolute', left: 2, top: 10, padding: '5px 18px 5px 9px', whiteSpace: 'nowrap',
        background: T.peach, color: T.ink, fontFamily: fS, fontSize: 10.5, lineHeight: 1.2,
        clipPath: 'polygon(0 0, 100% 0, calc(100% - 8px) 50%, 100% 100%, 0 100%)', transform: `rotate(${i % 2 ? 4 : 7}deg)`, transformOrigin: '0 0',
      }}>{text}</div>
    </div>
  )
}

function Tag({ text, i }: { text: string; i: number }) {
  const kind = tagKind(text)
  return kind === 'worn' ? <WovenLabel text={text} i={i} /> : kind === 'occasion' ? <Ribbon text={text} i={i} /> : <SwingTag text={text} i={i} />
}

function RailPiece({ n, i, lean, tag }: { n: string; i: number; lean: MotionValue<number>; tag: string | null }) {
  const [scope, animate] = useAnimate()
  const busy = useRef(false)
  const swing = async () => {
    if (busy.current) return
    busy.current = true
    await animate(scope.current, { rotate: [0, 6, -4, 2.2, -1, 0] }, { duration: 3.2, ease: 'easeInOut' })
    busy.current = false
  }
  return (
    <div style={{ width: PITCH, flexShrink: 0, display: 'flex', justifyContent: 'center', position: 'relative', zIndex: tag ? 5 : 1 }}>
      <motion.div style={{ rotate: lean, transformOrigin: '50% 8px' }}>
        <div className="lr-anim" style={{ ...vars({ '--s': `${(i % 2 ? 1 : -1) * (0.4 + (i % 3) * 0.2)}deg` }), transformOrigin: '50% 8px', animation: `lr-sway ${5.5 + (i % 4) * 0.8}s ease-in-out ${-i * 1.3}s infinite` }}>
          <div ref={scope} onMouseEnter={swing} style={{ transformOrigin: '50% 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
            <V4Icon n="hanger" s={60} w={0.55} c={T.cocoa} />
            <div className="lr-cut" style={{ width: 124, height: 150, marginTop: -24 }}>
              <img src={pic(n)} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </div>
            {tag && (
              <motion.div initial={{ opacity: 0, scale: 0.6, rotate: 30 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 9, delay: 0.4 + (i % 5) * 0.08 }}
                style={{ position: 'absolute', ...tagAnchor(tagKind(tag), n), transformOrigin: '0 0', pointerEvents: 'none', zIndex: 2 }}>
                <Tag text={tag} i={i} />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// The rail strip itself; place it at the top of a positioned, overflow-hidden page.
export function LoginRail() {
  const [rail] = useState(shuffledRail)
  const x = useMotionValue(0)
  const vel = useRef(SPEED)
  const speedRef = useRef(SPEED)
  const sway = useMotionValue(0)
  const lean = useSpring(sway, { stiffness: 38, damping: 2.6 })
  useAnimationFrame((_, dt) => {
    const s = Math.min(dt, 50) / 1000
    const v = vel.current
    const nv = v + (speedRef.current - v) * Math.min(1, s * 1.5)
    vel.current = nv
    sway.set(((nv - v) / s) * 0.03) // garments lean against the change in speed, then swing out
    let nx = x.get() + nv * s
    if (nx <= -LOOP) nx += LOOP
    x.set(nx)
  })
  useEffect(() => {
    const timers: number[] = []
    const cycle = () => {
      speedRef.current = SPEED
      timers.push(window.setTimeout(() => { speedRef.current = 0 }, 6000))
      timers.push(window.setTimeout(cycle, 9000))
    }
    cycle()
    return () => timers.forEach(clearTimeout)
  }, [])
  return (
    <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 300, pointerEvents: 'none' }}>
      <style>{CSS}</style>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 46, height: 2, background: T.cocoa, zIndex: 100 }} />
      <motion.div style={{ position: 'absolute', left: 0, top: 40, display: 'flex', x, pointerEvents: 'auto' }}>
        {[0, 1].flatMap(c => rail.map(([n, tag], i) => <RailPiece key={`${c}-${n}`} n={n} i={i} lean={lean} tag={tag} />))}
      </motion.div>
    </div>
  )
}

// "your closet," stays; the second line rotates through the picks, sliding in from the right like the rail.
const SECOND_LINES = ['on rotation', 'at a glance', 'worn well', 'finally sorted']

export function RotatingHeadline({ size = 34 }: { size?: number }) {
  const [k, setK] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setK(v => (v + 1) % SECOND_LINES.length), 2800)
    return () => clearInterval(id)
  }, [])
  return (
    <h1 style={{ margin: 0, textAlign: 'center', fontFamily: fD, fontWeight: 400, fontSize: size, lineHeight: 1.1, color: T.ink }}>
      <div>your closet,</div>
      <div style={{ position: 'relative', height: size * 1.15, overflow: 'hidden' }} aria-live="off">
        <AnimatePresence initial={false}>
          <motion.div key={k} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }} style={{ position: 'absolute', left: 0, right: 0, whiteSpace: 'nowrap' }}>
            {SECOND_LINES[k]}
          </motion.div>
        </AnimatePresence>
      </div>
    </h1>
  )
}
