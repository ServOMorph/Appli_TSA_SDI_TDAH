import { getGaugeLevel, getGaugeRatio, type GaugeLevel } from '@/domain/rules/budgetRules'

const levelColor: Record<GaugeLevel, string> = {
  ok: 'var(--color-success)',
  warning: 'var(--color-warning)',
  over: 'var(--color-error)',
}

interface BudgetGaugeProps {
  spent: number
  budgeted: number
  label: string
  height?: number
}

export function BudgetGauge({ spent, budgeted, label, height = 8 }: BudgetGaugeProps) {
  const ratio = getGaugeRatio(spent, budgeted)
  const color = levelColor[getGaugeLevel(spent, budgeted)]

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
      style={{
        width: '100%',
        height: `${height}px`,
        borderRadius: `${height}px`,
        backgroundColor: 'var(--color-border)',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: `${ratio * 100}%`, height: '100%', backgroundColor: color }} />
    </div>
  )
}

export function gaugeColor(spent: number, budgeted: number): string {
  return levelColor[getGaugeLevel(spent, budgeted)]
}
