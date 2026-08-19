import { useApp } from '@/app/AppContext'
import { Card } from '@/ui/components/Card'
import { pastelBackground } from '@/ui/styles/ambiance'
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

const cardRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
}

const colorInputStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  cursor: 'pointer',
  border: 'none',
  padding: 0,
  background: 'none',
  flexShrink: 0,
}

const resetColorBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
  fontSize: '1.125rem',
  lineHeight: 1,
  padding: 0,
  flexShrink: 0,
}

const DEFAULT_TOOL_COLOR = '#4a7c99'

export function toolLabel(tool: Tool, listName: string | undefined): string {
  if (tool.type === 'tableau_comptage') return 'Budget'
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
  const { lists, updateToolColor } = useApp()
  const list = tool.list_id ? lists.find((l) => l.id === tool.list_id) : undefined
  return (
    <Card style={tool.color ? { backgroundColor: pastelBackground(tool.color) } : undefined}>
      <div style={cardRowStyle}>
        <button style={{ ...entryBtnStyle, flex: 1 }} onClick={onOpen}>
          {toolLabel(tool, list?.name)}
        </button>
        <input
          type="color"
          aria-label={`Couleur de fond pour ${toolLabel(tool, list?.name)}`}
          value={tool.color ?? DEFAULT_TOOL_COLOR}
          onChange={(e) => updateToolColor(tool.id, e.target.value)}
          style={colorInputStyle}
        />
        {tool.color && (
          <button
            type="button"
            aria-label={`Retirer la couleur de ${toolLabel(tool, list?.name)}`}
            style={resetColorBtnStyle}
            onClick={() => updateToolColor(tool.id, null)}
          >
            &times;
          </button>
        )}
      </div>
    </Card>
  )
}
