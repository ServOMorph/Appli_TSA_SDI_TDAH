import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { todayDate } from '@/app/repositories'
import { formatFrenchDate } from '@/domain/rules/planningSlotRules'
import type { BudgetAccount } from '@/domain/entities/budgetAccount'
import type { BudgetCategoryKind, BudgetPeriod } from '@/domain/entities/budgetCategory'
import { getAccountBalance, getPeriodBounds, getUnbudgetedRemainder } from '@/domain/rules/budgetRules'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { dangerLinkStyle, formatEuro, inputStyle, modalBox, modalOverlay, neutralLinkStyle, pageStyle } from '@/ui/styles/budget'

function periodLabel(period: BudgetPeriod): string {
  return period === 'week' ? 'À la semaine' : 'Au mois'
}

export function E74BudgetSettings() {
  const {
    back,
    goTo,
    budgetCategories,
    budgetAccounts,
    budgetDeposits,
    createBudgetCategory,
    createBudgetAccount,
    renameBudgetAccount,
    deleteBudgetAccount,
    createBudgetDeposit,
    deleteBudgetDeposit,
  } = useApp()

  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryKind, setCategoryKind] = useState<BudgetCategoryKind>('expense')
  const [categoryPeriod, setCategoryPeriod] = useState<BudgetPeriod>('month')
  const [categoryAmount, setCategoryAmount] = useState('')
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [accountName, setAccountName] = useState('')
  const [renamingAccount, setRenamingAccount] = useState<BudgetAccount | null>(null)
  const [accountRenameValue, setAccountRenameValue] = useState('')
  const [deletingAccount, setDeletingAccount] = useState<BudgetAccount | null>(null)
  const [showDepositForm, setShowDepositForm] = useState(false)
  const [depositAccountId, setDepositAccountId] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [depositPeriod, setDepositPeriod] = useState<BudgetPeriod>('month')

  const reference = todayDate()

  function resetCategoryForm() {
    setCategoryName('')
    setCategoryKind('expense')
    setCategoryPeriod('month')
    setCategoryAmount('')
    setShowCategoryForm(false)
  }

  async function handleCreateCategory() {
    const amount = Number(categoryAmount.replace(',', '.'))
    if (!categoryName.trim() || !Number.isFinite(amount) || amount <= 0) return
    await createBudgetCategory(categoryName, categoryKind, categoryPeriod, amount)
    resetCategoryForm()
  }

  async function handleCreateAccount() {
    if (!accountName.trim()) return
    await createBudgetAccount(accountName)
    setAccountName('')
    setShowAccountForm(false)
  }

  async function handleRenameAccount() {
    if (!renamingAccount || !accountRenameValue.trim()) return
    await renameBudgetAccount(renamingAccount.id, accountRenameValue)
    setRenamingAccount(null)
  }

  async function handleDeleteAccount(account: BudgetAccount) {
    const result = await deleteBudgetAccount(account.id)
    if (result === 'needs_confirmation') setDeletingAccount(account)
  }

  async function confirmDeleteAccount() {
    if (!deletingAccount) return
    await deleteBudgetAccount(deletingAccount.id, true)
    setDeletingAccount(null)
  }

  function openDepositForm() {
    const firstAccount = budgetAccounts[0]
    if (!firstAccount) return
    setDepositAccountId(firstAccount.id)
    setDepositAmount('')
    setDepositPeriod('month')
    setShowDepositForm(true)
  }

  async function handleCreateDeposit() {
    const amount = Number(depositAmount.replace(',', '.'))
    if (!depositAccountId || !Number.isFinite(amount) || amount <= 0) return
    await createBudgetDeposit(depositAccountId, amount, depositPeriod)
    setShowDepositForm(false)
  }

  return (
    <main style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button aria-label="Retour" onClick={() => back('budget')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}>
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Configurer le budget</h1>
      </header>

      <section aria-label="Non alloué">
        <h2 style={{ fontSize: '1rem', margin: '0 0 var(--spacing-sm)' }}>Non alloué</h2>
        <Card>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
            Revenus moins budget des dépenses et dépôts sur la période en cours.
          </p>
          {(['week', 'month'] as BudgetPeriod[]).map((period) => {
            const remainder = getUnbudgetedRemainder(budgetCategories, budgetDeposits, period, getPeriodBounds(period, reference))
            return (
              <p key={period} style={{ display: 'flex', justifyContent: 'space-between', margin: 'var(--spacing-sm) 0 0' }}>
                <span>{periodLabel(period)}</span>
                <strong style={{ color: remainder < 0 ? 'var(--color-error)' : 'var(--color-success)' }}>{formatEuro(remainder)}</strong>
              </p>
            )
          })}
        </Card>
      </section>

      <section aria-label="Catégories">
        <h2 style={{ fontSize: '1rem', margin: '0 0 var(--spacing-sm)' }}>Catégories</h2>
        {budgetCategories.length === 0 ? (
          <p style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--color-text-muted)' }}>Aucune catégorie configurée.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--spacing-sm)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {budgetCategories.map((category) => (
              <li key={category.id}>
                <button
                  aria-label={`Ouvrir ${category.name}`}
                  onClick={() => goTo({ name: 'budget-category-detail', categoryId: category.id, date: reference })}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-sm)', appearance: 'none', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-sm)', cursor: 'pointer', color: 'var(--color-text)', font: 'inherit', textAlign: 'left' }}
                >
                  <span>{category.name}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    {category.kind === 'income' ? 'Revenu' : 'Dépense'} · {periodLabel(category.period)} · {formatEuro(category.amount)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <Button fullWidth onClick={() => setShowCategoryForm(true)}>Ajouter une catégorie</Button>
      </section>

      <section aria-label="Mes livrets">
        <h2 style={{ fontSize: '1rem', margin: '0 0 var(--spacing-sm)' }}>Mes livrets</h2>
        <Card>
          {budgetAccounts.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Aucun livret configuré.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {budgetAccounts.map((account) => {
                const deposits = budgetDeposits
                  .filter((deposit) => deposit.account_id === account.id)
                  .sort((a, b) => b.date.localeCompare(a.date))
                return (
                  <li key={account.id}>
                    <strong style={{ fontSize: '1rem' }}>{account.name}</strong>
                    <p style={{ margin: '4px 0', fontWeight: 600, color: 'var(--color-success)' }}>
                      Solde : {formatEuro(getAccountBalance(budgetDeposits, account.id))}
                    </p>
                    {deposits.map((deposit) => (
                      <div key={deposit.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ flex: '1 1 180px' }}>{formatFrenchDate(deposit.date)} · Dépôt : {formatEuro(deposit.amount)}</span>
                        <button aria-label={`Supprimer le dépôt ${deposit.amount}`} onClick={() => deleteBudgetDeposit(deposit.id)} style={dangerLinkStyle}>Supprimer le dépôt</button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)', marginTop: '4px' }}>
                      <button aria-label={`Renommer ${account.name}`} onClick={() => { setRenamingAccount(account); setAccountRenameValue(account.name) }} style={neutralLinkStyle}>Renommer le livret</button>
                      <button aria-label={`Supprimer ${account.name}`} onClick={() => handleDeleteAccount(account)} style={{ ...dangerLinkStyle, marginLeft: 'auto' }}>Supprimer le livret</button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </section>

      <Button fullWidth onClick={openDepositForm} disabled={budgetAccounts.length === 0}>Ajouter un dépôt</Button>
      <Button variant="secondary" fullWidth onClick={() => setShowAccountForm(true)}>Ajouter un livret</Button>

      {showCategoryForm && (
        <div role="dialog" aria-modal="true" aria-label="Ajouter une catégorie" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Ajouter une catégorie</h2>
            <label htmlFor="budget-category-name">Nom</label>
            <input id="budget-category-name" autoFocus value={categoryName} onChange={(event) => setCategoryName(event.target.value)} style={inputStyle} />
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="budget-category-kind">Type</label>
                <select id="budget-category-kind" value={categoryKind} onChange={(event) => setCategoryKind(event.target.value as BudgetCategoryKind)} style={inputStyle}>
                  <option value="expense">Dépense</option>
                  <option value="income">Revenu</option>
                </select>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="budget-category-period">Périodicité</label>
                <select id="budget-category-period" value={categoryPeriod} onChange={(event) => setCategoryPeriod(event.target.value as BudgetPeriod)} style={inputStyle}>
                  <option value="week">À la semaine</option>
                  <option value="month">Au mois</option>
                </select>
              </div>
            </div>
            <label htmlFor="budget-category-amount">Montant</label>
            <input id="budget-category-amount" type="text" inputMode="decimal" value={categoryAmount} onChange={(event) => setCategoryAmount(event.target.value)} style={inputStyle} />
            <Button fullWidth onClick={handleCreateCategory} disabled={!categoryName.trim() || Number(categoryAmount.replace(',', '.')) <= 0}>Créer</Button>
            <Button variant="secondary" fullWidth onClick={resetCategoryForm}>Annuler</Button>
          </div>
        </div>
      )}

      {showAccountForm && (
        <div role="dialog" aria-modal="true" aria-label="Ajouter un livret" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Ajouter un livret</h2>
            <label htmlFor="budget-account-name">Nom du livret</label>
            <input id="budget-account-name" autoFocus value={accountName} onChange={(event) => setAccountName(event.target.value)} style={inputStyle} />
            <Button fullWidth onClick={handleCreateAccount} disabled={!accountName.trim()}>Créer</Button>
            <Button variant="secondary" fullWidth onClick={() => { setAccountName(''); setShowAccountForm(false) }}>Annuler</Button>
          </div>
        </div>
      )}

      {showDepositForm && (
        <div role="dialog" aria-modal="true" aria-label="Ajouter un dépôt" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Ajouter un dépôt</h2>
            <label htmlFor="budget-deposit-account">Livret</label>
            <select id="budget-deposit-account" value={depositAccountId} onChange={(event) => setDepositAccountId(event.target.value)} style={inputStyle}>
              {budgetAccounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
            <label htmlFor="budget-deposit-amount">Montant</label>
            <input id="budget-deposit-amount" type="text" inputMode="decimal" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} style={inputStyle} />
            <label htmlFor="budget-deposit-period">Périodicité</label>
            <select id="budget-deposit-period" value={depositPeriod} onChange={(event) => setDepositPeriod(event.target.value as BudgetPeriod)} style={inputStyle}>
              <option value="week">À la semaine</option>
              <option value="month">Au mois</option>
            </select>
            <Button fullWidth onClick={handleCreateDeposit} disabled={Number(depositAmount.replace(',', '.')) <= 0}>Enregistrer</Button>
            <Button variant="secondary" fullWidth onClick={() => setShowDepositForm(false)}>Annuler</Button>
          </div>
        </div>
      )}

      {renamingAccount && (
        <div role="dialog" aria-modal="true" aria-label="Renommer le livret" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Renommer le livret</h2>
            <input aria-label="Nouveau nom du livret" autoFocus value={accountRenameValue} onChange={(event) => setAccountRenameValue(event.target.value)} style={inputStyle} />
            <Button fullWidth onClick={handleRenameAccount} disabled={!accountRenameValue.trim()}>Enregistrer</Button>
            <Button variant="secondary" fullWidth onClick={() => setRenamingAccount(null)}>Annuler</Button>
          </div>
        </div>
      )}

      {deletingAccount && (
        <div role="dialog" aria-modal="true" aria-label="Supprimer le livret" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Supprimer ce livret ?</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Des dépôts existent déjà pour ce livret. Ils seront définitivement supprimés avec le livret.</p>
            <Button fullWidth onClick={confirmDeleteAccount} style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}>Supprimer</Button>
            <Button variant="secondary" fullWidth onClick={() => setDeletingAccount(null)}>Annuler</Button>
          </div>
        </div>
      )}
    </main>
  )
}
