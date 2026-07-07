import { useApp } from '@/app/AppContext'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'

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
  const { todayTasks, todaySubTasksMap, selectTask, goTo, moveTask, completeTask } = useApp()

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

      {todayTasks.length === 0 ? (
        <p aria-live="polite">Aucune tâche sélectionnée aujourd'hui.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {todayTasks.map((task) => {
            const subs = todaySubTasksMap[task.id] ?? []
            const done = subs.filter((s) => s.is_completed).length
            const total = subs.length
            const nextSubTask = subs
              .filter((s) => !s.is_completed)
              .sort((a, b) => a.position - b.position)[0]
            return (
            <Card key={task.id} style={{ padding: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontSize: '1rem', padding: 0, textAlign: 'left', flex: 1 }}
                    onClick={() => openDetail(task.id)}
                  >
                    {task.title}
                  </button>
                  {total > 0 && (
                    <span
                      aria-label={`${done} sur ${total} étapes`}
                      style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}
                    >
                      {done}/{total}
                    </span>
                  )}
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
                {nextSubTask && (
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Prochaine étape : {nextSubTask.title}
                  </p>
                )}
              </div>
            </Card>
            )
          })}
        </div>
      )}

      <Button fullWidth onClick={() => goTo('task-create-v2')}>
        Ajouter une tâche
      </Button>
    </main>
  )
}
