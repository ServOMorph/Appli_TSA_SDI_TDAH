import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { todayDate } from '@/app/repositories'
import type { BudgetCategory, BudgetPeriod } from '@/domain/entities/budgetCategory'
import { getPeriodBounds, getSpentForCategory } from '@/domain/rules/budgetRules'
import { Button } from '@/ui/components/Button'
import { BudgetGauge } from '@/ui/components/BudgetGauge'
import { BudgetExpenseModal } from '@/ui/components/BudgetExpenseModal'
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

interface PeriodColumnProps {
  title: string
  period: BudgetPeriod
  date: string
  onShift: (offset: number) => void
  categories: BudgetCategory[]
  onOpenCategory: (category: BudgetCategory, date: string) => void
  entries: ReturnType<typeof useApp>['budgetEntries']
}

function PeriodColumn({ title, period, date, onShift, categories, onOpenCategory, entries }: PeriodColumnProps) {
  const bounds = getPeriodBounds(period, date)

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      <h2 style={{ margin: 0, fontSize: '1rem' }}>{title}</h2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
        <button aria-label={`Période précédente (${title})`} onClick={() => onShift(-1)} style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', fontSize: '1.125rem', padding: 0 }}>←</button>
        <span aria-live="polite" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>{periodDescription(period, date)}</span>
        <button aria-label={`Période suivante (${title})`} onClick={() => onShift(1)} style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', fontSize: '1.125rem', padding: 0 }}>→</button>
      </div>

      {categories.length === 0 ? (
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>Aucune sous-catégorie.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {categories.map((category) => {
            const spent = getSpentForCategory(entries, category.id, bounds)
            const remaining = category.amount - spent
            return (
              <li key={category.id}>
                <button
                  onClick={() => onOpenCategory(category, date)}
                  aria-label={`Ouvrir ${category.name}`}
                  style={{ width: '100%', textAlign: 'left', appearance: 'none', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-sm)', cursor: 'pointer', color: 'var(--color-text)', font: 'inherit' }}
                >
                  <strong style={{ display: 'block', fontSize: '0.875rem' }}>{category.name}</strong>
                  <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: amountTone(remaining) }}>{formatEuro(remaining)} restant</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>prévu {formatEuro(category.amount)}</span>
                  <BudgetGauge spent={spent} budgeted={category.amount} label={`Budget consommé pour ${category.name}`} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function E75BudgetAccount() {
  const { back, goTo, budgetCategories, budgetEntries, createBudgetEntry } = useApp()
  const [weekDate, setWeekDate] = useState(todayDate())
  const [monthDate, setMonthDate] = useState(todayDate())
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const weekCategories = budgetCategories.filter((category) => category.period === 'week')
  const monthCategories = budgetCategories.filter((category) => category.period === 'month')

  function openCategory(category: BudgetCategory, date: string) {
    goTo({ name: 'budget-category-detail', categoryId: category.id, date })
  }

  async function handleCreateExpense(categoryId: string, amount: number, label: string, entryDate: string) {
    await createBudgetEntry(categoryId, amount, label, entryDate)
    setShowExpenseForm(false)
  }

  return (
    <main style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button aria-label="Retour" onClick={() => back('budget')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}>
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', flex: 1 }}>Mon compte</h1>
        <button aria-label="Paramètres du budget" onClick={() => goTo('budget-settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}>
          ⚙
        </button>
      </header>

      <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
        <PeriodColumn
          title="Semaine"
          period="week"
          date={weekDate}
          onShift={(offset) => setWeekDate((previous) => shiftPeriod('week', previous, offset))}
          categories={weekCategories}
          onOpenCategory={openCategory}
          entries={budgetEntries}
        />
        <PeriodColumn
          title="Mois"
          period="month"
          date={monthDate}
          onShift={(offset) => setMonthDate((previous) => shiftPeriod('month', previous, offset))}
          categories={monthCategories}
          onOpenCategory={openCategory}
          entries={budgetEntries}
        />
      </div>

      <Button fullWidth onClick={() => setShowExpenseForm(true)} disabled={budgetCategories.length === 0}>
        Ajouter une dépense
      </Button>

      {showExpenseForm && (
        <BudgetExpenseModal
          categories={budgetCategories}
          defaultCategoryId={weekCategories[0]?.id ?? monthCategories[0]?.id}
          defaultDate={todayDate()}
          onSubmit={handleCreateExpense}
          onClose={() => setShowExpenseForm(false)}
        />
      )}
    </main>
  )
}
