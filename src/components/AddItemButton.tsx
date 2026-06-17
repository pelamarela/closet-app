import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { UButton } from './ui'
import { setBatchFiles } from '../lib/batchState'

type Props = {
  children?: React.ReactNode
  full?: boolean
  variant?: 'ghost' | 'secondary' | 'accent'
  style?: React.CSSProperties
  beforeNavigate?: () => void
}

export default function AddItemButton({ children, full, variant, style, beforeNavigate }: Props) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setBatchFiles(files)
    beforeNavigate?.()
    navigate('/wardrobe/batch')
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFiles}
      />
      <UButton
        icon="hanger"
        full={full}
        variant={variant}
        style={style}
        onClick={() => inputRef.current?.click()}
      >
        {children ?? 'Add item'}
      </UButton>
    </>
  )
}
