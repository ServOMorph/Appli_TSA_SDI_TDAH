import type { ReactNode } from 'react'
import { TaskIcon } from '@/ui/components/TaskIcon'
import { pastelBackground } from '@/ui/styles/ambiance'

interface TaskCardLayoutProps {
  icon: string | null
  color: string | null
  titleSlot: ReactNode
  children: ReactNode
}

function bannerStyle(color: string | null): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    padding: 'var(--spacing-lg)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: color ?? 'var(--color-surface)',
    color: color ? '#fff' : 'var(--color-text)',
  }
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 'var(--spacing-sm)',
}

export function TaskCardLayout({ icon, color, titleSlot, children }: TaskCardLayoutProps) {
  return (
    <>
      <div style={bannerStyle(color)}>
        <TaskIcon icon={icon} size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>{titleSlot}</div>
      </div>
      <div style={gridStyle} role="group" aria-label="Champs de la tâche">
        {children}
      </div>
    </>
  )
}

interface TaskFieldCardProps {
  label: string
  value: ReactNode
  color: string | null
  expanded: boolean
  onToggle: () => void
  span?: boolean
  children?: ReactNode
}

function cardStyle(color: string | null, span: boolean | undefined): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
    padding: 'var(--spacing-md)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: color ? pastelBackground(color) : 'var(--color-surface)',
    gridColumn: span ? '1 / -1' : undefined,
  }
}

const fieldLabelStyle: React.CSSProperties = { color: 'var(--color-text-muted)', fontSize: '0.875rem' }

const toggleBtnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-xs)',
  background: 'none',
  border: 'none',
  padding: 0,
  textAlign: 'left',
  cursor: 'pointer',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  width: '100%',
}

export function TaskFieldCard({ label, value, color, expanded, onToggle, span, children }: TaskFieldCardProps) {
  return (
    <div style={cardStyle(color, span)}>
      <button type="button" style={toggleBtnStyle} onClick={onToggle} aria-expanded={expanded} aria-label={`Modifier ${label}`}>
        <span style={fieldLabelStyle}>{label}</span>
        {!expanded && <span>{value}</span>}
      </button>
      {expanded && children}
    </div>
  )
}
