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

const toolTypeOrder: ToolType[] = ['liste', 'tableau_comptage', 'liste_comptage', 'routine', 'tableau_previsions']

interface ToolCreateModalProps {
  folderId: string | null
  onClose: () => void
  onListCreated: (listId: string) => void
}

export function ToolCreateModal({ folderId, onClose, onListCreated }: ToolCreateModalProps) {
  const { createToolList } = useApp()
  const [mode, setMode] = useState<'choice' | 'new-list'>('choice')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleCreateList() {
    const trimmed = name.trim()
    if (!trimmed) return
    setSubmitting(true)
    const listId = await createToolList(trimmed, folderId)
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
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button fullWidth disabled={!name.trim() || submitting} onClick={handleCreateList}>
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
