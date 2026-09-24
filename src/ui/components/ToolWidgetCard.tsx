import { useApp } from '@/app/AppContext'
import { Card } from '@/ui/components/Card'
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
    <Card>
      <button style={entryBtnStyle} onClick={onOpen}>
        📁 {folder.name}
      </button>
    </Card>
  )
}

export function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: () => void }) {
  const { lists, routines } = useApp()
  const list = tool.list_id ? lists.find((l) => l.id === tool.list_id) : undefined
  const routine = tool.routine_id ? routines.find((r) => r.id === tool.routine_id) : undefined
  const accentColor = tool.type === 'routine' ? routine?.color : tool.color
  return (
    <Card style={accentColor ? outlineOnlyStyle(accentColor) : undefined}>
      <button style={entryBtnStyle} onClick={onOpen}>
        {toolLabel(tool, list?.name, routine?.name)}
      </button>
    </Card>
  )
}
