import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { todayDate } from '@/app/repositories'
import type { BudgetCategory, BudgetPeriod } from '@/domain/entities/budgetCategory'
import {
  getAccountBalance,
  getPeriodBounds,
  getSpentForCategory,
  getTotalBudgeted,
  getTotalIncomeEntries,
  getTotalRemaining,
  getTotalSpent,
} from '@/domain/rules/budgetRules'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { BudgetGauge } from '@/ui/components/BudgetGauge'
import { BudgetExpenseModal } from '@/ui/components/BudgetExpenseModal'
import { BudgetIncomeModal } from '@/ui/components/BudgetIncomeModal'
import { formatEuro, pageStyle } from '@/ui/styles/budget'

function shiftPeriod(period: BudgetPeriod, date: string, offset: number): string {
  const next = new Date(`${date}T12:00:00`)
  if (period === 'week') next.setDate(next.getDate() + offset * 7)
  else next.setMonth(next.getMonth() + offset)
  return next.toISOString().slice(0, 10)
}

function periodDescription(period: BudgetPeriod, date: string): string {
  const bounds = getPeriodBounds(period, date)
  if (period === 'month') {
    const label = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(`${bounds.startDate}T12:00:00`))
    return label.charAt(0).toUpperCase() + label.slice(1)
  }
  const start = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(`${bounds.startDate}T12:00:00`))
  const end = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(`${bounds.endDate}T12:00:00`))
  return `Du ${start} au ${end}`
}

function amountTone(value: number): string {
  return value < 0 ? 'var(--color-error)' : 'var(--color-success)'
}

export function E71Budget() {
  const {
    back,
    goTo,
    budgetCategories,
    budgetAccounts,
    budgetEntries,
    budgetDeposits,
    budgetIncomeEntries,
    createBudgetEntry,
    createBudgetIncomeEntry,
  } = useApp()
  const [period, setPeriod] = useState<BudgetPeriod>('week')
  const [date, setDate] = useState(todayDate())
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showIncomeForm, setShowIncomeForm] = useState(false)

  const bounds = getPeriodBounds(period, date)
  const periodCategories = budgetCategories.filter((category) => category.period === period)
  const expenseCategories = periodCategories.filter((category) => category.kind === 'expense')
  const incomeCategories = periodCategories.filter((category) => category.kind === 'income')
  const allExpenseCategories = budgetCategories.filter((category) => category.kind === 'expense')
  const budgeted = getTotalBudgeted(budgetCategories, period)
  const spent = getTotalSpent(budgetCategories, budgetEntries, period, bounds)
  const remaining = getTotalRemaining(budgetCategories, budgetEntries, period, bounds)
  const accountsTotal = budgetAccounts.reduce((total, account) => total + getAccountBalance(budgetDeposits, account.id), 0)
  const totalIncomeEntries = getTotalIncomeEntries(budgetIncomeEntries, bounds)

  function openCategory(category: BudgetCategory) {
    goTo({ name: 'budget-category-detail', categoryId: category.id, date })
  }

  async function handleCreateExpense(categoryId: string, amount: number, label: string, entryDate: string) {
    await createBudgetEntry(categoryId, amount, label, entryDate)
    setShowExpenseForm(false)
  }

  async function handleCreateIncome(amount: number, label: string, entryDate: string) {
    await createBudgetIncomeEntry(amount, label, entryDate)
    setShowIncomeForm(false)
  }

  function tabStyle(value: BudgetPeriod): React.CSSProperties {
    const active = value === period
    return {
      flex: 1,
      padding: '10px',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      backgroundColor: active ? 'var(--color-accent)' : 'transparent',
      color: active ? '#ffffff' : 'var(--color-text-muted)',
      fontFamily: 'var(--font-body)',
      fontSize: '1rem',
      fontWeight: active ? 600 : 400,
      cursor: 'pointer',
    }
  }

  return (
    <main style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button aria-label="Retour" onClick={() => back('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}>
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', flex: 1 }}>Budget</h1>
        <button
          aria-label="Configurer le budget"
          onClick={() => goTo('budget-settings')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-secondary)', padding: 0 }}
        >
          ⚙
        </button>
      </header>

      <div role="tablist" aria-label="Période" style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <button role="tab" aria-selected={period === 'week'} onClick={() => setPeriod('week')} style={tabStyle('week')}>Semaine</button>
        <button role="tab" aria-selected={period === 'month'} onClick={() => setPeriod('month')} style={tabStyle('month')}>Mois</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-sm)' }}>
        <button aria-label="Période précédente" onClick={() => setDate((previous) => shiftPeriod(period, previous, -1))} style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>←</button>
        <span aria-live="polite" style={{ fontSize: '0.9375rem' }}>{periodDescription(period, date)}</span>
        <button aria-label="Période suivante" onClick={() => setDate((previous) => shiftPeriod(period, previous, 1))} style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>→</button>
      </div>

      <Card>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Montant total</p>
        <p style={{ margin: '4px 0', fontSize: '1.5rem', fontWeight: 700, color: amountTone(totalIncomeEntries) }}>{formatEuro(totalIncomeEntries)}</p>
        <p style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
          Revenus saisis sur la période
        </p>
        <Button variant="secondary" onClick={() => setShowIncomeForm(true)}>
          Ajouter un revenu
        </Button>
      </Card>

      <Card>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Il me reste</p>
        {expenseCategories.length === 0 ? (
          <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Non configuré</p>
        ) : (
          <>
            <p style={{ margin: '4px 0', fontSize: '2rem', fontWeight: 700, color: amountTone(remaining) }}>{formatEuro(remaining)}</p>
            <p style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              sur {formatEuro(budgeted)} · {formatEuro(spent)} dépensés
            </p>
            <BudgetGauge spent={spent} budgeted={budgeted} label="Budget consommé sur la période" height={10} />
          </>
        )}
      </Card>

      <section aria-label="Catégories de dépense">
        {expenseCategories.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Aucune catégorie de dépense pour cette période.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {expenseCategories.map((category) => {
              const categorySpent = getSpentForCategory(budgetEntries, category.id, bounds)
              const categoryRemaining = category.amount - categorySpent
              return (
                <li key={category.id}>
                  <button
                    onClick={() => openCategory(category)}
                    aria-label={`Ouvrir ${category.name}`}
                    style={{ width: '100%', textAlign: 'left', appearance: 'none', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', cursor: 'pointer', color: 'var(--color-text)', font: 'inherit' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--spacing-sm)' }}>
                      <strong style={{ fontSize: '1rem' }}>{category.name}</strong>
                      <span style={{ fontWeight: 600, color: amountTone(categoryRemaining) }}>{formatEuro(categoryRemaining)}</span>
                    </div>
                    <p style={{ margin: '4px 0 6px', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                      {formatEuro(categorySpent)} dépensés sur {formatEuro(category.amount)}
                    </p>
                    <BudgetGauge spent={categorySpent} budgeted={category.amount} label={`Budget consommé pour ${category.name}`} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {incomeCategories.length > 0 && (
        <section aria-label="Revenus">
          <h2 style={{ fontSize: '1rem', margin: '0 0 var(--spacing-sm)' }}>Revenus</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {incomeCategories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => openCategory(category)}
                  aria-label={`Ouvrir ${category.name}`}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', appearance: 'none', background: 'none', border: 'none', padding: '6px 0', cursor: 'pointer', color: 'var(--color-text)', font: 'inherit' }}
                >
                  <span>{category.name}</span>
                  <span style={{ fontWeight: 600 }}>{formatEuro(category.amount)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Mes livrets">
        <button
          onClick={() => goTo('budget-settings')}
          aria-label="Gérer les livrets"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', appearance: 'none', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', cursor: 'pointer', color: 'var(--color-text)', font: 'inherit' }}
        >
          <span>Mes livrets</span>
          <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
            {budgetAccounts.length === 0 ? 'Aucun livret' : formatEuro(accountsTotal)}
          </span>
        </button>
      </section>

      <Button fullWidth onClick={() => setShowExpenseForm(true)} disabled={allExpenseCategories.length === 0}>
        Ajouter une dépense
      </Button>

      {showExpenseForm && (
        <BudgetExpenseModal
          categories={allExpenseCategories}
          defaultCategoryId={expenseCategories[0]?.id}
          defaultDate={date}
          onSubmit={handleCreateExpense}
          onClose={() => setShowExpenseForm(false)}
        />
      )}

      {showIncomeForm && (
        <BudgetIncomeModal defaultDate={date} onSubmit={handleCreateIncome} onClose={() => setShowIncomeForm(false)} />
      )}
    </main>
  )
}
