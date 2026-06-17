import React from 'react'
import { RULE } from './ui'

type Props = {
  children: React.ReactNode
  column?: boolean
  zIndex?: number
}

export default function FixedBar({ children, column, zIndex = 25 }: Props) {
  return (
    <div style={{
      position: 'fixed', bottom: 'var(--nav-h)', left: 0, right: 0,
      background: '#F7F6F5', borderTop: RULE,
      padding: '12px 20px', zIndex,
      display: 'flex', gap: 8,
      flexDirection: column ? 'column' : 'row',
    }}>
      {children}
    </div>
  )
}
