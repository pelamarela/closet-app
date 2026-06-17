import React from 'react'
import { useNavigate } from 'react-router-dom'
import { UButton } from './ui'

type Props = {
  children?: React.ReactNode
  full?: boolean
  variant?: 'ghost' | 'secondary' | 'accent'
  style?: React.CSSProperties
  beforeNavigate?: () => void
}

export default function AddItemButton({ children, full, variant, style, beforeNavigate }: Props) {
  const navigate = useNavigate()
  return (
    <UButton
      icon="hanger"
      full={full}
      variant={variant}
      style={style}
      onClick={() => { beforeNavigate?.(); navigate('/wardrobe/new') }}
    >
      {children ?? 'Add item'}
    </UButton>
  )
}
