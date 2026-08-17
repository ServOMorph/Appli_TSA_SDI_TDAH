import { useState } from 'react'
import { todayDate } from '@/app/repositories'
import { Button } from '@/ui/components/Button'
import { inputStyle, modalBox, modalOverlay } from '@/ui/styles/budget'

interface BudgetIncomeModalProps {
  defaultDate?: string
  onSubmit: (amount: number, label: string, date: string) => void | Promise<void>
  onClose: () => void
}

export function BudgetIncomeModal({ defaultDate, onSubmit, onClose }: BudgetIncomeModalProps) {
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
    <div role="dialog" aria-modal="true" aria-label="Ajouter un revenu" style={modalOverlay}>
      <div style={modalBox}>
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Ajouter un revenu</h2>

        <label htmlFor="budget-income-amount">Montant</label>
        <input
          id="budget-income-amount"
          type="text"
          inputMode="decimal"
          autoFocus
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          style={inputStyle}
        />

        <label htmlFor="budget-income-label">Libellé (facultatif)</label>
        <input
          id="budget-income-label"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          style={inputStyle}
        />

        <label htmlFor="budget-income-date">Date</label>
        <input
          id="budget-income-date"
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
