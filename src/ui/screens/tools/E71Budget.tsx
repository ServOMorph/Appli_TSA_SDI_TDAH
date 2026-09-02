import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { todayDate } from '@/app/repositories'
import type { BudgetIncomeEntry } from '@/domain/entities/budgetIncomeEntry'
import { formatFrenchDate } from '@/domain/rules/planningSlotRules'
import { getAccountBalance, getMonComptePrevisions, getMontantTotal, getTotalDeposits, getTotalIncomeEntries } from '@/domain/rules/budgetRules'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { BudgetIncomeModal } from '@/ui/components/BudgetIncomeModal'
import { dangerLinkStyle, formatEuro, neutralLinkStyle, pageStyle, modalBox, modalOverlay } from '@/ui/styles/budget'

function amountTone(value: number): string {
  return value < 0 ? 'var(--color-error)' : 'var(--color-success)'
}

export function E71Budget() {
  const {
    back,
    goTo,
    budgetAccounts,
    budgetCategories,
    budgetDeposits,
    budgetIncomeEntries,
    createBudgetIncomeEntry,
    updateBudgetIncomeEntry,
    deleteBudgetIncomeEntry,
  } = useApp()
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [showIncomeManager, setShowIncomeManager] = useState(false)
  const [editingIncomeEntry, setEditingIncomeEntry] = useState<BudgetIncomeEntry | null>(null)

  const isConfigured = budgetIncomeEntries.length > 0

  const accountsTotal = budgetAccounts.reduce((total, account) => total + getAccountBalance(budgetDeposits, account.id), 0)
  const totalIncomeEntries = getTotalIncomeEntries(budgetIncomeEntries)
  const totalDeposits = getTotalDeposits(budgetDeposits)
  const monComptePrevisions = getMonComptePrevisions(budgetCategories)
  const montantTotal = getMontantTotal(budgetIncomeEntries, budgetDeposits, budgetCategories)
  const sortedIncomeEntries = [...budgetIncomeEntries].sort((a, b) => b.date.localeCompare(a.date))

  async function handleCreateIncome(amount: number, label: string, entryDate: string) {
    await createBudgetIncomeEntry(amount, label, entryDate)
    setShowIncomeForm(false)
  }

  async function handleUpdateIncome(amount: number, label: string, entryDate: string) {
    if (!editingIncomeEntry) return
    await updateBudgetIncomeEntry(editingIncomeEntry.id, amount, label, entryDate)
    setEditingIncomeEntry(null)
  }

  if (!isConfigured) {
    return (
      <main style={pageStyle}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <button aria-label="Retour" onClick={() => back('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}>
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: '1.25rem', flex: 1 }}>Budget</h1>
        </header>

        <Button fullWidth onClick={() => setShowIncomeForm(true)}>
          Configurer le budget
        </Button>

        {showIncomeForm && (
          <BudgetIncomeModal defaultDate={todayDate()} onSubmit={handleCreateIncome} onClose={() => setShowIncomeForm(false)} />
        )}
      </main>
    )
  }

  return (
    <main style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button aria-label="Retour" onClick={() => back('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}>
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', flex: 1 }}>Budget</h1>
        <button
          aria-label="Paramètres du budget"
          onClick={() => goTo('budget-settings')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-secondary)', padding: 0 }}
        >
          ⚙
        </button>
      </header>

      <Card>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>Montant total</p>
        <p style={{ margin: '4px 0', fontSize: '2rem', fontWeight: 700, color: amountTone(montantTotal), textAlign: 'center' }}>{formatEuro(montantTotal)}</p>
        <p style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--color-text-muted)', fontSize: '0.8125rem', textAlign: 'center' }}>
          {formatEuro(totalIncomeEntries)} de revenus{totalDeposits !== 0 ? ` · ${formatEuro(-totalDeposits)} livrets` : ''}{monComptePrevisions !== 0 ? ` · ${formatEuro(-monComptePrevisions)} mon compte` : ''}
        </p>
        <Button variant="secondary" fullWidth onClick={() => setShowIncomeManager(true)}>
          Modifier le budget
        </Button>
      </Card>

      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
        <button
          onClick={() => goTo('budget-previsions')}
          aria-label="Ouvrir Prévisions"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', appearance: 'none', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', cursor: 'pointer', color: 'var(--color-text)', font: 'inherit', textAlign: 'left' }}
        >
          <span>Prévisions</span>
          <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
            {budgetCategories.length === 0 ? 'Non configuré' : formatEuro(monComptePrevisions)}
          </span>
        </button>
        <button
          onClick={() => goTo('budget-livrets')}
          aria-label="Ouvrir Mes livrets"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', appearance: 'none', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', cursor: 'pointer', color: 'var(--color-text)', font: 'inherit', textAlign: 'left' }}
        >
          <span>Mes livrets</span>
          <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
            {budgetAccounts.length === 0 ? 'Aucun livret' : formatEuro(accountsTotal)}
          </span>
        </button>
      </div>

      {showIncomeManager && (
        <div role="dialog" aria-modal="true" aria-label="Modifier le budget" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Montant total</h2>
            {sortedIncomeEntries.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Aucun revenu enregistré.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {sortedIncomeEntries.map((entry) => (
                  <li key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-sm)' }}>
                    <span style={{ flex: 1, fontSize: '0.9375rem' }}>
                      {formatFrenchDate(entry.date)} · {entry.label || 'Revenu'} · {formatEuro(entry.amount)}
                    </span>
                    <button
                      aria-label={`Modifier le revenu ${entry.label || entry.amount}`}
                      onClick={() => setEditingIncomeEntry(entry)}
                      style={neutralLinkStyle}
                    >
                      Modifier
                    </button>
                    <button
                      aria-label={`Supprimer le revenu ${entry.label || entry.amount}`}
                      onClick={() => deleteBudgetIncomeEntry(entry.id)}
                      style={dangerLinkStyle}
                    >
                      Supprimer
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Button fullWidth onClick={() => setShowIncomeForm(true)}>
              Ajouter un revenu
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setShowIncomeManager(false)}>
              Fermer
            </Button>
          </div>
        </div>
      )}

      {showIncomeForm && (
        <BudgetIncomeModal defaultDate={todayDate()} onSubmit={handleCreateIncome} onClose={() => setShowIncomeForm(false)} />
      )}

      {editingIncomeEntry && (
        <BudgetIncomeModal
          title="Modifier le revenu"
          defaultAmount={editingIncomeEntry.amount}
          defaultLabel={editingIncomeEntry.label}
          defaultDate={editingIncomeEntry.date}
          onSubmit={handleUpdateIncome}
          onClose={() => setEditingIncomeEntry(null)}
        />
      )}
    </main>
  )
}
