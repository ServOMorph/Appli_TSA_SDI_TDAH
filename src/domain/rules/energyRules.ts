import type { EnergyEntry } from '@/domain/entities/energyEntry'

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
