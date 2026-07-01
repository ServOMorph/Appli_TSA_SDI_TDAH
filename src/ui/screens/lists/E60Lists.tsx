import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'

export function E60Lists() {
  const { lists, createList, selectList, goTo } = useApp()
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleCreate() {
    const name = newName.trim()
    if (!name) return
    setSubmitting(true)
    await createList(name)
    setNewName('')
    setShowNewForm(false)
    setSubmitting(false)
  }

  function handleSelectList(id: string) {
    selectList(id)
    goTo('list-detail')
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100svh',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button
          aria-label="Retour"
          onClick={() => goTo('dashboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem',
            color: 'var(--color-text)',
            padding: 0,
          }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Mes listes</h1>
      </header>

      {lists.length === 0 && !showNewForm && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
          Aucune liste pour l'instant.
        </p>
      )}

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
        }}
      >
        {lists.map((list) => (
          <li key={list.id}>
            <button
              onClick={() => handleSelectList(list.id)}
              aria-label={list.name}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text)',
              }}
            >
              {list.name}
            </button>
          </li>
        ))}
      </ul>

      {showNewForm ? (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <label
              htmlFor="new-list-name"
              style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}
            >
              Nom de la liste
            </label>
            <input
              id="new-list-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
              }}
              autoFocus
              placeholder="Ex : Musiques, Livres…"
              style={{
                padding: '8px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'var(--color-text)',
                background: 'var(--color-surface)',
              }}
            />
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button
                fullWidth
                onClick={handleCreate}
                disabled={!newName.trim() || submitting}
              >
                Créer
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowNewForm(false)
                  setNewName('')
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button fullWidth onClick={() => setShowNewForm(true)}>
          Nouvelle liste
        </Button>
      )}
    </main>
  )
}
