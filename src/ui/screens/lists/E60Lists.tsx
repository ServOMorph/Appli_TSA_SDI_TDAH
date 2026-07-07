import { useState } from 'react'
import { useApp } from '@/app/AppContext'
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

export function E60Lists() {
  const { lists, createList, renameList, deleteList, selectList, goTo } = useApp()
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  function startRename(id: string, currentName: string) {
    setRenamingId(id)
    setRenameValue(currentName)
  }

  async function confirmRename() {
    const name = renameValue.trim()
    if (!renamingId || !name) return
    await renameList(renamingId, name)
    setRenamingId(null)
    setRenameValue('')
  }

  async function confirmDelete() {
    if (!deletingId) return
    await deleteList(deletingId)
    setDeletingId(null)
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
        paddingBottom: 'var(--bottomnav-h)',
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
          <li
            key={list.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <button
              onClick={() => handleSelectList(list.id)}
              aria-label={list.name}
              style={{
                flex: 1,
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: 'var(--spacing-md)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text)',
              }}
            >
              {list.name}
            </button>
            <button
              aria-label={`Renommer ${list.name}`}
              onClick={() => startRename(list.id, list.name)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                fontSize: '0.875rem',
                padding: '4px 8px',
              }}
            >
              Renommer
            </button>
            <button
              aria-label={`Supprimer ${list.name}`}
              onClick={() => setDeletingId(list.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                fontSize: '1rem',
                padding: '4px 12px 4px 0',
              }}
            >
              ×
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

      {renamingId && (
        <div role="dialog" aria-modal="true" aria-label="Renommer la liste" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Renommer la liste</h2>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmRename()
              }}
              autoFocus
              aria-label="Nouveau nom de la liste"
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
            <Button fullWidth onClick={confirmRename} disabled={!renameValue.trim()}>
              Enregistrer
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setRenamingId(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {deletingId && (
        <div role="dialog" aria-modal="true" aria-label="Supprimer la liste" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Supprimer cette liste ?</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              Tous les éléments de cette liste seront supprimés. Cette action est irréversible.
            </p>
            <Button fullWidth onClick={confirmDelete}>
              Supprimer
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setDeletingId(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
