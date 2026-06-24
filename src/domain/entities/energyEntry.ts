export type EnergyStatus = 'filled' | 'skipped'

export interface EnergyEntry {
  id: string
  value: number | null
  status: EnergyStatus
  entry_date: string
}
