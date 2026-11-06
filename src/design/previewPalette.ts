// Preview only: swap the colour tokens in place so dev preview pages can show the
// Pelamarela Design System palette without touching the rest of the app.
import { useLayoutEffect, useState } from 'react'
import { T } from './kit'

const TOK = T as unknown as Record<string, string>
const CURRENT = { ...TOK }
const DS: Record<string, string> = {
  paper: '#FFFFFF', white: '#FCF9F4', ink: '#1B1210', peach: '#E1AFA1', peachSoft: '#FCF9F4', peachDeep: '#D49A8A',
  rose: '#E1AFA1', roseDeep: '#E9558C', cocoa: '#3E2022', line: '#ECE6DF', g700: '#3A302D', g500: '#6B605B', g400: '#8F8580', g200: '#DDD6D0',
}

export function applyPalette(designSystem: boolean) { Object.assign(TOK, designSystem ? DS : CURRENT) }

/** Apply the design system palette while the calling page is mounted. Render children only once `ready`. */
export function usePreviewPalette() {
  const [ready, setReady] = useState(false)
  useLayoutEffect(() => {
    applyPalette(true)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true)
    return () => applyPalette(false)
  }, [])
  return ready
}
