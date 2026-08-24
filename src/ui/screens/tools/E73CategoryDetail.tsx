import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { todayDate } from '@/app/repositories'
import { formatFrenchDate } from '@/domain/rules/planningSlotRules'
import { getPeriodBounds, getSpentForCategory, isDateInPeriod } from '@/domain/rules/budgetRules'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { BudgetGauge } from '@/ui/components/BudgetGauge'
import { BudgetExpenseModal } from '@/ui/components/BudgetExpenseModal'
import { dangerLinkStyle, formatEuro, inputStyle, modalBox, modalOverlay, pageStyle } from '@/ui/styles/budget'

export function E73CategoryDetail() {
  const {
    route,
    back,
    budgetCategories,
    budgetEntries,
    renameBudgetCategory,
    updateBudgetCategoryAmount,
    deleteBudgetCategory,
    deleteBudgetEntry,
    createBudgetEntry,
  } = useApp()
  const categoryId = route.name === 'budget-category-detail' ? (route.categoryId ?? null) : null
  const referenceDate = (route.name === 'budget-category-detail' ? route.date : undefined) ?? todayDate()
  const category = budgetCategories.find((item) => item.id === categoryId) ?? null

  const [renaming, setRenaming] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [editingAmount, setEditingAmount] = useState(false)
  const [amountValue, setAmountValue] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  if (!category) {
    return (
      <main style={pageStyle}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <button aria-label="Retour" onClick={() => back('budget-account')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}>
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Catégorie</h1>
        </header>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Cette catégorie n'existe plus.</p>
      </main>
    )
  }

  const bounds = getPeriodBounds(category.period, referenceDate)
  const spent = getSpentForCategory(budgetEntries, category.id, bounds)
  const remaining = category.amount - spent
  const entries = budgetEntries
    .filter((entry) => entry.category_id === category.id && isDateInPeriod(entry.date, bounds))
    .sort((a, b) => b.date.localeCompare(a.date))

  async function handleRename() {
    if (!category || !nameValue.trim()) return
    await renameBudgetCategory(category.id, nameValue)
    setRenaming(false)
  }

  async function handleUpdateAmount() {
    const amount = Number(amountValue.replace(',', '.'))
    if (!category || !Number.isFinite(amount) || amount <= 0) return
    await updateBudgetCategoryAmount(category.id, amount)
    setEditingAmount(false)
  }

  async function handleDelete() {
    if (!category) return
    const result = await deleteBudgetCategory(category.id)
    if (result === 'needs_confirmation') {
      setConfirmingDelete(true)
      return
    }
    back('budget-account')
  }

  async function confirmDelete() {
    if (!category) return
    await deleteBudgetCategory(category.id, true)
    setConfirmingDelete(false)
    back('budget-account')
  }

  async function handleCreateExpense(amount: number, label: string, entryDate: string) {
    if (!category) return
    await createBudgetEntry(category.id, amount, label, entryDate)
    setShowExpenseForm(false)
  }

  return (
    <main style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button aria-label="Retour" onClick={() => back('budget-account')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}>
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{category.name}</h1>
      </header>

      <Card>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          {category.period === 'week' ? 'À la semaine' : 'Au mois'}
        </p>
        <p style={{ margin: '4px 0', fontSize: '1.75rem', fontWeight: 700, color: remaining < 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
          {formatEuro(remaining)}
        </p>
        <p style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          {formatEuro(spent)} dépensés sur {formatEuro(category.amount)}
        </p>
        <BudgetGauge spent={spent} budgeted={category.amount} label={`Budget consommé pour ${category.name}`} height={10} />
      </Card>

      <Button fullWidth onClick={() => setShowExpenseForm(true)}>
        Ajouter une dépense
      </Button>

      <section aria-label="Dépenses de la période">
        <h2 style={{ fontSize: '1rem', margin: '0 0 var(--spacing-sm)' }}>Dépenses de la période</h2>
        {entries.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Aucune dépense sur cette période.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {entries.map((entry) => (
              <li key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-sm)' }}>
                <span style={{ flex: 1, fontSize: '0.9375rem' }}>
                  {formatFrenchDate(entry.date)} · {entry.label || 'Dépense'} · {formatEuro(entry.amount)}
                </span>
                <button
                  aria-label={`Supprimer la dépense ${entry.label || entry.amount}`}
                  onClick={() => deleteBudgetEntry(entry.id)}
                  style={dangerLinkStyle}
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <Button variant="secondary" fullWidth onClick={() => { setNameValue(category.name); setRenaming(true) }}>
          Renommer
        </Button>
        <Button variant="secondary" fullWidth onClick={() => { setAmountValue(String(category.amount)); setEditingAmount(true) }}>
          Modifier le montant
        </Button>
        <Button fullWidth onClick={handleDelete} style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
          Supprimer la catégorie
        </Button>
      </div>

      {renaming && (
        <div role="dialog" aria-modal="true" aria-label="Renommer la catégorie" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Renommer la catégorie</h2>
            <input aria-label="Nouveau nom de la catégorie" autoFocus value={nameValue} onChange={(event) => setNameValue(event.target.value)} style={inputStyle} />
            <Button fullWidth onClick={handleRename} disabled={!nameValue.trim()}>Enregistrer</Button>
            <Button variant="secondary" fullWidth onClick={() => setRenaming(false)}>Annuler</Button>
          </div>
        </div>
      )}

      {editingAmount && (
        <div role="dialog" aria-modal="true" aria-label="Modifier le montant" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Modifier le montant</h2>
            <input aria-label="Nouveau montant" type="text" inputMode="decimal" autoFocus value={amountValue} onChange={(event) => setAmountValue(event.target.value)} style={inputStyle} />
            <Button fullWidth onClick={handleUpdateAmount} disabled={Number(amountValue.replace(',', '.')) <= 0}>Enregistrer</Button>
            <Button variant="secondary" fullWidth onClick={() => setEditingAmount(false)}>Annuler</Button>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <div role="dialog" aria-modal="true" aria-label="Supprimer la catégorie" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Supprimer cette catégorie ?</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Des dépenses existent déjà pour cette catégorie. Elles seront définitivement supprimées avec la catégorie.</p>
            <Button fullWidth onClick={confirmDelete} style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}>Supprimer</Button>
            <Button variant="secondary" fullWidth onClick={() => setConfirmingDelete(false)}>Annuler</Button>
          </div>
        </div>
      )}

      {showExpenseForm && (
        <BudgetExpenseModal
          category={category}
          defaultDate={referenceDate}
          onSubmit={handleCreateExpense}
          onClose={() => setShowExpenseForm(false)}
        />
      )}
    </main>
  )
}
