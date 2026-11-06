import { useEffect, useState } from 'react'
import { animate, useReducedMotion } from 'motion/react'

// Counts from 0 to `to` on mount (and whenever `to` changes). Skips the
// animation when the OS asks for reduced motion.
export function CountUp({ to, duration = 0.9, delay = 0 }: { to: number; duration?: number; delay?: number }) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (reduce) return
    const c = animate(0, to, { duration, delay, ease: [0.22, 1, 0.36, 1], onUpdate: v => setN(Math.round(v)) })
    return () => c.stop()
  }, [to, duration, delay, reduce])
  return <>{reduce ? to : n}</>
}
