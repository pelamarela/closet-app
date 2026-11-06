// Spread onto a motion element for a staggered fade-up: <motion.div {...rise(i)} />
const EASE = [0.22, 1, 0.36, 1] as const
export const rise = (i = 0, y = 12) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: Math.min(i, 12) * 0.05, ease: EASE },
})
