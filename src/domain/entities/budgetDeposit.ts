export interface BudgetDeposit {
  id: string
  account_id: string
  category_id?: string
  amount: number
  label?: string
  date: string
  transfer_id?: string
  created_at: string
}
