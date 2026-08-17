import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { todayDate } from '@/app/repositories'
import { formatFrenchDate } from '@/domain/rules/planningSlotRules'
import { getAccountBalance } from '@/domain/rules/budgetRules'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { dangerLinkStyle, formatEuro, inputStyle, modalBox, modalOverlay, neutralLinkStyle, pageStyle } from '@/ui/styles/budget'

type MovementKind = 'deposit' | 'withdrawal'

interface MovementFormState {
  kind: MovementKind
  amount: string
  label: string
  date: string
}

function emptyForm(): MovementFormState {
  return { kind: 'deposit', amount: '', label: '', date: todayDate() }
}

function formFromDeposit(deposit: BudgetDeposit): MovementFormState {
  return {
    kind: deposit.amount < 0 ? 'withdrawal' : 'deposit',
    amount: String(Math.abs(deposit.amount)),
    label: deposit.label ?? '',
    date: deposit.date,
  }
}

export function E77BudgetLivretDetail() {
  const { route, back, budgetAccounts, budgetDeposits, createBudgetDeposit, updateBudgetDeposit, deleteBudgetDeposit } = useApp()
  const accountId = route.name === 'budget-livret-detail' ? (route.accountId ?? null) : null
  const account = budgetAccounts.find((item) => item.id === accountId) ?? null

  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<MovementFormState>(emptyForm())
  const [editingDeposit, setEditingDeposit] = useState<BudgetDeposit | null>(null)
  const [editForm, setEditForm] = useState<MovementFormState>(emptyForm())

  if (!account) {
    return (
      <main style={pageStyle}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <button aria-label="Retour" onClick={() => back('budget-livrets')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}>
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Livret</h1>
        </header>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Ce livret n'existe plus.</p>
      </main>
    )
  }

  const balance = getAccountBalance(budgetDeposits, account.id)
  const deposits = budgetDeposits
    .filter((deposit) => deposit.account_id === account.id)
    .sort((a, b) => b.date.localeCompare(a.date))

  function parsedAmount(form: MovementFormState): number {
    return Number(form.amount.replace(',', '.'))
  }

  function canSubmit(form: MovementFormState, excludeDepositId?: string): boolean {
    const amount = parsedAmount(form)
    if (!Number.isFinite(amount) || amount <= 0) return false
    if (form.kind !== 'withdrawal') return true
    const currentBalance = deposits
      .filter((deposit) => deposit.id !== excludeDepositId)
      .reduce((total, deposit) => total + deposit.amount, 0)
    return amount <= currentBalance
  }

  async function handleAddSubmit() {
    if (!account || !canSubmit(addForm)) return
    const amount = parsedAmount(addForm)
    const signedAmount = addForm.kind === 'withdrawal' ? -amount : amount
    await createBudgetDeposit(account.id, signedAmount, addForm.label, addForm.date)
    setShowAddForm(false)
  }

  async function handleEditSubmit() {
    if (!editingDeposit || !canSubmit(editForm, editingDeposit.id)) return
    const amount = parsedAmount(editForm)
    const signedAmount = editForm.kind === 'withdrawal' ? -amount : amount
    await updateBudgetDeposit(editingDeposit.id, signedAmount, editForm.label, editForm.date)
    setEditingDeposit(null)
  }

  return (
    <main style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button aria-label="Retour" onClick={() => back('budget-livrets')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}>
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{account.name}</h1>
      </header>

      <Card>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Solde</p>
        <p style={{ margin: '4px 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-success)' }}>{formatEuro(balance)}</p>
      </Card>

      <section aria-label="Mouvements">
        <h2 style={{ fontSize: '1rem', margin: '0 0 var(--spacing-sm)' }}>Mouvements</h2>
        {deposits.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Aucun mouvement enregistré.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {deposits.map((deposit) => {
              const isWithdrawal = deposit.amount < 0
              const movementLabel = isWithdrawal ? 'Retrait' : 'Dépôt'
              return (
                <li key={deposit.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-sm)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-sm)' }}>
                  <span style={{ flex: '1 1 180px', fontSize: '0.9375rem' }}>
                    {formatFrenchDate(deposit.date)} · {movementLabel} : {formatEuro(Math.abs(deposit.amount))}
                    {deposit.label ? ` · ${deposit.label}` : ''}
                  </span>
                  <button
                    aria-label={`Modifier le mouvement du ${formatFrenchDate(deposit.date)}`}
                    onClick={() => { setEditForm(formFromDeposit(deposit)); setEditingDeposit(deposit) }}
                    style={neutralLinkStyle}
                  >
                    Modifier
                  </button>
                  <button
                    aria-label={`Supprimer le mouvement du ${formatFrenchDate(deposit.date)}`}
                    onClick={() => deleteBudgetDeposit(deposit.id)}
                    style={dangerLinkStyle}
                  >
                    Supprimer
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <Button fullWidth onClick={() => { setAddForm(emptyForm()); setShowAddForm(true) }}>
        Ajouter un mouvement
      </Button>

      {showAddForm && (
        <div role="dialog" aria-modal="true" aria-label="Ajouter un mouvement" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Ajouter un mouvement</h2>
            <label htmlFor="livret-add-kind">Type</label>
            <select id="livret-add-kind" value={addForm.kind} onChange={(event) => setAddForm({ ...addForm, kind: event.target.value as MovementKind })} style={inputStyle}>
              <option value="deposit">Dépôt</option>
              <option value="withdrawal">Retrait</option>
            </select>
            <label htmlFor="livret-add-amount">Montant</label>
            <input id="livret-add-amount" type="text" inputMode="decimal" autoFocus value={addForm.amount} onChange={(event) => setAddForm({ ...addForm, amount: event.target.value })} style={inputStyle} />
            {addForm.kind === 'withdrawal' && !canSubmit(addForm) && parsedAmount(addForm) > 0 && (
              <p style={{ margin: 0, color: 'var(--color-error)', fontSize: '0.8125rem' }}>Le retrait dépasse le solde du livret ({formatEuro(balance)}).</p>
            )}
            <label htmlFor="livret-add-label">Motif</label>
            <input id="livret-add-label" value={addForm.label} onChange={(event) => setAddForm({ ...addForm, label: event.target.value })} style={inputStyle} />
            <label htmlFor="livret-add-date">Date</label>
            <input id="livret-add-date" type="date" value={addForm.date} onChange={(event) => setAddForm({ ...addForm, date: event.target.value })} style={inputStyle} />
            <Button fullWidth onClick={handleAddSubmit} disabled={!canSubmit(addForm)}>Enregistrer</Button>
            <Button variant="secondary" fullWidth onClick={() => setShowAddForm(false)}>Annuler</Button>
          </div>
        </div>
      )}

      {editingDeposit && (
        <div role="dialog" aria-modal="true" aria-label="Modifier le mouvement" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Modifier le mouvement</h2>
            <label htmlFor="livret-edit-kind">Type</label>
            <select id="livret-edit-kind" value={editForm.kind} onChange={(event) => setEditForm({ ...editForm, kind: event.target.value as MovementKind })} style={inputStyle}>
              <option value="deposit">Dépôt</option>
              <option value="withdrawal">Retrait</option>
            </select>
            <label htmlFor="livret-edit-amount">Montant</label>
            <input id="livret-edit-amount" type="text" inputMode="decimal" autoFocus value={editForm.amount} onChange={(event) => setEditForm({ ...editForm, amount: event.target.value })} style={inputStyle} />
            {editForm.kind === 'withdrawal' && !canSubmit(editForm, editingDeposit.id) && parsedAmount(editForm) > 0 && (
              <p style={{ margin: 0, color: 'var(--color-error)', fontSize: '0.8125rem' }}>Le retrait dépasse le solde du livret ({formatEuro(balance)}).</p>
            )}
            <label htmlFor="livret-edit-label">Motif</label>
            <input id="livret-edit-label" value={editForm.label} onChange={(event) => setEditForm({ ...editForm, label: event.target.value })} style={inputStyle} />
            <label htmlFor="livret-edit-date">Date</label>
            <input id="livret-edit-date" type="date" value={editForm.date} onChange={(event) => setEditForm({ ...editForm, date: event.target.value })} style={inputStyle} />
            <Button fullWidth onClick={handleEditSubmit} disabled={!canSubmit(editForm, editingDeposit.id)}>Enregistrer</Button>
            <Button variant="secondary" fullWidth onClick={() => setEditingDeposit(null)}>Annuler</Button>
          </div>
        </div>
      )}
    </main>
  )
}
