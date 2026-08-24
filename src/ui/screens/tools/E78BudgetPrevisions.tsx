import { useApp } from '@/app/AppContext'
import type { BudgetCategory, BudgetPeriod } from '@/domain/entities/budgetCategory'
import { getMonCompteWeight } from '@/domain/rules/budgetRules'
import { formatEuro, pageStyle } from '@/ui/styles/budget'

interface CategoryColumnProps {
  title: string
  period: BudgetPeriod
  categories: BudgetCategory[]
}

function CategoryColumn({ title, period, categories }: CategoryColumnProps) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      <h2 style={{ margin: 0, fontSize: '1rem' }}>{title}</h2>
      {categories.length === 0 ? (
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>Aucune sous-catégorie.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {categories.map((category) => (
            <li
              key={category.id}
              style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-sm)' }}
            >
              <strong style={{ display: 'block', fontSize: '0.875rem' }}>{category.name}</strong>
              <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                prévu {formatEuro(category.amount)}
                {period === 'week' ? ` · ${formatEuro(category.amount * getMonCompteWeight('week'))} sur le mois` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function E78BudgetPrevisions() {
  const { back, goTo, budgetCategories } = useApp()
  const weekCategories = budgetCategories.filter((category) => category.period === 'week')
  const monthCategories = budgetCategories.filter((category) => category.period === 'month')

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
        <CategoryColumn title="Semaine" period="week" categories={weekCategories} />
        <CategoryColumn title="Mois" period="month" categories={monthCategories} />
      </div>
    </main>
  )
}
