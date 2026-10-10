import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import type { Folder } from '@/domain/entities/folder'
import type { Tool } from '@/domain/entities/tool'

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
  maxHeight: '90svh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-md)',
}

export const cardWithMenuStyle: React.CSSProperties = {
  position: 'relative',
  paddingRight: '32px',
}

const triggerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '4px',
  right: '4px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '1.125rem',
  lineHeight: 1,
  padding: '4px 6px',
}

type View = 'menu' | 'move' | 'delete'

interface ActionsDialogProps {
  label: string
  view: View
  setView: (view: View) => void
  onClose: () => void
  moveTargets: { id: string | null; name: string }[]
  onMove: (folderId: string | null) => void
  deleteMessage: string
  onDelete?: () => void
}

function ActionsDialog({ label, view, setView, onClose, moveTargets, onMove, deleteMessage, onDelete }: ActionsDialogProps) {
  return (
    <div style={overlayStyle} role="dialog" aria-label={`Options de ${label}`}>
      <div style={boxStyle}>
        {view === 'menu' && (
          <>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{label}</h2>
            {moveTargets.length > 0 && (
              <Button fullWidth onClick={() => setView('move')}>
                Déplacer
              </Button>
            )}
            {onDelete && (
              <Button fullWidth onClick={() => setView('delete')}>
                Supprimer
              </Button>
            )}
            <Button fullWidth variant="secondary" onClick={onClose}>
              Annuler
            </Button>
          </>
        )}

        {view === 'move' && (
          <>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Déplacer vers</h2>
            {moveTargets.map((target) => (
              <Button key={target.id ?? 'root'} fullWidth onClick={() => onMove(target.id)}>
                {target.id === null ? target.name : `📁 ${target.name}`}
              </Button>
            ))}
            <Button fullWidth variant="secondary" onClick={onClose}>
              Annuler
            </Button>
          </>
        )}

        {view === 'delete' && onDelete && (
          <>
            <p style={{ margin: 0 }}>{deleteMessage}</p>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button fullWidth onClick={onDelete}>
                Supprimer
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

export function ToolActionsMenu({ tool, label }: { tool: Tool; label: string }) {
  const { folders, moveTool, deleteTool } = useApp()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('menu')

  const moveTargets = [
    ...(tool.folder_id !== null ? [{ id: null, name: 'Accueil' }] : []),
    ...folders.filter((f) => f.id !== tool.folder_id).map((f) => ({ id: f.id as string | null, name: f.name })),
  ]

  function close() {
    setOpen(false)
    setView('menu')
  }

  if (tool.type === 'tableau_comptage' && moveTargets.length === 0) return null

  return (
    <>
      <button type="button" aria-label={`Options de ${label}`} style={triggerStyle} onClick={() => setOpen(true)}>
        ⋯
      </button>
      {open && (
        <ActionsDialog
          label={label}
          view={view}
          setView={setView}
          onClose={close}
          moveTargets={moveTargets}
          onMove={(folderId) => {
            void moveTool(tool.id, folderId)
            close()
          }}
          deleteMessage={`Supprimer « ${label} » ? Son contenu sera effacé.`}
          onDelete={
            tool.type === 'tableau_comptage'
              ? undefined
              : () => {
                  void deleteTool(tool.id)
                  close()
                }
          }
        />
      )}
    </>
  )
}

export function FolderActionsMenu({ folder }: { folder: Folder }) {
  const { tools, deleteFolder } = useApp()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('menu')
  const count = tools.filter((t) => t.folder_id === folder.id && t.type !== 'tableau_comptage').length
  const deleteMessage =
    count === 0
      ? `Supprimer le dossier « ${folder.name} » ?`
      : `Supprimer le dossier « ${folder.name} » et ${count === 1 ? "l'outil qu'il contient" : `les ${count} outils qu'il contient`} ?`

  function close() {
    setOpen(false)
    setView('menu')
  }

  return (
    <>
      <button type="button" aria-label={`Options de ${folder.name}`} style={triggerStyle} onClick={() => setOpen(true)}>
        ⋯
      </button>
      {open && (
        <ActionsDialog
          label={folder.name}
          view={view}
          setView={setView}
          onClose={close}
          moveTargets={[]}
          onMove={() => {}}
          deleteMessage={deleteMessage}
          onDelete={() => {
            void deleteFolder(folder.id)
            close()
          }}
        />
      )}
    </>
  )
}
