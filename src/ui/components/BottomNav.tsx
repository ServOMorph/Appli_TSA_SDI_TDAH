import { Button } from '@/ui/components/Button'

function segmentStyle(withDivider: boolean): React.CSSProperties {
  return {
    flex: 1,
    position: 'relative',
    padding: '12px 8px',
    background: 'transparent',
    border: 'none',
    borderLeft: withDivider ? '1px solid var(--color-border)' : 'none',
    color: 'var(--color-secondary)',
    fontSize: '0.9375rem',
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
  }
}

const segmentPastilleStyle: React.CSSProperties = {
  position: 'absolute',
  top: 6,
  right: 6,
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: '#d32f2f',
}

interface BottomNavProps {
  overloadMode: boolean
  inboxHasTasks: boolean
  onAddTask: () => void
  onGoTodo: () => void
  onGoPlanning: () => void
  onGoLists: () => void
}

export function BottomNav({
  overloadMode,
  inboxHasTasks,
  onAddTask,
  onGoTodo,
  onGoPlanning,
  onGoLists,
}: BottomNavProps) {
  return (
    <nav
      aria-label="Navigation principale"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        marginTop: 'auto',
      }}
    >
      {!overloadMode && (
        <Button fullWidth onClick={onAddTask}>
          Ajouter une tâche
        </Button>
      )}
      {!overloadMode && (
        <div
          role="group"
          aria-label="Listes de tâches"
          style={{
            display: 'flex',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          <button onClick={onGoTodo} style={segmentStyle(false)}>
            Todo
            {inboxHasTasks && <span aria-hidden style={segmentPastilleStyle} />}
          </button>
          <button onClick={onGoPlanning} style={segmentStyle(true)}>
            Planning
          </button>
          <button onClick={onGoLists} style={segmentStyle(true)}>
            Listes
          </button>
        </div>
      )}
    </nav>
  )
}
