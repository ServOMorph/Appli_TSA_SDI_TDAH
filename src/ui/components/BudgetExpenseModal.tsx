import { useState } from 'react'
import { todayDate } from '@/app/repositories'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import { Button } from '@/ui/components/Button'
import { inputStyle, modalBox, modalOverlay } from '@/ui/styles/budget'

interface BudgetExpenseModalProps {
  category: BudgetCategory
  defaultDate?: string
  onSubmit: (amount: number, label: string, date: string) => void | Promise<void>
  onClose: () => void
}

export function BudgetExpenseModal({
  category,
  defaultDate,
  onSubmit,
  onClose,
}: BudgetExpenseModalProps) {
  const [amount, setAmount] = useState('')
  const [label, setLabel] = useState('')
  const [date, setDate] = useState(defaultDate ?? todayDate())

  const parsedAmount = Number(amount.replace(',', '.'))
  const canSubmit = Number.isFinite(parsedAmount) && parsedAmount > 0

  async function handleSubmit() {
    if (!canSubmit) return
    await onSubmit(parsedAmount, label, date)
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Ajouter une dépense" style={modalOverlay}>
      <div style={modalBox}>
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Ajouter une dépense pour {category.name}</h2>

        <label htmlFor="budget-expense-amount">Montant</label>
        <input
          id="budget-expense-amount"
          type="text"
          inputMode="decimal"
          autoFocus
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          style={inputStyle}
        />

        <label htmlFor="budget-expense-label">Libellé (facultatif)</label>
        <input
          id="budget-expense-label"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          style={inputStyle}
        />

        <label htmlFor="budget-expense-date">Date</label>
        <input
          id="budget-expense-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          style={inputStyle}
        />

        <Button fullWidth onClick={handleSubmit} disabled={!canSubmit}>
          Enregistrer
        </Button>
        <Button variant="secondary" fullWidth onClick={onClose}>
          Annuler
        </Button>
      </div>
    </div>
  )
}
