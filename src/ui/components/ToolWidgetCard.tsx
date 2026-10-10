import { useApp } from '@/app/AppContext'
import { Card } from '@/ui/components/Card'
import { FolderActionsMenu, ToolActionsMenu, cardWithMenuStyle } from '@/ui/components/ToolActionsMenu'
import { outlineOnlyStyle } from '@/ui/styles/ambiance'
import type { Folder } from '@/domain/entities/folder'
import type { Tool } from '@/domain/entities/tool'

const entryBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  color: 'var(--color-text)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  padding: 0,
}

export function toolLabel(tool: Tool, listName: string | undefined, routineName?: string): string {
  if (tool.type === 'tableau_comptage') return 'Budget'
  if (tool.type === 'routine') return routineName ?? 'Routine'
  return listName ?? 'Liste'
}

export function FolderCard({ folder, onOpen }: { folder: Folder; onOpen: () => void }) {
  return (
    <Card style={cardWithMenuStyle}>
      <button style={entryBtnStyle} onClick={onOpen}>
        📁 {folder.name}
      </button>
      <FolderActionsMenu folder={folder} />
    </Card>
  )
}

export function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: () => void }) {
  const { lists, routines } = useApp()
  const list = tool.list_id ? lists.find((l) => l.id === tool.list_id) : undefined
  const routine = tool.routine_id ? routines.find((r) => r.id === tool.routine_id) : undefined
  const accentColor = tool.type === 'routine' ? routine?.color : tool.color
  const label = toolLabel(tool, list?.name, routine?.name)
  return (
    <Card style={{ ...cardWithMenuStyle, ...(accentColor ? outlineOnlyStyle(accentColor) : {}) }}>
      <button style={entryBtnStyle} onClick={onOpen}>
        {label}
      </button>
      <ToolActionsMenu tool={tool} label={label} />
    </Card>
  )
}
