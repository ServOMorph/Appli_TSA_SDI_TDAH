import { useState } from 'react'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import { Button } from '@/ui/components/Button'
import { inputStyle, modalBox, modalOverlay } from '@/ui/styles/budget'

interface TaskExpenseModalProps {
  taskTitle: string
  categories: BudgetCategory[]
  onSubmit: (categoryId: string, amount: number) => void | Promise<void>
  onSkip: () => void | Promise<void>
}

export function TaskExpenseModal({ taskTitle, categories, onSubmit, onSkip }: TaskExpenseModalProps) {
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')

  const parsedAmount = Number(amount.replace(',', '.'))
  const canSubmit = categoryId !== '' && Number.isFinite(parsedAmount) && parsedAmount > 0

  async function handleSubmit() {
    if (!canSubmit) return
    await onSubmit(categoryId, parsedAmount)
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Dépense de la tâche" style={modalOverlay}>
      <div style={modalBox}>
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Dépense : {taskTitle}</h2>

        {categories.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
            Aucune sous-catégorie dans « Mon compte ». Créez-en une pour enregistrer cette dépense.
          </p>
        ) : (
          <>
            <label htmlFor="task-expense-amount">Montant</label>
            <input
              id="task-expense-amount"
              type="text"
              inputMode="decimal"
              autoFocus
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              style={inputStyle}
            />

            <label htmlFor="task-expense-category">Catégorie</label>
            <select
              id="task-expense-category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              style={inputStyle}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <Button fullWidth onClick={handleSubmit} disabled={!canSubmit}>
              Enregistrer
            </Button>
          </>
        )}
        <Button variant="secondary" fullWidth onClick={onSkip}>
          Terminer sans dépense
        </Button>
      </div>
    </div>
  )
}
