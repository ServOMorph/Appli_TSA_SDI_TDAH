import { BatteryIcon } from '@/ui/components/BatteryIcon'

interface BatteryCostProps {
  cost: number
  size?: number
}

export function BatteryCost({ cost, size = 14 }: BatteryCostProps) {
  return (
    <span
      aria-label={`${cost} énergie`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}
    >
      <BatteryIcon size={size} />
      {cost}
    </span>
  )
}
