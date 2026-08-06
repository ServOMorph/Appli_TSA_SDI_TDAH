import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { ToolCreateModal } from '@/ui/components/ToolCreateModal'
import { ToolCard } from '@/ui/components/ToolWidgetCard'

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--spacing-xl)',
  gap: 'var(--spacing-lg)',
  maxWidth: '480px',
  margin: '0 auto',
  minHeight: '100svh',
  paddingBottom: 'var(--bottomnav-h)',
}

export function E72FolderDetail() {
  const { route, goTo, back, folders, tools, selectList } = useApp()
  const folderId = route.name === 'folder-detail' ? (route.folderId ?? null) : null
  const folder = folders.find((f) => f.id === folderId) ?? null
  const [showCreate, setShowCreate] = useState(false)
  const folderTools = folderId ? tools.filter((t) => t.folder_id === folderId) : []

  function openTool(toolId: string) {
    const tool = folderTools.find((t) => t.id === toolId)
    if (!tool) return
    if (tool.type === 'tableau_comptage') {
      goTo('budget')
    } else if (tool.type === 'liste' && tool.list_id) {
      selectList(tool.list_id)
      goTo('list-detail')
    }
  }

  function handleListCreated(listId: string) {
    setShowCreate(false)
    selectList(listId)
    goTo('list-detail')
  }

  return (
    <main style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button
          aria-label="Retour"
          onClick={() => back('tools')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', flex: 1 }}>{folder?.name ?? 'Dossier'}</h1>
        <Button onClick={() => setShowCreate(true)} aria-label="Ajouter un outil">
          +
        </Button>
      </header>

      {folderTools.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
          Ce dossier est vide.
        </p>
      )}

      {folderTools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} onOpen={() => openTool(tool.id)} />
      ))}

      {showCreate && folderId && (
        <ToolCreateModal
          folderId={folderId}
          allowFolder={false}
          onClose={() => setShowCreate(false)}
          onListCreated={handleListCreated}
        />
      )}
    </main>
  )
}
