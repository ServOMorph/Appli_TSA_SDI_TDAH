import type { BudgetPeriod } from '@/domain/entities/budgetCategory'

export interface BudgetDeposit {
  id: string
  account_id: string
  amount: number
  period: BudgetPeriod
  date: string
  created_at: string
}
