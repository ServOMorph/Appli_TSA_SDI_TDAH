import { useApp } from '@/app/AppContext'
import { getAccountBalance } from '@/domain/rules/budgetRules'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { formatEuro, pageStyle } from '@/ui/styles/budget'

export function E76BudgetLivrets() {
  const { back, goTo, budgetAccounts, budgetDeposits } = useApp()

  const accountsTotal = budgetAccounts.reduce((total, account) => total + getAccountBalance(budgetDeposits, account.id), 0)

  return (
    <main style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button aria-label="Retour" onClick={() => back('budget')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}>
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', flex: 1 }}>Mes livrets</h1>
        <button aria-label="Paramètres du budget" onClick={() => goTo('budget-settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}>
          ⚙
        </button>
      </header>

      {budgetAccounts.length === 0 ? (
        <>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Aucun livret configuré.</p>
          <Button fullWidth onClick={() => goTo('budget-settings')}>
            Configurer un livret
          </Button>
        </>
      ) : (
        <>
          <Card>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Mes livrets</p>
            <p style={{ margin: '4px 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>{formatEuro(accountsTotal)}</p>
          </Card>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {budgetAccounts.map((account) => (
              <li key={account.id}>
                <button
                  onClick={() => goTo({ name: 'budget-livret-detail', accountId: account.id })}
                  aria-label={`Ouvrir ${account.name}`}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', appearance: 'none', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', cursor: 'pointer', color: 'var(--color-text)', font: 'inherit', textAlign: 'left' }}
                >
                  <span>{account.name}</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{formatEuro(getAccountBalance(budgetDeposits, account.id))}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
