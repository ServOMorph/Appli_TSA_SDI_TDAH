export type BudgetPeriod = 'week' | 'month'

export interface BudgetCategory {
  id: string
  name: string
  period: BudgetPeriod
  amount: number
  temporary_amount?: number
  temporary_start_date?: string
  temporary_end_date?: string
  position: number
  created_at: string
  updated_at: string
}
