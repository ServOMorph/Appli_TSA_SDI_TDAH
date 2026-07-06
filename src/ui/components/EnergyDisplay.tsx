import { getEnergyLabel } from '@/domain/rules/energyRules'
import type { EnergyStatus } from '@/domain/entities/energyEntry'

interface EnergyDisplayProps {
  status: EnergyStatus | null
  value: number | null
  onClick: () => void
}

const chipStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '6px 12px',
  fontSize: '0.875rem',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
}

export function EnergyDisplay({ status, value, onClick }: EnergyDisplayProps) {
  const { label, ariaLabel } = getEnergyLabel(status, value)
  return (
    <button onClick={onClick} aria-label={ariaLabel} style={chipStyle}>
      {label}
    </button>
  )
}
