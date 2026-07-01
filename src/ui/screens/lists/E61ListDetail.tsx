import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import type { ListItem } from '@/domain/entities/listItem'

export function E61ListDetail() {
  const { lists, selectedListId, getListItems, addListItem, deleteListItem, goTo } = useApp()
  const list = lists.find((l) => l.id === selectedListId) ?? null

  const [items, setItems] = useState<ListItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!selectedListId) return
    getListItems(selectedListId).then(setItems)
  }, [selectedListId])

  async function handleAdd() {
    const title = newTitle.trim()
    if (!title || !selectedListId) return
    setSubmitting(true)
    await addListItem(selectedListId, title)
    const updated = await getListItems(selectedListId)
    setItems(updated)
    setNewTitle('')
    setShowAddForm(false)
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    await deleteListItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
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
          onClick={() => goTo('lists')}
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
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{list?.name ?? 'Liste'}</h1>
      </header>

      {items.length === 0 && !showAddForm && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
          Cette liste est vide.
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
        {items.map((item) => (
          <li
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-md)',
            }}
          >
            <span>{item.title}</span>
            <button
              aria-label={`Supprimer ${item.title}`}
              onClick={() => handleDelete(item.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.1rem',
                color: 'var(--color-text-muted)',
                padding: '0 4px',
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {showAddForm ? (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <label
              htmlFor="new-item-title"
              style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}
            >
              Élément
            </label>
            <input
              id="new-item-title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
              }}
              autoFocus
              placeholder="Nom de l'élément…"
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
                onClick={handleAdd}
                disabled={!newTitle.trim() || submitting}
              >
                Ajouter
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowAddForm(false)
                  setNewTitle('')
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button fullWidth onClick={() => setShowAddForm(true)}>
          Ajouter un élément
        </Button>
      )}
    </main>
  )
}
