import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import type { BudgetCategory, BudgetCategoryKind, BudgetPeriod } from '@/domain/entities/budgetCategory'
import type { BudgetAccount } from '@/domain/entities/budgetAccount'
import { getAccountBalance, getPeriodBounds, getRemainingForCategory, getSpentForCategory, getUnbudgetedRemainder, isDateInPeriod } from '@/domain/rules/budgetRules'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'

const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}

const modalBox: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--spacing-xl)',
  maxWidth: '360px',
  width: '90%',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-md)',
}

const inputStyle: React.CSSProperties = {
  padding: '8px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-body)',
  fontSize: '1rem',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}

function periodLabel(period: BudgetPeriod): string {
  return period === 'week' ? 'À la semaine' : 'Au mois'
}

function periodAccent(period: BudgetPeriod): string {
  return period === 'week' ? 'var(--color-secondary)' : 'var(--color-primary)'
}

function amountTone(value: number): string {
  return value < 0 ? 'var(--color-error)' : 'var(--color-success)'
}

const dangerLinkStyle: React.CSSProperties = { background: 'none', border: 'none', padding: 0, color: 'var(--color-error)', cursor: 'pointer', fontWeight: 600 }
const neutralLinkStyle: React.CSSProperties = { background: 'none', border: 'none', padding: 0, color: 'var(--color-secondary)', cursor: 'pointer' }

function todayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function shiftPeriod(period: BudgetPeriod, date: string, offset: number): string {
  const next = new Date(`${date}T12:00:00`)
  if (period === 'week') next.setDate(next.getDate() + offset * 7)
  else next.setMonth(next.getMonth() + offset)
  return next.toISOString().slice(0, 10)
}

function periodDescription(period: BudgetPeriod, date: string): string {
  const bounds = getPeriodBounds(period, date)
  if (period === 'month') {
    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(`${bounds.startDate}T12:00:00`))
  }
  return `Du ${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(`${bounds.startDate}T12:00:00`))} au ${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${bounds.endDate}T12:00:00`))}`
}

export function E71Budget() {
  const {
    goTo,
    budgetCategories,
    budgetAccounts,
    budgetEntries,
    budgetDeposits,
    createBudgetCategory,
    renameBudgetCategory,
    updateBudgetCategoryAmount,
    deleteBudgetCategory,
    createBudgetAccount,
    renameBudgetAccount,
    deleteBudgetAccount,
    createBudgetEntry,
    deleteBudgetEntry,
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
  const [renamingCategory, setRenamingCategory] = useState<BudgetCategory | null>(null)
  const [categoryRenameValue, setCategoryRenameValue] = useState('')
  const [editingAmount, setEditingAmount] = useState<BudgetCategory | null>(null)
  const [amountValue, setAmountValue] = useState('')
  const [deletingCategory, setDeletingCategory] = useState<BudgetCategory | null>(null)
  const [renamingAccount, setRenamingAccount] = useState<BudgetAccount | null>(null)
  const [accountRenameValue, setAccountRenameValue] = useState('')
  const [deletingAccount, setDeletingAccount] = useState<BudgetAccount | null>(null)
  const [periodDates, setPeriodDates] = useState<Record<BudgetPeriod, string>>({ week: todayDate(), month: todayDate() })
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [expenseCategoryId, setExpenseCategoryId] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseLabel, setExpenseLabel] = useState('')
  const [showDepositForm, setShowDepositForm] = useState(false)
  const [depositAccountId, setDepositAccountId] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [depositPeriod, setDepositPeriod] = useState<BudgetPeriod>('month')

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

  async function handleRenameCategory() {
    if (!renamingCategory || !categoryRenameValue.trim()) return
    await renameBudgetCategory(renamingCategory.id, categoryRenameValue)
    setRenamingCategory(null)
  }

  async function handleUpdateAmount() {
    const amount = Number(amountValue.replace(',', '.'))
    if (!editingAmount || !Number.isFinite(amount) || amount <= 0) return
    await updateBudgetCategoryAmount(editingAmount.id, amount)
    setEditingAmount(null)
  }

  async function handleDeleteCategory(category: BudgetCategory) {
    const result = await deleteBudgetCategory(category.id)
    if (result === 'needs_confirmation') setDeletingCategory(category)
  }

  async function confirmDeleteCategory() {
    if (!deletingCategory) return
    await deleteBudgetCategory(deletingCategory.id, true)
    setDeletingCategory(null)
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

  function openExpenseForm() {
    const firstExpense = budgetCategories.find((category) => category.kind === 'expense')
    if (!firstExpense) return
    setExpenseCategoryId(firstExpense.id)
    setExpenseAmount('')
    setExpenseLabel('')
    setShowExpenseForm(true)
  }

  async function handleCreateExpense() {
    const amount = Number(expenseAmount.replace(',', '.'))
    if (!expenseCategoryId || !Number.isFinite(amount) || amount <= 0) return
    await createBudgetEntry(expenseCategoryId, amount, expenseLabel)
    setShowExpenseForm(false)
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

  function renderPeriod(period: BudgetPeriod) {
    const categories = budgetCategories.filter((category) => category.period === period)
    const bounds = getPeriodBounds(period, periodDates[period])
    const remainder = getUnbudgetedRemainder(
      budgetCategories,
      budgetDeposits,
      period,
      bounds,
    )

    return (
      <section key={period} aria-label={periodLabel(period)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span aria-hidden="true" style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: periodAccent(period) }} />
            {periodLabel(period)}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <button aria-label={period === 'week' ? 'Semaine précédente' : 'Mois précédent'} onClick={() => setPeriodDates((previous) => ({ ...previous, [period]: shiftPeriod(period, previous[period], -1) }))} style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer' }}>←</button>
            <span aria-live="polite" style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{periodDescription(period, periodDates[period])}</span>
            <button aria-label={`${period === 'week' ? 'Semaine' : 'Mois'} suivant`} onClick={() => setPeriodDates((previous) => ({ ...previous, [period]: shiftPeriod(period, previous[period], 1) }))} style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer' }}>→</button>
          </div>
        </div>
        <Card style={{ borderLeft: `4px solid ${periodAccent(period)}` }}>
          <p style={{ margin: '0 0 var(--spacing-md)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Reste non budgétisé
            <br />
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: categories.length === 0 ? 'var(--color-text-muted)' : amountTone(remainder) }}>
              {categories.length === 0 ? 'Non configuré' : formatEuro(remainder)}
            </span>
          </p>
          {categories.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Aucune catégorie configurée.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {categories.map((category) => {
                const remaining = category.kind === 'expense' ? getRemainingForCategory(category, budgetEntries, bounds) : null
                return (
                  <li key={category.id} style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-sm)' }}>
                    <strong style={{ fontSize: '1rem' }}>{category.name}</strong>
                    <p style={{ margin: '4px 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                      {category.kind === 'income' ? 'Revenu' : 'Dépense'} · Budgétisé {formatEuro(category.amount)}
                    </p>
                    {category.kind === 'expense' && remaining !== null && (
                      <p style={{ margin: '4px 0', fontWeight: 600, color: amountTone(remaining) }}>
                        Restant : {formatEuro(remaining)}
                        <span style={{ marginLeft: '8px', fontWeight: 400, color: 'var(--color-text-muted)' }}>
                          (Dépensé {formatEuro(getSpentForCategory(budgetEntries, category.id, bounds))})
                        </span>
                      </p>
                    )}
                    {category.kind === 'expense' && budgetEntries.filter((entry) => entry.category_id === category.id && isDateInPeriod(entry.date, bounds)).map((entry) => (
                      <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ flex: 1 }}>{entry.date} · {entry.label || 'Dépense'} · {formatEuro(entry.amount)}</span>
                        <button aria-label={`Supprimer la dépense ${entry.label || entry.amount}`} onClick={() => deleteBudgetEntry(entry.id)} style={dangerLinkStyle}>Supprimer la dépense</button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)', marginTop: '4px' }}>
                      <button aria-label={`Renommer ${category.name}`} onClick={() => { setRenamingCategory(category); setCategoryRenameValue(category.name) }} style={neutralLinkStyle}>
                        Renommer
                      </button>
                      <button aria-label={`Modifier le montant de ${category.name}`} onClick={() => { setEditingAmount(category); setAmountValue(String(category.amount)) }} style={neutralLinkStyle}>
                        Modifier le montant
                      </button>
                      <button aria-label={`Supprimer ${category.name}`} onClick={() => handleDeleteCategory(category)} style={{ ...dangerLinkStyle, marginLeft: 'auto' }}>
                        Supprimer
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </section>
    )
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', padding: 'var(--spacing-xl)', gap: 'var(--spacing-lg)', maxWidth: '480px', margin: '0 auto', minHeight: '100svh', paddingBottom: 'var(--bottomnav-h)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button aria-label="Retour" onClick={() => goTo('tools')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}>
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Budget</h1>
      </header>

      {renderPeriod('week')}
      {renderPeriod('month')}

      <Button fullWidth onClick={openExpenseForm} disabled={!budgetCategories.some((category) => category.kind === 'expense')}>Ajouter une dépense</Button>
      <Button fullWidth onClick={() => setShowCategoryForm(true)}>Ajouter une catégorie</Button>

      <section>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 var(--spacing-sm)' }}>Mes livrets</h2>
        <Card>
          {budgetAccounts.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Aucun livret configuré.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {budgetAccounts.map((account) => (
                <li key={account.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '1rem' }}>{account.name}</strong>
                    <p style={{ margin: '4px 0', fontWeight: 600, color: 'var(--color-success)' }}>Solde : {formatEuro(getAccountBalance(budgetDeposits, account.id))}</p>
                    {budgetDeposits.filter((deposit) => deposit.account_id === account.id && isDateInPeriod(deposit.date, getPeriodBounds(deposit.period, periodDates[deposit.period]))).map((deposit) => (
                      <div key={deposit.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ flex: '1 1 180px' }}>{deposit.date} · Dépôt : {formatEuro(deposit.amount)}</span>
                        <button aria-label={`Supprimer le dépôt ${deposit.amount}`} onClick={() => deleteBudgetDeposit(deposit.id)} style={dangerLinkStyle}>Supprimer le dépôt</button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)', marginTop: '4px' }}>
                      <button aria-label={`Renommer ${account.name}`} onClick={() => { setRenamingAccount(account); setAccountRenameValue(account.name) }} style={neutralLinkStyle}>Renommer le livret</button>
                      <button aria-label={`Supprimer ${account.name}`} onClick={() => handleDeleteAccount(account)} style={{ ...dangerLinkStyle, marginLeft: 'auto' }}>Supprimer le livret</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <Button fullWidth onClick={openDepositForm} disabled={budgetAccounts.length === 0}>Ajouter un dépôt</Button>
      <Button variant="secondary" fullWidth onClick={() => setShowAccountForm(true)}>Ajouter un livret</Button>

      {showExpenseForm && (
        <div role="dialog" aria-modal="true" aria-label="Ajouter une dépense" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Ajouter une dépense</h2>
            <label htmlFor="budget-expense-category">Catégorie</label>
            <select id="budget-expense-category" value={expenseCategoryId} onChange={(event) => setExpenseCategoryId(event.target.value)} style={inputStyle}>
              {budgetCategories.filter((category) => category.kind === 'expense').map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <label htmlFor="budget-expense-amount">Montant</label>
            <input id="budget-expense-amount" type="number" min="0.01" step="0.01" inputMode="decimal" value={expenseAmount} onChange={(event) => setExpenseAmount(event.target.value)} style={inputStyle} />
            <label htmlFor="budget-expense-label">Libellé (facultatif)</label>
            <input id="budget-expense-label" value={expenseLabel} onChange={(event) => setExpenseLabel(event.target.value)} style={inputStyle} />
            <Button fullWidth onClick={handleCreateExpense} disabled={Number(expenseAmount.replace(',', '.')) <= 0}>Enregistrer</Button>
            <Button variant="secondary" fullWidth onClick={() => setShowExpenseForm(false)}>Annuler</Button>
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
            <input id="budget-deposit-amount" type="number" min="0.01" step="0.01" inputMode="decimal" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} style={inputStyle} />
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
            <input id="budget-category-amount" type="number" min="0.01" step="0.01" inputMode="decimal" value={categoryAmount} onChange={(event) => setCategoryAmount(event.target.value)} style={inputStyle} />
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

      {renamingCategory && (
        <div role="dialog" aria-modal="true" aria-label="Renommer la catégorie" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Renommer la catégorie</h2>
            <input aria-label="Nouveau nom de la catégorie" autoFocus value={categoryRenameValue} onChange={(event) => setCategoryRenameValue(event.target.value)} style={inputStyle} />
            <Button fullWidth onClick={handleRenameCategory} disabled={!categoryRenameValue.trim()}>Enregistrer</Button>
            <Button variant="secondary" fullWidth onClick={() => setRenamingCategory(null)}>Annuler</Button>
          </div>
        </div>
      )}

      {editingAmount && (
        <div role="dialog" aria-modal="true" aria-label="Modifier le montant" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Modifier le montant</h2>
            <input aria-label="Nouveau montant" type="number" min="0.01" step="0.01" inputMode="decimal" autoFocus value={amountValue} onChange={(event) => setAmountValue(event.target.value)} style={inputStyle} />
            <Button fullWidth onClick={handleUpdateAmount} disabled={Number(amountValue.replace(',', '.')) <= 0}>Enregistrer</Button>
            <Button variant="secondary" fullWidth onClick={() => setEditingAmount(null)}>Annuler</Button>
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

      {deletingCategory && (
        <div role="dialog" aria-modal="true" aria-label="Supprimer la catégorie" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Supprimer cette catégorie ?</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Des dépenses existent déjà pour cette catégorie. Elles seront définitivement supprimées avec la catégorie.</p>
            <Button fullWidth onClick={confirmDeleteCategory} style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}>Supprimer</Button>
            <Button variant="secondary" fullWidth onClick={() => setDeletingCategory(null)}>Annuler</Button>
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
