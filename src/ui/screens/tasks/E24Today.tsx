import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--spacing-xl)',
  gap: 'var(--spacing-lg)',
  maxWidth: '480px',
  margin: '0 auto',
  minHeight: '100svh',
}

const backBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '1rem',
  padding: 0,
  alignSelf: 'flex-start',
}

export function E24Today() {
  const { todayTasks, selectTask, goTo, moveTask, completeTask } = useApp()

  const isLimit = todayTasks.length >= 3

  function openDetail(taskId: string) {
    selectTask(taskId)
    goTo('task-detail')
  }

  return (
    <main style={pageStyle}>
      <button style={backBtnStyle} onClick={() => goTo('dashboard')} aria-label="Retour">
        ← Retour
      </button>

      <h1 style={{ margin: 0 }}>Aujourd'hui</h1>

      {isLimit && (
        <p
          role="status"
          style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}
        >
          Vous avez déjà 3 tâches aujourd'hui.
        </p>
      )}

      {todayTasks.length === 0 ? (
        <p aria-live="polite">Aucune tâche sélectionnée aujourd'hui.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {todayTasks.map((task) => (
            <Card key={task.id} style={{ padding: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontSize: '1rem', padding: 0, textAlign: 'left', flex: 1 }}
                  onClick={() => openDetail(task.id)}
                >
                  {task.title}
                </button>
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                  <button
                    aria-label={`Terminer ${task.title}`}
                    style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}
                    onClick={() => completeTask(task.id)}
                  >
                    Terminer
                  </button>
                  <button
                    aria-label={`Retirer ${task.title}`}
                    style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}
                    onClick={() => moveTask(task.id, 'inbox')}
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Button variant="secondary" fullWidth onClick={() => goTo('inbox')}>
        Voir l'inbox
      </Button>
    </main>
  )
}
