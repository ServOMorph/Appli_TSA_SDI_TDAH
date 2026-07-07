import { SpoonIcon } from '@/ui/components/SpoonIcon'

interface SpoonCostProps {
  cost: number
  size?: number
}

export function SpoonCost({ cost, size = 14 }: SpoonCostProps) {
  return (
    <span
      aria-label={`${cost} cuillères d'énergie`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}
    >
      <SpoonIcon size={size} />
      {cost}
    </span>
  )
}
