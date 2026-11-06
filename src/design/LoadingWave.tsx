// The brand wave for loading screens: it sways and bobs like it's treading water, so a wait feels alive.
import { motion } from 'motion/react'

export default function LoadingWave({ width = 100 }: { width?: number }) {
  return (
    <motion.img
      src="/brand/wave.png" alt=""
      animate={{ y: [0, -6, 0, 4, 0], rotate: [-3, 2, -2, 3, -3], x: [0, 5, 0, -4, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width, display: 'block', marginBottom: 24, transformOrigin: '20% 80%' }}
    />
  )
}
