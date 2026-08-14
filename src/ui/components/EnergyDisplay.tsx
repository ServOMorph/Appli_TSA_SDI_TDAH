import { getEnergyPairLabel } from '@/domain/rules/energyRules'
import type { EnergyStatus } from '@/domain/entities/energyEntry'
import { BatteryIcon } from '@/ui/components/BatteryIcon'
import { pastelBackground } from '@/ui/styles/ambiance'

interface EnergyDisplayProps {
  status: EnergyStatus | null
  value: number | null
  plannedCost: number
  onClick: () => void
  ambianceColor: string
}

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--spacing-xs)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '6px 12px',
  fontSize: '0.875rem',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
}

export function EnergyDisplay({ status, value, plannedCost, onClick, ambianceColor }: EnergyDisplayProps) {
  const filled = status === 'filled' && value !== null
  const { label, ariaLabel } = getEnergyPairLabel(status, value, plannedCost)
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ ...chipStyle, backgroundColor: pastelBackground(ambianceColor) }}
    >
      {filled && <BatteryIcon size={16} />}
      {label}
    </button>
  )
}
