import { useApp } from '@/app/AppContext'
import { FolderCard, ToolCard } from '@/ui/components/ToolWidgetCard'

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

export function E70Tools() {
  const { goTo, folders, tools, selectList } = useApp()
  const rootTools = tools.filter((t) => t.folder_id === null)

  function openTool(toolId: string) {
    const tool = rootTools.find((t) => t.id === toolId)
    if (!tool) return
    if (tool.type === 'tableau_comptage') {
      goTo('budget')
    } else if (tool.type === 'liste' && tool.list_id) {
      selectList(tool.list_id)
      goTo('list-detail')
    }
  }

  return (
    <main style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button
          aria-label="Retour"
          onClick={() => goTo('dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', flex: 1 }}>Outils</h1>
      </header>

      {folders.length === 0 && rootTools.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
          Aucun outil pour l'instant.
        </p>
      )}

      {folders.map((folder) => (
        <FolderCard key={folder.id} folder={folder} onOpen={() => goTo({ name: 'folder-detail', folderId: folder.id })} />
      ))}

      {rootTools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} onOpen={() => openTool(tool.id)} />
      ))}
    </main>
  )
}
