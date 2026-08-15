import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { IMPLEMENTED_TOOL_TYPES, TOOL_TYPE_LABELS, type ToolType } from '@/domain/entities/tool'

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}

const boxStyle: React.CSSProperties = {
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

const categoryRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
}

const removeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
  fontSize: '1.125rem',
  lineHeight: 1,
}

const toolTypeOrder: ToolType[] = ['liste', 'tableau_comptage', 'liste_comptage', 'routine', 'tableau_previsions']

interface ToolCreateModalProps {
  folderId: string | null
  onClose: () => void
  onListCreated: (listId: string) => void
}

export function ToolCreateModal({ folderId, onClose, onListCreated }: ToolCreateModalProps) {
  const { createToolList, createListCategory } = useApp()
  const [mode, setMode] = useState<'choice' | 'new-list'>('choice')
  const [name, setName] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [categoryInput, setCategoryInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function addCategoryEntry() {
    const trimmed = categoryInput.trim()
    if (!trimmed) return
    setCategories((prev) => [...prev, trimmed])
    setCategoryInput('')
  }

  function removeCategoryEntry(index: number) {
    setCategories((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleCreateList() {
    const trimmed = name.trim()
    if (!trimmed || categories.length === 0) return
    setSubmitting(true)
    const listId = await createToolList(trimmed, folderId)
    for (const category of categories) {
      await createListCategory(listId, category)
    }
    setSubmitting(false)
    onListCreated(listId)
  }

  return (
    <div style={overlayStyle} role="dialog" aria-label="Ajouter un outil">
      <div style={boxStyle}>
        {mode === 'choice' && (
          <>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Ajouter</h2>
            <Button fullWidth onClick={() => setMode('new-list')}>
              Nouvelle liste
            </Button>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              {toolTypeOrder
                .filter((type) => !IMPLEMENTED_TOOL_TYPES.includes(type))
                .map((type) => (
                  <li key={type} style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }} aria-disabled="true">
                    {TOOL_TYPE_LABELS[type]} (bientôt disponible)
                  </li>
                ))}
            </ul>
            <Button fullWidth variant="secondary" onClick={onClose}>
              Annuler
            </Button>
          </>
        )}

        {mode === 'new-list' && (
          <>
            <label htmlFor="new-tool-list-name" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Nom de la liste
            </label>
            <input
              id="new-tool-list-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              style={inputStyle}
            />

            <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Catégories</label>
            {categories.map((category, i) => (
              <div key={i} style={categoryRowStyle}>
                <span>{category}</span>
                <button
                  type="button"
                  aria-label={`Retirer ${category}`}
                  style={removeBtnStyle}
                  onClick={() => removeCategoryEntry(i)}
                >
                  &times;
                </button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCategoryEntry()
                  }
                }}
                placeholder="Ajouter une catégorie"
                aria-label="Nouvelle catégorie"
                style={{ ...inputStyle, flex: 1 }}
              />
              <Button type="button" onClick={addCategoryEntry} disabled={!categoryInput.trim()}>
                Ajouter
              </Button>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button fullWidth disabled={!name.trim() || categories.length === 0 || submitting} onClick={handleCreateList}>
                Créer
              </Button>
              <Button fullWidth variant="secondary" onClick={onClose}>
                Annuler
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
