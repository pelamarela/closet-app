import React from 'react'
import { useNavigate } from 'react-router-dom'
import { UButton } from './ui'

type Props = {
  children?: React.ReactNode
  onClick?: () => void
  full?: boolean
  variant?: 'ghost' | 'secondary' | 'accent'
  style?: React.CSSProperties
  disabled?: boolean
  navigationState?: Record<string, unknown>
}

export default function LogOutfitButton({ children, onClick, full, variant, style, disabled, navigationState }: Props) {
  const navigate = useNavigate()
  return (
    <UButton
      icon="calendar"
      full={full}
      variant={variant}
      style={style}
      disabled={disabled}
      onClick={onClick ?? (() => navigate('/outfits/new', navigationState ? { state: navigationState } : undefined))}
    >
      {children ?? 'Log outfit'}
    </UButton>
  )
}
