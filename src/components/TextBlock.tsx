import React from 'react'
import { UI, RULE } from './ui'

type Props = {
  children: React.ReactNode
}

export default function TextBlock({ children }: Props) {
  return (
    <div style={{
      border: RULE, background: '#fff', padding: 14,
      fontFamily: UI, fontSize: 13, lineHeight: 1.55,
      letterSpacing: '-0.005em', color: 'rgba(0,0,0,0.78)',
    }}>
      {children}
    </div>
  )
}
