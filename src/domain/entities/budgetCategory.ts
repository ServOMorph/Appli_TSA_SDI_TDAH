export type BudgetPeriod = 'week' | 'month'

export interface BudgetCategory {
  id: string
  name: string
  period: BudgetPeriod
  amount: number
  position: number
  created_at: string
  updated_at: string
}
