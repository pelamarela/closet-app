// Visual "elements" adapted from open-source libraries (Magic UI / React Bits
// style) and restyled with the closet design tokens. Built on Motion.
import { useState, useEffect, type CSSProperties, type ReactNode } from 'react'
import { motion, animate, useReducedMotion } from 'motion/react'
import { T, fM } from './kit'

const EASE = [0.22, 1, 0.36, 1] as const

// Diagonal light sweep on hover (Glare Hover).
export function GlareHover({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <motion.div initial="rest" whileHover="hover" style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {children}
      <motion.div
        aria-hidden
        variants={{ rest: { x: '-130%' }, hover: { x: '130%', transition: { duration: 0.75, ease: EASE } } }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(115deg, transparent 38%, rgba(255,255,255,.55) 50%, transparent 62%)' }}
      />
    </motion.div>
  )
}

// Loading placeholder with a moving highlight (Shimmer).
export function Shimmer({ style }: { style?: CSSProperties }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      aria-hidden
      animate={reduce ? undefined : { backgroundPositionX: ['200%', '-100%'] }}
      transition={{ duration: 1.6, ease: 'linear', repeat: Infinity }}
      style={{ background: `linear-gradient(100deg, ${T.g200} 30%, ${T.paper} 50%, ${T.g200} 70%)`, backgroundSize: '200% 100%', ...style }}
    />
  )
}

// A light that travels around the border (Border Beam) — for "AI is working".
export function BorderBeam({ children, color = T.roseDeep, radius = 2, width = 3, style }: { children: ReactNode; color?: string; radius?: number; width?: number; style?: CSSProperties }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: radius, padding: width, background: T.line, ...style }}>
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, ease: 'linear', repeat: Infinity }}
        style={{ position: 'absolute', left: '-50%', top: '-50%', width: '200%', height: '200%', background: `conic-gradient(from 0deg, transparent 0 70%, ${color} 100%)` }}
      />
      <div style={{ position: 'relative', background: T.paper, borderRadius: Math.max(0, radius - 1) }}>{children}</div>
    </div>
  )
}

// Ring that fills to a value with a counted-up label (Animated Circular Progress Bar).
export function ProgressRing({ value, label, size = 96, stroke = 8 }: { value: number; label?: string; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const [n, setN] = useState(0)
  useEffect(() => {
    const c = animate(0, value, { duration: 1.1, ease: EASE, onUpdate: v => setN(Math.round(v)) })
    return () => c.stop()
  }, [value])
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.peach} strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.cocoa} strokeWidth={stroke} strokeLinecap="butt"
          initial={{ pathLength: 0 }} animate={{ pathLength: value / 100 }} transition={{ duration: 1.1, ease: EASE }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: fM, fontWeight: 700, fontSize: size * 0.22 }}>{n}%</span>
        {label && <span style={{ fontFamily: fM, fontSize: 9, color: T.g500, marginTop: 1 }}>{label}</span>}
      </div>
    </div>
  )
}

// Little burst of paper-bits (Confetti) — fire on "outfit saved". Change `fire` to replay.
const BITS = [T.peachDeep, T.rose, T.cocoa, T.ink, T.roseDeep]
export function Confetti({ fire, count = 26 }: { fire: number; count?: number }) {
  if (!fire) return null
  return (
    <div key={fire} aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, pointerEvents: 'none' }}>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + (i % 3) * 0.3
        const d = 70 + ((i * 37) % 60)
        return (
          <motion.span key={i}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d + 40, opacity: 0, rotate: (i % 2 ? 1 : -1) * (180 + i * 20), scale: 0.6 }}
            transition={{ duration: 0.9 + (i % 4) * 0.12, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'absolute', width: 7, height: i % 2 ? 7 : 3, background: BITS[i % BITS.length] }}
          />
        )
      })}
    </div>
  )
}

// Words rise in one by one (Text Reveal).
export function RevealText({ text, style }: { text: string; style?: CSSProperties }) {
  return (
    <span style={{ display: 'inline-block', ...style }}>
      {text.split(' ').map((w, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', marginRight: '0.28em' }}>
          <motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }} style={{ display: 'inline-block' }}>{w}</motion.span>
        </span>
      ))}
    </span>
  )
}

// Fade-up entrance with a per-item delay — wrap list rows / cards / sections.
export function Reveal({ children, i = 0, y = 12, style }: { children: ReactNode; i?: number; y?: number; style?: CSSProperties }) {
  return (
    <motion.div initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: Math.min(i, 12) * 0.05, ease: EASE }} style={style}>
      {children}
    </motion.div>
  )
}

