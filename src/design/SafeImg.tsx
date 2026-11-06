import { useState, useEffect } from 'react'
import type { ImgHTMLAttributes, ReactNode } from 'react'

const MAX_RETRIES = 3

// Moving highlight shown on the <img> box until the photo has loaded.
if (typeof document !== 'undefined' && !document.getElementById('ds-shimmer-css')) {
  const st = document.createElement('style')
  st.id = 'ds-shimmer-css'
  st.textContent = `@keyframes ds-shimmer{0%,100%{opacity:1}50%{opacity:.55}}.ds-shimmer{background:#D9D6D2;animation:ds-shimmer 1.4s ease-in-out infinite}@media (prefers-reduced-motion:reduce){.ds-shimmer{animation:none}}`
  document.head.appendChild(st)
}

// <img> for signed-URL photos. When many tiles load at once some requests fail
// transiently, which otherwise leaves a broken-image icon until the next
// reload. Retry with a cache-busted URL, then fall back instead of showing
// the browser's broken state.
export function SafeImg({ src, fallback = null, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { fallback?: ReactNode }) {
  const [attempt, setAttempt] = useState(0)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const loaded = loadedSrc === src

  useEffect(() => { setAttempt(0) }, [src])

  if (!src || attempt > MAX_RETRIES) return <>{fallback}</>

  const url = attempt === 0 ? src : `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}`
  return (
    <img
      {...rest}
      className={[rest.className, loaded ? '' : 'ds-shimmer'].filter(Boolean).join(' ') || undefined}
      onLoad={() => setLoadedSrc(src ?? null)}
      src={url}
      onError={() => { setTimeout(() => setAttempt(a => a + 1), 400 * (attempt + 1)) }}
    />
  )
}
