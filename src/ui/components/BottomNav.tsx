import { useEffect, useRef } from 'react'
import { Button } from '@/ui/components/Button'

export type BottomNavTab = 'dashboard' | 'inbox' | 'planning' | 'lists'

function segmentStyle(withDivider: boolean, active: boolean): React.CSSProperties {
  return {
    flex: 1,
    position: 'relative',
    padding: '12px 8px',
    background: 'transparent',
    border: 'none',
    borderLeft: withDivider ? '1px solid var(--color-border)' : 'none',
    color: active ? 'var(--color-accent)' : 'var(--color-secondary)',
    fontWeight: active ? 700 : 400,
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

const navContainerStyle: React.CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 40,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-sm)',
  maxWidth: '480px',
  margin: '0 auto',
  padding: 'var(--spacing-sm) var(--spacing-xl) calc(var(--spacing-sm) + env(safe-area-inset-bottom))',
  background: 'var(--color-background)',
  borderTop: '1px solid var(--color-border)',
}

interface BottomNavProps {
  activeTab: BottomNavTab | null
  overloadMode: boolean
  inboxHasTasks: boolean
  onAddTask: () => void
  onGoDashboard: () => void
  onGoTodo: () => void
  onGoPlanning: () => void
  onGoLists: () => void
}

export function BottomNav({
  activeTab,
  overloadMode,
  inboxHasTasks,
  onAddTask,
  onGoDashboard,
  onGoTodo,
  onGoPlanning,
  onGoLists,
}: BottomNavProps) {
  const navRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const node = navRef.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
      const height = node.offsetHeight
      if (height > 0) {
        document.documentElement.style.setProperty('--bottomnav-h', `${height}px`)
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [overloadMode])

  if (overloadMode) {
    return <nav ref={navRef} aria-label="Navigation principale" style={navContainerStyle} />
  }

  return (
    <nav ref={navRef} aria-label="Navigation principale" style={navContainerStyle}>
      <Button fullWidth onClick={onAddTask}>
        Ajouter une tâche
      </Button>
      <div
        role="group"
        aria-label="Navigation"
        style={{
          display: 'flex',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={onGoDashboard}
          aria-current={activeTab === 'dashboard' ? 'page' : undefined}
          style={segmentStyle(false, activeTab === 'dashboard')}
        >
          Accueil
        </button>
        <button
          onClick={onGoTodo}
          aria-current={activeTab === 'inbox' ? 'page' : undefined}
          style={segmentStyle(true, activeTab === 'inbox')}
        >
          Todo
          {inboxHasTasks && <span aria-hidden style={segmentPastilleStyle} />}
        </button>
        <button
          onClick={onGoPlanning}
          aria-current={activeTab === 'planning' ? 'page' : undefined}
          style={segmentStyle(true, activeTab === 'planning')}
        >
          Planning
        </button>
        <button
          onClick={onGoLists}
          aria-current={activeTab === 'lists' ? 'page' : undefined}
          style={segmentStyle(true, activeTab === 'lists')}
        >
          Listes
        </button>
      </div>
    </nav>
  )
}
