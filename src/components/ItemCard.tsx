import { Shirt } from 'lucide-react'
import type { ItemWithSignedUrl } from '../hooks/useItems'

const CATEGORY_LABELS: Record<string, string> = {
  top: 'Top', bottom: 'Bottom', dress: 'Dress',
  outerwear: 'Outerwear', shoes: 'Shoes', accessory: 'Accessory',
}

interface ItemCardProps {
  item: ItemWithSignedUrl
  onClick: () => void
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <button onClick={onClick} className="w-full text-left">
      <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden mb-2">
        {item.signedImageUrl ? (
          <img
            src={item.signedImageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <Shirt size={32} />
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-stone-800 truncate">{item.name}</p>
      <p className="text-xs text-stone-400 mt-0.5">{CATEGORY_LABELS[item.category] ?? item.category}</p>
    </button>
  )
}
