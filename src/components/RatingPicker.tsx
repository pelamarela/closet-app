interface RatingPickerProps {
  value: number
  onChange: (v: number) => void
  label: string
  hint?: string
}

export default function RatingPicker({ value, onChange, label, hint }: RatingPickerProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm font-medium text-stone-700">{label}</label>
        {hint && <span className="text-xs text-stone-400">{hint}</span>}
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-11 h-11 rounded-full text-sm font-medium transition-colors ${
              n <= value ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-400'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
