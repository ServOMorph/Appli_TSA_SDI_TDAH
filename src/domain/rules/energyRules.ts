import type { EnergyEntry, EnergyStatus } from '@/domain/entities/energyEntry'

export const ENERGY_MIN = 1
export const ENERGY_MAX = 12

export function isValidEnergyValue(value: number): boolean {
  return Number.isInteger(value) && value >= ENERGY_MIN && value <= ENERGY_MAX
}

export function getEnergyLabel(
  status: EnergyStatus | null,
  value: number | null,
): { label: string; ariaLabel: string } {
  if (status === 'filled' && value !== null) {
    return { label: `${value} énergie`, ariaLabel: `${value} énergie aujourd'hui` }
  }
  if (status === 'skipped') {
    return { label: 'Énergie ignorée', ariaLabel: "Énergie ignorée aujourd'hui" }
  }
  return { label: 'Mon énergie', ariaLabel: 'Renseigner mon énergie' }
}

/** Énergie planifiée et énergie disponible affichées côte à côte (E14, Q1). */
export function getEnergyPairLabel(
  status: EnergyStatus | null,
  value: number | null,
  plannedCost: number,
): { label: string; ariaLabel: string } {
  if (status === 'filled' && value !== null) {
    return {
      label: `${plannedCost} / ${value}`,
      ariaLabel: `${plannedCost} énergie planifiée sur ${value} disponible aujourd'hui`,
    }
  }
  return getEnergyLabel(status, value)
}

export function hasCheckedInToday(entries: EnergyEntry[], date: string): boolean {
  return entries.some((e) => e.entry_date === date && e.status === 'filled')
}

export function getLatestFilledValue(entries: EnergyEntry[]): number | null {
  const filled = entries
    .filter((e) => e.status === 'filled' && e.value !== null)
    .sort((a, b) => b.entry_date.localeCompare(a.entry_date))
  return filled.length > 0 ? filled[0].value : null
}

export function getTodayEntry(entries: EnergyEntry[], date: string): EnergyEntry | undefined {
  return entries.find((e) => e.entry_date === date)
}

export function isOverloaded(energyToday: number | null, plannedCost: number): boolean {
  if (energyToday === null) return false
  return plannedCost > energyToday
}
