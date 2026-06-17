import { useNavigate } from 'react-router-dom'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { UButton } from './ui'
import AddItemButton from './AddItemButton'
import LogOutfitButton from './LogOutfitButton'

export default function QuickActions() {
  const navigate = useNavigate()
  const { isDesktop } = useBreakpoint()
  return (
    <>
      <AddItemButton variant="ghost" style={{ flex: 1 }}>
        {isDesktop ? 'Add item' : 'Add'}
      </AddItemButton>
      <LogOutfitButton style={{ flex: 1 }}>
        {isDesktop ? 'Log outfit' : 'Log'}
      </LogOutfitButton>
      <UButton variant="ghost" icon="spark" style={{ flex: 1 }} onClick={() => navigate('/suggest')}>
        Suggest
      </UButton>
    </>
  )
}
