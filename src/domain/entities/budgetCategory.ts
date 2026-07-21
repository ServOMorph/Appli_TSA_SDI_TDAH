export type BudgetCategoryKind = 'income' | 'expense'
export type BudgetPeriod = 'week' | 'month'

export interface BudgetCategory {
  id: string
  name: string
  kind: BudgetCategoryKind
  period: BudgetPeriod
  amount: number
  position: number
  created_at: string
  updated_at: string
}
